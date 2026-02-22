<script>
	import { X, ChevronDown, User, FileText, Globe, Briefcase, AlertTriangle } from 'lucide-svelte';
	import { fade, scale, slide } from 'svelte/transition';
	import { getRoomTypeForWave } from '../GridView/parts/roomTypeHelpers.js';

	let {
		show = false,
		room = null,
		isOccupied = false,
		activeWave = null,
		onClose,
		onSave
	} = $props();

	// Get effective type for this wave (derived, not state)
	let selectedType = $derived.by(() => {
		if (!show || !room || !activeWave) return 'double';
		return getRoomTypeForWave(room, activeWave);
	});

	// Mutable selected type for editing
	let editedType = $state('');

	const typeOptions = [
		{ value: 'unset', label: 'Belum Diatur', cap: '-' },
		{ value: 'quint', label: 'Quint', cap: 5 },
		{ value: 'quad', label: 'Quad', cap: 4 },
		{ value: 'triple', label: 'Triple', cap: 3 },
		{ value: 'double', label: 'Double', cap: 2 }
	];

	let openGuestIndex = $state(0);
	let isInitializing = $state(false);

	function toggleGuest(index) {
		openGuestIndex = openGuestIndex === index ? -1 : index;
	}

	// Get Real Guests from activeWave
	let guests = $derived.by(() => {
		if (!show || !room || !activeWave || !activeWave.jamaah) return [];
		return activeWave.jamaah.filter((j) => j.roomId === room.id);
	});

	// Track when modal opens (show changes from false to true)
	let prevShow = $state(false);
	$effect(() => {
		if (show && !prevShow) {
			// Modal just opened - initialize
			isInitializing = true;
		}
		prevShow = show;
	});

	$effect(() => {
		if (show && room && activeWave && isInitializing) {
			// Initialize edited type from effective type
			editedType = getRoomTypeForWave(room, activeWave);
			openGuestIndex = 0;

			// Done initializing
			isInitializing = false;
		}
	});

	let capacityWarning = $derived.by(() => {
		if (!editedType) return null;
		const newTypeConfig = typeOptions.find((t) => t.value === editedType);
		if (!newTypeConfig || editedType === 'unset') return null;

		const newCap = newTypeConfig.cap;
		const currentCount = guests.length;

		if (currentCount > newCap) {
			return {
				title: 'Kapasitas Melampaui Batas',
				message: `Kamar ini memiliki ${currentCount} jamaah, tapi tipe ${newTypeConfig.label} hanya muat ${newCap} orang.`,
				type: 'error'
			};
		}
		return null;
	});

	// Bed analysis - use selectedType (effective type) for display
	let currentCap = $derived.by(() => {
		const typeConfig = typeOptions.find((t) => t.value === selectedType);
		if (!typeConfig || selectedType === 'unset') return '-';
		return typeConfig.cap;
	});
	let emptyBeds = $derived.by(() => {
		if (currentCap === '-') return '-';
		return Math.max(0, currentCap - guests.length);
	});
	let overflowBeds = $derived.by(() => {
		if (currentCap === '-') return 0;
		return Math.max(0, guests.length - currentCap);
	});

	function handleSave() {
		if (onSave && room) {
			console.log('RoomDetailModal handleSave:', {
				roomId: room.id,
				type: editedType
			});

			onSave({
				id: room.id,
				type: editedType
			});
		}
	}

	function handleClose() {
		if (onClose) onClose();
	}
</script>

