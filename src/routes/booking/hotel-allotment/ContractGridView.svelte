<script>
	import { hotelStorageStore } from '$lib/stores/hotelStorageStore.svelte.js';
	import { gregorianToHijri, hijriMonths } from '$lib/utils/hijri.js';
	import { Maximize2, Minimize2, Users, GripVertical, ChevronDown } from 'lucide-svelte';

	let { contract, hotelId } = $props();

	let isFullscreen = $state(false);
	let showJamaahPanel = $state(true);
	let draggedJamaah = $state(null);
	let dropTargetRoom = $state(null);
	let roomTypeMenu = $state(null); // { roomId, x, y }
	let hoveredCell = $state(null); // { roomId, dateKey }

	// Room capacity by type
	const roomCapacity = { double: 2, triple: 3, quad: 4, quint: 5 };

	// Wave colors
	const waveColors = [
		{ bg: '#1e3a5f', text: '#fff', light: '#dbeafe', mid: '#3b6998' },
		{ bg: '#6a1b9a', text: '#fff', light: '#f3e5f5', mid: '#9c4dcc' },
		{ bg: '#1b5e20', text: '#fff', light: '#dcfce7', mid: '#4caf50' },
		{ bg: '#b71c1c', text: '#fff', light: '#fee2e2', mid: '#ef5350' },
		{ bg: '#e65100', text: '#fff', light: '#fff7ed', mid: '#ff9800' },
		{ bg: '#006064', text: '#fff', light: '#e0f7fa', mid: '#00acc1' }
	];

	const typeConfig = {
		quint: { label: 'QUINT', short: 'QNT', color: '#0d47a1', bg: '#e3f2fd', headerBg: '#1565c0', capacity: 5 },
		quad: { label: 'QUAD', short: 'QD', color: '#1b5e20', bg: '#e8f5e9', headerBg: '#2e7d32', capacity: 4 },
		triple: { label: 'TRIPLE', short: 'TPL', color: '#e65100', bg: '#fff3e0', headerBg: '#ef6c00', capacity: 3 },
		double: { label: 'DOUBLE', short: 'DBL', color: '#6a1b9a', bg: '#f3e5f5', headerBg: '#7b1fa2', capacity: 2 }
	};

	// Date helpers
	let allDates = $derived(() => {
		const from = new Date(contract.contractPeriod.from);
		const to = new Date(contract.contractPeriod.to);
		const days = [];
		const current = new Date(from);
		while (current <= to) {
			days.push(new Date(current));
			current.setDate(current.getDate() + 1);
		}
		return days;
	});

	let roomsByType = $derived(() => {
		const groups = {};
		const typeOrder = ['quint', 'quad', 'triple', 'double'];
		for (const room of contract.rooms) {
			if (!groups[room.type]) groups[room.type] = [];
			groups[room.type].push(room);
		}
		const ordered = [];
		for (const t of typeOrder) {
			if (groups[t]) ordered.push({ type: t, rooms: groups[t] });
		}
		for (const t of Object.keys(groups)) {
			if (!typeOrder.includes(t)) ordered.push({ type: t, rooms: groups[t] });
		}
		return ordered;
	});

	let orderedRooms = $derived(() => {
		const result = [];
		for (const group of roomsByType()) {
			for (const room of group.rooms) result.push(room);
		}
		return result;
	});

	const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

	function formatDateShort(date) {
		return `${date.getDate()}/${date.getMonth() + 1}`;
	}

	function getHijriDate(date) {
		try { return gregorianToHijri(date.toISOString().split('T')[0]); } catch (e) { return null; }
	}

	function getWaveColor(waveIndex) {
		return waveColors[waveIndex % waveColors.length];
	}

	// Cell lookup: LEFT = checkout, RIGHT = checkin
	let cellLookup = $derived(() => {
		const lookup = {};
		const waves = contract.waves || [];
		waves.forEach((wave, waveIndex) => {
			const ciDate = wave.checkIn;
			const coDate = wave.checkOut;
			const roomIds = wave.roomIds || [];
			for (const roomId of roomIds) {
				const ciKey = `${roomId}_${ciDate}`;
				if (!lookup[ciKey]) lookup[ciKey] = { left: null, right: null };
				lookup[ciKey].right = { waveIndex, wave, type: 'checkin' };

				const coKey = `${roomId}_${coDate}`;
				if (!lookup[coKey]) lookup[coKey] = { left: null, right: null };
				lookup[coKey].left = { waveIndex, wave, type: 'checkout' };

				const current = new Date(ciDate);
				current.setDate(current.getDate() + 1);
				const coTime = new Date(coDate).getTime();
				while (current.getTime() < coTime) {
					const dateKey = current.toISOString().split('T')[0];
					const key = `${roomId}_${dateKey}`;
					if (!lookup[key]) lookup[key] = { left: null, right: null };
					if (!lookup[key].left) lookup[key].left = { waveIndex, wave, type: 'occupied' };
					if (!lookup[key].right) lookup[key].right = { waveIndex, wave, type: 'occupied' };
					current.setDate(current.getDate() + 1);
				}
			}
		});
		return lookup;
	});

	function getCellParts(roomId, date) {
		const dateKey = date.toISOString().split('T')[0];
		return cellLookup()[`${roomId}_${dateKey}`] || { left: null, right: null };
	}

	// Selected wave
	let selectedWaveIndex = $state(0);
	let selectedWave = $derived((contract.waves || [])[selectedWaveIndex]);

	// Jamaah helpers
	function getJamaahInRoom(waveIndex, roomId) {
		const wave = (contract.waves || [])[waveIndex];
		if (!wave || !wave.jamaah) return [];
		return wave.jamaah.filter(j => j.roomId === roomId);
	}

	function getUnassignedJamaah(waveIndex) {
		const wave = (contract.waves || [])[waveIndex];
		if (!wave || !wave.jamaah) return [];
		return wave.jamaah.filter(j => !j.roomId || j.roomId === '');
	}

	function getAssignedJamaah(waveIndex) {
		const wave = (contract.waves || [])[waveIndex];
		if (!wave || !wave.jamaah) return [];
		return wave.jamaah.filter(j => j.roomId && j.roomId !== '');
	}

	function getRoomOccupancy(roomId) {
		if (!selectedWave) return { count: 0, capacity: 0 };
		const room = contract.rooms.find(r => r.id === roomId);
		const capacity = roomCapacity[room?.type] || 2;
		const jamaahInRoom = getJamaahInRoom(selectedWaveIndex, roomId);
		return { count: jamaahInRoom.length, capacity };
	}

	// Get cell tooltip with jamaah names
	function getCellTooltip(roomId, waveIndex) {
		const jamaah = getJamaahInRoom(waveIndex, roomId);
		if (jamaah.length === 0) return '';
		return jamaah.map(j => j.name).join('\n');
	}

	// Update wave data
	function updateWave(waveId, updates) {
		const updatedWaves = contract.waves.map(w => w.id === waveId ? { ...w, ...updates } : w);
		hotelStorageStore.updateContract(hotelId, contract.id, { waves: updatedWaves });
	}

	// Toggle room for wave
	function toggleRoomForWave(room) {
		if (!selectedWave) return;
		const currentRoomIds = new Set(selectedWave.roomIds || []);
		let newRoomIds;
		if (currentRoomIds.has(room.id)) {
			newRoomIds = [...currentRoomIds].filter(id => id !== room.id);
		} else {
			newRoomIds = [...currentRoomIds, room.id];
		}
		updateWave(selectedWave.id, { roomIds: newRoomIds, roomsUsed: newRoomIds.length });
	}

	// Drag & Drop Jamaah
	function onDragStart(e, jamaah) {
		draggedJamaah = jamaah;
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData('text/plain', jamaah.id);
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
		if (!draggedJamaah || !selectedWave) return;

		const room = contract.rooms.find(r => r.id === roomId);
		const capacity = roomCapacity[room?.type] || 2;
		const currentInRoom = getJamaahInRoom(selectedWaveIndex, roomId);

		if (currentInRoom.length >= capacity && draggedJamaah.roomId !== roomId) {
			alert(`Kamar ${roomId} sudah penuh! (${currentInRoom.length}/${capacity})`);
			draggedJamaah = null;
			return;
		}

		// Make sure room is in wave's roomIds
		if (!(selectedWave.roomIds || []).includes(roomId)) {
			const newRoomIds = [...(selectedWave.roomIds || []), roomId];
			updateWave(selectedWave.id, { roomIds: newRoomIds, roomsUsed: newRoomIds.length });
		}

		// Move jamaah to room
		const updatedJamaah = selectedWave.jamaah.map(j =>
			j.id === draggedJamaah.id ? { ...j, roomId } : j
		);
		updateWave(selectedWave.id, { jamaah: updatedJamaah });
		draggedJamaah = null;
	}

	function removeJamaahFromRoom(jamaahId) {
		if (!selectedWave) return;
		const updatedJamaah = selectedWave.jamaah.map(j =>
			j.id === jamaahId ? { ...j, roomId: '' } : j
		);
		updateWave(selectedWave.id, { jamaah: updatedJamaah });
	}

	// Room type manipulation
	function changeRoomType(roomId, newType) {
		const updatedRooms = contract.rooms.map(r =>
			r.id === roomId ? { ...r, type: newType } : r
		);
		hotelStorageStore.updateContract(hotelId, contract.id, { rooms: updatedRooms });
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

	function isFriday(date) { return date.getDay() === 5; }

	let waveSummary = $derived(() => {
		return (contract.waves || []).map((wave, i) => {
			const checkIn = new Date(wave.checkIn);
			const checkOut = new Date(wave.checkOut);
			const nights = Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24));
			const totalJamaah = (wave.jamaah || []).length;
			const assigned = (wave.jamaah || []).filter(j => j.roomId && j.roomId !== '').length;
			return { ...wave, index: i, color: getWaveColor(i), nights, roomCount: (wave.roomIds || []).length, totalJamaah, assigned };
		});
	});

	let hoverRoomId = $state(null);
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="contract-grid-wrapper" class:fullscreen={isFullscreen} onclick={closeRoomTypeMenu}>
	<!-- Toolbar -->
	<div class="grid-toolbar">
		<div class="toolbar-left">
			<span class="toolbar-title">📊 Room Allotment Grid</span>
			<span class="toolbar-subtitle">{contract.name} · {contract.rooms.length} kamar · {(contract.waves || []).length} gelombang</span>
		</div>
		<div class="toolbar-right">
			<button class="toolbar-btn" class:active={showJamaahPanel} onclick={() => (showJamaahPanel = !showJamaahPanel)} title="Panel Jamaah">
				<Users size={14} />
			</button>
			<div class="wave-selector">
				<span class="wave-label">Aktif:</span>
				<select class="wave-select" bind:value={selectedWaveIndex}>
					{#each contract.waves || [] as wave, i}
						<option value={i}>{wave.name} {wave.tripName ? `(${wave.tripName})` : ''}</option>
					{/each}
				</select>
			</div>
			<button class="toolbar-btn" onclick={() => (isFullscreen = !isFullscreen)} title={isFullscreen ? 'Keluar Fullscreen' : 'Fullscreen'}>
				{#if isFullscreen}<Minimize2 size={14} />{:else}<Maximize2 size={14} />{/if}
			</button>
		</div>
	</div>

	<!-- Wave Legend -->
	<div class="wave-legend">
		{#each waveSummary() as ws}
			<button class="legend-item" class:active={selectedWaveIndex === ws.index} onclick={() => (selectedWaveIndex = ws.index)}>
				<span class="legend-dot" style="background: {ws.color.bg};"></span>
				<span class="legend-name">{ws.name}</span>
				<span class="legend-info">{ws.roomCount} kmr · {ws.nights} mlm · {ws.assigned}/{ws.totalJamaah} org</span>
			</button>
		{/each}
	</div>

	<!-- Hint bar -->
	<div class="cell-hint-bar">
		<div class="hint-cell-demo"><div class="hint-left">CO</div><div class="hint-right">CI</div></div>
		<span class="hint-text">Kiri = Check-Out, Kanan = Check-In · <strong>Klik kanan</strong> header kamar = ubah tipe · <strong>Drag</strong> jamaah ke header kamar</span>
	</div>

	<!-- Main content area -->
	<div class="grid-main-area">
		<!-- Jamaah Panel -->
		{#if showJamaahPanel && selectedWave}
			<div class="jamaah-panel">
				<div class="jamaah-panel-header">
					<h3>{selectedWave.name}</h3>
					<span class="jamaah-count">{getAssignedJamaah(selectedWaveIndex).length}/{(selectedWave.jamaah || []).length} assigned</span>
				</div>

				<!-- Unassigned -->
				{#if getUnassignedJamaah(selectedWaveIndex).length > 0}
					<div class="jamaah-section">
						<div class="jamaah-section-title">
							<span class="section-dot unassigned"></span>
							Belum Ditugaskan ({getUnassignedJamaah(selectedWaveIndex).length})
						</div>
						{#each getUnassignedJamaah(selectedWaveIndex) as j}
							<div
								class="jamaah-card"
								draggable="true"
								ondragstart={(e) => onDragStart(e, j)}
							>
								<span class="jamaah-grip"><GripVertical size={10} /></span>
								<span class="jamaah-name">{j.name}</span>
								<span class="jamaah-gender" class:male={j.gender === 'L'} class:female={j.gender === 'P'}>{j.gender}</span>
							</div>
						{/each}
					</div>
				{/if}

				<!-- Assigned by room -->
				{#each orderedRooms() as room}
					{@const jamaahInRoom = getJamaahInRoom(selectedWaveIndex, room.id)}
					{@const isInWave = (selectedWave.roomIds || []).includes(room.id)}
					{#if isInWave && jamaahInRoom.length > 0}
						{@const occ = getRoomOccupancy(room.id)}
						{@const tc = typeConfig[room.type]}
						<div class="jamaah-room-group">
							<div class="jamaah-room-header" style="border-left-color: {tc?.headerBg || '#607d8b'};">
								<span class="room-label">{room.id.replace('R0', '').replace('R', '')} · {tc?.short || room.type}</span>
								<span class="room-occ" class:full={occ.count >= occ.capacity}>{occ.count}/{occ.capacity}</span>
							</div>
							{#each jamaahInRoom as j}
								<div
									class="jamaah-card assigned"
									draggable="true"
									ondragstart={(e) => onDragStart(e, j)}
								>
									<span class="jamaah-grip"><GripVertical size={10} /></span>
									<span class="jamaah-name">{j.name}</span>
									<span class="jamaah-gender" class:male={j.gender === 'L'} class:female={j.gender === 'P'}>{j.gender}</span>
									<button class="jamaah-remove" onclick={() => removeJamaahFromRoom(j.id)} title="Hapus dari kamar">×</button>
								</div>
							{/each}
						</div>
					{/if}
				{/each}
			</div>
		{/if}

		<!-- Grid Container -->
		<div class="grid-scroll-container">
			<table class="allotment-grid">
				<thead>
					<tr class="header-type-row">
						<th class="corner-cell sticky-col" rowspan="2">
							<div class="corner-content">
								<span class="corner-date">TANGGAL</span>
								<span class="corner-hijri">HIJRIAH</span>
							</div>
						</th>
						<th class="day-header sticky-col-2" rowspan="2"><span>HARI</span></th>
						{#each roomsByType() as group}
							{@const tc = typeConfig[group.type] || { label: group.type.toUpperCase(), headerBg: '#607d8b' }}
							<th class="type-group-header" colspan={group.rooms.length} style="background: {tc.headerBg};">{tc.label}</th>
						{/each}
					</tr>
					<tr class="header-room-row">
						{#each orderedRooms() as room}
							{@const tc = typeConfig[room.type] || { bg: '#eceff1', color: '#607d8b' }}
							{@const isInWave = selectedWave && (selectedWave.roomIds || []).includes(room.id)}
							{@const occ = getRoomOccupancy(room.id)}
							{@const isManipulated = room.type !== room.originalType}
							{@const isDragOver = dropTargetRoom === room.id}
							<th
								class="room-number-header"
								class:room-selected={isInWave}
								class:drag-over={isDragOver}
								style="background: {isInWave ? getWaveColor(selectedWaveIndex).bg : tc.bg}; color: {isInWave ? '#fff' : tc.color};"
								onclick={() => toggleRoomForWave(room)}
								oncontextmenu={(e) => openRoomTypeMenu(e, room.id)}
								ondragover={(e) => onDragOver(e, room.id)}
								ondragleave={onDragLeave}
								ondrop={(e) => onDrop(e, room.id)}
								onmouseenter={() => (hoverRoomId = room.id)}
								onmouseleave={() => (hoverRoomId = null)}
							>
								<div class="room-header-content">
									<span class="room-num">{room.id.replace('R0', '').replace('R', '')}</span>
									{#if isInWave}
										<span class="room-occ-badge" class:full={occ.count >= occ.capacity}>{occ.count}/{occ.capacity}</span>
									{/if}
									{#if isManipulated}<span class="manip-icon">⚙</span>{/if}
								</div>
							</th>
						{/each}
					</tr>
				</thead>

				<tbody>
					{#each allDates() as date, dateIndex}
						{@const hijri = getHijriDate(date)}
						{@const dayName = dayNames[date.getDay()]}
						{@const friday = isFriday(date)}
						<tr class="date-row" class:friday-row={friday}>
							<td class="date-cell sticky-col" class:friday-date={friday}>
								<div class="date-inner">
									<span class="greg-date">{formatDateShort(date)}</span>
									{#if hijri}<span class="hijri-short">{hijri.day} {hijriMonths[hijri.month].substring(0, 3)}</span>{/if}
								</div>
							</td>
							<td class="day-name-cell sticky-col-2" class:friday-day={friday}>{dayName}</td>

							{#each orderedRooms() as room}
								{@const parts = getCellParts(room.id, date)}
								{@const leftColor = parts.left ? getWaveColor(parts.left.waveIndex) : null}
								{@const rightColor = parts.right ? getWaveColor(parts.right.waveIndex) : null}
								{@const isColHover = hoverRoomId === room.id}
								{@const isTransition = parts.left && parts.right && parts.left.waveIndex !== parts.right.waveIndex}
								{@const dateKey = date.toISOString().split('T')[0]}
								{@const leftTooltip = parts.left ? getCellTooltip(room.id, parts.left.waveIndex) : ''}
								{@const rightTooltip = parts.right ? getCellTooltip(room.id, parts.right.waveIndex) : ''}
								<td class="grid-cell" class:col-highlight={isColHover}
									onmouseenter={() => (hoveredCell = { roomId: room.id, dateKey })}
									onmouseleave={() => (hoveredCell = null)}
								>
									<div class="cell-split">
										<div
											class="cell-half cell-left"
											class:co-marker={parts.left?.type === 'checkout'}
											class:occupied={parts.left?.type === 'occupied'}
											class:empty={!parts.left}
											style={parts.left ? `background: ${leftColor.bg}; color: ${leftColor.text};` : ''}
											title={parts.left?.type === 'checkout' ? `CO: ${parts.left.wave.name}\n${leftTooltip}` : leftTooltip}
										>
											{#if parts.left?.type === 'checkout'}<span class="half-label">◀</span>{/if}
										</div>
										<div
											class="cell-half cell-right"
											class:ci-marker={parts.right?.type === 'checkin'}
											class:occupied={parts.right?.type === 'occupied'}
											class:empty={!parts.right}
											style={parts.right ? `background: ${rightColor.bg}; color: ${rightColor.text};` : ''}
											title={parts.right?.type === 'checkin' ? `CI: ${parts.right.wave.name}\n${rightTooltip}` : rightTooltip}
										>
											{#if parts.right?.type === 'checkin'}<span class="half-label">▶</span>{/if}
										</div>
									</div>
									{#if isTransition}<div class="transition-divider"></div>{/if}
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<!-- Footer -->
	<div class="grid-footer">
		<div class="footer-left">
			{#each waveSummary() as ws}
				<div class="footer-wave" style="border-left-color: {ws.color.bg};">
					<strong>{ws.name}</strong>
					<span>{ws.roomCount} kmr · {ws.nights} mlm · {ws.assigned}/{ws.totalJamaah} org</span>
				</div>
			{/each}
		</div>
		<div class="footer-right">
			<div class="footer-icon-legend">
				<div class="mini-cell-demo"><div class="mini-left">◀</div><div class="mini-right-empty"></div></div>
				<span>Check-Out</span>
			</div>
			<div class="footer-icon-legend">
				<div class="mini-cell-demo"><div class="mini-left-empty"></div><div class="mini-right">▶</div></div>
				<span>Check-In</span>
			</div>
			<div class="footer-icon-legend">
				<div class="mini-cell-demo transition-demo"><div class="mini-left-co"></div><div class="mini-right-ci"></div></div>
				<span>Overlap</span>
			</div>
		</div>
	</div>
</div>

<!-- Room Type Context Menu -->
{#if roomTypeMenu}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="context-menu-overlay" onclick={closeRoomTypeMenu}>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="context-menu" style="left: {roomTypeMenu.x}px; top: {roomTypeMenu.y}px;" onclick={(e) => e.stopPropagation()}>
			<div class="context-menu-title">Ubah Tipe Kamar {roomTypeMenu.roomId}</div>
			{#each ['double', 'triple', 'quad', 'quint'] as t}
				{@const currentRoom = contract.rooms.find(r => r.id === roomTypeMenu.roomId)}
				<button
					class="context-menu-item"
					class:active={currentRoom?.type === t}
					onclick={() => changeRoomType(roomTypeMenu.roomId, t)}
				>
					<span class="ctx-dot" style="background: {typeConfig[t].headerBg};"></span>
					{typeConfig[t].label} ({roomCapacity[t]} org)
					{#if currentRoom?.type === t}<span class="ctx-check">✓</span>{/if}
					{#if currentRoom?.originalType !== t && currentRoom?.type !== t}
						<span class="ctx-manip">⚙</span>
					{/if}
				</button>
			{/each}
			{#if contract.rooms.find(r => r.id === roomTypeMenu.roomId)?.type !== contract.rooms.find(r => r.id === roomTypeMenu.roomId)?.originalType}
				<div class="context-menu-divider"></div>
				<button class="context-menu-item reset" onclick={() => changeRoomType(roomTypeMenu.roomId, contract.rooms.find(r => r.id === roomTypeMenu.roomId)?.originalType)}>
					↩ Reset ke {contract.rooms.find(r => r.id === roomTypeMenu.roomId)?.originalType}
				</button>
			{/if}
		</div>
	</div>
{/if}

<style>
	.contract-grid-wrapper {
		background: #fff;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		overflow: hidden;
		margin-top: 8px;
		font-family: 'Inter', -apple-system, system-ui, sans-serif;
	}
	.contract-grid-wrapper.fullscreen {
		position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 9999; border-radius: 0; margin: 0;
	}

	/* Toolbar */
	.grid-toolbar {
		display: flex; align-items: center; justify-content: space-between; padding: 10px 16px;
		background: linear-gradient(135deg, #0f172a, #1e293b); color: white;
	}
	.toolbar-left { display: flex; align-items: center; gap: 12px; }
	.toolbar-title { font-size: 13px; font-weight: 700; }
	.toolbar-subtitle { font-size: 11px; color: rgba(255,255,255,0.5); }
	.toolbar-right { display: flex; align-items: center; gap: 8px; }
	.wave-selector { display: flex; align-items: center; gap: 6px; }
	.wave-label { font-size: 10px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
	.wave-select {
		background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 6px;
		padding: 5px 28px 5px 10px; color: white; font-size: 11px; font-weight: 600; outline: none; cursor: pointer;
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
		background-repeat: no-repeat; background-position: right 8px center;
	}
	.wave-select option { background: #1e293b; }
	.toolbar-btn {
		display: flex; align-items: center; justify-content: center; width: 28px; height: 28px;
		background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 6px;
		color: white; cursor: pointer; transition: background 0.15s;
	}
	.toolbar-btn:hover, .toolbar-btn.active { background: rgba(255,255,255,0.2); }

	/* Wave Legend */
	.wave-legend { display: flex; flex-wrap: wrap; gap: 6px; padding: 8px 16px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; align-items: center; }
	.legend-item {
		display: flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 8px;
		border: 1.5px solid #e2e8f0; background: white; cursor: pointer; transition: all 0.15s; font-size: 11px;
	}
	.legend-item:hover { border-color: #94a3b8; transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
	.legend-item.active { border-color: #6366f1; background: #eef2ff; box-shadow: 0 0 0 2px rgba(99,102,241,0.15); }
	.legend-dot { width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; }
	.legend-name { font-weight: 700; color: #1e293b; }
	.legend-info { color: #94a3b8; font-size: 10px; }

	/* Hint bar */
	.cell-hint-bar { display: flex; align-items: center; gap: 10px; padding: 5px 16px; background: #fffbeb; border-bottom: 1px solid #fde68a; }
	.hint-cell-demo { display: flex; width: 36px; height: 16px; border: 1px solid #d97706; border-radius: 2px; overflow: hidden; flex-shrink: 0; }
	.hint-left, .hint-right { flex: 1; display: flex; align-items: center; justify-content: center; font-size: 6px; font-weight: 800; color: #92400e; }
	.hint-left { background: #fef3c7; border-right: 1px solid #d97706; }
	.hint-right { background: #fde68a; }
	.hint-text { font-size: 10px; color: #92400e; }
	.hint-text strong { font-weight: 700; }

	/* Main area with jamaah panel */
	.grid-main-area { display: flex; overflow: hidden; }

	/* Jamaah Panel */
	.jamaah-panel {
		width: 220px; min-width: 220px; border-right: 1px solid #e2e8f0; background: #f8fafc;
		overflow-y: auto; max-height: calc(100vh - 380px);
	}
	.fullscreen .jamaah-panel { max-height: calc(100vh - 200px); }
	.jamaah-panel-header {
		padding: 10px 12px; background: white; border-bottom: 1px solid #e2e8f0;
		position: sticky; top: 0; z-index: 5;
	}
	.jamaah-panel-header h3 { font-size: 12px; font-weight: 700; color: #1e293b; margin: 0; }
	.jamaah-count { font-size: 10px; color: #94a3b8; }

	.jamaah-section { padding: 6px 8px; }
	.jamaah-section-title { font-size: 10px; font-weight: 700; color: #64748b; padding: 4px 0; display: flex; align-items: center; gap: 4px; }
	.section-dot { width: 6px; height: 6px; border-radius: 50%; }
	.section-dot.unassigned { background: #ef4444; }

	.jamaah-card {
		display: flex; align-items: center; gap: 4px; padding: 4px 6px; margin: 2px 0;
		background: white; border: 1px solid #e2e8f0; border-radius: 5px; cursor: grab;
		transition: all 0.12s; font-size: 10px;
	}
	.jamaah-card:hover { border-color: #94a3b8; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
	.jamaah-card:active { cursor: grabbing; opacity: 0.7; }
	.jamaah-card.assigned { background: #f0f9ff; border-color: #bae6fd; }
	.jamaah-grip { color: #cbd5e1; flex-shrink: 0; }
	.jamaah-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #1e293b; font-weight: 500; }
	.jamaah-gender { font-size: 8px; font-weight: 800; padding: 1px 4px; border-radius: 3px; flex-shrink: 0; }
	.jamaah-gender.male { background: #dbeafe; color: #1d4ed8; }
	.jamaah-gender.female { background: #fce7f3; color: #be185d; }
	.jamaah-remove { background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 14px; padding: 0 2px; line-height: 1; }
	.jamaah-remove:hover { color: #ef4444; }

	.jamaah-room-group { padding: 4px 8px; }
	.jamaah-room-header {
		display: flex; align-items: center; justify-content: space-between; padding: 3px 6px;
		border-left: 3px solid; font-size: 10px; font-weight: 700; color: #475569; margin-bottom: 2px;
	}
	.room-occ { font-size: 9px; color: #94a3b8; font-weight: 600; }
	.room-occ.full { color: #ef4444; font-weight: 800; }

	/* Grid Container */
	.grid-scroll-container { overflow: auto; max-height: calc(100vh - 380px); flex: 1; position: relative; }
	.fullscreen .grid-scroll-container { max-height: calc(100vh - 200px); }

	.allotment-grid { border-collapse: separate; border-spacing: 0; width: max-content; min-width: 100%; }

	.sticky-col { position: sticky; left: 0; z-index: 20; }
	.sticky-col-2 { position: sticky; left: 82px; z-index: 20; }

	/* Header */
	.header-type-row th { position: sticky; top: 0; z-index: 30; }
	.corner-cell {
		min-width: 82px; width: 82px; background: #0f172a !important; color: rgba(255,255,255,0.85);
		z-index: 50 !important; border-right: 1px solid rgba(255,255,255,0.08);
	}
	.corner-content { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 6px 4px; }
	.corner-date { font-size: 8px; font-weight: 800; letter-spacing: 0.1em; }
	.corner-hijri { font-size: 7px; color: rgba(255,255,255,0.4); letter-spacing: 0.06em; }
	.day-header {
		min-width: 34px; width: 34px; background: #0f172a !important; color: rgba(255,255,255,0.85);
		z-index: 50 !important; border-right: 2px solid rgba(255,255,255,0.1); font-size: 7px; font-weight: 700;
		letter-spacing: 0.08em; text-align: center;
	}
	.type-group-header {
		color: white; font-size: 10px; font-weight: 800; letter-spacing: 0.12em; padding: 7px 10px;
		text-align: center; border-right: 2px solid rgba(255,255,255,0.25); white-space: nowrap;
	}

	.header-room-row th { position: sticky; top: 32px; z-index: 25; }
	.room-number-header {
		min-width: 50px; width: 50px; padding: 4px 2px; text-align: center;
		border-right: 1px solid rgba(0,0,0,0.06); border-bottom: 2px solid rgba(0,0,0,0.08);
		cursor: pointer; transition: all 0.15s; user-select: none;
	}
	.room-number-header:hover { filter: brightness(0.9); }
	.room-number-header.room-selected { box-shadow: inset 0 0 0 2px rgba(255,255,255,0.4); }
	.room-number-header.drag-over {
		outline: 2px dashed #fbbf24 !important; outline-offset: -2px; background: #fef3c7 !important; color: #92400e !important;
	}
	.room-header-content { display: flex; flex-direction: column; align-items: center; gap: 1px; }
	.room-num { font-size: 10px; font-weight: 800; font-variant-numeric: tabular-nums; }
	.room-occ-badge { font-size: 7px; font-weight: 700; opacity: 0.8; }
	.room-occ-badge.full { color: #fbbf24; }
	.manip-icon { font-size: 7px; }

	/* Date Rows */
	.date-row { transition: background 0.08s; }
	.date-row:hover { background: rgba(99,102,241,0.03); }
	.friday-row { background: rgba(34,197,94,0.04); }
	.date-cell { background: white; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #f1f5f9; padding: 0; }
	.date-cell.friday-date { background: #f0fdf4; }
	.date-inner { display: flex; flex-direction: column; align-items: center; gap: 1px; padding: 2px 4px; }
	.greg-date { font-size: 10px; font-weight: 700; color: #1e293b; font-variant-numeric: tabular-nums; }
	.hijri-short { font-size: 7px; color: #94a3b8; font-weight: 500; white-space: nowrap; }
	.day-name-cell {
		background: white; border-right: 2px solid #e2e8f0; border-bottom: 1px solid #f1f5f9;
		font-size: 7px; font-weight: 700; text-align: center; color: #94a3b8; letter-spacing: 0.04em;
	}
	.day-name-cell.friday-day { color: #16a34a; background: #f0fdf4; font-weight: 800; }

	/* Grid Cells */
	.grid-cell {
		min-width: 50px; width: 50px; height: 22px; border-right: 1px solid #e9ecef;
		border-bottom: 1px solid #e9ecef; padding: 0; position: relative; cursor: default;
	}
	.grid-cell:hover { outline: 2px solid #818cf8; outline-offset: -2px; z-index: 5; }
	.grid-cell.col-highlight { background: rgba(99,102,241,0.04); }
	.cell-split { display: flex; width: 100%; height: 100%; }
	.cell-half { flex: 1; display: flex; align-items: center; justify-content: center; min-width: 0; transition: background 0.1s; }
	.cell-half.empty { background: transparent; }
	.cell-left { border-right: 1px solid rgba(255,255,255,0.15); }
	.cell-left.empty { border-right: 1px dotted #e9ecef; }
	.cell-half.co-marker { position: relative; opacity: 0.75; }
	.half-label { font-size: 8px; font-weight: 900; line-height: 1; opacity: 0.9; }
	.transition-divider {
		position: absolute; top: 0; left: 50%; width: 2px; height: 100%;
		background: #fbbf24; z-index: 2; box-shadow: 0 0 4px rgba(251,191,36,0.6);
	}

	/* Footer */
	.grid-footer {
		display: flex; align-items: center; justify-content: space-between; padding: 8px 16px;
		background: #f8fafc; border-top: 1px solid #e2e8f0; flex-wrap: wrap; gap: 8px;
	}
	.footer-left { display: flex; flex-wrap: wrap; gap: 12px; }
	.footer-wave { display: flex; flex-direction: column; gap: 1px; padding-left: 10px; border-left: 3px solid; font-size: 10px; }
	.footer-wave strong { color: #1e293b; }
	.footer-wave span { color: #94a3b8; font-size: 9px; }
	.footer-right { display: flex; gap: 14px; align-items: center; }
	.footer-icon-legend { display: flex; align-items: center; gap: 4px; font-size: 10px; color: #64748b; }
	.mini-cell-demo { display: flex; width: 22px; height: 12px; border: 1px solid #cbd5e1; border-radius: 2px; overflow: hidden; }
	.mini-left, .mini-right { flex: 1; display: flex; align-items: center; justify-content: center; background: #1e3a5f; color: white; font-size: 6px; font-weight: 800; }
	.mini-left { border-right: 1px solid rgba(255,255,255,0.3); }
	.mini-left-empty, .mini-right-empty { flex: 1; background: white; }
	.mini-left-empty { border-right: 1px solid #e2e8f0; }
	.mini-left-co { flex: 1; background: #1e3a5f; border-right: 1px solid #fbbf24; }
	.mini-right-ci { flex: 1; background: #6a1b9a; }

	/* Context Menu */
	.context-menu-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 10000; }
	.context-menu {
		position: fixed; background: white; border: 1px solid #e2e8f0; border-radius: 10px;
		box-shadow: 0 8px 32px rgba(0,0,0,0.15); padding: 6px; min-width: 180px; z-index: 10001;
	}
	.context-menu-title { font-size: 10px; font-weight: 800; color: #64748b; padding: 6px 10px 4px; text-transform: uppercase; letter-spacing: 0.06em; }
	.context-menu-item {
		display: flex; align-items: center; gap: 8px; width: 100%; padding: 7px 10px; border: none;
		background: none; cursor: pointer; border-radius: 6px; font-size: 11px; color: #334155; text-align: left;
		transition: background 0.1s;
	}
	.context-menu-item:hover { background: #f1f5f9; }
	.context-menu-item.active { background: #eef2ff; color: #4338ca; font-weight: 700; }
	.context-menu-item.reset { color: #dc2626; }
	.ctx-dot { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }
	.ctx-check { margin-left: auto; color: #22c55e; font-weight: 800; }
	.ctx-manip { margin-left: auto; font-size: 10px; }
	.context-menu-divider { height: 1px; background: #e2e8f0; margin: 4px 0; }

	/* Scrollbar */
	.grid-scroll-container::-webkit-scrollbar, .jamaah-panel::-webkit-scrollbar { width: 6px; height: 6px; }
	.grid-scroll-container::-webkit-scrollbar-track, .jamaah-panel::-webkit-scrollbar-track { background: #f1f5f9; }
	.grid-scroll-container::-webkit-scrollbar-thumb, .jamaah-panel::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 3px; }
	.grid-scroll-container::-webkit-scrollbar-corner { background: #f1f5f9; }
</style>
