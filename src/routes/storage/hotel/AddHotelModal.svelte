<script>
	import { X, Star, Building2, Search } from 'lucide-svelte';
	import { fade, slide } from 'svelte/transition';
	import masterHotels from '$lib/data/masterData-hotel.json';
	import { hotelStorageStore } from '$lib/stores/hotelStorageStore.svelte.js';

	let { show = false, onClose } = $props();

	let searchQuery = $state('');
	let selectedHotel = $state(null);

	// Filter out hotels already in storage
	let existingIds = $derived(new Set(hotelStorageStore.hotels.map((h) => h.hotelId)));
	let availableHotels = $derived(
		masterHotels.filter((h) => {
			const notAdded = !existingIds.has(h.id);
			const matchSearch =
				!searchQuery ||
				h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				h.city.toLowerCase().includes(searchQuery.toLowerCase());
			return notAdded && matchSearch;
		})
	);

	function handleSelect(hotel) {
		selectedHotel = selectedHotel?.id === hotel.id ? null : hotel;
	}

	function handleAdd() {
		if (!selectedHotel) return;
		hotelStorageStore.addHotel({
			hotelId: selectedHotel.id,
			hotelName: selectedHotel.name,
			city: selectedHotel.city,
			starRating: selectedHotel.starRating
		});
		resetAndClose();
	}

	function resetAndClose() {
		searchQuery = '';
		selectedHotel = null;
		onClose();
	}
</script>

{#if show}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
		transition:fade={{ duration: 200 }}
		onclick={(e) => {
			if (e.target === e.currentTarget) resetAndClose();
		}}
		onkeydown={() => {}}
		role="dialog"
		tabindex="-1"
	>
		<div
			class="w-full max-w-md rounded-2xl bg-white shadow-2xl"
			transition:slide={{ axis: 'y', duration: 300 }}
		>
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-gray-100 p-6">
				<div>
					<h2 class="text-lg font-semibold text-gray-900">Add Hotel</h2>
					<p class="mt-0.5 text-sm text-gray-500">Pilih hotel dari master data</p>
				</div>
				<button
					class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
					onclick={resetAndClose}
				>
					<X size={20} />
				</button>
			</div>

			<!-- Search -->
			<div class="border-b border-gray-100 px-6 py-3">
				<div class="relative">
					<Search size={14} class="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
					<input
						type="text"
						placeholder="Cari hotel..."
						class="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pr-3 pl-9 text-sm text-gray-900 outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
						bind:value={searchQuery}
					/>
				</div>
			</div>

			<!-- Hotel List -->
			<div class="max-h-[300px] overflow-y-auto p-3">
				{#if availableHotels.length === 0}
					<div class="py-8 text-center">
						<Building2 size={24} class="mx-auto text-gray-300" />
						<p class="mt-2 text-sm text-gray-400">
							{searchQuery ? 'Tidak ditemukan' : 'Semua hotel sudah ditambahkan'}
						</p>
					</div>
				{:else}
					<div class="space-y-1">
						{#each availableHotels as hotel}
							<button
								class="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors
                                    {selectedHotel?.id === hotel.id
									? 'bg-purple-50 ring-1 ring-[#972395]'
									: 'hover:bg-gray-50'}"
								onclick={() => handleSelect(hotel)}
							>
								<div
									class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500"
								>
									<Building2 size={14} />
								</div>
								<div class="min-w-0 flex-1">
									<div class="flex items-center gap-2">
										<span class="truncate text-sm font-medium text-gray-900">{hotel.name}</span>
										<div class="flex gap-0.5">
											{#each Array(hotel.starRating || 0) as _}
												<Star size={8} class="fill-yellow-400 text-yellow-400" />
											{/each}
										</div>
									</div>
									<div class="text-xs text-gray-500">
										{hotel.city} · {hotel.distanceToHaram} dari Haram
									</div>
								</div>
								{#if selectedHotel?.id === hotel.id}
									<div class="h-2 w-2 rounded-full bg-[#972395]"></div>
								{/if}
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Footer -->
			<div
				class="flex items-center justify-end gap-3 rounded-b-2xl border-t border-gray-100 bg-gray-50 p-6"
			>
				<button
					class="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
					onclick={resetAndClose}
				>
					Cancel
				</button>
				<button
					class="rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-colors
                        {selectedHotel
						? 'bg-[#972395] hover:bg-[#7a1c78]'
						: 'cursor-not-allowed bg-gray-300'}"
					disabled={!selectedHotel}
					onclick={handleAdd}
				>
					Add Hotel
				</button>
			</div>
		</div>
	</div>
{/if}
