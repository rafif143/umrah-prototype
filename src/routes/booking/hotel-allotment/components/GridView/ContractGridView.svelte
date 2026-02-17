<script>
	import { hotelStorageStore } from '$lib/stores/hotelStorageStore.svelte.js';
	import { gregorianToHijri, hijriMonths } from '$lib/utils/hijri.js';
	import { Maximize2, Minimize2, Users } from 'lucide-svelte';
	import { sidebarState } from '$lib/runes/sidebarState.svelte.js';
	import {
		typeConfig as defaultTypeConfig,
		typeColors,
		roomCapacity
	} from '../../shared/hotelAllotmentHelpers.js';

	// Parts
	import ContractGridSidebar from './parts/ContractGridSidebar.svelte';
	import ContractGridTable from './parts/ContractGridTable.svelte';
	import {
		getAllDates,
		getRoomsByType,
		getOrderedRooms,
		getCellLookup,
		getJamaahInRoom,
		checkWaveOverlap,
		isContractFullyAllocated,
		canWaveMoveToRoom
	} from './parts/contractHelpers.js';
	import { getRoomTypeForWave } from './parts/roomTypeHelpers.js';

	// Modals & Drawers

	import RoomDetailModal from '../Modals/RoomDetailModal.svelte';
	import AddWaveModal from '../Modals/AddWaveModal.svelte';

	import AllocationAlertModal from '../Modals/AllocationAlertModal.svelte';
	import SwapRoomModal from '../Modals/SwapRoomModal.svelte';

	let { contract, hotelId } = $props();

	// === UI State ===
	let isFullscreen = $state(false);
	let showJamaahPanel = $state(true);
	let draggedJamaah = $state(null);
	let dropTargetRoom = $state(null);
	let roomTypeMenu = $state(null);
	let hoveredCell = $state(null);
	let hoverRoomId = $state(null);

	// === Configuration State ===
	let localTypeConfig = $state({ ...defaultTypeConfig });

	let showAddWaveModal = $state(false);
	let editingWave = $state(null);

	// === Drawer/Modal State (from Card View) ===

	let showRoomModal = $state(false);
	let selectedRoom = $state(null);
	let selectedRoomOccupied = $state(false);
	let dragSourceRoomId = $state(null);
	let dragSourceWaveId = $state(null);
	let isDraggingRoom = $state(false);

	// Tetris-style wave cell drag state
	let draggedWaveInfo = $state(null); // { waveId, fromRoomId }

	let alertState = $state({
		show: false,
		title: '',
		message: '',
		type: 'warning',
		onConfirm: () => {}
	});
	let swapState = $state({
		show: false,
		sourceRoom: null,
		targetRoom: null,
		sourceBooking: null,
		targetBooking: null
	});

	// Date helpers
	let allDates = $derived(getAllDates(contract));
	let roomsByType = $derived(getRoomsByType(contract));
	let orderedRooms = $derived(getOrderedRooms(contract));

	// Cell lookup: LEFT = checkout, RIGHT = checkin
	let cellLookup = $derived(getCellLookup(contract));

	let isFullyAllocated = $derived(isContractFullyAllocated(contract));

	// Selected wave
	let selectedWaveIndex = $state(0);
	let selectedWave = $derived((contract.waves || [])[selectedWaveIndex]);

	// Jamaah helpers
	// (Moved to contractHelpers.js, but keeping getRoomOccupancy if needed locally)
	function getRoomOccupancy(roomId) {
		if (!selectedWave) return { count: 0, capacity: 0 };
		const room = contract.rooms.find((r) => r.id === roomId);
		const capacity = roomCapacity[room?.type] || 2;
		const jamaahInRoom = getJamaahInRoom(contract, selectedWaveIndex, roomId);
		return { count: jamaahInRoom.length, capacity };
	}

	// Undo History
	let historyStack = $state([]);
	let showUndoToast = $state(false);
	let undoTimeout;

	function pushHistory() {
		// Deep clone current waves (including roomTypeOverrides)
		const snapshot = {
			waves: JSON.parse(JSON.stringify(contract.waves || []))
		};
		historyStack.push(snapshot);
		if (historyStack.length > 20) historyStack.shift(); // Limit history size
	}

	function handleUndo() {
		if (historyStack.length === 0) return;
		const previousState = historyStack.pop();

		// Update contract without pushing to history (restore waves with roomTypeOverrides)
		hotelStorageStore.updateContract(hotelId, contract.id, { 
			waves: previousState.waves
		});

		// Show toast
		showUndoToast = true;
		clearTimeout(undoTimeout);
		undoTimeout = setTimeout(() => {
			showUndoToast = false;
		}, 3000);
	}

	function handleKeydown(e) {
		if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
			e.preventDefault();
			handleUndo();
		}
	}

	// Update wave data
	function updateWave(waveId, updates) {
		pushHistory(); // Save state before update
		const updatedWaves = contract.waves.map((w) => (w.id === waveId ? { ...w, ...updates } : w));
		hotelStorageStore.updateContract(hotelId, contract.id, { waves: updatedWaves });
	}

	function handleCreateWave(waveData) {
		pushHistory(); // Save state before create/update
		let updatedWaves;
		if (waveData.id) {
			// Update existing
			updatedWaves = (contract.waves || []).map((w) =>
				w.id === waveData.id ? { ...w, ...waveData } : w
			);
		} else {
			// Create new
			const newWave = {
				id: crypto.randomUUID(),
				...waveData,
				tripName: '',
				rooms: [],
				roomIds: [],
				jamaah: [],
				roomsUsed: 0
			};
			updatedWaves = [...(contract.waves || []), newWave];
		}

		hotelStorageStore.updateContract(hotelId, contract.id, { waves: updatedWaves });
		if (contract) contract.waves = updatedWaves;
		editingWave = null;
	}

	function handleAddWave() {
		editingWave = null;
		showAddWaveModal = true;
	}

	function openEditWave(e, wave) {
		e.stopPropagation();
		editingWave = wave;
		showAddWaveModal = true;
	}

	// Drag & Drop Jamaah
	function onDragStart(e, jamaah, waveIndex) {
		draggedJamaah = { ...jamaah, waveIndex };
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'jamaah', ...jamaah, waveIndex }));
	}

	function executeJamaahDrop(room, jamaahData, waveIndex) {
		const targetWave = (contract.waves || [])[waveIndex];
		if (!targetWave) return;

		if (!(targetWave.roomIds || []).includes(room.id)) {
			const newRoomIds = [...(targetWave.roomIds || []), room.id];
			updateWave(targetWave.id, { roomIds: newRoomIds, roomsUsed: newRoomIds.length });
		}

		const updatedJamaah = targetWave.jamaah.map((j) =>
			j.id === jamaahData.id ? { ...j, roomId: room.id } : j
		);
		updateWave(targetWave.id, { jamaah: updatedJamaah });
	}

	function processJamaahDrop(room, jamaahData, waveIndex) {
		const targetWave = (contract.waves || [])[waveIndex];
		if (!targetWave) return;

		const roomType = getRoomTypeForWave(room, targetWave);
		const capacity = roomCapacity[roomType] || 2;
		const currentInRoom = getJamaahInRoom(contract, waveIndex, room.id);

		if (currentInRoom.length >= capacity && jamaahData.roomId !== room.id) {
			alertState = {
				show: true,
				title: 'Kamar Penuh',
				message: `Kamar ${room.id} sudah penuh! (${currentInRoom.length}/${capacity})`,
				type: 'error',
				onConfirm: () => closeAlert()
			};
			return;
		}

		// Always show confirmation modal
		alertState = {
			show: true,
			title: 'Konfirmasi Pindah Jamaah',
			message: `Pindahkan ${jamaahData.name} ke Kamar ${room.id} (${roomType.toUpperCase()})?`,
			type: 'info',
			onConfirm: () => {
				executeJamaahDrop(room, jamaahData, waveIndex);
				closeAlert();
			}
		};
	}

	function onDragOver(e, roomId) {
		e.preventDefault();
		e.dataTransfer.dropEffect = 'move';
		dropTargetRoom = roomId;
	}

	function onDragLeave() {
		dropTargetRoom = null;
	}

	function onDrop(e, roomId) {
		e.preventDefault();
		dropTargetRoom = null;

		const data = e.dataTransfer.getData('text/plain');
		try {
			const parsed = JSON.parse(data);
			
			// Handle Booking Drop (all jamaah in booking)
			if (parsed.type === 'booking') {
				const room = contract.rooms.find((r) => r.id === roomId);
				if (room) processBookingDrop(room, parsed);
				return;
			}
			
			// Handle Jamaah Drop (from JSON)
			if (parsed.type === 'jamaah' || parsed.waveIndex !== undefined) {
				const room = contract.rooms.find((r) => r.id === roomId);
				if (room) processJamaahDrop(room, parsed, parsed.waveIndex);
				draggedJamaah = null;
				return;
			}
		} catch {}

		// Fallback legacy global state check
		if (!draggedJamaah) return;
		const room = contract.rooms.find((r) => r.id === roomId);
		if (room && draggedJamaah.waveIndex !== undefined) {
			processJamaahDrop(room, draggedJamaah, draggedJamaah.waveIndex);
		}
		draggedJamaah = null;
	}

	function processBookingDrop(room, bookingData) {
		const { waveIndex, jamaahIds, requestedType, count } = bookingData;
		const targetWave = (contract.waves || [])[waveIndex];
		if (!targetWave) return;

		const roomType = getRoomTypeForWave(room, targetWave);
		const capacity = roomCapacity[roomType] || 2;

		// Check capacity
		const currentInRoom = getJamaahInRoom(contract, waveIndex, room.id);
		const totalAfter = currentInRoom.length + count;

		if (totalAfter > capacity) {
			alertState = {
				show: true,
				title: 'Kapasitas Tidak Cukup',
				message: `Booking ini memiliki ${count} jamaah, tapi kamar ${room.id} (${roomType.toUpperCase()}) hanya tersisa ${capacity - currentInRoom.length} tempat.`,
				type: 'error',
				onConfirm: () => closeAlert()
			};
			return;
		}

		// Confirm allocation
		alertState = {
			show: true,
			title: 'Konfirmasi Alokasi Booking',
			message: `Alokasikan ${count} jamaah dari booking ini ke Kamar ${room.id} (${roomType.toUpperCase()})?`,
			type: 'info',
			onConfirm: () => {
				executeBookingDrop(room, bookingData, waveIndex);
				closeAlert();
			}
		};
	}

	function executeBookingDrop(room, bookingData, waveIndex) {
		const targetWave = (contract.waves || [])[waveIndex];
		if (!targetWave) return;

		pushHistory(); // Save state before update

		// Prepare updates
		const updates = {};

		// Add room to wave if not already there
		if (!(targetWave.roomIds || []).includes(room.id)) {
			const newRoomIds = [...(targetWave.roomIds || []), room.id];
			updates.roomIds = newRoomIds;
			updates.roomsUsed = newRoomIds.length;
		}

		// Update all jamaah in booking to this room
		const updatedJamaah = targetWave.jamaah.map((j) =>
			bookingData.jamaahIds.includes(j.id) ? { ...j, roomId: room.id } : j
		);
		updates.jamaah = updatedJamaah;

		// Single update call
		updateWave(targetWave.id, updates);
	}

	function removeJamaahFromRoom(jamaahId) {
		// iterate all waves to find the jamaah
		for (const wave of contract.waves || []) {
			const jIndex = (wave.jamaah || []).findIndex((j) => j.id === jamaahId);
			if (jIndex !== -1) {
				const updatedJamaah = [...wave.jamaah];
				updatedJamaah[jIndex] = { ...updatedJamaah[jIndex], roomId: '' };
				updateWave(wave.id, { jamaah: updatedJamaah });
				return;
			}
		}
	}

	function emptyRoom(roomId) {
		if (!selectedWave) return;

		const jamaahInRoom = getJamaahInRoom(contract, selectedWaveIndex, roomId);
		if (jamaahInRoom.length === 0) return;

		alertState = {
			show: true,
			title: 'Konfirmasi Kosongkan Kamar',
			message: `Kosongkan kamar ${roomId}? ${jamaahInRoom.length} jamaah akan dikembalikan ke "Belum Dialokasikan".`,
			type: 'warning',
			onConfirm: () => {
				executeEmptyRoom(roomId);
				closeAlert();
			}
		};
	}

	function executeEmptyRoom(roomId) {
		if (!selectedWave) return;

		pushHistory(); // Save state before update

		// Remove all jamaah from this room (set roomId to empty)
		const updatedJamaah = selectedWave.jamaah.map((j) =>
			j.roomId === roomId ? { ...j, roomId: '' } : j
		);

		// Remove room from wave's roomIds
		const newRoomIds = (selectedWave.roomIds || []).filter((id) => id !== roomId);

		// Update wave
		updateWave(selectedWave.id, {
			jamaah: updatedJamaah,
			roomIds: newRoomIds,
			roomsUsed: newRoomIds.length
		});
	}

	// Room type manipulation (per-wave)
	function changeRoomType(roomId, newType) {
		if (!selectedWave) {
			console.error('No selectedWave when changing room type');
			return;
		}
		
		console.log('Changing room type:', {
			roomId,
			newType,
			waveId: selectedWave.id,
			waveName: selectedWave.name,
			currentOverrides: selectedWave.roomTypeOverrides
		});
		
		pushHistory(); // Save state before room type change
		
		// Get current overrides for this wave
		const currentOverrides = { ...(selectedWave.roomTypeOverrides || {}) };
		
		// Find the room's original type
		const room = contract.rooms.find((r) => r.id === roomId);
		const originalType = room?.originalType;
		
		console.log('Room info:', { roomId, originalType, newType });
		
		// If newType is same as original, remove the override
		if (newType === originalType) {
			delete currentOverrides[roomId];
			console.log('Removing override (back to original)');
		} else {
			// Set the override for this wave
			currentOverrides[roomId] = newType;
			console.log('Setting override:', currentOverrides);
		}
		
		// Update wave with new overrides
		updateWave(selectedWave.id, { roomTypeOverrides: currentOverrides });
		roomTypeMenu = null;
	}

	function openRoomTypeMenu(e, roomId) {
		e.preventDefault();
		e.stopPropagation();
		roomTypeMenu = { roomId, x: e.clientX, y: e.clientY };
	}

	function closeRoomTypeMenu() {
		roomTypeMenu = null;
	}

	// === Derived values for allocation (from Card View) ===

	let occupiedRoomIds = $derived(() => {
		return new Set(selectedWave?.roomIds || []);
	});

	function closeAlert() {
		alertState.show = false;
	}

	function openRoomModal(room, isOccupied) {
		selectedRoom = room;
		selectedRoomOccupied = isOccupied;
		showRoomModal = true;
	}

	function handleCellClick({ roomId, date, wave }) {
		if (wave) {
			const index = (contract.waves || []).findIndex((w) => w.id === wave.id);
			if (index !== -1) selectedWaveIndex = index;
		}

		const room = contract.rooms.find((r) => r.id === roomId);
		if (room) {
			const occupants = getJamaahInRoom(contract, selectedWaveIndex, roomId);
			openRoomModal(room, occupants.length > 0);
		}
	}

	function handleSaveRoom({ id, type, roomColor, force = false }) {
		const occupants = getJamaahInRoom(contract, selectedWaveIndex, id);
		const cap = roomCapacity[type] || 2;

		if (occupants.length > cap && !force) {
			alertState = {
				show: true,
				title: 'Konfirmasi Kapasitas',
				message: `Kamar ini memiliki ${occupants.length} orang, tapi kapasitas ${type.toUpperCase()} hanya ${cap}.\nTetap ubah tipe kamar?`,
				type: 'error',
				onConfirm: () => {
					handleSaveRoom({ id, type, roomColor, force: true });
					closeAlert();
				}
			};
			return;
		}

		// Don't push history here - updateWave will do it
		// pushHistory(); 

		// Get current overrides for this wave
		const currentOverrides = { ...(selectedWave.roomTypeOverrides || {}) };
		
		// Find the room's original type
		const room = contract.rooms.find((r) => r.id === id);
		const originalType = room?.originalType || room?.type;
		
		// If type is same as original, remove the override
		if (type === originalType) {
			delete currentOverrides[id];
		} else {
			// Set the override for this wave
			currentOverrides[id] = type;
		}

		// Prepare wave updates
		let waveUpdates = { roomTypeOverrides: currentOverrides };
		
		// Update room color for this wave
		if (roomColor) {
			const currentRoomColors = { ...(selectedWave.roomColors || {}) };
			currentRoomColors[id] = roomColor;
			waveUpdates.roomColors = currentRoomColors;
			console.log('Saving room color:', { roomId: id, color: roomColor, allColors: currentRoomColors });
		}
		
		updateWave(selectedWave.id, waveUpdates);
		showRoomModal = false;
	}

	// === Room Move & Swap (from Card View) ===
	function getBookingForRoom(room, waveId = selectedWave?.id) {
		const wave = (contract.waves || []).find((w) => w.id === waveId);
		
		// First check allocations (legacy/booking data)
		const booking = wave?.allocations?.[room.id];
		if (booking) return booking;
		
		// Then check jamaah array (real data)
		const jamaahInRoom = (wave?.jamaah || []).filter((j) => j.roomId === room.id);
		if (jamaahInRoom.length > 0) {
			return {
				applicantName: `${jamaahInRoom.length} Jamaah di ${room.id}`,
				pilgrims: jamaahInRoom.map((j) => ({ name: j.name, gender: j.gender }))
			};
		}
		
		// Fallback: empty room
		return {
			applicantName: 'Kamar Kosong',
			pilgrims: []
		};
	}

	function executeMove(sourceId, targetId, waveId = dragSourceWaveId || selectedWave?.id) {
		const wave = (contract.waves || []).find((w) => w.id === waveId);
		if (!wave) return;

		const currentRooms = new Set(wave.roomIds || []);
		if (currentRooms.has(sourceId)) {
			// Update room IDs
			const newRoomIds = Array.from(currentRooms).filter((id) => id !== sourceId);
			if (!newRoomIds.includes(targetId)) newRoomIds.push(targetId);

			// Update allocations
			const currentAllocations = { ...(wave.allocations || {}) };
			if (currentAllocations[sourceId]) {
				currentAllocations[targetId] = currentAllocations[sourceId];
				delete currentAllocations[sourceId];
			}

			// Update jamaah roomId
			const updatedJamaah = (wave.jamaah || []).map((j) =>
				j.roomId === sourceId ? { ...j, roomId: targetId } : j
			);

			// Execute single update
			updateWave(wave.id, {
				roomIds: newRoomIds,
				allocations: currentAllocations,
				jamaah: updatedJamaah,
				roomsUsed: newRoomIds.length
			});
		}
	}

	function checkMoveConfirm(sourceRoom, targetRoom, waveId = dragSourceWaveId || selectedWave?.id) {
		const waveindex = (contract.waves || []).findIndex((w) => w.id === waveId);

		// Use SwapRoomModal for detailed move confirmation too
		swapState = {
			show: true,
			mode: 'move', // New mode: One-way move
			sourceRoom,
			targetRoom,
			sourceBooking: getBookingForRoom(sourceRoom, waveId),
			targetBooking: { applicantName: 'Kamar Kosong', pilgrims: [] }, // Empty target
			waveId
		};
	}

	function handleSwapConfirm() {
		const { mode, sourceRoom, targetRoom, sourceBooking, targetBooking, waveId } = swapState;

		if (mode === 'move') {
			executeMove(sourceRoom.id, targetRoom.id, waveId);
			swapState.show = false;
			return;
		}

		// Mode 'swap' logic (existing)
		const wave = (contract.waves || []).find((w) => w.id === (waveId || selectedWave?.id));
		if (!wave) return;

		const currentAllocations = { ...(wave.allocations || {}) };
		currentAllocations[sourceRoom.id] = targetBooking;
		currentAllocations[targetRoom.id] = sourceBooking;

		// Swap jamaah roomIds as well
		const updatedJamaah = (wave.jamaah || []).map((j) => {
			if (j.roomId === sourceRoom.id) return { ...j, roomId: targetRoom.id };
			if (j.roomId === targetRoom.id) return { ...j, roomId: sourceRoom.id };
			return j;
		});

		updateWave(wave.id, { allocations: currentAllocations, jamaah: updatedJamaah });
		swapState.show = false;
	}

	function finalizeDrop(room, booking) {
		const currentRooms = new Set(selectedWave.roomIds || []);
		let newAllocations = { ...(selectedWave.allocations || {}) };
		if (booking && typeof booking === 'object') newAllocations[room.id] = booking;
		if (!currentRooms.has(room.id)) {
			const updatedRoomIds = [...currentRooms, room.id];
			updateWave(selectedWave.id, { roomIds: updatedRoomIds, allocations: newAllocations });
		} else {
			updateWave(selectedWave.id, { allocations: newAllocations });
		}
	}

	function checkMismatch(room, bookingType, paxCount, booking) {
		const roomType = getRoomTypeForWave(room, selectedWave);
		const isMismatch = bookingType && localTypeConfig[bookingType] && bookingType !== roomType;

		alertState = {
			show: true,
			title: isMismatch ? '🔧 Penyesuaian Kamar' : 'Konfirmasi Alokasi',
			message: isMismatch
				? `Booking tipe '${bookingType.toUpperCase()}' tapi kamar '${roomType.toUpperCase()}'.\nUbah tipe kamar otomatis?`
				: `Alokasikan booking ${booking.applicantName} (${paxCount} orang) ke Kamar ${room.id}?`,
			type: isMismatch ? 'warning' : 'info',
			onConfirm: () => {
				if (isMismatch) handleSaveRoom({ id: room.id, type: bookingType });
				finalizeDrop(room, booking);
				closeAlert();
			}
		};
	}

	// === Unified Room Header Drop Handler ===
	function handleRoomHeaderDrop(e, room) {
		e.preventDefault();
		dropTargetRoom = null;
		const data = e.dataTransfer.getData('text/plain');
		if (!data) return;

		// Try JSON (booking or room-move)
		try {
			const parsed = JSON.parse(data);

			if (parsed.type === 'move-room') {
				const sourceRoom = contract.rooms.find((r) => r.id === parsed.fromRoomId);
				const waveId = parsed.waveId || selectedWave?.id;
				if (!sourceRoom || sourceRoom.id === room.id) return;

				const targetWave = (contract.waves || []).find((w) => w.id === waveId);
				// Check if target room has jamaah (real occupancy check)
				const targetJamaah = (targetWave?.jamaah || []).filter((j) => j.roomId === room.id);
				const targetAlloc = targetWave?.allocations?.[room.id];
				const targetOccupied = 
					targetJamaah.length > 0 || 
					(targetAlloc?.pilgrims && targetAlloc.pilgrims.length > 0);

				if (targetOccupied) {
					swapState = {
						show: true,
						mode: 'swap', // Explicit mode
						sourceRoom,
						targetRoom: room,
						sourceBooking: getBookingForRoom(sourceRoom, waveId),
						targetBooking: getBookingForRoom(room, waveId),
						waveId
					};
				} else {
					checkMoveConfirm(sourceRoom, room, waveId);
				}
				dragSourceRoomId = null;
				dragSourceWaveId = null;
				isDraggingRoom = false;
				return;
			}

			// Handle booking drop from sidebar (new format)
			if (parsed.type === 'booking' && parsed.jamaahIds) {
				processBookingDrop(room, parsed);
				return;
			}

			// Legacy booking/pilgrim drop (old format - kept for compatibility)
			if (parsed.type === 'booking' || parsed.type === 'pilgrim') {
				if (!selectedWave) return;
				let booking, bookingType, paxCount;
				if (parsed.type === 'booking') {
					booking = parsed.booking;
					bookingType = booking.roomType?.toLowerCase();
					paxCount = booking.pilgrims?.length || 0;
				} else {
					bookingType = parsed.pilgrim?.roomType?.toLowerCase();
					paxCount = 1;
					booking = {
						applicantName: parsed.pilgrim?.name || 'Unknown',
						pilgrims: [parsed.pilgrim || {}]
					};
				}
				const roomType = getRoomTypeForWave(room, selectedWave);
				const cap = localTypeConfig[roomType]?.capacity || 0;
				if (paxCount > cap) {
					alertState = {
						show: true,
						title: '⚠️ Kapasitas Berlebih',
						message: `${paxCount} jamaah, kapasitas ${roomType.toUpperCase()} hanya ${cap}.\nLanjutkan?`,
						type: 'warning',
						onConfirm: () => {
							checkMismatch(room, bookingType, paxCount, booking);
							closeAlert();
						}
					};
				} else {
					checkMismatch(room, bookingType, paxCount, booking);
				}
				return;
			}
		} catch {
			/* Not JSON — jamaah drag */
		}

		// Jamaah drag & drop (centralized via processJamaahDrop)
		if (draggedJamaah && selectedWave) {
			processJamaahDrop(room, draggedJamaah, selectedWaveIndex);
			draggedJamaah = null;
		}
	}

	// Room header drag start (for room-to-room move/swap)
	function handleRoomDragStart(e, room, wave = selectedWave) {
		const waveId = wave?.id;
		const waveObj = (contract.waves || []).find((w) => w.id === waveId);
		if (!waveObj?.roomIds?.includes(room.id)) {
			e.preventDefault();
			return;
		}
		isDraggingRoom = true;
		dragSourceRoomId = room.id;
		dragSourceWaveId = waveId;
		const roomType = getRoomTypeForWave(room, wave);
		e.dataTransfer.setData(
			'text/plain',
			JSON.stringify({ type: 'move-room', fromRoomId: room.id, fromType: roomType, waveId })
		);
		e.dataTransfer.effectAllowed = 'move';
	}

	function handleRoomDragEnd() {
		isDraggingRoom = false;
		dragSourceRoomId = null;
		dragSourceWaveId = null;
		dropTargetRoom = null;
	}

	// === Tetris-style Wave Cell Drag ===
	function handleWaveCellDragStart(e, room, wave) {
		if (!wave) {
			e.preventDefault();
			return;
		}
		// Only allow drag if this room is part of the wave
		if (!(wave.roomIds || []).includes(room.id)) {
			e.preventDefault();
			return;
		}

		draggedWaveInfo = {
			waveId: wave.id,
			fromRoomId: room.id,
			waveStart: wave.start || wave.checkIn,
			waveEnd: wave.end || wave.checkOut
		};
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData(
			'text/plain',
			JSON.stringify({
				type: 'move-wave-cell',
				waveId: wave.id,
				fromRoomId: room.id
			})
		);
	}

	function handleWaveCellDragEnd() {
		draggedWaveInfo = null;
		dropTargetRoom = null;
	}

	function handleWaveCellDrop(e, targetRoom) {
		e.preventDefault();
		dropTargetRoom = null;

		const data = e.dataTransfer.getData('text/plain');
		if (!data) return;

		let parsed;
		try {
			parsed = JSON.parse(data);
		} catch {
			return;
		}
		if (parsed.type !== 'move-wave-cell') return;

		const { waveId, fromRoomId } = parsed;
		if (fromRoomId === targetRoom.id) {
			draggedWaveInfo = null;
			return;
		} // same room, no-op

		const wave = (contract.waves || []).find((w) => w.id === waveId);
		if (!wave) {
			draggedWaveInfo = null;
			return;
		}

		// Check if wave can move to target room
		const { canMove, conflict, conflictType } = canWaveMoveToRoom(contract, waveId, targetRoom.id);

		if (!canMove && conflictType === 'overlap') {
			// Target room has a conflicting wave
			const sourceRoom = contract.rooms.find((r) => r.id === fromRoomId);
			swapState = {
				show: true,
				mode: 'swap',
				sourceRoom,
				targetRoom,
				sourceBooking: getBookingForRoom(sourceRoom, waveId),
				targetBooking: getBookingForRoom(targetRoom, conflict.id),
				waveId
			};
			draggedWaveInfo = null;
			return;
		}

		// Capacity check
		const waveIndex = (contract.waves || []).findIndex((w) => w.id === waveId);
		const jamaahInSourceRoom = getJamaahInRoom(contract, waveIndex, fromRoomId);
		const targetRoomType = getRoomTypeForWave(targetRoom, wave);
		const targetCap = roomCapacity[targetRoomType] || 2;

		let message = `Pindahkan alokasi ${wave.name} dari kamar ${fromRoomId} ke ${targetRoom.id}?`;
		let alertType = 'info';

		if (jamaahInSourceRoom.length > targetCap) {
			message += `\n\n⛔ Kamar asal: ${jamaahInSourceRoom.length} jamaah, kapasitas target (${targetRoomType.toUpperCase()}) hanya ${targetCap}.`;
			alertType = 'error';
		}

		const sourceRoomObj = contract.rooms.find((r) => r.id === fromRoomId);
		const sourceRoomType = sourceRoomObj ? getRoomTypeForWave(sourceRoomObj, wave) : null;
		if (sourceRoomObj && sourceRoomType !== targetRoomType) {
			message += `\n\n⚠️ Tipe berbeda (${sourceRoomType.toUpperCase()} → ${targetRoomType.toUpperCase()}).`;
			if (alertType === 'info') alertType = 'warning';
		}

		// Use SwapRoomModal for detailed move confirmation
		// Check if target room is occupied in this wave (check both allocations and jamaah)
		const targetAlloc = wave.allocations?.[targetRoom.id];
		const targetJamaah = (wave.jamaah || []).filter((j) => j.roomId === targetRoom.id);
		const isTargetOccupied = 
			(targetAlloc?.pilgrims && targetAlloc.pilgrims.length > 0) || 
			targetJamaah.length > 0;

		// Use SwapRoomModal for detailed confirmation
		swapState = {
			show: true,
			mode: isTargetOccupied ? 'swap' : 'move',
			sourceRoom: sourceRoomObj,
			targetRoom: targetRoom,
			sourceBooking: getBookingForRoom(sourceRoomObj, waveId),
			targetBooking: isTargetOccupied
				? getBookingForRoom(targetRoom, waveId)
				: { applicantName: 'Kamar Kosong', pilgrims: [] },
			waveId
		};
	}
	draggedWaveInfo = null;

	function executeWaveCellMove(waveId, fromRoomId, toRoomId) {
		console.log('executeWaveCellMove', { waveId, fromRoomId, toRoomId });
		const wave = (contract.waves || []).find((w) => w.id === waveId);
		if (!wave) return;

		// Update roomIds: remove fromRoom, add toRoom
		const newRoomIds = (wave.roomIds || []).filter((id) => id !== fromRoomId);
		if (!newRoomIds.includes(toRoomId)) newRoomIds.push(toRoomId);

		// Transfer allocations
		const newAllocations = { ...(wave.allocations || {}) };
		if (newAllocations[fromRoomId]) {
			newAllocations[toRoomId] = newAllocations[fromRoomId];
			delete newAllocations[fromRoomId];
		}

		// Re-assign jamaah roomId
		const updatedJamaah = (wave.jamaah || []).map((j) =>
			j.roomId === fromRoomId ? { ...j, roomId: toRoomId } : j
		);

		updateWave(waveId, {
			roomIds: newRoomIds,
			roomsUsed: newRoomIds.length,
			allocations: newAllocations,
			jamaah: updatedJamaah
		});
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="contract-grid-wrapper" class:fullscreen={isFullscreen} onclick={closeRoomTypeMenu}>
	<!-- Toolbar -->
	<div class="grid-toolbar">
		<div class="toolbar-left">
			<span class="toolbar-title">📊 Room Allotment Grid</span>
			<span class="toolbar-subtitle"
				>{contract.name} · {contract.rooms.length} kamar · {(contract.waves || []).length} gelombang</span
			>
		</div>
		<div class="toolbar-right">
			<button
				class="toolbar-btn"
				class:active={showJamaahPanel}
				onclick={() => (showJamaahPanel = !showJamaahPanel)}
				title="Panel Jamaah Kiri"
			>
				<Users size={14} />
			</button>

			<button
				class="toolbar-btn"
				onclick={() => (isFullscreen = !isFullscreen)}
				title={isFullscreen ? 'Keluar Fullscreen' : 'Fullscreen'}
			>
				{#if isFullscreen}<Minimize2 size={14} />{:else}<Maximize2 size={14} />{/if}
			</button>
		</div>
	</div>

	<!-- Hint bar -->
	<div class="cell-hint-bar">
		<div class="hint-cell-demo">
			<div class="hint-left">CO</div>
			<div class="hint-right">CI</div>
		</div>
		<span class="hint-text"
			>Kiri = Check-Out, Kanan = Check-In · <strong>Klik kanan</strong> header kamar = ubah tipe ·
			<strong>Drag</strong> jamaah ke header kamar</span
		>
	</div>

	<!-- Main content area -->
	<div class="grid-main-area">
		{#if showJamaahPanel && !isFullscreen}
			<ContractGridSidebar
				{contract}
				{localTypeConfig}
				{isFullyAllocated}
				onAddWave={handleAddWave}
				onEditWave={openEditWave}
				{onDragStart}
			/>
		{/if}

		<!-- Grid Container -->
		<ContractGridTable
			{contract}
			{allDates}
			{orderedRooms}
			{roomsByType}
			{localTypeConfig}
			selectedWave={selectedWave}
			bind:hoverRoomId
			bind:hoveredCell
			{dragSourceRoomId}
			{dragSourceWaveId}
			{dropTargetRoom}
			{isDraggingRoom}
			onRoomDragStart={handleRoomDragStart}
			onRoomDragEnd={handleRoomDragEnd}
			onRoomDragOver={(e, id) => onDragOver(e, id)}
			onRoomDragLeave={onDragLeave}
			onRoomDrop={handleRoomHeaderDrop}
			onCellDrop={onDrop}
			onOpenRoomTypeMenu={openRoomTypeMenu}
			{cellLookup}
			onCellClick={handleCellClick}
			{draggedWaveInfo}
			onWaveCellDragStart={handleWaveCellDragStart}
			onWaveCellDragEnd={handleWaveCellDragEnd}
			onWaveCellDrop={handleWaveCellDrop}
		/>
	</div>

	<!-- Footer -->
</div>

<!-- Room Type Context Menu -->
{#if roomTypeMenu}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="context-menu-overlay" onclick={closeRoomTypeMenu}>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="context-menu"
			style="left: {roomTypeMenu.x}px; top: {roomTypeMenu.y}px;"
			onclick={(e) => e.stopPropagation()}
		>
			<div class="context-menu-title">Ubah Tipe Kamar {roomTypeMenu.roomId}</div>
			{#each ['double', 'triple', 'quad', 'quint'] as t}
				{@const currentRoom = contract.rooms.find((r) => r.id === roomTypeMenu.roomId)}
				{@const effectiveType = selectedWave?.roomTypeOverrides?.[roomTypeMenu.roomId] || currentRoom?.originalType || currentRoom?.type}
				{@const isManipulated = selectedWave?.roomTypeOverrides?.[roomTypeMenu.roomId] !== undefined}
				<button
					class="context-menu-item"
					class:active={effectiveType === t}
					onclick={() => changeRoomType(roomTypeMenu.roomId, t)}
				>
					<span class="ctx-dot" style="background: {localTypeConfig[t].headerBg};"></span>
					{localTypeConfig[t].label} ({roomCapacity[t]} org)
					{#if effectiveType === t}<span class="ctx-check">✓</span>{/if}
					{#if isManipulated && effectiveType === t}
						<span class="ctx-manip">⚙</span>
					{/if}
				</button>
			{/each}
			{#if roomTypeMenu}
				{@const currentRoom = contract.rooms.find((r) => r.id === roomTypeMenu.roomId)}
				{@const hasOverride = selectedWave?.roomTypeOverrides?.[roomTypeMenu.roomId] !== undefined}
				{#if hasOverride}
					<div class="context-menu-divider"></div>
					<button
						class="context-menu-item reset"
						onclick={() => changeRoomType(roomTypeMenu.roomId, currentRoom?.originalType || currentRoom?.type)}
					>
						↩ Reset ke {(currentRoom?.originalType || currentRoom?.type)?.toUpperCase()}
					</button>
				{/if}
			{/if}
			<div class="context-menu-divider"></div>
			<button
				class="context-menu-item"
				onclick={() => {
					const room = contract.rooms.find((r) => r.id === roomTypeMenu.roomId);
					if (room) openRoomModal(room, occupiedRoomIds().has(room.id));
					closeRoomTypeMenu();
				}}>🔍 Detail Kamar</button
			>
			{#if selectedWave}
				{@const jamaahInRoom = getJamaahInRoom(contract, selectedWaveIndex, roomTypeMenu.roomId)}
				{#if jamaahInRoom.length > 0}
					<button
						class="context-menu-item danger"
						onclick={() => {
							emptyRoom(roomTypeMenu.roomId);
							closeRoomTypeMenu();
						}}>🗑️ Kosongkan Kamar</button
					>
				{/if}
			{/if}
		</div>
	</div>
{/if}

<RoomDetailModal
	show={showRoomModal}
	room={selectedRoom}
	isOccupied={selectedRoomOccupied}
	activeWave={selectedWave}
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
	mode={swapState.mode}
	waveId={swapState.waveId}
	activeWave={selectedWave}
	{contract}
	onConfirm={handleSwapConfirm}
	onCancel={() => (swapState.show = false)}
/>

<AddWaveModal
	bind:isOpen={showAddWaveModal}
	{contract}
	initialData={editingWave}
	onSave={handleCreateWave}
/>

<!-- Undo Toast -->
{#if showUndoToast}
	<div class="toast-undo">
		<span>↩️</span>
		Undo berhasil
	</div>
{/if}

<style>
	/* Toast Animation */
	@keyframes slide-up-fade {
		from {
			opacity: 0;
			transform: translateX(-50%) translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateX(-50%) translateY(0);
		}
	}
	.toast-undo {
		position: fixed;
		bottom: 24px;
		left: 50%;
		transform: translateX(-50%);
		background: #1e293b;
		color: white;
		padding: 10px 20px;
		border-radius: 30px;
		font-size: 13px;
		font-weight: 500;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		z-index: 9999;
		display: flex;
		align-items: center;
		gap: 8px;
		animation: slide-up-fade 0.3s cubic-bezier(0.16, 1, 0.3, 1);
		pointer-events: none;
	}

	.contract-grid-wrapper {
		background: #fff;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		overflow: hidden;
		margin-top: 8px;
		transition: margin-right 0.3s;
		font-family:
			'Inter',
			-apple-system,
			system-ui,
			sans-serif;
	}
	.contract-grid-wrapper.fullscreen {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		z-index: 9999;
		border-radius: 0;
		margin: 0;
	}
	
	.contract-grid-wrapper.fullscreen .grid-main-area {
		height: calc(100vh - 90px); /* toolbar + hint bar */
	}

	/* Toolbar */
	.grid-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 10px 16px;
		background: linear-gradient(135deg, #0f172a, #1e293b);
		color: white;
	}
	.toolbar-left {
		display: flex;
		align-items: center;
		gap: 12px;
	}
	.toolbar-title {
		font-size: 13px;
		font-weight: 700;
	}
	.toolbar-subtitle {
		font-size: 11px;
		color: rgba(255, 255, 255, 0.5);
	}
	.toolbar-right {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.toolbar-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		min-width: 28px;
		height: 28px;
		padding: 0 8px;
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 6px;
		color: white;
		cursor: pointer;
		transition: background 0.15s;
		font-size: 12px;
		font-weight: 500;
		white-space: nowrap;
	}
	.toolbar-btn:hover,
	.toolbar-btn.active {
		background: rgba(255, 255, 255, 0.2);
	}

	/* Hint bar */
	.cell-hint-bar {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 5px 16px;
		background: #fffbeb;
		border-bottom: 1px solid #fde68a;
	}
	.hint-cell-demo {
		display: flex;
		width: 36px;
		height: 16px;
		border: 1px solid #d97706;
		border-radius: 2px;
		overflow: hidden;
		flex-shrink: 0;
	}
	.hint-left,
	.hint-right {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 6px;
		font-weight: 800;
		color: #92400e;
	}
	.hint-left {
		background: #fef3c7;
		border-right: 1px solid #d97706;
	}
	.hint-right {
		background: #fde68a;
	}
	.hint-text {
		font-size: 10px;
		color: #92400e;
	}
	.hint-text strong {
		font-weight: 700;
	}

	/* Main area with jamaah panel */
	.grid-main-area {
		display: flex;
		overflow: hidden;
	}

	/* Context Menu */
	.context-menu-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		z-index: 50;
	}
	.context-menu {
		position: fixed;
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
		padding: 5px;
		z-index: 60;
		min-width: 180px;
	}
	.context-menu-title {
		font-size: 10px;
		font-weight: 700;
		color: #94a3b8;
		padding: 5px 8px;
		border-bottom: 1px solid #f1f5f9;
		margin-bottom: 3px;
	}
	.context-menu-item {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
		padding: 6px 8px;
		border: none;
		background: none;
		font-size: 11px;
		color: #334155;
		cursor: pointer;
		border-radius: 4px;
		text-align: left;
	}
	.context-menu-item:hover {
		background: #f1f5f9;
	}
	.context-menu-item.active {
		background: #f0f9ff;
		color: #0284c7;
		font-weight: 600;
	}
	.context-menu-item.reset {
		color: #ef4444;
	}
	.context-menu-item.danger {
		color: #dc2626;
	}
	.context-menu-item.danger:hover {
		background: #fef2f2;
	}
	.ctx-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
	}
	.context-menu-divider {
		height: 1px;
		background: #f1f5f9;
		margin: 3px 0;
	}
</style>
