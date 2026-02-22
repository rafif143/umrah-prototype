<script>
	import {
		Plus,
		Pencil,
		AlertTriangle,
		ChevronDown,
		GripVertical,
		Package,
		MoreVertical,
		Trash2
	} from 'lucide-svelte';
	import {
		getAssignedJamaah,
		getOrderedRooms,
		getJamaahInRoom,
		checkWaveOverlap
	} from './contractHelpers.js';
	import { getRoomTypeForWave } from './roomTypeHelpers.js';

	let {
		contract,
		localTypeConfig,
		isFullyAllocated = false,
		onAddWave,
		onEditWave,
		onDeleteWave,
		onDragStart,
		onImportPackage,
		onAutoAllocateBooking
	} = $props();

	let expandedWaveKeys = $state(new Set([0]));
	let expandedRoomKeys = $state(new Set());
	let openDropdownIndex = $state(null); // Track which dropdown is open

	function toggleWaveExpanded(index) {
		const newSet = new Set(expandedWaveKeys);
		if (newSet.has(index)) newSet.delete(index);
		else newSet.add(index);
		expandedWaveKeys = newSet;
	}

	function toggleRoomGroupExpanded(key) {
		const newSet = new Set(expandedRoomKeys);
		if (newSet.has(key)) newSet.delete(key);
		else newSet.add(key);
		expandedRoomKeys = newSet;
	}

	function toggleDropdown(e, index) {
		e.stopPropagation();
		openDropdownIndex = openDropdownIndex === index ? null : index;
	}

	function closeDropdown() {
		openDropdownIndex = null;
	}

	function handleEditClick(e, waveId, index) {
		// Just pass the index to the edit function
		onEditWave(e, index);
		closeDropdown();
	}

	function handleDeleteClick(e, waveId, index) {
		// Just pass the index to the delete function
		onDeleteWave(e, index);
		closeDropdown();
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="jamaah-panel" onclick={closeDropdown}>
	<button
		class="add-wave-btn"
		onclick={!isFullyAllocated ? onAddWave : undefined}
		class:disabled={isFullyAllocated}
		title={isFullyAllocated ? 'Semua tanggal dalam kontrak sudah terisi' : 'Tambah Gelombang'}
	>
		<Plus size={14} />
		<span>Tambah Gelombang</span>
	</button>
	{#each contract.waves || [] as wave, i}
		{@const isWaveExpanded = expandedWaveKeys.has(i)}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div
			class="wave-group-header clickable"
			class:dropdown-open={openDropdownIndex === i}
			onclick={() => toggleWaveExpanded(i)}
			role="button"
			tabindex="0"
			style="cursor: pointer;"
		>
			<div class="wave-header-content">
				<div class="wave-title-row">
					<div class="wave-title">
						<span class="wave-name">{wave.name}</span>
						{#if wave.tripName}
							<span class="trip-name">({wave.tripName})</span>
						{/if}
					</div>

					<div class="wave-actions">
						{#if checkWaveOverlap(contract, i)}
							<div class="overlap-warning" title="Tanggal bertabrakan dengan gelombang lain">
								<AlertTriangle size={14} color="#ef4444" />
							</div>
						{/if}

						<!-- Dropdown Menu -->
						<div class="wave-dropdown-container">
							<button
								class="wave-dropdown-btn"
								onclick={(e) => toggleDropdown(e, i)}
								title="Menu Gelombang"
							>
								<MoreVertical size={16} />
							</button>

							{#if openDropdownIndex === i}
								<!-- svelte-ignore a11y_click_events_have_key_events -->
								<div class="wave-dropdown-menu" onclick={(e) => e.stopPropagation()}>
									<button class="dropdown-item" onclick={(e) => handleEditClick(e, wave.id, i)}>
										<Pencil size={14} />
										<span>Edit Gelombang</span>
									</button>
									<button
										class="dropdown-item"
										onclick={(e) => {
											e.stopPropagation();
											onImportPackage(wave, i);
											closeDropdown();
										}}
									>
										<Package size={14} />
										<span>Import Package</span>
									</button>
									<div class="dropdown-divider"></div>
									<button
										class="dropdown-item danger"
										onclick={(e) => handleDeleteClick(e, wave.id, i)}
									>
										<Trash2 size={14} />
										<span>Hapus Gelombang</span>
									</button>
								</div>
							{/if}
						</div>

						<div class="expand-icon">
							<ChevronDown
								size={16}
								style="transition: transform 0.2s; transform: {isWaveExpanded
									? 'rotate(0deg)'
									: 'rotate(-90deg)'}"
							/>
						</div>
					</div>
				</div>

				<div class="wave-stats">
					{getAssignedJamaah(contract, i).length} Jamaah · {(wave.roomIds || []).length} Kamar
				</div>
			</div>
		</div>
		{#if isWaveExpanded}
			<!-- Assigned by booking and room -->
			{@const assignedData = (() => {
				const bookings = {};
				const emptyRooms = [];
				const occupiedRooms = new Set();
				let outOfBookingRooms = [];

				// Group jamaah by booking -> room
				(wave.jamaah || []).forEach((j) => {
					if (!j.roomId || j.roomId === '') return;
					const bId = j.bookingId || 'NO-BOOKING';
					const bName = j.bookingName || bId;

					if (bId === 'NO-BOOKING') {
						if (!outOfBookingRooms.includes(j.roomId)) outOfBookingRooms.push(j.roomId);
						occupiedRooms.add(j.roomId);
						return;
					}

					if (!bookings[bId]) {
						bookings[bId] = { bookingId: bId, bookingName: bName, pax: 0, rooms: {} };
					}
					if (!bookings[bId].rooms[j.roomId]) {
						bookings[bId].rooms[j.roomId] = [];
						occupiedRooms.add(j.roomId);
					}
					bookings[bId].rooms[j.roomId].push(j);
					bookings[bId].pax++;
				});

				// Find empty rooms assigned to wave
				(wave.roomIds || []).forEach((rId) => {
					if (!occupiedRooms.has(rId)) {
						emptyRooms.push(rId);
					}
				});

				const orderMap = {};
				getOrderedRooms(contract).forEach((r, idx) => {
					orderMap[r.id] = idx;
				});

				return { bookings, emptyRooms, orderMap, outOfBookingRooms };
			})()}

			<div class="assigned-section">
				<!-- Render each booking as a parent -->
				{#each Object.values(assignedData.bookings) as bookingGroup}
					<div class="booking-unassigned-group">
						<div class="booking-top-label" style="border-left-color: #cbd5e1;">
							<span class="booking-top-name">{bookingGroup.bookingName}</span>
							<span class="booking-top-pax">{bookingGroup.pax} pax</span>
						</div>

						<div class="booking-chunks-wrapper">
							{#each Object.entries(bookingGroup.rooms).sort((a, b) => (assignedData.orderMap[a[0]] || 0) - (assignedData.orderMap[b[0]] || 0)) as [roomId, jamaahInRoom]}
								{@const roomObj = contract.rooms.find((r) => r.id === roomId) || {
									id: roomId,
									type: 'double'
								}}
								{@const effectiveType = getRoomTypeForWave(roomObj, wave)}
								{@const tc = localTypeConfig[effectiveType]}
								{@const cap = tc?.capacity || 2}
								{@const roomKey = `${i}-${roomId}`}
								{@const isExpanded = expandedRoomKeys.has(roomKey)}

								<div class="jamaah-room-group">
									<!-- svelte-ignore a11y_click_events_have_key_events -->
									<div
										class="jamaah-room-header clickable"
										style="border-left-color: {tc?.headerBg || '#607d8b'}; cursor: pointer;"
										onclick={() => toggleRoomGroupExpanded(roomKey)}
										role="button"
										tabindex="0"
									>
										<span class="room-label">
											✓ {roomId.replace('R0', '').replace('R', '')} • {effectiveType.toUpperCase()}
										</span>
										<div style="display: flex; align-items: center; gap: 6px;">
											<span class="room-occ" class:full={jamaahInRoom.length >= cap}
												>{jamaahInRoom.length}/{cap}</span
											>
											<ChevronDown
												size={12}
												style="transition: transform 0.2s; transform: {isExpanded
													? 'rotate(0deg)'
													: 'rotate(-90deg)'}"
											/>
										</div>
									</div>
									{#if isExpanded}
										{#each jamaahInRoom as j}
											<div
												class="jamaah-card assigned"
												draggable="true"
												ondragstart={(e) => onDragStart(e, j, i)}
											>
												<span class="jamaah-grip"><GripVertical size={10} /></span>
												<span class="jamaah-name">{j.name}</span>
												<span
													class="jamaah-gender"
													class:male={j.gender === 'L'}
													class:female={j.gender === 'P'}>{j.gender}</span
												>
											</div>
										{/each}
									{/if}
								</div>
							{/each}
						</div>
					</div>
				{/each}

				<!-- Render mixed/unknown booking rooms if any -->
				{#if assignedData.outOfBookingRooms.length > 0}
					<!-- fallback for rooms outside booking structure but with pax -->
					{#each assignedData.outOfBookingRooms.sort((a, b) => (assignedData.orderMap[a] || 0) - (assignedData.orderMap[b] || 0)) as roomId}
						{@const jamaahInRoom = getJamaahInRoom(contract, i, roomId)}
						{@const roomObj = contract.rooms.find((r) => r.id === roomId) || {
							id: roomId,
							type: 'double'
						}}
						{@const effectiveType = getRoomTypeForWave(roomObj, wave)}
						{@const tc = localTypeConfig[effectiveType]}
						{@const cap = tc?.capacity || 2}
						{@const roomKey = `${i}-${roomId}`}
						{@const isExpanded = expandedRoomKeys.has(roomKey)}

						<div class="jamaah-room-group">
							<div
								class="jamaah-room-header clickable"
								style="border-left-color: {tc?.headerBg || '#607d8b'}; cursor: pointer;"
								onclick={() => toggleRoomGroupExpanded(roomKey)}
								role="button"
								tabindex="0"
							>
								<span class="room-label">
									✓ {roomId.replace('R0', '').replace('R', '')} • {effectiveType.toUpperCase()}
								</span>
								<div style="display: flex; align-items: center; gap: 6px;">
									<span class="room-occ" class:full={jamaahInRoom.length >= cap}
										>{jamaahInRoom.length}/{cap}</span
									>
									<ChevronDown
										size={12}
										style="transition: transform 0.2s; transform: {isExpanded
											? 'rotate(0deg)'
											: 'rotate(-90deg)'}"
									/>
								</div>
							</div>
							{#if isExpanded}
								{#each jamaahInRoom as j}
									<div
										class="jamaah-card assigned"
										draggable="true"
										ondragstart={(e) => onDragStart(e, j, i)}
									>
										<span class="jamaah-grip"><GripVertical size={10} /></span>
										<span class="jamaah-name">{j.name}</span>
										<span
											class="jamaah-gender"
											class:male={j.gender === 'L'}
											class:female={j.gender === 'P'}>{j.gender}</span
										>
									</div>
								{/each}
							{/if}
						</div>
					{/each}
				{/if}
			</div>

			<!-- Unassigned bookings (no room yet) -->
			{@const unassignedJamaah = (wave.jamaah || []).filter((j) => !j.roomId || j.roomId === '')}
			{@const unassignedBookings = unassignedJamaah.reduce((acc, j) => {
				const bookingId = j.bookingId || 'NO-BOOKING';
				const bookingName = j.bookingName || bookingId;
				const reqType = j.requestedRoomType || 'double';
				const capacity = localTypeConfig[reqType]?.capacity || 2;

				if (!acc[bookingId]) {
					acc[bookingId] = {
						bookingId,
						bookingName,
						pax: 0,
						chunks: []
					};
				}

				acc[bookingId].pax++;

				// Find exactly one chunk of this requested room type that isn't full yet
				let targetChunk = acc[bookingId].chunks.find(
					(c) => c.requestedType === reqType && c.jamaah.length < capacity
				);

				if (!targetChunk) {
					targetChunk = {
						requestedType: reqType,
						jamaah: [],
						chunkIndex: acc[bookingId].chunks.filter((c) => c.requestedType === reqType).length
					};
					acc[bookingId].chunks.push(targetChunk);
				}

				targetChunk.jamaah.push(j);
				return acc;
			}, {})}

			{#if Object.keys(unassignedBookings).length > 0}
				<div class="unassigned-section">
					<div class="unassigned-header">Belum Dialokasikan</div>
					{#each Object.values(unassignedBookings) as bookingGroup}
						<div class="booking-unassigned-group">
							<div
								class="booking-top-label booking-top-draggable"
								draggable="true"
								ondragstart={(e) => {
									e.dataTransfer.effectAllowed = 'move';
									e.dataTransfer.setData(
										'text/plain',
										JSON.stringify({
											type: 'booking-group',
											bookingId: bookingGroup.bookingId,
											bookingName: bookingGroup.bookingName,
											waveIndex: i,
											chunks: bookingGroup.chunks.map((c) => ({
												requestedType: c.requestedType,
												jamaahIds: c.jamaah.map((j) => j.id),
												count: c.jamaah.length
											}))
										})
									);

									// Build custom drag ghost block
									const ghost = document.createElement('div');
									ghost.style.cssText = [
										'position:fixed',
										'top:-1000px',
										'left:0',
										'background:#1e293b',
										'color:white',
										'border-radius:8px',
										'padding:8px 12px',
										'min-width:160px',
										'box-shadow:0 4px 20px rgba(0,0,0,0.4)',
										'font-family:system-ui,sans-serif',
										'font-size:11px',
										'line-height:1.5',
										'border:1px solid rgba(255,255,255,0.1)'
									].join(';');

									const header = document.createElement('div');
									header.style.cssText =
										'font-weight:700;font-size:12px;margin-bottom:6px;padding-bottom:5px;border-bottom:1px solid rgba(255,255,255,0.15);display:flex;justify-content:space-between;align-items:center;gap:12px';
									header.innerHTML = `<span>📦 ${bookingGroup.bookingName}</span><span style="background:rgba(255,255,255,0.15);border-radius:4px;padding:1px 6px;font-size:10px">${bookingGroup.pax} pax</span>`;
									ghost.appendChild(header);

									const typeColors = {
										double: '#6366f1',
										triple: '#10b981',
										quad: '#f59e0b',
										quint: '#ec4899',
										single: '#3b82f6'
									};
									const chunkSummary = {};
									bookingGroup.chunks.forEach((c) => {
										const k = c.requestedType;
										chunkSummary[k] = (chunkSummary[k] || 0) + c.jamaah.length;
									});

									Object.entries(chunkSummary).forEach(([type, pax]) => {
										const row = document.createElement('div');
										row.style.cssText =
											'display:flex;justify-content:space-between;align-items:center;padding:3px 0;gap:10px';
										const color = typeColors[type] || '#64748b';
										row.innerHTML = `<span style="display:flex;align-items:center;gap:5px"><span style="width:8px;height:8px;border-radius:2px;background:${color};display:inline-block"></span>${type.toUpperCase()}</span><span style="color:#94a3b8">${pax} pax</span>`;
										ghost.appendChild(row);
									});

									document.body.appendChild(ghost);
									e.dataTransfer.setDragImage(ghost, 80, 20);
									setTimeout(() => document.body.removeChild(ghost), 0);
								}}
								role="button"
								tabindex="0"
							>
								<span class="booking-top-name">
									<GripVertical
										size={10}
										style="display:inline; color:#94a3b8; margin-right: 2px;"
									/>
									{bookingGroup.bookingName}
								</span>
								<span class="booking-top-pax">{bookingGroup.pax} pax</span>
							</div>

							<div class="booking-chunks-wrapper">
								{#each bookingGroup.chunks as chunk}
									{@const bookingKey = `${i}-unassigned-${bookingGroup.bookingId}-${chunk.requestedType}-${chunk.chunkIndex}`}
									{@const isExpanded = expandedRoomKeys.has(bookingKey)}
									<div class="jamaah-room-group">
										<!-- svelte-ignore a11y_click_events_have_key_events -->
										<div
											class="jamaah-room-header unassigned clickable"
											draggable="true"
											ondragstart={(e) => {
												e.dataTransfer.effectAllowed = 'move';
												e.dataTransfer.setData(
													'text/plain',
													JSON.stringify({
														type: 'booking',
														bookingId: bookingGroup.bookingId,
														waveIndex: i,
														jamaahIds: chunk.jamaah.map((j) => j.id),
														requestedRoomType: chunk.requestedType,
														count: chunk.jamaah.length
													})
												);
											}}
											onclick={() => toggleRoomGroupExpanded(bookingKey)}
											role="button"
											tabindex="0"
										>
											<span class="room-label">
												<span class="booking-grip"><GripVertical size={10} /></span>
												✗ {chunk.requestedType.toUpperCase()}
												{chunk.chunkIndex > 0 ? `(#${chunk.chunkIndex + 1})` : ''}
											</span>
											<div style="display: flex; align-items: center; gap: 6px;">
												<span class="room-occ">{chunk.jamaah.length} pax</span>
												<ChevronDown
													size={12}
													style="transition: transform 0.2s; transform: {isExpanded
														? 'rotate(0deg)'
														: 'rotate(-90deg)'}"
												/>
											</div>
										</div>
										{#if isExpanded}
											{#each chunk.jamaah as j}
												<div
													class="jamaah-card unassigned"
													draggable="true"
													ondragstart={(e) => onDragStart(e, j, i)}
												>
													<span class="jamaah-grip"><GripVertical size={10} /></span>
													<span class="jamaah-name">{j.name}</span>
													<span
														class="jamaah-gender"
														class:male={j.gender === 'L'}
														class:female={j.gender === 'P'}>{j.gender}</span
													>
												</div>
											{/each}
										{/if}
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		{/if}
	{/each}
</div>

<style>
	/* Jamaah Panel Styles */
	.jamaah-panel {
		width: 220px;
		min-width: 220px;
		border-right: 1px solid #e2e8f0;
		background: #f8fafc;
		overflow-y: auto;
		max-height: calc(100vh - 380px);
	}
	/* Note: .fullscreen .jamaah-panel rule is in parent global styles or need to pass class? 
	   Actually styles are scoped. I might need to move styles here. */

	.add-wave-btn {
		width: 100%;
		padding: 12px;
		background: #fff;
		border: none;
		border-bottom: 1px solid #e2e8f0;
		color: #3b82f6;
		font-weight: 600;
		font-size: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		cursor: pointer;
		transition: background 0.15s;
	}
	.add-wave-btn:hover {
		background: #f1f5f9;
	}
	.add-wave-btn.disabled {
		opacity: 0.5;
		cursor: not-allowed;
		background: #f8fafc;
		color: #94a3b8;
	}
	.add-wave-btn.disabled:hover {
		background: #f8fafc;
	}

	.wave-group-header {
		padding: 12px 14px;
		background: #fff;
		border-bottom: 1px solid #e2e8f0;
		border-top: 1px solid #e2e8f0;
		position: sticky;
		top: 0;
		z-index: 10;
		font-size: 13px;
		color: #1e293b;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
		transition: background 0.15s;
	}
	.wave-group-header.dropdown-open {
		z-index: 20;
	}
	.wave-group-header:first-child {
		border-top: none;
	}
	.wave-group-header:hover {
		background: #f8fafc;
	}

	.wave-header-content {
		width: 100%;
	}

	.wave-title-row {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 4px;
	}

	.wave-title {
		display: flex;
		flex-direction: column;
		gap: 2px;
		flex: 1;
		min-width: 0;
	}

	.wave-name {
		font-weight: 700;
		color: #1e293b;
		font-size: 13px;
		line-height: 1.2;
	}

	.trip-name {
		font-weight: 500;
		color: #64748b;
		font-size: 11px;
		line-height: 1.2;
	}

	.wave-actions {
		display: flex;
		align-items: center;
		gap: 6px;
		flex-shrink: 0;
	}

	.wave-stats {
		font-size: 11px;
		color: #94a3b8;
		font-weight: 500;
		margin-top: 2px;
	}

	.overlap-warning {
		display: flex;
		align-items: center;
	}

	.expand-icon {
		display: flex;
		align-items: center;
		color: #94a3b8;
	}

	.jamaah-room-group {
		margin-bottom: 1px;
	}
	.jamaah-room-header {
		padding: 6px 12px 6px 8px; /* Indented slightly less than original? Or same? Original 6px 8px? */
		/* Original was padding: 6px 12px 6px ... wait let me check View File output */
		/* Line 804 in step 905 just says attributes. CSS is elsewhere? */
		/* I need to find CSS for .jamaah-room-header in original file. */
		background: #f8fafc;
		border-left: 3px solid transparent;
		border-bottom: 1px solid #f1f5f9;
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 11px;
	}
	.jamaah-room-header:hover {
		background: #f1f5f9;
	}
	.room-label {
		font-weight: 600;
		color: #475569;
	}
	.room-occ {
		font-size: 10px;
		color: #cbd5e1;
		font-weight: 500;
	}
	.room-occ.full {
		color: #ef4444;
	}

	.unassigned-section {
		margin-top: 8px;
		border-top: 2px solid #e2e8f0;
		padding-top: 4px;
	}

	.unassigned-header {
		padding: 6px 12px;
		background: #fef3c7;
		border-left: 3px solid #f59e0b;
		font-size: 10px;
		font-weight: 700;
		color: #92400e;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.booking-unassigned-group {
		margin-bottom: 8px;
		border-bottom: 1px solid #f1f5f9;
	}

	.booking-top-label {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 6px 12px;
		background: #f8fafc;
		border-left: 3px solid #cbd5e1;
	}

	.booking-top-draggable {
		cursor: grab;
		transition: background 0.15s;
	}
	.booking-top-draggable:hover {
		background: #eff6ff;
		border-left-color: #818cf8;
	}
	.booking-top-draggable:active {
		cursor: grabbing;
		opacity: 0.75;
	}

	.booking-top-name {
		font-size: 11px;
		font-weight: 700;
		color: #334155;
	}

	.booking-top-pax {
		font-size: 10px;
		font-weight: 600;
		color: #64748b;
		background: #e2e8f0;
		padding: 2px 6px;
		border-radius: 4px;
	}

	.booking-chunks-wrapper {
		display: flex;
		flex-direction: column;
		padding-left: 8px;
	}

	.jamaah-room-header.unassigned {
		background: #fffbeb;
		border-left-color: #f59e0b !important;
		cursor: grab;
	}

	.jamaah-room-header.unassigned:active {
		cursor: grabbing;
	}

	.booking-grip {
		color: #cbd5e1;
		display: inline-flex;
		align-items: center;
		margin-right: 4px;
	}

	.jamaah-card.unassigned {
		background: #fffbeb;
		border-color: #fde68a;
	}

	.jamaah-card {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 4px 6px;
		margin: 2px 4px 2px 12px; /* Indented */
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 5px;
		cursor: grab;
		transition: all 0.12s;
		font-size: 10px;
	}
	.jamaah-card:hover {
		border-color: #94a3b8;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
	}
	.jamaah-card:active {
		cursor: grabbing;
		opacity: 0.7;
	}
	.jamaah-card.assigned {
		background: #f0f9ff;
		border-color: #bae6fd;
	}
	.jamaah-grip {
		color: #cbd5e1;
		flex-shrink: 0;
	}
	.jamaah-name {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.jamaah-gender {
		font-size: 9px;
		font-weight: 700;
		padding: 1px 4px;
		border-radius: 3px;
		color: #fff;
	}
	.jamaah-gender.male {
		background: #3b82f6; /* L */
	}
	.jamaah-gender.female {
		background: #ec4899; /* P */
	}

	/* Wave Dropdown Menu */
	.wave-dropdown-container {
		position: relative;
	}

	.wave-dropdown-btn {
		background: none;
		border: none;
		cursor: pointer;
		padding: 6px;
		border-radius: 6px;
		color: #64748b;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.15s;
		min-width: 32px;
		height: 32px;
	}

	.wave-dropdown-btn:hover {
		background: #f1f5f9;
		color: #475569;
	}

	.wave-dropdown-btn:active {
		background: #e2e8f0;
	}

	.wave-dropdown-menu {
		position: absolute;
		top: 100%;
		right: 0;
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 10px;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
		padding: 6px;
		z-index: 1000;
		min-width: 180px;
		margin-top: 4px;
		animation: dropdown-appear 0.15s ease-out;
	}

	@keyframes dropdown-appear {
		from {
			opacity: 0;
			transform: translateY(-4px) scale(0.95);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	.dropdown-item {
		display: flex;
		align-items: center;
		gap: 10px;
		width: 100%;
		padding: 10px 12px;
		border: none;
		background: none;
		font-size: 13px;
		font-weight: 500;
		color: #374151;
		cursor: pointer;
		border-radius: 6px;
		text-align: left;
		transition: all 0.15s;
	}

	.dropdown-item:hover {
		background: #f3f4f6;
		color: #111827;
	}

	.dropdown-item.danger {
		color: #dc2626;
	}

	.dropdown-item.danger:hover {
		background: #fef2f2;
		color: #b91c1c;
	}

	.dropdown-divider {
		height: 1px;
		background: #e5e7eb;
		margin: 6px 0;
	}
</style>
