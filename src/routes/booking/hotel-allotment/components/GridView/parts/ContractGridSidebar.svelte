<script>
	import { Plus, Pencil, AlertTriangle, ChevronDown, GripVertical, Package } from 'lucide-svelte';
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
		onDragStart,
		onImportPackage
	} = $props();

	let expandedWaveKeys = $state(new Set([0]));
	let expandedRoomKeys = $state(new Set());

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
</script>

<div class="jamaah-panel">
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
			onclick={() => toggleWaveExpanded(i)}
			role="button"
			tabindex="0"
			style="cursor: pointer;"
		>
			<span>{wave.name} {wave.tripName ? `(${wave.tripName})` : ''}</span>
			<div style="display: flex; align-items: center; gap: 6px;">
				{#if checkWaveOverlap(contract, i)}
					<div title="Tanggal bertabrakan dengan gelombang lain">
						<AlertTriangle size={14} color="#ef4444" />
					</div>
				{/if}

				<button
					class="icon-btn-ghost"
					onclick={(e) => {
						e.stopPropagation();
						onImportPackage(wave, i);
					}}
					title="Import Package"
					style="background: none; border: none; cursor: pointer; padding: 2px; display: flex; color: #972395;"
				>
					<Package size={12} />
				</button>

				<button
					class="icon-btn-ghost"
					onclick={(e) => onEditWave(e, wave)}
					title="Edit Gelombang"
					style="background: none; border: none; cursor: pointer; padding: 2px; display: flex; color: #64748b;"
				>
					<Pencil size={12} />
				</button>

				<span style="font-weight: normal; color: #64748b; font-size: 11px;">
					{getAssignedJamaah(contract, i).length} Jamaah · {(wave.roomIds || []).length} Kamar
				</span>
				<ChevronDown
					size={14}
					style="transition: transform 0.2s; transform: {isWaveExpanded
						? 'rotate(0deg)'
						: 'rotate(-90deg)'}"
				/>
			</div>
		</div>
		{#if isWaveExpanded}
			<!-- Assigned by booking and room -->
			{#each getOrderedRooms(contract) as room}
				{@const jamaahInRoom = getJamaahInRoom(contract, i, room.id)}
				{#if (wave.roomIds || []).includes(room.id) || jamaahInRoom.length > 0}
					{@const effectiveType = getRoomTypeForWave(room, wave)}
					{@const tc = localTypeConfig[effectiveType]}
					{@const cap = tc?.capacity || 2}
					{@const roomKey = `${i}-${room.id}`}
					{@const isExpanded = expandedRoomKeys.has(roomKey)}
					
					<!-- Group jamaah by bookingId -->
					{@const bookingGroups = jamaahInRoom.reduce((acc, j) => {
						const bookingId = j.bookingId || 'NO-BOOKING';
						if (!acc[bookingId]) acc[bookingId] = {
							jamaah: [],
							requestedType: j.requestedRoomType || 'double',
							hasRoom: !!j.roomId
						};
						acc[bookingId].jamaah.push(j);
						return acc;
					}, {})}
					
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
								{#each Object.entries(bookingGroups) as [bookingId, bookingData], idx}
									{#if idx > 0}, {/if}
									{#if bookingData.hasRoom}✓{:else}✗{/if} {bookingId} - {bookingData.requestedType.toUpperCase()}
								{/each}
								· {room.id.replace('R0', '').replace('R', '')}
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
				{/if}
			{/each}
			
			<!-- Unassigned bookings (no room yet) -->
			{@const unassignedJamaah = (wave.jamaah || []).filter(j => !j.roomId || j.roomId === '')}
			{@const unassignedBookings = unassignedJamaah.reduce((acc, j) => {
				const bookingId = j.bookingId || 'NO-BOOKING';
				if (!acc[bookingId]) acc[bookingId] = {
					jamaah: [],
					requestedType: j.requestedRoomType || 'double'
				};
				acc[bookingId].jamaah.push(j);
				return acc;
			}, {})}
			
			{#if Object.keys(unassignedBookings).length > 0}
				<div class="unassigned-section">
					<div class="unassigned-header">Belum Dialokasikan</div>
					{#each Object.entries(unassignedBookings) as [bookingId, bookingData]}
						{@const bookingKey = `${i}-unassigned-${bookingId}`}
						{@const isExpanded = expandedRoomKeys.has(bookingKey)}
						<div class="jamaah-room-group">
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<div
								class="jamaah-room-header unassigned clickable"
								draggable="true"
								ondragstart={(e) => {
									e.dataTransfer.effectAllowed = 'move';
									e.dataTransfer.setData('text/plain', JSON.stringify({
										type: 'booking',
										bookingId,
										waveIndex: i,
										jamaahIds: bookingData.jamaah.map(j => j.id),
										requestedType: bookingData.requestedType,
										count: bookingData.jamaah.length
									}));
								}}
								onclick={() => toggleRoomGroupExpanded(bookingKey)}
								role="button"
								tabindex="0"
							>
								<span class="room-label">
									<span class="booking-grip"><GripVertical size={10} /></span>
									✗ {bookingId} - {bookingData.requestedType.toUpperCase()}
								</span>
								<div style="display: flex; align-items: center; gap: 6px;">
									<span class="room-occ">{bookingData.jamaah.length} pax</span>
									<ChevronDown
										size={12}
										style="transition: transform 0.2s; transform: {isExpanded
											? 'rotate(0deg)'
											: 'rotate(-90deg)'}"
									/>
								</div>
							</div>
							{#if isExpanded}
								{#each bookingData.jamaah as j}
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
		padding: 10px 12px;
		background: #fff;
		border-bottom: 1px solid #e2e8f0;
		border-top: 1px solid #e2e8f0;
		position: sticky;
		top: 0;
		z-index: 10;
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-weight: 600;
		font-size: 12px;
		color: #1e293b;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
	}
	.wave-group-header:first-child {
		border-top: none;
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
</style>
