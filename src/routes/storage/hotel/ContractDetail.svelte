<script>
	import { hotelStorageStore } from '$lib/stores/hotelStorageStore.svelte.js';
	import { Palette, NotebookPen } from 'lucide-svelte';
	import WaveDetailDrawer from './WaveDetailDrawer.svelte';
	import RoomDetailModal from './RoomDetailModal.svelte';
	import BookingAllocationDrawer from './BookingAllocationDrawer.svelte';
	import AllocationAlertModal from './AllocationAlertModal.svelte';
	import SwapRoomModal from './SwapRoomModal.svelte';
	import { sidebarState } from '$lib/runes/sidebarState.svelte.js';

	let { contract, hotelId } = $props();

	// Wave switcher — default to first wave
	let defaultWaveId = $derived(contract.waves?.[0]?.id || null);
	let selectedWaveId = $state(null);
	let activeWaveId = $derived(selectedWaveId ?? defaultWaveId);

	// Muted type colors — subtle, not rainbow
	const typeColors = {
		quint: { hex: '#4b5563', light: '#f3f4f6', dark: '#1f2937', label: 'Quint', cap: 5 },
		quad: { hex: '#6b7280', light: '#f3f4f6', dark: '#374151', label: 'Quad', cap: 4 },
		triple: { hex: '#9ca3af', light: '#f9fafb', dark: '#4b5563', label: 'Triple', cap: 3 },
		double: { hex: '#d1d5db', light: '#f9fafb', dark: '#6b7280', label: 'Double', cap: 2 }
	};

	let activeWave = $derived((contract.waves || []).find((w) => w.id === activeWaveId));

	let occupiedRoomIds = $derived(() => {
		return new Set(activeWave?.roomIds || []);
	});

	let roomSummary = $derived(() => {
		const ids = occupiedRoomIds();
		const summary = {};
		for (const room of contract.rooms) {
			const t = room.type;
			if (!summary[t]) summary[t] = { total: 0, occupied: 0, empty: 0, manipulated: 0 };
			summary[t].total++;
			if (ids.has(room.id)) summary[t].occupied++;
			else summary[t].empty++;
			if (room.type !== room.originalType) summary[t].manipulated++;
		}
		return summary;
	});

	let totalOccupied = $derived(() => {
		const ids = occupiedRoomIds();
		return contract.rooms.filter((r) => ids.has(r.id)).length;
	});
	let totalEmpty = $derived(() => contract.rooms.length - totalOccupied());
	let totalManipulated = $derived(contract.rooms.filter((r) => r.type !== r.originalType).length);

	function updateWave(waveId, updates) {
		const updatedWaves = contract.waves.map((w) => {
			if (w.id === waveId) {
				return { ...w, ...updates };
			}
			return w;
		});
		hotelStorageStore.updateContract(hotelId, contract.id, { waves: updatedWaves });
	}

	let activeFlatRate = $derived(activeWave?.flatRate ?? 0);
	let showDrawer = $state(false);
	let showAllocationDrawer = $state(false);
	// No longer store trip name here independently, it comes from activeWave
	let allocationTripName = $derived(activeWave?.tripName || '');

	function openDrawer() {
		if (activeWave) {
			showDrawer = true;
		}
	}

	function toggleAllocationDrawer() {
		showAllocationDrawer = !showAllocationDrawer;
		if (showAllocationDrawer) {
			sidebarState.isCollapsed = true; // Auto-collapse sidebar
		}
	}

	function handleTripSelect(tripName) {
		if (activeWave) {
			updateWave(activeWave.id, { tripName });
		}
	}

	function executeMove(sourceId, targetId) {
		const currentRooms = new Set(activeWave.roomIds || []);
		if (currentRooms.has(sourceId)) {
			// Create new array with source removed and target added
			const newRoomIds = Array.from(currentRooms).filter((id) => id !== sourceId);
			newRoomIds.push(targetId);
			updateWave(activeWave.id, { roomIds: newRoomIds });

			// Move allocation data too
			const currentAllocations = { ...(activeWave.allocations || {}) };
			if (currentAllocations[sourceId]) {
				currentAllocations[targetId] = currentAllocations[sourceId];
				delete currentAllocations[sourceId];
				updateWave(activeWave.id, { allocations: currentAllocations });
			}
		}
	}

	function checkMoveConfirm(sourceRoom, targetRoom) {
		let message = `Apakah Anda yakin ingin memindahkan alokasi dari kamar **${sourceRoom.id}** ke kamar **${targetRoom.id}**?`;
		let title = 'Pindahkan Alokasi';
		let type = 'info';

		if (sourceRoom.type !== targetRoom.type) {
			message += `\n\n⚠️ **Perhatian**: Tipe kamar berbeda (${sourceRoom.type.toUpperCase()} ➝ ${targetRoom.type.toUpperCase()}).`;
			type = 'warning';
		}

		alertState = {
			show: true,
			title,
			message,
			type,
			onConfirm: () => {
				executeMove(sourceRoom.id, targetRoom.id);
				closeAlert();
			}
		};
	}

	function handleDragStart(event, room) {
		if (!occupiedRoomIds().has(room.id)) {
			event.preventDefault();
			return;
		}
		isDragging = true;
		dragSourceRoomId = room.id;
		const data = JSON.stringify({
			type: 'move-room',
			fromRoomId: room.id,
			fromType: room.type
		});
		event.dataTransfer.setData('text/plain', data);
		event.dataTransfer.effectAllowed = 'move';
	}

	// Swap State
	let swapState = $state({
		show: false,
		sourceRoom: null,
		targetRoom: null,
		sourceBooking: null,
		targetBooking: null
	});

	function getBookingForRoom(room) {
		// Try to find real allocation
		const booking = activeWave.allocations?.[room.id];
		if (booking) return booking;

		// Fallback: Generate Mock Data for existing occupied rooms without data
		const cap = typeColors[room.type]?.cap || 2;
		return {
			applicantName: `Jamaah ${room.type.charAt(0).toUpperCase() + room.type.slice(1)}`,
			pilgrims: Array.from({ length: cap }, (_, i) => ({ name: `Jamaah ${i + 1} (${room.id})` }))
		};
	}

	function handleSwapConfirm() {
		const { sourceRoom, targetRoom, sourceBooking, targetBooking } = swapState;

		const currentAllocations = { ...(activeWave.allocations || {}) };

		// Swap allocations
		// Note: We used mock data for display, but we should persist it now if it was missing
		// to ensures consistency for future swaps.
		currentAllocations[sourceRoom.id] = targetBooking;
		currentAllocations[targetRoom.id] = sourceBooking;

		updateWave(activeWave.id, { allocations: currentAllocations });
		swapState.show = false;
	}

	function finalizeDrop(room, booking) {
		// Changed signature to accept booking object
		const currentRooms = new Set(activeWave.roomIds || []);
		let newAllocations = { ...(activeWave.allocations || {}) };

		// If it's a booking object (not just type string), save it
		if (booking && typeof booking === 'object') {
			newAllocations[room.id] = booking;
		}

		if (!currentRooms.has(room.id)) {
			const updatedRoomIds = [...currentRooms, room.id];
			updateWave(activeWave.id, { roomIds: updatedRoomIds, allocations: newAllocations });
		} else {
			// Just update allocations if room was already occupied (edge case)
			updateWave(activeWave.id, { allocations: newAllocations });
		}
	}

	function checkMismatch(room, bookingType, paxCount, booking) {
		const currentRoomType = room.type;

		// 2. Check Type Mismatch & Auto-Manipulate
		if (bookingType && typeColors[bookingType] && bookingType !== currentRoomType) {
			alertState = {
				show: true,
				title: '🔧 Penyesuaian Kamar',
				message: `Booking ini tipe '${bookingType.toUpperCase()}' tetapi kamar saat ini '${currentRoomType.toUpperCase()}'.\n\nApakah Anda ingin mengubah tipe kamar menjadi '${bookingType.toUpperCase()}' secara otomatis?`,
				type: 'info',
				onConfirm: () => {
					// Update room type!
					handleSaveRoom({ id: room.id, type: bookingType });
					finalizeDrop(room, booking);
					closeAlert();
				}
			};
		} else {
			finalizeDrop(room, booking);
		}
	}

	function handleDrop(event, room) {
		event.preventDefault();
		const data = event.dataTransfer.getData('text/plain');
		if (!data) return;

		try {
			const parsed = JSON.parse(data);
			if (parsed.type === 'move-room') {
				// Handle Room-to-Room Move
				const sourceRoomId = parsed.fromRoomId;
				const sourceRoom = contract.rooms.find((r) => r.id === sourceRoomId);

				if (!sourceRoom || sourceRoomId === room.id) return;

				if (occupiedRoomIds().has(room.id)) {
					// --- SWAP LOGIC ---
					const sourceBooking = getBookingForRoom(sourceRoom);
					const targetBooking = getBookingForRoom(room);

					swapState = {
						show: true,
						sourceRoom,
						targetRoom: room,
						sourceBooking,
						targetBooking
					};
					return;
				}

				checkMoveConfirm(sourceRoom, room);
				return;
			}

			let booking, bookingType, paxCount;

			if (parsed.type === 'booking') {
				booking = parsed.booking; // Use the full booking object
				bookingType = booking.roomType?.toLowerCase();
				paxCount = booking.pilgrims?.length || 0;
			} else {
				// Legacy/Single Pilgrim
				bookingType = parsed.pilgrim?.roomType?.toLowerCase();
				paxCount = 1;
				booking = {
					applicantName: parsed.pilgrim?.name || 'Unknown',
					pilgrims: [parsed.pilgrim || {}]
				};
			}

			if (activeWave) {
				const currentRoomType = room.type;
				const currentCap = typeColors[currentRoomType]?.cap || 0;

				// 1. Check Capacity Overflow
				if (paxCount > currentCap) {
					alertState = {
						show: true,
						title: '⚠️ Kapasitas Berlebih',
						message: `Booking ini memiliki ${paxCount} jamaah, tetapi kapasitas kamar '${currentRoomType.toUpperCase()}' hanya ${currentCap}.\n\nApakah Anda yakin ingin melanjutkan?`,
						type: 'warning',
						onConfirm: () => {
							checkMismatch(room, bookingType, paxCount, booking);
							closeAlert();
						}
					};
					return;
				}

				checkMismatch(room, bookingType, paxCount, booking);
			}
		} catch (e) {
			console.error(e);
		}
	}

	function handleSaveWave(updates) {
		if (activeWave) {
			updateWave(activeWave.id, updates);
		}
		showDrawer = false;
	}

	let showRoomModal = $state(false);
	let selectedRoom = $state(null);
	let selectedRoomOccupied = $state(false);
	let dragOverRoomId = $state(null); // Track hovered room for drag effect
	let dragSourceRoomId = $state(null); // Track source room being dragged
	let isDragging = $state(false);
	let alertState = $state({
		show: false,
		title: '',
		message: '',
		type: 'warning',
		onConfirm: () => {}
	});

	function closeAlert() {
		alertState.show = false;
	}

	function openRoomModal(room, isOccupied) {
		selectedRoom = room;
		selectedRoomOccupied = isOccupied;
		showRoomModal = true;
	}

	function handleSaveRoom({ id, type }) {
		if (contract) {
			const updatedRooms = contract.rooms.map((r) => {
				if (r.id === id) {
					return { ...r, type };
				}
				return r;
			});

			hotelStorageStore.updateContract(hotelId, contract.id, { rooms: updatedRooms });
		}
		showRoomModal = false;
	}
