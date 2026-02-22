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
	import ContractGridToolbar from './parts/ContractGridToolbar.svelte';
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
		canWaveMoveToRoom,
		getFloors,
		getRoomsByFloor
	} from './parts/contractHelpers.js';
	import { getRoomTypeForWave } from './parts/roomTypeHelpers.js';

	// Modals & Drawers

	import RoomDetailModal from '../Modals/RoomDetailModal.svelte';
	import AddWaveModal from '../Modals/AddWaveModal.svelte';
	import ImportPackageModal from '../Modals/ImportPackageModal.svelte';

	import AllocationAlertModal from '../Modals/AllocationAlertModal.svelte';
	import SwapRoomModal from '../Modals/SwapRoomModal.svelte';

	import ContractContextMenu from '../Modals/ContractContextMenu.svelte';
	import QuickDetailModal from '../Modals/QuickDetailModal.svelte';
	import UndoToast from '../Modals/UndoToast.svelte';

	let { contract, hotelId } = $props();

	// === UI State ===
	let isFullscreen = $state(false);
	let showJamaahPanel = $state(true);
	let draggedJamaah = $state(null);
	let dropTargetRoom = $state(null);
	let roomTypeMenu = $state(null);
	let hoveredCell = $state(null);
	let hoverRoomId = $state(null);

	// === Floor Selection ===
	let selectedFloor = $state(null);

	// === Room Type Management ===
	let hasUnsavedChanges = $derived.by(() => {
		if (!selectedWave || !contract?.rooms) return false;

		// Check if any room has a different type in the current wave vs base contract
		return contract.rooms.some((room) => {
			const baseType = room.type || 'unset';
			const currentType = getRoomTypeForWave(room, selectedWave);
			return baseType !== currentType;
		});
	});

	function saveRoomTypes() {
		if (!selectedWave || !contract?.rooms) return;

		pushHistory(); // Save state before changes

		// Update base room types to match current wave overrides
		// Keep originalType for historical tracking
		const updatedRooms = contract.rooms.map((room) => {
			const currentType = getRoomTypeForWave(room, selectedWave);

			// Capture the physical base type properly on first save
			let physicalType = room.originalType;
			if (!physicalType || physicalType === 'unset') {
				physicalType = room.type;
			}
			if (!physicalType || physicalType === 'unset') {
				physicalType = currentType;
			}

			return {
				...room,
				type: currentType,
				originalType: physicalType // First actual type becomes the permanent group header
			};
		});

		// Clear wave-specific overrides since they're now the base types
		const updatedWaves = contract.waves.map((wave) => {
			if (wave.id === selectedWave.id) {
				const { roomTypeOverrides, ...cleanWave } = wave;
				return cleanWave;
			}
			return wave;
		});

		// Update contract
		hotelStorageStore.updateContract(hotelId, contract.id, {
			rooms: updatedRooms,
			waves: updatedWaves
		});

		// Show success message
		alertState = {
			show: true,
			title: 'Room Types Saved',
			message: 'Tipe kamar berhasil disimpan sebagai base configuration.',
			type: 'info',
			onConfirm: () => closeAlert()
		};
	}

	// === Configuration State ===
	let localTypeConfig = $state({ ...defaultTypeConfig });

	let showAddWaveModal = $state(false);
	let editingWave = $state(null);
	let showImportPackageModal = $state(false);
	let importingWave = $state(null);
	let importingWaveIndex = $state(null);

	// Quick detail modal for sold/staff cells
	let showQuickDetailModal = $state(false);
	let quickDetailData = $state(null);
	let quickAddStaffInput = $state({});
	let quickAddingStaff = $state(null);

	// Cell selection for sold marking
	let selectedCells = $state(new Set());
	let isSelecting = $state(false);
	let selectionStart = $state(null);

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
	let availableFloors = $derived(getFloors(contract));
	let roomsByType = $derived(() => {
		// Always use floor-filtered rooms (no "all" option)
		const floorRooms = currentFloorRooms();
		if (!floorRooms || floorRooms.length === 0) {
			return [];
		}
		const floorContract = { ...contract, rooms: floorRooms };

		console.log('=== ROOMS BY TYPE CALCULATION ===');
		console.log('Selected wave for headers:', selectedWave?.name || 'null');
		console.log('Selected wave overrides:', selectedWave?.roomTypeOverrides || {});

		// IMPORTANT: Always use base room types for headers, NOT effective types
		// Headers should never change, only manipulation badges should change
		const result = getRoomsByType(floorContract, null); // Pass null to get base types only

		console.log(
			'Room types for headers (base types only):',
			result.map((g) => ({ roomId: g.rooms[0]?.id, type: g.type }))
		);
		console.log('=== END CALCULATION ===');

		return result;
	});

	// Floor-based room filtering
	let currentFloorRooms = $derived(() => {
		// Always filter by selected floor (no "all" option)
		if (!selectedFloor) return [];
		return getRoomsByFloor(contract, selectedFloor);
	});

	let orderedRooms = $derived(() => {
		// Always use floor-filtered rooms (no "all" option)
		return currentFloorRooms();
	});

	// Initialize selected floor - always select first floor, no "all" option
	$effect(() => {
		if (availableFloors.length > 0 && !selectedFloor) {
			selectedFloor = availableFloors[0]; // Always select first floor
		}
	});

	// Cell lookup: LEFT = checkout, RIGHT = checkin
	let cellLookup = $derived(getCellLookup(contract));

	let isFullyAllocated = $derived(isContractFullyAllocated(contract));

	// Selected wave
	let selectedWaveIndex = $state(0);
	let selectedWave = $derived.by(() => {
		// Force reactivity by accessing contract directly
		const waves = contract?.waves || [];
		console.log('=== SELECTED WAVE CALCULATION ===');
		console.log(
			'Available waves:',
			waves.map((w) => ({ id: w.id, name: w.name }))
		);
		console.log('Selected wave index:', selectedWaveIndex);

		if (waves.length === 0) {
			console.log('No waves available, returning null');
			return null;
		}

		// Ensure we have a valid index
		const validIndex = selectedWaveIndex < waves.length ? selectedWaveIndex : 0;
		const wave = waves[validIndex];
		console.log('Selected wave:', wave?.name, 'ID:', wave?.id);
		console.log('Wave overrides:', wave?.roomTypeOverrides || {});
		console.log('=== END SELECTED WAVE CALCULATION ===');

		return wave;
	});

	// Jamaah helpers
	// (Moved to contractHelpers.js, but keeping getRoomOccupancy if needed locally)
	function getRoomOccupancy(roomId) {
		if (!selectedWave) return { count: 0, capacity: 0 };
		const room = contract.rooms.find((r) => r.id === roomId);
		const capacity = roomCapacity[room?.type] === '-' ? '-' : roomCapacity[room?.type] || 2;
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
		if (e.key === 'Escape') {
			clearSelection();
			closeRoomTypeMenu();
		}
	}

	// Update wave data
	function updateWave(waveId, updates) {
		console.log('=== UPDATE WAVE ===');
		console.log('Wave ID:', waveId);
		console.log('Updates:', updates);

		pushHistory(); // Save state before update
		const updatedWaves = contract.waves.map((w) => (w.id === waveId ? { ...w, ...updates } : w));

		console.log(
			'Updated waves:',
			updatedWaves.map((w) => ({
				id: w.id,
				name: w.name,
				roomTypeOverrides: w.roomTypeOverrides
			}))
		);

		hotelStorageStore.updateContract(hotelId, contract.id, { waves: updatedWaves });
		console.log('=== END UPDATE WAVE ===');
	}

	function handleCreateWave(waveData) {
		pushHistory(); // Save state before create/update
		let updatedWaves;

		if (waveData.id && !waveData.id.startsWith('wave-')) {
			// Normal update with valid ID
			updatedWaves = (contract.waves || []).map((w) =>
				w.id === waveData.id ? { ...w, ...waveData } : w
			);
		} else if (waveData._editIndex !== undefined) {
			// Update by index (for cases where ID was corrupted or pseudo)
			updatedWaves = (contract.waves || []).map((w, index) => {
				if (index === waveData._editIndex) {
					// Preserve the original ID if it exists, otherwise use the provided one
					const originalId = w.id || waveData.id;
					const { _editIndex, ...cleanWaveData } = waveData;
					return { ...w, ...cleanWaveData, id: originalId };
				}
				return w;
			});
		} else if (waveData.id) {
			// Try to find by ID first, then by properties
			const existingIndex = (contract.waves || []).findIndex((w) => w.id === waveData.id);
			if (existingIndex !== -1) {
				// Update existing wave
				updatedWaves = (contract.waves || []).map((w, index) =>
					index === existingIndex ? { ...w, ...waveData } : w
				);
			} else {
				// Try to find by properties (fallback for corrupted ID)
				const propertyIndex = (contract.waves || []).findIndex(
					(w) => w.name === waveData.name && w.start === waveData.start && w.end === waveData.end
				);

				if (propertyIndex !== -1) {
					updatedWaves = (contract.waves || []).map((w, index) =>
						index === propertyIndex ? { ...w, ...waveData, id: w.id || waveData.id } : w
					);
				} else {
					// Create new wave
					const newWave = {
						id: crypto.randomUUID(),
						...waveData,
						tripName: waveData.tripName || '',
						rooms: [],
						roomIds: [],
						jamaah: [],
						roomsUsed: 0
					};
					delete newWave._editIndex; // Remove helper property
					updatedWaves = [...(contract.waves || []), newWave];
				}
			}
		} else {
			// Create new wave
			const newWave = {
				id: crypto.randomUUID(),
				...waveData,
				tripName: waveData.tripName || '',
				rooms: [],
				roomIds: [],
				jamaah: [],
				roomsUsed: 0
			};
			delete newWave._editIndex; // Remove helper property
			updatedWaves = [...(contract.waves || []), newWave];
		}

		// Clean up any helper properties from all waves
		updatedWaves = updatedWaves.map((w) => {
			const { _editIndex, ...cleanWave } = w;
			return cleanWave;
		});

		hotelStorageStore.updateContract(hotelId, contract.id, { waves: updatedWaves });
		if (contract) contract.waves = updatedWaves;
		editingWave = null;
	}

	function handleAddWave() {
		editingWave = null;
		showAddWaveModal = true;
	}

	function openEditWaveByIndex(e, index) {
		e.stopPropagation();

		// Debug: Log the current state
		console.log('=== WAVE EDIT DEBUG ===');
		console.log('Index:', index);
		console.log('Contract waves:', $state.snapshot(contract.waves));
		console.log('Specific wave at index:', $state.snapshot((contract.waves || [])[index]));

		// Get the wave from multiple sources to ensure we have the most complete data
		const reactiveWave = (contract.waves || [])[index];

		if (!reactiveWave) {
			console.error('No wave found at index:', index);
			alert('Error: Cannot edit wave - wave not found');
			return;
		}

		// Try to get the original wave data from the store to ensure we have the ID
		let originalWave = null;
		let originalContract = null;
		try {
			const hotel = hotelStorageStore.hotels.find((h) => h.hotelId === hotelId);
			originalContract = hotel?.contracts?.find((c) => c.id === contract.id);
			originalWave = originalContract?.waves?.[index];
			console.log('Original wave from store:', originalWave);
		} catch (error) {
			console.warn('Could not access original wave data:', error);
		}

		// Determine the best source for the wave ID
		let waveId = reactiveWave.id || originalWave?.id;

		if (!waveId) {
			console.warn('Wave at index', index, 'has no ID in either reactive or original data');

			// Try to find by matching properties in the original data
			if (originalContract?.waves) {
				const foundWave = originalContract.waves.find(
					(w) =>
						w.name === reactiveWave.name &&
						w.start === reactiveWave.start &&
						w.end === reactiveWave.end
				);
				if (foundWave?.id) {
					waveId = foundWave.id;
					console.log('Found wave ID by property matching:', waveId);
				}
			}

			// Last resort: use a combination of properties as a pseudo-ID
			if (!waveId) {
				waveId = `wave-${index}-${reactiveWave.name?.replace(/\s+/g, '-') || 'unnamed'}`;
				console.warn('Using pseudo-ID for wave:', waveId);
			}
		}

		// Create a clean wave object with all necessary properties
		const cleanWave = {
			id: waveId,
			name: reactiveWave.name || originalWave?.name || 'Unnamed Wave',
			start: reactiveWave.start || originalWave?.start,
			end: reactiveWave.end || originalWave?.end,
			rate: reactiveWave.rate || originalWave?.rate || 0,
			currency: reactiveWave.currency || originalWave?.currency || 'SAR',
			color: reactiveWave.color || originalWave?.color || { bg: '#1e3a5f', text: '#fff' },
			tripName: reactiveWave.tripName || originalWave?.tripName || '',
			// Store the index for fallback identification
			_editIndex: index
		};

		console.log('Final clean wave for editing:', cleanWave);
		console.log('=== END DEBUG ===');

		editingWave = cleanWave;
		showAddWaveModal = true;
	}

	function handleDeleteWaveByIndex(e, index) {
		e.stopPropagation();

		const wave = (contract.waves || [])[index];

		if (!wave) {
			console.error('No wave found at index:', index);
			alert('Error: Cannot delete wave - wave not found');
			return;
		}

		// Check if wave has jamaah
		const jamaahCount = (wave.jamaah || []).length;
		const roomCount = (wave.roomIds || []).length;

		let confirmMessage = `Hapus gelombang "${wave.name}"?`;
		if (jamaahCount > 0 || roomCount > 0) {
			confirmMessage += `\n\nGelombang ini memiliki:\n- ${jamaahCount} jamaah\n- ${roomCount} kamar\n\nSemua data akan dihapus!`;
		}

		if (confirm(confirmMessage)) {
			pushHistory(); // Save state before delete

			// Remove wave by index
			const updatedWaves = (contract.waves || []).filter((_, i) => i !== index);
			hotelStorageStore.updateContract(hotelId, contract.id, { waves: updatedWaves });
			if (contract) contract.waves = updatedWaves;

			// Show success message
			alertState = {
				show: true,
				title: 'Gelombang Dihapus',
				message: `Gelombang "${wave.name}" berhasil dihapus.`,
				type: 'info',
				onConfirm: () => closeAlert()
			};
		}
	}

	function handleImportPackage(wave, waveIndex) {
		importingWave = wave;
		importingWaveIndex = waveIndex;
		showImportPackageModal = true;
	}

	function handlePackageImport(importData) {
		if (!importingWave) return;

		pushHistory(); // Save state before import

		// Merge imported jamaah with existing jamaah
		const existingJamaah = importingWave.jamaah || [];
		const newJamaah = [...existingJamaah, ...importData.jamaah];

		// Update wave with new jamaah and package info
		updateWave(importingWave.id, {
			jamaah: newJamaah,
			tripName: importData.packageName, // Update trip name with package name
			packageId: importData.packageId,
			tripDateId: importData.tripDateId
		});

		// Show success message
		alertState = {
			show: true,
			title: 'Import Berhasil',
			message: `${importData.jamaah.length} jamaah dari ${importData.bookings.length} booking berhasil diimport ke ${importingWave.name}`,
			type: 'info',
			onConfirm: () => closeAlert()
		};

		importingWave = null;
		importingWaveIndex = null;
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

		// Check if room is sold
		if (isRoomSold(room.id)) {
			alertState = {
				show: true,
				title: 'Kamar Dijual',
				message: `Kamar ${room.id} sudah ditandai sebagai dijual. Lepas status "Dijual" terlebih dahulu untuk mengalokasikan jamaah.`,
				type: 'error',
				onConfirm: () => closeAlert()
			};
			return;
		}

		const roomType = getRoomTypeForWave(room, targetWave);
		const capacity = roomCapacity[roomType] === '-' ? 999 : roomCapacity[roomType] || 2; // Allow unlimited for unset
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

			// Handle Booking GROUP Drop (auto-allocate all chunks)
			if (parsed.type === 'booking-group') {
				processBookingGroupDrop(parsed);
				return;
			}

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

	function processBookingGroupDrop(groupData) {
		const { waveIndex, chunks, bookingId, bookingName } = groupData;
		const targetWave = (contract.waves || [])[waveIndex];
		if (!targetWave) return;

		// Build a usage map of current occupancy per room
		const tentativeOccupancy = {};
		contract.rooms.forEach((r) => {
			tentativeOccupancy[r.id] = getJamaahInRoom(contract, waveIndex, r.id).length;
		});

		const usedRoomIds = new Set(targetWave.roomIds || []);
		const allocated = []; // { jamaahIds, roomId, roomType }
		const failed = []; // { requestedType, needed, reason }

		// Helper: find room for N pax — exact type first, then any type fallback
		function findRoom(requestedType, count) {
			// Pass 1: exact effective-type match
			for (const room of contract.rooms || []) {
				if (isRoomSold(room.id) || isRoomStaff(room.id)) continue;
				const effType = getRoomTypeForWave(room, targetWave);
				const cap = roomCapacity[effType] === '-' ? 999 : roomCapacity[effType] || 2;
				const avail = cap - (tentativeOccupancy[room.id] ?? 0);
				if (effType === requestedType && avail >= count) return { room, cap };
			}
			// Pass 2: any room with enough space (fallback when types unknown/unset)
			for (const room of contract.rooms || []) {
				if (isRoomSold(room.id) || isRoomStaff(room.id)) continue;
				const effType = getRoomTypeForWave(room, targetWave);
				if (effType === 'unset') continue; // skip unset rooms
				const cap = roomCapacity[effType] === '-' ? 999 : roomCapacity[effType] || 2;
				const avail = cap - (tentativeOccupancy[room.id] ?? 0);
				if (avail >= count) return { room, cap };
			}
			// Pass 3: any room with ANY space (partial fit)
			for (const room of contract.rooms || []) {
				if (isRoomSold(room.id) || isRoomStaff(room.id)) continue;
				const effType = getRoomTypeForWave(room, targetWave);
				if (effType === 'unset') continue;
				const cap = roomCapacity[effType] === '-' ? 999 : roomCapacity[effType] || 2;
				const avail = cap - (tentativeOccupancy[room.id] ?? 0);
				if (avail > 0) return { room, cap, partial: true };
			}
			return null;
		}

		for (const chunk of chunks) {
			const { requestedType, jamaahIds, count } = chunk;
			let remaining = [...jamaahIds]; // IDs still to place

			while (remaining.length > 0) {
				const match = findRoom(requestedType, 1); // find any room with at least 1 slot
				if (!match) {
					failed.push({ requestedType, needed: remaining.length, reason: 'no room available' });
					break;
				}
				const { room } = match;
				const effType = getRoomTypeForWave(room, targetWave);
				const cap = roomCapacity[effType] === '-' ? 999 : roomCapacity[effType] || 2;
				const avail = cap - (tentativeOccupancy[room.id] ?? 0);
				const placing = remaining.splice(0, avail); // fill this room as much as possible

				tentativeOccupancy[room.id] = (tentativeOccupancy[room.id] ?? 0) + placing.length;
				usedRoomIds.add(room.id);
				allocated.push({ jamaahIds: placing, roomId: room.id, roomType: effType });
			}
		}

		if (allocated.length === 0) {
			alertState = {
				show: true,
				title: 'Tidak Ada Kamar yang Tersedia',
				message: `Tidak ditemukan kamar yang bisa menampung jamaah dari booking "${bookingName}". Pastikan kontrak memiliki kamar dengan kapasitas tersedia.`,
				type: 'error',
				onConfirm: () => closeAlert()
			};
			return;
		}

		// Build confirmation summary
		let confirmMsg = `Auto-alokasi booking "${bookingName}":\n`;
		allocated.forEach((a) => {
			confirmMsg += `\u2022 ${a.jamaahIds.length} pax \u2192 Kamar ${a.roomId} (${a.roomType.toUpperCase()})\n`;
		});

		if (failed.length > 0) {
			const totalFailed = failed.reduce((sum, f) => sum + f.needed, 0);
			confirmMsg += `\n\u26a0\ufe0f ${totalFailed} jamaah tidak bisa dialokasikan: tidak ada kamar tersisa.\n`;
			confirmMsg += `\nHanya yang sesuai akan dialokasikan.`;
		}

		alertState = {
			show: true,
			title: failed.length > 0 ? 'Alokasi Sebagian' : 'Konfirmasi Auto-Alokasi',
			message: confirmMsg,
			type: failed.length > 0 ? 'warning' : 'info',
			onConfirm: () => {
				executeBookingGroupDrop(targetWave, waveIndex, allocated, usedRoomIds);
				closeAlert();
			}
		};
	}

	function executeBookingGroupDrop(targetWave, waveIndex, allocated, usedRoomIds) {
		pushHistory();

		let updatedJamaah = [...(targetWave.jamaah || [])];

		// Assign each planned jamaah to their room
		for (const { jamaahIds, roomId } of allocated) {
			updatedJamaah = updatedJamaah.map((j) => (jamaahIds.includes(j.id) ? { ...j, roomId } : j));
		}

		updateWave(targetWave.id, {
			jamaah: updatedJamaah,
			roomIds: [...usedRoomIds],
			roomsUsed: usedRoomIds.size
		});
	}

	function processBookingDrop(room, bookingData) {
		const { waveIndex, jamaahIds, requestedRoomType, count } = bookingData;
		const targetWave = (contract.waves || [])[waveIndex];
		if (!targetWave) return;

		// Check if room is sold
		if (isRoomSold(room.id)) {
			alertState = {
				show: true,
				title: 'Kamar Dijual',
				message: `Kamar ${room.id} sudah ditandai sebagai dijual. Lepas status "Dijual" terlebih dahulu untuk mengalokasikan booking.`,
				type: 'error',
				onConfirm: () => closeAlert()
			};
			return;
		}

		const roomType = getRoomTypeForWave(room, targetWave);
		const capacity = roomCapacity[roomType] === '-' ? 999 : roomCapacity[roomType] || 2; // Allow unlimited for unset

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

	function emptyRoom(roomId, waveId) {
		const targetWaveId = waveId || selectedWave?.id;
		if (!targetWaveId) return;
		const waveindex = (contract.waves || []).findIndex((w) => w.id === targetWaveId);
		if (waveindex === -1) return;

		const jamaahInRoom = getJamaahInRoom(contract, waveindex, roomId);
		if (jamaahInRoom.length === 0) return;

		alertState = {
			show: true,
			title: 'Konfirmasi Kosongkan Kamar',
			message: `Kosongkan kamar ${roomId}? ${jamaahInRoom.length} jamaah akan dikembalikan ke "Belum Dialokasikan".`,
			type: 'warning',
			onConfirm: () => {
				executeEmptyRoom(roomId, targetWaveId);
				closeAlert();
			}
		};
	}

	function executeEmptyRoom(roomId, waveId) {
		const targetWaveId = waveId || selectedWave?.id;
		const wave = (contract.waves || []).find((w) => w.id === targetWaveId);
		if (!wave) return;

		pushHistory(); // Save state before update

		// Remove all jamaah from this room (set roomId to empty)
		const updatedJamaah = (wave.jamaah || []).map((j) =>
			j.roomId === roomId ? { ...j, roomId: '' } : j
		);

		// Remove room from wave's roomIds
		const newRoomIds = (wave.roomIds || []).filter((id) => id !== roomId);

		// Update wave
		updateWave(wave.id, {
			jamaah: updatedJamaah,
			roomIds: newRoomIds,
			roomsUsed: newRoomIds.length
		});
	}

	// Mark room as sold
	function toggleRoomSoldStatus(roomId) {
		if (!selectedWave) return;

		pushHistory(); // Save state before update

		const currentSoldRooms = selectedWave.soldRooms || [];
		const isSold = currentSoldRooms.includes(roomId);

		let newSoldRooms;
		if (isSold) {
			// Remove from sold list
			newSoldRooms = currentSoldRooms.filter((id) => id !== roomId);
		} else {
			// Check if room has jamaah - must be empty to mark as sold
			const jamaahInRoom = getJamaahInRoom(contract, selectedWaveIndex, roomId);
			if (jamaahInRoom.length > 0) {
				alertState = {
					show: true,
					title: 'Kamar Tidak Kosong',
					message: `Kamar ${roomId} masih berisi ${jamaahInRoom.length} jamaah. Kosongkan kamar terlebih dahulu sebelum menandai sebagai dijual.`,
					type: 'error',
					onConfirm: () => closeAlert()
				};
				return;
			}

			// Add to sold list
			newSoldRooms = [...currentSoldRooms, roomId];
		}

		updateWave(selectedWave.id, { soldRooms: newSoldRooms });
	}

	function isRoomSold(roomId) {
		if (!selectedWave) return false;
		return (selectedWave.soldRooms || []).includes(roomId);
	}

	// Cell selection functions
	function handleCellMouseDown(e, roomId, dateKey) {
		if (e.button !== 0) return; // Only left click

		// Check if this cell has wave data (occupied)
		const cellKey = `${roomId}_${dateKey}`;
		const cellData = cellLookup[cellKey];

		// Only allow selection on empty cells (no wave data)
		if (cellData && (cellData.left || cellData.right)) {
			return; // Cell is occupied, don't select
		}

		// Check if this cell is sold or staff
		const isSold = isCellSold(roomId, dateKey);
		const isStaff = isCellStaff(roomId, dateKey);

		// If starting new selection, check type consistency
		if (selectedCells.size > 0) {
			// Check what type the current selection is
			const firstSelectedKey = Array.from(selectedCells)[0];
			const [firstRoomId, firstDateKey] = firstSelectedKey.split('_');
			const firstIsSold = isCellSold(firstRoomId, firstDateKey);
			const firstIsStaff = isCellStaff(firstRoomId, firstDateKey);

			// If trying to mix sold and staff, clear selection and start fresh
			if ((isSold && firstIsStaff) || (isStaff && firstIsSold)) {
				selectedCells = new Set();
			}
		}

		isSelecting = true;
		selectionStart = { roomId, dateKey };

		// Toggle selection
		const newSelected = new Set(selectedCells);
		if (newSelected.has(cellKey)) {
			newSelected.delete(cellKey);
		} else {
			newSelected.add(cellKey);
		}
		selectedCells = newSelected;
	}

	function handleCellMouseEnter(roomId, dateKey) {
		if (!isSelecting) return;

		// Check if this cell has wave data
		const cellKey = `${roomId}_${dateKey}`;
		const cellData = cellLookup[cellKey];

		// Only select empty cells
		if (cellData && (cellData.left || cellData.right)) {
			return;
		}

		// Check type consistency
		if (selectedCells.size > 0) {
			const firstSelectedKey = Array.from(selectedCells)[0];
			const [firstRoomId, firstDateKey] = firstSelectedKey.split('_');
			const firstIsSold = isCellSold(firstRoomId, firstDateKey);
			const firstIsStaff = isCellStaff(firstRoomId, firstDateKey);

			const isSold = isCellSold(roomId, dateKey);
			const isStaff = isCellStaff(roomId, dateKey);

			// Don't add if mixing types
			if ((isSold && firstIsStaff) || (isStaff && firstIsSold)) {
				return;
			}
		}

		const newSelected = new Set(selectedCells);
		newSelected.add(cellKey);
		selectedCells = newSelected;
	}

	function handleCellMouseUp() {
		isSelecting = false;
		selectionStart = null;
	}

	function clearSelection() {
		selectedCells = new Set();
	}

	function isCellSelected(roomId, dateKey) {
		return selectedCells.has(`${roomId}_${dateKey}`);
	}

	function toggleSelectedCellsSold() {
		if (selectedCells.size === 0) return;
		if (!selectedWave) return;

		pushHistory();

		// Get current sold cells
		const currentSoldCells = selectedWave.soldCells || {};
		const newSoldCells = { ...currentSoldCells };

		// Group selected cells by room to find date ranges
		const selectedArray = Array.from(selectedCells);
		const roomGroups = {};

		selectedArray.forEach((cellKey) => {
			const [roomId, dateKey] = cellKey.split('_');
			if (!roomGroups[roomId]) roomGroups[roomId] = [];
			roomGroups[roomId].push(dateKey);
		});

		// For each room, sort dates and mark as sold with IN/OUT
		Object.entries(roomGroups).forEach(([roomId, dates]) => {
			// Check if room has jamaah
			const jamaahInRoom = getJamaahInRoom(contract, selectedWaveIndex, roomId);
			if (jamaahInRoom.length > 0) return; // Skip if occupied

			// Sort dates
			dates.sort();

			dates.forEach((dateKey, idx) => {
				const cellKey = `${roomId}_${dateKey}`;
				if (!newSoldCells[cellKey]) {
					// Determine if this is first, last, or middle
					if (dates.length === 1) {
						// Single day - both IN and OUT
						newSoldCells[cellKey] = { left: 'out', right: 'in', status: 'available', price: 0 };
					} else if (idx === 0) {
						// First day - only IN (right side)
						newSoldCells[cellKey] = { left: null, right: 'in', status: 'available', price: 0 };
					} else if (idx === dates.length - 1) {
						// Last day - only OUT (left side)
						newSoldCells[cellKey] = { left: 'out', right: null, status: 'available', price: 0 };
					} else {
						// Middle days - both sides occupied
						newSoldCells[cellKey] = {
							left: 'occupied',
							right: 'occupied',
							status: 'available',
							price: 0
						};
					}
				}
			});
		});

		updateWave(selectedWave.id, { soldCells: newSoldCells });
		clearSelection();
	}

	function removeSelectedCellsSold() {
		if (selectedCells.size === 0) return;
		if (!selectedWave) return;

		pushHistory();

		// Get current sold cells
		const currentSoldCells = selectedWave.soldCells || {};
		const newSoldCells = { ...currentSoldCells };

		// Remove all selected from sold
		const selectedArray = Array.from(selectedCells);
		selectedArray.forEach((cellKey) => {
			delete newSoldCells[cellKey];
		});

		updateWave(selectedWave.id, { soldCells: newSoldCells });
		clearSelection();
	}

	function toggleSelectedCellsStaff() {
		if (selectedCells.size === 0) return;
		if (!selectedWave) return;

		pushHistory();

		// Get current staff cells
		const currentStaffCells = selectedWave.staffCells || {};
		const newStaffCells = { ...currentStaffCells };

		// Group selected cells by room to find date ranges
		const selectedArray = Array.from(selectedCells);
		const roomGroups = {};

		selectedArray.forEach((cellKey) => {
			const [roomId, dateKey] = cellKey.split('_');
			if (!roomGroups[roomId]) roomGroups[roomId] = [];
			roomGroups[roomId].push(dateKey);
		});

		// For each room, sort dates and mark as staff with IN/OUT
		Object.entries(roomGroups).forEach(([roomId, dates]) => {
			// Check if room has jamaah
			const jamaahInRoom = getJamaahInRoom(contract, selectedWaveIndex, roomId);
			if (jamaahInRoom.length > 0) return; // Skip if occupied

			// Sort dates
			dates.sort();

			dates.forEach((dateKey, idx) => {
				const cellKey = `${roomId}_${dateKey}`;
				if (!newStaffCells[cellKey]) {
					// Determine if this is first, last, or middle
					if (dates.length === 1) {
						// Single day - both IN and OUT
						newStaffCells[cellKey] = { left: 'out', right: 'in', status: 'available', price: 0 };
					} else if (idx === 0) {
						// First day - only IN (right side)
						newStaffCells[cellKey] = { left: null, right: 'in', status: 'available', price: 0 };
					} else if (idx === dates.length - 1) {
						// Last day - only OUT (left side)
						newStaffCells[cellKey] = { left: 'out', right: null, status: 'available', price: 0 };
					} else {
						// Middle days - both sides occupied
						newStaffCells[cellKey] = {
							left: 'occupied',
							right: 'occupied',
							status: 'available',
							price: 0
						};
					}
				}
			});
		});

		updateWave(selectedWave.id, { staffCells: newStaffCells });
		clearSelection();
	}

	function removeSelectedCellsStaff() {
		if (selectedCells.size === 0) return;
		if (!selectedWave) return;

		pushHistory();

		// Get current staff cells
		const currentStaffCells = selectedWave.staffCells || {};
		const newStaffCells = { ...currentStaffCells };

		// Remove all selected from staff
		const selectedArray = Array.from(selectedCells);
		selectedArray.forEach((cellKey) => {
			delete newStaffCells[cellKey];
		});

		updateWave(selectedWave.id, { staffCells: newStaffCells });
		clearSelection();
	}

	function isCellSold(roomId, dateKey) {
		if (!selectedWave) return false;
		const cellKey = `${roomId}_${dateKey}`;
		return (selectedWave.soldCells || {})[cellKey] !== undefined;
	}

	function getCellSoldData(roomId, dateKey) {
		if (!selectedWave) return null;
		const cellKey = `${roomId}_${dateKey}`;
		return (selectedWave.soldCells || {})[cellKey] || null;
	}

	function isCellStaff(roomId, dateKey) {
		if (!selectedWave) return false;
		const cellKey = `${roomId}_${dateKey}`;
		return (selectedWave.staffCells || {})[cellKey] !== undefined;
	}

	function getCellStaffData(roomId, dateKey) {
		if (!selectedWave) return null;
		const cellKey = `${roomId}_${dateKey}`;
		return (selectedWave.staffCells || {})[cellKey] || null;
	}

	function openQuickDetail() {
		if (selectedCells.size === 0 || !selectedWave) return;

		const selectedArray = Array.from(selectedCells);
		const soldCells = selectedWave.soldCells || {};
		const staffCells = selectedWave.staffCells || {};

		// Group by room and type
		const details = [];
		const roomGroups = {};

		selectedArray.forEach((cellKey) => {
			const [roomId, dateKey] = cellKey.split('_');
			const isSold = soldCells[cellKey] !== undefined;
			const isStaff = staffCells[cellKey] !== undefined;

			if (!isSold && !isStaff) return;

			const type = isSold ? 'sold' : 'staff';
			const groupKey = `${roomId}_${type}`;

			if (!roomGroups[groupKey]) {
				roomGroups[groupKey] = {
					roomId,
					type,
					dates: [],
					cellKeys: [],
					data: isSold ? soldCells[cellKey] : staffCells[cellKey]
				};
			}

			roomGroups[groupKey].dates.push(dateKey);
			roomGroups[groupKey].cellKeys.push(cellKey);
		});

		// Convert to array and sort dates
		Object.values(roomGroups).forEach((group) => {
			group.dates.sort();
			group.checkIn = group.dates[0];
			group.checkOut = group.dates[group.dates.length - 1];
			details.push(group);
		});

		quickDetailData = {
			wave: selectedWave,
			details
		};

		showQuickDetailModal = true;
	}

	function updateQuickDetailStatus(roomId, type, newStatus) {
		if (!selectedWave) return;

		pushHistory();

		const cellsKey = type === 'sold' ? 'soldCells' : 'staffCells';
		const cells = { ...(selectedWave[cellsKey] || {}) };

		// Update all cells for this room
		Object.keys(cells).forEach((cellKey) => {
			if (cellKey.startsWith(roomId + '_')) {
				cells[cellKey] = {
					...cells[cellKey],
					status: newStatus
				};
			}
		});

		updateWave(selectedWave.id, { [cellsKey]: cells });

		// Update quickDetailData
		if (quickDetailData) {
			quickDetailData.details = quickDetailData.details.map((d) => {
				if (d.roomId === roomId && d.type === type) {
					return { ...d, data: { ...d.data, status: newStatus } };
				}
				return d;
			});
		}
	}

	function updateQuickDetailPrice(roomId, type, newPrice) {
		if (!selectedWave) return;

		pushHistory();

		const cellsKey = type === 'sold' ? 'soldCells' : 'staffCells';
		const cells = { ...(selectedWave[cellsKey] || {}) };

		// Update all cells for this room
		Object.keys(cells).forEach((cellKey) => {
			if (cellKey.startsWith(roomId + '_')) {
				cells[cellKey] = {
					...cells[cellKey],
					price: parseFloat(newPrice) || 0
				};
			}
		});

		updateWave(selectedWave.id, { [cellsKey]: cells });

		// Update quickDetailData
		if (quickDetailData) {
			quickDetailData.details = quickDetailData.details.map((d) => {
				if (d.roomId === roomId && d.type === type) {
					return { ...d, data: { ...d.data, price: parseFloat(newPrice) || 0 } };
				}
				return d;
			});
		}
	}

	function toggleQuickAddStaff(roomId) {
		if (quickAddingStaff === roomId) {
			quickAddingStaff = null;
			quickAddStaffInput[roomId] = '';
		} else {
			quickAddingStaff = roomId;
			if (!quickAddStaffInput[roomId]) {
				quickAddStaffInput[roomId] = '';
			}
		}
	}

	function addQuickStaff(roomId) {
		const staffName = quickAddStaffInput[roomId]?.trim();
		if (!staffName || !selectedWave) return;

		pushHistory();

		const cells = { ...(selectedWave.staffCells || {}) };

		// Add staff to all cells for this room
		Object.keys(cells).forEach((cellKey) => {
			if (cellKey.startsWith(roomId + '_')) {
				const currentStaffList = cells[cellKey].staffList || [];
				cells[cellKey] = {
					...cells[cellKey],
					staffList: [...currentStaffList, staffName]
				};
			}
		});

		updateWave(selectedWave.id, { staffCells: cells });

		// Update quickDetailData
		if (quickDetailData) {
			quickDetailData.details = quickDetailData.details.map((d) => {
				if (d.roomId === roomId && d.type === 'staff') {
					const newStaffList = [...(d.data.staffList || []), staffName];
					return { ...d, data: { ...d.data, staffList: newStaffList } };
				}
				return d;
			});
		}

		// Reset input
		quickAddStaffInput[roomId] = '';
		quickAddingStaff = null;
	}

	function removeQuickStaff(roomId, staffName) {
		if (!selectedWave) return;

		pushHistory();

		const cells = { ...(selectedWave.staffCells || {}) };

		// Remove staff from all cells for this room
		Object.keys(cells).forEach((cellKey) => {
			if (cellKey.startsWith(roomId + '_')) {
				const currentStaffList = cells[cellKey].staffList || [];
				cells[cellKey] = {
					...cells[cellKey],
					staffList: currentStaffList.filter((name) => name !== staffName)
				};
			}
		});

		updateWave(selectedWave.id, { staffCells: cells });

		// Update quickDetailData
		if (quickDetailData) {
			quickDetailData.details = quickDetailData.details.map((d) => {
				if (d.roomId === roomId && d.type === 'staff') {
					const newStaffList = (d.data.staffList || []).filter((name) => name !== staffName);
					return { ...d, data: { ...d.data, staffList: newStaffList } };
				}
				return d;
			});
		}
	}

	// Mark room as staff
	function toggleRoomStaffStatus(roomId) {
		if (!selectedWave) return;

		pushHistory(); // Save state before update

		const currentStaffRooms = selectedWave.staffRooms || [];
		const isStaff = currentStaffRooms.includes(roomId);

		let newStaffRooms;
		if (isStaff) {
			// Remove from staff list
			newStaffRooms = currentStaffRooms.filter((id) => id !== roomId);
		} else {
			// Check if room has jamaah - must be empty to mark as staff
			const jamaahInRoom = getJamaahInRoom(contract, selectedWaveIndex, roomId);
			if (jamaahInRoom.length > 0) {
				alertState = {
					show: true,
					title: 'Kamar Tidak Kosong',
					message: `Kamar ${roomId} masih berisi ${jamaahInRoom.length} jamaah. Kosongkan kamar terlebih dahulu sebelum menandai sebagai untuk staff.`,
					type: 'error',
					onConfirm: () => closeAlert()
				};
				return;
			}

			// Add to staff list
			newStaffRooms = [...currentStaffRooms, roomId];
		}

		updateWave(selectedWave.id, { staffRooms: newStaffRooms });
	}

	function isRoomStaff(roomId) {
		if (!selectedWave) return false;
		return (selectedWave.staffRooms || []).includes(roomId);
	}

	// Room type manipulation (wave-specific overrides, not direct room type change)
	function changeRoomType(roomId, newType, waveId) {
		const targetWaveId = waveId || selectedWave?.id;
		const targetWave = (contract.waves || []).find((w) => w.id === targetWaveId);

		console.log('Changing room type:', { roomId, newType });

		if (!targetWave) {
			console.error('No wave available!');
			alert('Pilih gelombang terlebih dahulu');
			return;
		}

		console.log('Current targetWave:', targetWave.name, 'ID:', targetWave.id);

		pushHistory(); // Save state before room type change

		// Get current overrides for this wave
		const currentOverrides = { ...(targetWave.roomTypeOverrides || {}) };
		console.log('Current overrides before change:', currentOverrides);

		// Find the room's base type
		const room = contract.rooms.find((r) => r.id === roomId);
		const baseType = room?.type || 'unset';
		console.log(`Room ${roomId}: baseType=${baseType}, newType=${newType}`);

		// If new type is same as base type, remove the override
		if (newType === baseType) {
			delete currentOverrides[roomId];
			console.log(`Removing override for ${roomId} (same as base type)`);
		} else {
			// Set the override for this wave
			currentOverrides[roomId] = newType;
			console.log(`Setting override for ${roomId}: ${newType}`);
		}

		console.log('New overrides after change:', currentOverrides);

		// Update wave with new overrides - this should trigger selectedWave reactivity
		updateWave(targetWave.id, { roomTypeOverrides: currentOverrides });

		roomTypeMenu = null;
	}

	function openRoomTypeMenu(e, roomId, waveId = null) {
		e.preventDefault();
		e.stopPropagation();
		roomTypeMenu = { roomId, x: e.clientX, y: e.clientY, waveId: waveId || selectedWave?.id };
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

	function handleSaveRoom({ id, type, force = false }) {
		const occupants = getJamaahInRoom(contract, selectedWaveIndex, id);
		const cap = roomCapacity[type] === '-' ? 999 : roomCapacity[type] || 2; // Allow unlimited for unset

		if (occupants.length > cap && !force) {
			alertState = {
				show: true,
				title: 'Konfirmasi Kapasitas',
				message: `Kamar ini memiliki ${occupants.length} orang, tapi kapasitas ${type.toUpperCase()} hanya ${cap}.\nTetap ubah tipe kamar?`,
				type: 'error',
				onConfirm: () => {
					handleSaveRoom({ id, type, force: true });
					closeAlert();
				}
			};
			return;
		}

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
		updateWave(selectedWave.id, { roomTypeOverrides: currentOverrides });
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

		// Check if target room is sold
		if (isRoomSold(targetRoom.id)) {
			alertState = {
				show: true,
				title: 'Kamar Dijual',
				message: `Kamar ${targetRoom.id} sudah ditandai sebagai dijual. Lepas status "Dijual" terlebih dahulu untuk memindahkan alokasi.`,
				type: 'error',
				onConfirm: () => closeAlert()
			};
			return;
		}

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
					targetJamaah.length > 0 || (targetAlloc?.pilgrims && targetAlloc.pilgrims.length > 0);

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

			// Handle booking GROUP drop from sidebar (auto-allocate all chunks to correct rooms)
			if (parsed.type === 'booking-group') {
				processBookingGroupDrop(parsed);
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

		// Check if target room is sold
		if (isRoomSold(targetRoom.id)) {
			alertState = {
				show: true,
				title: 'Kamar Dijual',
				message: `Kamar ${targetRoom.id} sudah ditandai sebagai dijual. Lepas status "Dijual" terlebih dahulu untuk memindahkan alokasi.`,
				type: 'error',
				onConfirm: () => closeAlert()
			};
			draggedWaveInfo = null;
			return;
		}

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
		const targetCap =
			roomCapacity[targetRoomType] === '-' ? 999 : roomCapacity[targetRoomType] || 2; // Allow unlimited for unset

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
			(targetAlloc?.pilgrims && targetAlloc.pilgrims.length > 0) || targetJamaah.length > 0;

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

<svelte:window onkeydown={handleKeydown} onmouseup={handleCellMouseUp} />

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="contract-grid-wrapper" class:fullscreen={isFullscreen}>
	<ContractGridToolbar
		{contract}
		{isFullscreen}
		{availableFloors}
		bind:selectedFloor
		{showJamaahPanel}
		onToggleJamaahPanel={() => (showJamaahPanel = !showJamaahPanel)}
		{hasUnsavedChanges}
		toggleFullscreen={() => (isFullscreen = !isFullscreen)}
		{saveRoomTypes}
	/>

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
		{#if showJamaahPanel}
			<ContractGridSidebar
				{contract}
				{localTypeConfig}
				{isFullyAllocated}
				onAddWave={handleAddWave}
				onEditWave={openEditWaveByIndex}
				onDeleteWave={handleDeleteWaveByIndex}
				onImportPackage={handleImportPackage}
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
			{selectedWave}
			bind:hoverRoomId
			bind:hoveredCell
			{dragSourceRoomId}
			{dragSourceWaveId}
			{dropTargetRoom}
			{isDraggingRoom}
			{isRoomSold}
			{isRoomStaff}
			{isCellSold}
			{isCellStaff}
			{getCellSoldData}
			{getCellStaffData}
			{isCellSelected}
			{handleCellMouseDown}
			{handleCellMouseEnter}
			{handleCellMouseUp}
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
<ContractContextMenu
	{roomTypeMenu}
	{contract}
	{localTypeConfig}
	{roomCapacity}
	{selectedWave}
	{selectedCells}
	{selectedWaveIndex}
	occupiedRoomIds={occupiedRoomIds()}
	onClose={closeRoomTypeMenu}
	onChangeRoomType={changeRoomType}
	onOpenRoomModal={openRoomModal}
	onToggleSold={toggleSelectedCellsSold}
	onToggleStaff={toggleSelectedCellsStaff}
	onRemoveSold={removeSelectedCellsSold}
	onRemoveStaff={removeSelectedCellsStaff}
	onClearSelection={clearSelection}
	onOpenQuickDetail={openQuickDetail}
	onEmptyRoom={emptyRoom}
/>

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
	{selectedWaveIndex}
	onClose={() => {
		swapState.show = false;
	}}
	onConfirm={handleSwapConfirm}
/>

<!-- Add Wave Modal -->
<AddWaveModal
	show={showAddWaveModal}
	bind:wave={editingWave}
	onClose={() => {
		showAddWaveModal = false;
		editingWave = null;
	}}
	onSave={handleCreateWave}
/>

<!-- Import Package Modal -->
<ImportPackageModal
	bind:isOpen={showImportPackageModal}
	wave={importingWave}
	onImport={handlePackageImport}
/>

<!-- Undo Toast -->
<UndoToast show={showUndoToast} />

<!-- Quick Detail Modal -->
<QuickDetailModal
	bind:show={showQuickDetailModal}
	{quickDetailData}
	{quickAddingStaff}
	bind:quickAddStaffInput
	onUpdateStatus={updateQuickDetailStatus}
	onUpdatePrice={updateQuickDetailPrice}
	onRemoveStaff={removeQuickStaff}
	onToggleAddStaff={toggleQuickAddStaff}
	onAddStaff={addQuickStaff}
/>

<style>
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
		height: calc(100vh - 100px); /* toolbar + hint bar */
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
</style>