{#if show}
	<!-- Backdrop -->
	<div
		class="fixed inset-0 z-[10100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
		transition:fade={{ duration: 200 }}
		onclick={handleClose}
		role="dialog"
		tabindex="-1"
		onkeydown={() => {}}
	>
		<!-- Modal -->
		<div
			class="relative flex max-h-[85vh] w-full max-w-sm flex-col rounded-xl bg-white shadow-2xl"
			transition:scale={{ duration: 200, start: 0.95 }}
			onclick={(e) => e.stopPropagation()}
			role="document"
			tabindex="-1"
			onkeydown={() => {}}
		>
			<!-- Header -->
			<div
				class="flex flex-shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4"
			>
				<div>
					<h3 class="font-semibold text-gray-900">Room {room?.id}</h3>
					<p class="mt-0.5 text-xs text-gray-500">
						{isOccupied ? 'Occupied' : 'Empty'} · {room?.originalType?.toUpperCase()}
						{#if room?.originalType !== editedType}
							<span class="font-medium text-orange-500">→ {editedType?.toUpperCase()}</span>
						{/if}
					</p>
				</div>
				<button
					class="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
					onclick={handleClose}
				>
					<X size={18} />
				</button>
			</div>

			<!-- Content -->
			<div class="custom-scrollbar flex-1 overflow-y-auto p-0">
				<!-- Package Info (Wave Level) -->
				{#if activeWave}
					<div class="border-b border-blue-100 bg-blue-50/50 px-5 py-3">
						<div class="flex items-start gap-3">
							<div class="mt-0.5 text-blue-500">
								<Briefcase size={14} />
							</div>
							<div>
								<h4 class="text-xs font-semibold tracking-wide text-blue-900 uppercase">
									Package Info
								</h4>
								<p class="mt-0.5 text-sm font-medium text-blue-800">
									{activeWave.tripName || 'No Package Name'}
								</p>
								<p class="mt-0.5 text-[10px] text-blue-600">Wave: {activeWave.name}</p>
							</div>
						</div>
					</div>
				{/if}

				{#if capacityWarning}
					<div
						class="mx-5 mt-4 rounded-lg border border-red-200 bg-red-50 p-3 shadow-sm"
						transition:slide
					>
						<h4 class="mb-1 flex items-center gap-1.5 text-xs font-bold text-red-800">
							<AlertTriangle size={14} />
							{capacityWarning.title}
						</h4>
						<p class="text-[11px] leading-relaxed text-red-600">
							{capacityWarning.message}
						</p>
						<p class="mt-2 text-[10px] font-semibold tracking-wider text-red-700 uppercase">
							⚠️ Tetap simpan? Perubahan akan berdampak pada manifest.
						</p>
					</div>
				{/if}

				{#if isOccupied && guests.length > 0}
					<!-- Guest List -->
					<div class="p-5 pb-2">
						<h4 class="mb-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">
							Guest Information ({guests.length})
						</h4>

						<!-- Bed Status Summary -->
						<div
							class="mb-3 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5"
						>
							<div class="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
								<span>{guests.length} / {currentCap}</span>
								<span class="text-gray-400">terisi</span>
							</div>
							<div class="h-3 w-px bg-gray-200"></div>
							{#if emptyBeds > 0}
								<div class="flex items-center gap-1 text-xs font-semibold text-green-600">
									🛏️ {emptyBeds} bed kosong
								</div>
							{/if}
							{#if overflowBeds > 0}
								<div class="flex items-center gap-1 text-xs font-bold text-red-600">
									⚠️ {overflowBeds} not allocated bed
								</div>
							{/if}
							{#if emptyBeds === 0 && overflowBeds === 0}
								<div class="flex items-center gap-1 text-xs font-semibold text-blue-600">
									✅ Full
								</div>
							{/if}
						</div>
						<div class="space-y-2">
							{#each guests as guest, i}
								<div
									class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all {openGuestIndex ===
									i
										? 'border-[#972395] ring-1 ring-[#972395]'
										: ''}"
								>
									<button
										class="flex w-full items-center justify-between bg-gray-50 px-4 py-3 text-left transition-colors hover:bg-gray-100"
										onclick={() => toggleGuest(i)}
									>
										<div class="flex items-center gap-3">
											<div
												class="flex h-8 w-8 items-center justify-center rounded-full bg-[#972395]/10 text-[#972395]"
											>
												<User size={14} />
											</div>
											<div>
												<div class="text-sm font-medium text-gray-900">{guest.name}</div>
												<div class="text-[10px] text-gray-500">Gender: {guest.gender}</div>
											</div>
										</div>
										<ChevronDown
											size={16}
											class="text-gray-400 transition-transform duration-200 {openGuestIndex === i
												? 'rotate-180'
												: ''}"
										/>
									</button>

									{#if openGuestIndex === i}
										<div
											transition:slide={{ duration: 200 }}
											class="border-t border-gray-100 bg-white px-4 py-3"
										>
											<div class="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
												<div class="col-span-2">
													<span class="mb-0.5 block text-gray-400">ID / Passport</span>
													<span class="font-medium text-gray-700">{guest.id}</span>
												</div>
											</div>
										</div>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				{:else}
					<div class="p-8 text-center">
						<div
							class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400"
						>
							<User size={20} />
						</div>
						<h3 class="text-sm font-medium text-gray-900">Room Empty</h3>
						<p class="mt-1 text-xs text-gray-500">No guests assigned to this room yet.</p>
					</div>
				{/if}

				<!-- Room Configuration -->
				<div class="border-t border-gray-100 bg-gray-50/50 p-5 pt-4">
					<!-- Room Type Settings -->
					<div class="mb-3 flex items-center justify-between">
						<label
							class="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-gray-500 uppercase"
						>
							<FileText size={12} />
							Room Type Configuration
						</label>
						{#if room?.originalType !== editedType}
							<span
								class="rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-medium text-orange-700"
								>Modified</span
							>
						{/if}
					</div>

					<div class="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
						<div class="mb-2 flex items-center justify-between">
							<span class="text-xs text-gray-500">Effective Type</span>
							<span class="text-xs font-medium text-gray-900 capitalize">{editedType}</span>
						</div>

						<div class="grid grid-cols-4 gap-1.5">
							{#each typeOptions as option}
								<button
									class="flex flex-col items-center justify-center rounded border py-1.5 text-[10px] font-medium transition-all
									{editedType === option.value
										? 'border-[#972395] bg-[#972395] text-white shadow-sm'
										: 'border-gray-100 bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700'}"
									onclick={() => (editedType = option.value)}
								>
									<span>{option.label}</span>
									<span class="text-[9px] font-normal opacity-80"
										>({option.cap === '-' ? '-' : option.cap})</span
									>
								</button>
							{/each}
						</div>
						<p class="mt-2 text-center text-[10px] text-gray-400">
							Safety check enabled for capacity changes.
						</p>
					</div>
				</div>
			</div>

			<div
				class="flex flex-shrink-0 justify-end gap-3 rounded-b-xl border-t border-gray-100 bg-white p-4"
			>
				<button
					class="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
					onclick={handleClose}
				>
					Close
				</button>
				<button
					class="rounded-lg px-4 py-2 text-sm font-medium text-white transition-all {capacityWarning
						? 'bg-orange-600 shadow-lg shadow-orange-100 hover:bg-orange-700'
						: 'bg-[#972395] hover:bg-[#7a1c78]'}"
					onclick={handleSave}
				>
					{capacityWarning ? 'Simpan & Paksa' : 'Simpan Perubahan'}
				</button>
			</div>
		</div>
	</div>
{/if}