</script>

<div
	class="p-2 transition-all duration-300"
	style="margin-right: {showAllocationDrawer ? '320px' : '0'}"
>
	<!-- Wave tabs -->
	<div class="mb-3 flex items-center gap-1.5">
		<span class="mr-1 text-[10px] font-semibold uppercase" style="color: #9ca3af;">Wave:</span>
		{#each contract.waves || [] as wave}
			<button
				class="rounded-md border px-2.5 py-1 text-[11px] font-medium transition-all"
				style={activeWaveId === wave.id
					? `background: ${wave.color || '#972395'}; color: white; border-color: ${wave.color || '#972395'};`
					: 'background: white; color: #6b7280; border-color: #e5e7eb;'}
				onclick={() => {
					selectedWaveId = wave.id;
					isEditing = false;
				}}
			>
				{wave.name} ({wave.roomsUsed})
			</button>
		{/each}
	</div>

	<!-- Actions -->
	<div class="mb-3 flex items-center justify-end gap-2">
		<button
			class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors {showAllocationDrawer
				? 'bg-red-50 text-red-700 hover:bg-red-100'
				: 'bg-blue-50 text-blue-700 hover:bg-blue-100'}"
			onclick={toggleAllocationDrawer}
		>
			<NotebookPen class="h-3.5 w-3.5" />
			<span>{showAllocationDrawer ? 'Tutup Atur Ruangan' : 'Atur Ruangan'}</span>
		</button>
		<button
			class="flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200"
			onclick={openDrawer}
		>
			<Palette class="h-3.5 w-3.5" />
			<span>Detail & Edit</span>
		</button>
	</div>

	<!-- Room grid -->
	<div
		class="grid gap-2 overflow-visible p-1 transition-all duration-300"
		style="grid-template-columns: repeat({showAllocationDrawer ? 5 : 10}, 1fr);"
	>
		{#each contract.rooms as room}
			{@const tc = typeColors[room.type]}
			{@const isOccupied = occupiedRoomIds().has(room.id)}
			{@const isManipulated = room.type !== room.originalType}
			{@const origTc = typeColors[room.originalType]}
			{@const cellColor = isOccupied ? activeWave?.color || tc.hex : 'white'}
			{@const borderColor = isOccupied ? activeWave?.color || tc.hex : '#e5e7eb'}
			{@const isDragOver = dragOverRoomId === room.id}
			{@const isDragSource = dragSourceRoomId === room.id}

			<!-- Manipulated Styles -->
			{@const manipulatedStyles = isManipulated
				? 'border-style: dashed; border-width: 2px; border-color: #f59e0b;'
				: `border-color: ${borderColor};`}

			<!-- Wrapper for Drop Target and Layout -->
			<div
				class="group relative cursor-pointer"
				onclick={() => openRoomModal(room, isOccupied)}
				ondragover={(e) => {
					e.preventDefault();
					dragOverRoomId = room.id;
				}}
				ondragleave={() => (dragOverRoomId = null)}
				ondrop={(e) => {
					handleDrop(e, room);
					dragOverRoomId = null;
				}}
				role="button"
				tabindex="0"
				onkeydown={(e) => e.key === 'Enter' && openRoomModal(room, isOccupied)}
				style="height: {showAllocationDrawer ? '56px' : '40px'};"
			>
				<!-- Draggable Inner Box (The Visuals) -->
				<div
					class="flex h-full w-full flex-col items-center justify-center rounded border transition-all hover:shadow-sm {isDragOver
						? 'z-20 scale-110 bg-blue-50 shadow-xl ring-2 ring-blue-500'
						: ''} {isDragSource ? 'scale-95 opacity-60 ring-2 ring-amber-500' : ''}"
					draggable={isOccupied}
					ondragstart={(e) => handleDragStart(e, room)}
					ondragend={() => {
						isDragging = false;
						dragSourceRoomId = null;
						dragOverRoomId = null;
					}}
					style="padding: {isManipulated ? '4px 2px' : '6px 2px'};
						background: {cellColor}; {manipulatedStyles}"
				>
					<span
						class="pointer-events-none text-[9px] leading-none font-bold"
						style={isOccupied ? 'color: rgba(255,255,255,0.9);' : 'color: #9ca3af;'}
					>
						{room.id}
					</span>

					<span
						class="pointer-events-none mt-0.5 text-[8px] leading-none font-semibold uppercase"
						style={isOccupied ? 'color: white;' : `color: ${tc.dark};`}
					>
						{tc.label}
					</span>

					{#if isManipulated}
						<div
							class="pointer-events-none mt-0.5 decoration-slice text-center text-[6px] leading-tight font-medium line-through opacity-70"
							style="color: {isOccupied ? 'rgba(255,255,255,0.8)' : '#9ca3af'};"
						>
							{origTc.label}
						</div>
					{/if}
				</div>

				<!-- Tooltip (Sibling, excluded from drag image) -->
				<div
					class="pointer-events-none absolute z-[1000] w-max max-w-[180px] rounded px-2 py-1 text-center text-[10px] leading-tight whitespace-normal opacity-0 shadow-xl ring-1 ring-gray-900/5 transition-opacity group-hover:opacity-100"
					style="background: #1f2937; color: white; bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%);"
				>
					{room.id} · {tc.label} ({tc.cap} pax)
					{#if isManipulated}
						· {origTc.label}→{tc.label}{/if}
					· {isOccupied ? 'Terisi' : 'Kosong'}
					<div
						class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent"
						style="border-top-color: #1f2937;"
					></div>
				</div>
			</div>
		{/each}
	</div>

	<WaveDetailDrawer
		show={showDrawer}
		wave={activeWave}
		roomSummary={roomSummary()}
		{typeColors}
		totalOccupied={totalOccupied()}
		totalEmpty={totalEmpty()}
		{totalManipulated}
		onClose={() => (showDrawer = false)}
		onSave={handleSaveWave}
	/>

	<RoomDetailModal
		show={showRoomModal}
		room={selectedRoom}
		isOccupied={selectedRoomOccupied}
		{activeWave}
		onClose={() => (showRoomModal = false)}
		onSave={handleSaveRoom}
	/>

	<AllocationAlertModal
		show={alertState.show}
		title={alertState.title}
		message={alertState.message}
		type={alertState.type}
		onConfirm={alertState.onConfirm}
		onCancel={closeAlert}
	/>

	<SwapRoomModal
		show={swapState.show}
		sourceRoom={swapState.sourceRoom}
		targetRoom={swapState.targetRoom}
		sourceBooking={swapState.sourceBooking}
		targetBooking={swapState.targetBooking}
		{typeColors}
		onConfirm={handleSwapConfirm}
		onCancel={() => (swapState.show = false)}
	/>

	<!-- Fixed Allocation Panel (Outside Flow) -->
	<div
		class="fixed top-0 right-0 z-50 h-full border-l border-gray-200 bg-white shadow-xl transition-transform duration-300"
		style="width: 320px; transform: translateX({showAllocationDrawer ? '0' : '100%'});"
	>
		<BookingAllocationDrawer
			show={true}
			inline={true}
			tripName={allocationTripName}
			onClose={() => (showAllocationDrawer = false)}
			onTripSelect={handleTripSelect}
		/>
	</div>
</div>
