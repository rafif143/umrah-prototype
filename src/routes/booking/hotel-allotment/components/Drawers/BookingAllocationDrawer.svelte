<script>
	import { X, User, ChevronDown, ListFilter, GripVertical, Briefcase } from 'lucide-svelte';
	import { slide, fade } from 'svelte/transition';
	import { bookingStore } from '$lib/stores/bookingStore.svelte.js';

	let {
		show = false,
		tripName = '',
		inline = false,
		onClose,
		onDragStart,
		onTripSelect
	} = $props();

	let selectedBookingId = $state(null);

	// Get unique trip names from bookings
	let tripOptions = $derived.by(() => {
		const packages = bookingStore.bookings.map((b) => b.packageName).filter(Boolean);
		return [...new Set(packages)];
	});

	// Group bookings by package name (simple filter for now)
	let filteredBookings = $derived(
		bookingStore.bookings.filter((b) => !tripName || b.packageName === tripName)
	);

	function handleTripChange(newTrip) {
		if (onTripSelect) {
			onTripSelect(newTrip);
		}
	}

	function toggleBooking(id) {
		selectedBookingId = selectedBookingId === id ? null : id;
	}

	function handleDragStart(event, item, type = 'pilgrim') {
		if (onDragStart) {
			onDragStart(event, item, type);
		}
		// Fallback for native HTML5 DnD if needed
		const data =
			type === 'booking'
				? JSON.stringify({ type: 'booking', booking: item })
				: JSON.stringify({ type: 'pilgrim', ...item });

		event.dataTransfer.setData('text/plain', data);
		event.dataTransfer.effectAllowed = 'copy';
	}
</script>

{#if show}
	<!-- Backdrop (Overlay only) -->
	{#if !inline}
		<div
			class="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
			transition:fade={{ duration: 200 }}
			onclick={onClose}
			role="dialog"
			tabindex="-1"
			onkeydown={() => {}}
		></div>
	{/if}

	<!-- Drawer / Panel -->
	<div
		class={inline
			? 'relative flex h-full w-full flex-col bg-gray-50'
			: 'fixed top-0 right-0 bottom-0 z-50 flex w-80 transform flex-col overflow-hidden bg-white shadow-2xl transition-transform duration-300'}
		transition:slide={{ axis: 'x', duration: 300 }}
		onclick={(e) => e.stopPropagation()}
		role="document"
		tabindex="-1"
		onkeydown={() => {}}
	>
		<!-- Header -->
		<div class="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-5 py-4">
			<div>
				<h3 class="font-semibold text-gray-900">Allocations</h3>
				<p class="mt-0.5 max-w-[200px] truncate text-xs text-gray-500">
					{tripName || 'All Bookings'}
				</p>
			</div>
			<button
				class="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
				onclick={onClose}
			>
				<X size={18} />
			</button>
		</div>

		<!-- List -->
		<div class="custom-scrollbar flex-1 overflow-y-auto p-0">
			{#if filteredBookings.length === 0}
				<div class="flex flex-col items-center justify-center p-8 text-center text-gray-400">
					<ListFilter size={32} class="mb-2 opacity-50" />
					<p class="text-sm">No bookings found for this trip.</p>
				</div>
			{:else}
				<div class="divide-y divide-gray-100">
					{#each filteredBookings as booking}
						<div
							class="group border-l-4 border-transparent bg-white transition-colors hover:border-blue-500 hover:bg-gray-50"
							draggable="true"
							ondragstart={(e) => handleDragStart(e, booking, 'booking')}
							role="listitem"
						>
							<button
								class="flex w-full items-center justify-between px-5 py-3 text-left"
								onclick={() => toggleBooking(booking.id)}
							>
								<div>
									<div class="text-sm font-medium text-gray-900">{booking.applicantName}</div>
									<div class="text-[10px] text-gray-500">
										{booking.id} · {booking.pilgrims?.length || 0} Pax
									</div>
								</div>
								<ChevronDown
									size={16}
									class="text-gray-400 transition-transform duration-200 {selectedBookingId ===
									booking.id
										? 'rotate-180'
										: ''}"
								/>
							</button>

							{#if selectedBookingId === booking.id}
								<div transition:slide={{ duration: 200 }} class="bg-gray-50/50 px-5 pt-1 pb-3">
									<div class="space-y-2">
										{#each booking.pilgrims || [] as pilgrim}
											<div
												class="flex cursor-grab items-center gap-3 rounded-lg border border-gray-200 bg-white p-2 shadow-sm transition-all hover:border-blue-400 hover:shadow-md active:cursor-grabbing"
												draggable="true"
												ondragstart={(e) => handleDragStart(e, { pilgrim, bookingId: booking.id })}
												role="button"
												tabindex="0"
											>
												<div class="cursor-grab text-gray-400">
													<GripVertical size={14} />
												</div>
												<div
													class="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-[10px] font-bold text-blue-600"
												>
													{pilgrim.no}
												</div>
												<div class="min-w-0 flex-1">
													<div class="truncate text-xs font-medium text-gray-900">
														{pilgrim.name}
													</div>
													<div class="flex items-center gap-1.5 text-[10px] text-gray-500">
														<span class="capitalize">{pilgrim.gender}</span>
														<span>•</span>
														<span>{pilgrim.roomType}</span>
													</div>
												</div>
											</div>
										{/each}
									</div>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
{/if}
