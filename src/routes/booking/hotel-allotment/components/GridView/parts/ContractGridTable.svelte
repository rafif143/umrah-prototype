<script>
	import {
		getHijriDate,
		getCellTooltip,
		getCellLookup,
		getJamaahInRoom
	} from './contractHelpers.js';
	import { getRoomTypeForWave, isRoomManipulatedInWave } from './roomTypeHelpers.js';
	import { hijriMonths } from '$lib/utils/hijri.js';
	import { Repeat } from 'lucide-svelte';

	let {
		contract,
		allDates,
		orderedRooms,
		roomsByType,
		localTypeConfig,
		selectedWave,
		hoverRoomId = $bindable(),
		hoveredCell = $bindable(),
		dragSourceRoomId,
		dragSourceWaveId,
		dropTargetRoom,
		isDraggingRoom,
		isRoomSold,
		isRoomStaff,
		onRoomDragStart,
		onRoomDragEnd,
		onRoomDragOver,
		onRoomDragLeave,
		onRoomDrop,
		onCellDrop,
		onOpenRoomTypeMenu,
		cellLookup,
		onCellClick,
		// Tetris wave cell drag
		draggedWaveInfo = null,
		onWaveCellDragStart,
		onWaveCellDragEnd,
		onWaveCellDrop
	} = $props();

	let waveIdAtTop = $state(null);
	let observer = null;
	let scrollContainer = $state();
	let primaryCalendar = $state('gregorian'); // 'gregorian' | 'hijri'

	function toggleCalendar() {
		primaryCalendar = primaryCalendar === 'gregorian' ? 'hijri' : 'gregorian';
	}

	$effect(() => {
		if (scrollContainer) {
			observer = new IntersectionObserver(
				(entries) => {
					// We want the one that is closest to the top
					const visible = entries
						.filter((e) => e.isIntersecting)
						.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

					if (visible.length > 0) {
						const dateKey = visible[0].target.getAttribute('data-date');
						// Find any wave for this date (just pick the first one found in lookup for ANY room)
						const firstRoom = contract.rooms[0];
						if (firstRoom) {
							const info = cellLookup[`${firstRoom.id}_${dateKey}`];
							const waveId = info?.right?.wave?.id || info?.left?.wave?.id;
							if (waveId) waveIdAtTop = waveId;
						}
					}
				},
				{
					root: scrollContainer,
					rootMargin: '-50px 0px -90% 0px', // Focus on a thin strip at the top
					threshold: 0
				}
			);

			// Observe all rows
			const rows = scrollContainer.querySelectorAll('tr[data-date]');
			rows.forEach((r) => observer.observe(r));
		}

		return () => {
			if (observer) observer.disconnect();
		};
	});

	const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

	function isFriday(date) {
		return date.getDay() === 5;
	}

	function formatDateShort(date) {
		return `${date.getDate()}/${date.getMonth() + 1}`;
	}

	function getCellParts(roomId, date) {
		const dateKey = date.toISOString().split('T')[0];
		// ensure cellLookup is object
		return (cellLookup || {})[`${roomId}_${dateKey}`] || { left: null, right: null };
	}

	// Proxy tooltip helper
	function getTooltip(roomId, waveIndex) {
		return getCellTooltip(contract, roomId, waveIndex);
	}

	// Resolve wave color — can be string hex, object {bg, text}, or undefined
	function getWaveBg(wave, fallback) {
		if (!wave?.color) return fallback;
		if (typeof wave.color === 'string') return wave.color;
		if (typeof wave.color === 'object' && wave.color.bg) return wave.color.bg;
		return fallback;
	}

	// Extract color string from room color (could be string or object)
	function extractColor(color) {
		if (!color) return null;
		if (typeof color === 'string') return color;
		if (typeof color === 'object' && color.bg) return color.bg;
		return null;
	}

	// Helper for header context
	function getContextWave(room) {
		// 1. Priority: Wave being hovered (precise)
		const hoverInfo =
			hoveredCell && hoveredCell.roomId === room.id
				? cellLookup[`${room.id}_${hoveredCell.dateKey}`]
				: null;
		const hoveredWave = hoverInfo?.right?.wave || hoverInfo?.left?.wave;
		if (hoveredWave) return hoveredWave;

		// 2. Priority: Wave at the top of the scroll
		if (waveIdAtTop) {
			const wave = (contract.waves || []).find((w) => w.id === waveIdAtTop);
			if (wave) return wave;
		}

		// 3. Fallback: Selected wave from sidebar
		return selectedWave;
	}
</script>

<div class="grid-scroll-container" bind:this={scrollContainer}>
	<table class="allotment-grid">
		<thead>
			<tr class="header-type-row">
				<th class="corner-cell sticky-col" rowspan="2">
					<button
						class="corner-swap-btn"
						onclick={toggleCalendar}
						title="Klik untuk tukar format tanggal"
					>
						<div class="corner-content" class:hijri-active={primaryCalendar === 'hijri'}>
							<span class="corner-date">TANGGAL</span>
							<span class="corner-hijri">HIJRIAH</span>
						</div>
						<div class="swap-icon-container">
							<Repeat size={10} />
						</div>
					</button>
				</th>
				<th class="day-header sticky-col-2" rowspan="2"><span>HARI</span></th>
				{#each roomsByType as group}
					{@const tc = localTypeConfig[group.type] || {
						label: group.type.toUpperCase(),
						headerBg: '#607d8b'
					}}
					<th
						class="type-group-header"
						colspan={group.rooms.length}
						style="background: {tc.headerBg};">{tc.label}</th
					>
				{/each}
			</tr>
			<tr class="header-room-row">
				{#each orderedRooms as room}
					{@const contextWave = getContextWave(room)}
					{@const effectiveType = getRoomTypeForWave(room, contextWave)}
					{@const tc = localTypeConfig[effectiveType] || { bg: '#eceff1', color: '#607d8b' }}
					{@const isManipulated = isRoomManipulatedInWave(room, contextWave)}
					{@const isDragOver = dropTargetRoom === room.id}
					{@const isSold = (contextWave?.soldRooms || []).includes(room.id)}
					{@const isStaff = (contextWave?.staffRooms || []).includes(room.id)}
					{@const currentWaveIndex = (contract.waves || []).findIndex(
						(w) => w.id === contextWave?.id
					)}
					{@const occupants = getJamaahInRoom(contract, currentWaveIndex, room.id)}
					{@const capacity = localTypeConfig[effectiveType]?.capacity || 2}
					{@const isFull = occupants.length === capacity}
					{@const isOverload = occupants.length > capacity}
					<th
						class="room-number-header"
						class:room-selected={true}
						class:room-manipulated={isManipulated}
						class:room-sold={isSold}
						class:room-staff={isStaff}
						class:drag-over={isDragOver}
						style="background: {tc.headerBg}; color: #fff;"
						oncontextmenu={(e) => onOpenRoomTypeMenu(e, room.id)}
						ondragover={(e) => onRoomDragOver(e, room.id)}
						ondragleave={onRoomDragLeave}
						ondrop={(e) => onRoomDrop(e, room)}
						onmouseenter={() => (hoverRoomId = room.id)}
						onmouseleave={() => (hoverRoomId = null)}
					>
						<div class="room-header-content">
							<span class="room-num">{room.id.replace('R0', '').replace('R', '')}</span>

							<!-- Occupancy Indicator -->
							<span
								class="room-occupancy"
								class:room-full={isFull}
								class:room-overload={isOverload}
							>
								{occupants.length}/{capacity}
								<div class="occ-tooltip">
									{isOverload
										? '🚨 Overload'
										: isFull
											? '✅ Kamar Penuh'
											: `✨ ${capacity - occupants.length} tersedia`}
								</div>
							</span>

							{#if isSold}
								<span class="sold-badge" title="Kamar dijual">💰</span>
							{/if}
							{#if isStaff}
								<span class="staff-badge" title="Kamar staff">👨‍✈️</span>
							{/if}
							{#if isManipulated}
								{@const originalType = room.originalType || room.type}
								<span
									class="manip-badge"
									title="Tipe diubah: {originalType.toUpperCase()} → {effectiveType.toUpperCase()} (Wave: {contextWave?.name ||
										'N/A'})"
								>
									<span class="manip-icon">⚙</span>
									<span class="manip-label">{effectiveType.toUpperCase()}</span>
								</span>
							{/if}
						</div>
					</th>
				{/each}
			</tr>
		</thead>

		<tbody>
			{#each allDates as date, dateIndex}
				{@const hijri = getHijriDate(date)}
				{@const dayName = dayNames[date.getDay()]}
				{@const friday = isFriday(date)}
				{@const dateKey = date.toISOString().split('T')[0]}
				<tr class="date-row" class:friday-row={friday} data-date={dateKey}>
					<td class="date-cell sticky-col" class:friday-date={friday}>
						<div class="date-inner" class:hijri-primary={primaryCalendar === 'hijri'}>
							{#if primaryCalendar === 'gregorian'}
								<span class="primary-date">{formatDateShort(date)}</span>
								{#if hijri}
									<span class="secondary-date">
										{hijri.day}
										{hijriMonths[hijri.month].substring(0, 3)}
									</span>
								{/if}
							{:else}
								{#if hijri}
									<span class="primary-date">
										{hijri.day}
										{hijriMonths[hijri.month].substring(0, 3)}
									</span>
								{/if}
								<span class="secondary-date">{formatDateShort(date)}</span>
							{/if}
						</div>
					</td>
					<td class="day-name-cell sticky-col-2" class:friday-day={friday}>{dayName}</td>

					{#each orderedRooms as room}
						{@const parts = getCellParts(room.id, date)}
						{@const effectiveTypeForHeader = getRoomTypeForWave(room, selectedWave)}
						{@const leftWaveType = parts.left ? getRoomTypeForWave(room, parts.left.wave) : null}
						{@const leftWaveColor = getWaveBg(parts.left?.wave)}
						{@const leftTypeColor = leftWaveType
							? localTypeConfig[leftWaveType]?.headerBg || '#607d8b'
							: null}
						{@const leftColor = leftWaveColor || leftTypeColor}
						{@const rightWaveType = parts.right ? getRoomTypeForWave(room, parts.right.wave) : null}
						{@const rightWaveColor = getWaveBg(parts.right?.wave)}
						{@const rightTypeColor = rightWaveType
							? localTypeConfig[rightWaveType]?.headerBg || '#607d8b'
							: null}
						{@const rightColor = rightWaveColor || rightTypeColor}
						{@const isColHover = hoverRoomId === room.id}
						{@const isSold = isRoomSold(room.id)}
						{@const isStaff = isRoomStaff(room.id)}
						{@const isDragSrc =
							dragSourceRoomId === room.id &&
							(dragSourceWaveId
								? parts.left?.wave.id === dragSourceWaveId ||
									parts.right?.wave.id === dragSourceWaveId
								: true)}
						{@const isTransition =
							parts.left && parts.right && parts.left.waveIndex !== parts.right.waveIndex}
						{@const leftTooltip = parts.left ? getTooltip(room.id, parts.left.waveIndex) : ''}
						{@const rightTooltip = parts.right ? getTooltip(room.id, parts.right.waveIndex) : ''}
						{@const isInWaveDateRange =
							draggedWaveInfo?.waveStart && draggedWaveInfo?.waveEnd
								? dateKey >= draggedWaveInfo.waveStart && dateKey <= draggedWaveInfo.waveEnd
								: false}
						{@const isWaveDragSrc =
							draggedWaveInfo &&
							isInWaveDateRange &&
							draggedWaveInfo.fromRoomId === room.id &&
							(parts.left?.wave?.id === draggedWaveInfo.waveId ||
								parts.right?.wave?.id === draggedWaveInfo.waveId)}
						{@const isWaveDropTarget =
							draggedWaveInfo && isInWaveDateRange && draggedWaveInfo.fromRoomId !== room.id}
						<td
							class:grid-cell={true}
							class:col-highlight={isColHover}
							class:cell-sold={isSold}
							class:cell-staff={isStaff}
							class:drag-source={isDragSrc}
							class:wave-drag-source={isWaveDragSrc}
							class:wave-drop-target={isWaveDragSrc !== undefined &&
								isWaveDropTarget &&
								draggedWaveInfo}
							onmouseenter={() => (hoveredCell = { roomId: room.id, dateKey })}
							onmouseleave={() => (hoveredCell = null)}
							oncontextmenu={(e) => onOpenRoomTypeMenu(e, room.id)}
							ondragover={(e) => onRoomDragOver(e, room.id)}
							ondragleave={onRoomDragLeave}
							ondrop={(e) => {
								if (draggedWaveInfo) {
									onWaveCellDrop(e, room);
								} else {
									onCellDrop(e, room.id);
								}
							}}
						>
							<div class="cell-split">
								<div
									class="cell-half cell-left"
									class:co-marker={parts.left?.type === 'checkout'}
									class:occupied={parts.left?.type === 'occupied'}
									class:empty={!parts.left}
									style={parts.left ? `background: ${leftColor}; color: #fff;` : ''}
									title={parts.left?.type === 'checkout'
										? `CO: ${parts.left.wave.name}\n${leftTooltip}`
										: leftTooltip}
									draggable={parts.left ? true : false}
									ondragstart={(e) => parts.left && onWaveCellDragStart(e, room, parts.left.wave)}
									ondragend={onWaveCellDragEnd}
									onclick={() =>
										parts.left &&
										onCellClick &&
										onCellClick({ roomId: room.id, date, wave: parts.left.wave })}
									role="button"
									tabindex="0"
									onkeydown={(e) =>
										e.key === 'Enter' &&
										parts.left &&
										onCellClick &&
										onCellClick({ roomId: room.id, date, wave: parts.left.wave })}
								>
									{#if parts.left?.type === 'checkout'}<span class="half-label">◀</span>{/if}
								</div>
								<div
									class="cell-half cell-right"
									class:ci-marker={parts.right?.type === 'checkin'}
									class:occupied={parts.right?.type === 'occupied'}
									class:empty={!parts.right}
									style={parts.right ? `background: ${rightColor}; color: #fff;` : ''}
									title={parts.right?.type === 'checkin'
										? `CI: ${parts.right.wave.name}\n${rightTooltip}`
										: rightTooltip}
									draggable={parts.right ? true : false}
									ondragstart={(e) => parts.right && onWaveCellDragStart(e, room, parts.right.wave)}
									ondragend={onWaveCellDragEnd}
									onclick={() =>
										parts.right &&
										onCellClick &&
										onCellClick({ roomId: room.id, date, wave: parts.right.wave })}
									role="button"
									tabindex="0"
									onkeydown={(e) =>
										e.key === 'Enter' &&
										parts.right &&
										onCellClick &&
										onCellClick({ roomId: room.id, date, wave: parts.right.wave })}
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
		<tfoot>
			<tr class="scroll-spacer">
				<td colspan={orderedRooms.length + 2}></td>
			</tr>
		</tfoot>
	</table>
</div>

<style>
	/* Grid Container */
	.grid-scroll-container {
		overflow: auto;
		max-height: calc(100vh - 380px);
		flex: 1;
		position: relative;
	}

	:global(.fullscreen) .grid-scroll-container {
		max-height: 100%;
		height: 100%;
	}

	.allotment-grid {
		border-collapse: separate;
		border-spacing: 0;
		width: max-content;
		min-width: 100%;
	}

	.sticky-col {
		position: sticky;
		left: 0;
		z-index: 20;
	}
	.sticky-col-2 {
		position: sticky;
		left: 82px;
		z-index: 20;
	}

	/* Header */
	.header-type-row th {
		position: sticky;
		top: 0;
		z-index: 30;
	}
	.corner-cell {
		min-width: 82px;
		width: 82px;
		background: #0f172a !important;
		color: rgba(255, 255, 255, 0.85);
		z-index: 50 !important;
		border-right: 1px solid rgba(255, 255, 255, 0.08);
	}
	/* Corner Cell with Swap */
	.corner-cell {
		padding: 0 !important;
	}
	.corner-swap-btn {
		width: 100%;
		height: 100%;
		background: none;
		border: none;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		position: relative;
		padding: 4px;
		color: white;
		transition: background 0.2s;
	}
	.corner-swap-btn:hover {
		background: rgba(255, 255, 255, 0.05);
	}
	.corner-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}
	.corner-content.hijri-active {
		transform: translateY(2px);
	}
	.corner-date {
		font-size: 11px;
		font-weight: 800;
		letter-spacing: 0.05em;
		opacity: 0.9;
		transition: all 0.2s;
	}
	.corner-hijri {
		font-size: 8px;
		font-weight: 600;
		letter-spacing: 0.05em;
		opacity: 0.4;
		transition: all 0.2s;
	}
	.hijri-active .corner-date {
		font-size: 8px;
		opacity: 0.4;
	}
	.hijri-active .corner-hijri {
		font-size: 11px;
		font-weight: 800;
		opacity: 0.9;
	}
	.swap-icon-container {
		position: absolute;
		right: 4px;
		top: 50%;
		transform: translateY(-50%);
		opacity: 0.3;
		transition:
			opacity 0.2s,
			transform 0.3s;
	}
	.corner-swap-btn:hover .swap-icon-container {
		opacity: 0.8;
		transform: translateY(-50%) rotate(180deg);
	}

	.date-inner {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1px;
	}
	.primary-date {
		font-size: 13px;
		font-weight: 800;
		color: #1e293b;
		line-height: 1.1;
	}
	.secondary-date {
		font-size: 9px;
		font-weight: 600;
		color: #94a3b8;
	}
	.hijri-primary .primary-date {
		color: #475569;
	}
	.hijri-primary .secondary-date {
		color: #cbd5e1;
	}
	.day-header {
		min-width: 45px;
		width: 45px;
		background: #0f172a !important;
		color: rgba(255, 255, 255, 0.9);
		z-index: 50 !important;
		border-right: 2px solid rgba(255, 255, 255, 0.1);
		font-size: 11px;
		font-weight: 800;
		letter-spacing: 0.05em;
		text-align: center;
	}
	.type-group-header {
		color: white;
		font-size: 10px;
		font-weight: 800;
		letter-spacing: 0.12em;
		padding: 7px 10px;
		text-align: center;
		border-right: 2px solid rgba(255, 255, 255, 0.25);
		white-space: nowrap;
	}

	.room-number-header {
		position: sticky;
		top: 29px;
		z-index: 25;
		min-width: 50px;
		width: 50px;
		padding: 4px 2px;
		text-align: center;
		vertical-align: top;
		border-right: 1px solid rgba(0, 0, 0, 0.06);
		border-bottom: 2px solid rgba(0, 0, 0, 0.08);
		cursor: pointer;
		transition: all 0.15s;
		user-select: none;
	}
	.room-number-header:hover {
		filter: brightness(0.9);
	}
	.room-number-header.room-selected {
		box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.4);
	}
	.room-number-header.room-manipulated {
		box-shadow: inset 0 0 0 2px #fbbf24 !important;
	}
	.room-number-header.room-manipulated::after {
		content: '';
		position: absolute;
		top: 0;
		right: 0;
		width: 0;
		height: 0;
		border-style: solid;
		border-width: 0 10px 10px 0;
		border-color: transparent #fbbf24 transparent transparent;
	}
	.room-number-header.room-sold {
		box-shadow: inset 0 0 0 2px #16a34a !important;
	}
	.room-number-header.room-staff {
		box-shadow: inset 0 0 0 2px #4f46e5 !important;
	}
	.room-number-header.drag-over {
		outline: 2px dashed #fbbf24 !important;
		outline-offset: -2px;
		background: #fef3c7 !important;
		color: #92400e !important;
	}
	.grid-cell.drag-source {
		opacity: 0.5;
		outline: 2px dashed #f59e0b;
		outline-offset: -2px;
	}
	.room-header-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		gap: 2px;
	}
	.room-num {
		font-size: 10px;
		font-weight: 800;
		font-variant-numeric: tabular-nums;
		line-height: 1;
	}
	.room-occupancy {
		font-size: 10px;
		font-weight: 800;
		font-variant-numeric: tabular-nums;
		letter-spacing: 0.05em;
		padding: 2px 4px;
		background: rgba(0, 0, 0, 0.1);
		border-radius: 4px;
		color: white;
		margin-top: 2px;
		box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
	}
	.room-full {
		background: rgba(0, 0, 0, 0.3);
		color: #fff;
		box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.2);
	}
	.room-overload {
		background: #ef4444;
		color: #fff;
		box-shadow: 0 0 6px rgba(239, 68, 68, 0.5);
	}

	/* Custom Instant Tooltip */
	.room-occupancy {
		position: relative;
	}
	.occ-tooltip {
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%) translateY(4px) scale(0.9);
		background: #1e293b;
		color: white;
		padding: 5px 10px;
		border-radius: 6px;
		font-size: 10px;
		font-weight: 700;
		white-space: nowrap;
		opacity: 0;
		visibility: hidden;
		transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
		pointer-events: none;
		z-index: 1000;
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(255, 255, 255, 0.1);
	}
	/* Triangle arrow pointing UP */
	.occ-tooltip::after {
		content: '';
		position: absolute;
		bottom: 100%;
		left: 50%;
		transform: translateX(-50%);
		border-width: 5px;
		border-style: solid;
		border-color: transparent transparent #1e293b transparent;
	}
	.room-number-header:hover .occ-tooltip {
		opacity: 1;
		visibility: visible;
		transform: translateX(-50%) translateY(10px) scale(1);
	}

	.sold-badge {
		font-size: 10px;
		animation: pulse-badge 2s ease-in-out infinite;
	}
	.staff-badge {
		font-size: 10px;
		animation: pulse-badge 2s ease-in-out infinite;
		animation-delay: 0.5s;
	}
	@keyframes pulse-badge {
		0%,
		100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.7;
			transform: scale(1.1);
		}
	}

	.manip-badge {
		display: flex;
		align-items: center;
		gap: 3px;
		background: rgba(251, 191, 36, 0.9);
		border: 1px solid rgba(251, 191, 36, 1);
		border-radius: 4px;
		padding: 2px 5px;
		font-size: 8px;
		font-weight: 800;
		color: #78350f;
		backdrop-filter: blur(4px);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
	}
	.manip-icon {
		font-size: 8px;
		line-height: 1;
	}
	.manip-label {
		font-size: 8px;
		font-weight: 900;
		letter-spacing: 0.03em;
	}

	/* Date Rows */
	.date-row {
		transition: background 0.08s;
	}
	.date-row:hover {
		background: rgba(99, 102, 241, 0.03);
	}
	.friday-row {
		background: rgba(34, 197, 94, 0.04);
	}
	.date-cell {
		background: white;
		border-right: 1px solid #e2e8f0;
		border-bottom: 1px solid #f1f5f9;
		padding: 0;
	}
	.date-cell.friday-date {
		background: #f0fdf4;
	}
	.date-inner {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1px;
		padding: 2px 4px;
	}
	.greg-date {
		font-size: 10px;
		font-weight: 700;
		color: #1e293b;
		font-variant-numeric: tabular-nums;
	}
	.hijri-short {
		font-size: 7px;
		color: #94a3b8;
		font-weight: 500;
		white-space: nowrap;
	}
	.day-name-cell {
		background: white;
		border-right: 2px solid #e2e8f0;
		border-bottom: 1px solid #f1f5f9;
		font-size: 7px;
		font-weight: 700;
		text-align: center;
		color: #94a3b8;
		letter-spacing: 0.04em;
	}
	.day-name-cell.friday-day {
		color: #16a34a;
		background: #f0fdf4;
		font-weight: 800;
	}

	/* Grid Cells */
	.grid-cell {
		min-width: 50px;
		width: 50px;
		height: 22px;
		border-right: 1px solid #e9ecef;
		border-bottom: 1px solid #e9ecef;
		padding: 0;
		position: relative;
		cursor: context-menu;
	}
	.grid-cell:hover {
		outline: 2px solid #818cf8;
		outline-offset: -2px;
		z-index: 5;
	}
	.grid-cell.col-highlight {
		background: rgba(99, 102, 241, 0.04);
	}
	.grid-cell.cell-sold {
		background: repeating-linear-gradient(
			45deg,
			rgba(22, 163, 74, 0.08),
			rgba(22, 163, 74, 0.08) 8px,
			rgba(22, 163, 74, 0.15) 8px,
			rgba(22, 163, 74, 0.15) 16px
		) !important;
		border-right: 2px solid #16a34a !important;
		border-bottom: 2px solid #16a34a !important;
		position: relative;
	}
	.grid-cell.cell-sold::before {
		content: '💰';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		font-size: 14px;
		opacity: 0.25;
		pointer-events: none;
		z-index: 1;
	}
	.grid-cell.cell-staff {
		background: repeating-linear-gradient(
			45deg,
			rgba(79, 70, 229, 0.08),
			rgba(79, 70, 229, 0.08) 8px,
			rgba(79, 70, 229, 0.15) 8px,
			rgba(79, 70, 229, 0.15) 16px
		) !important;
		border-right: 2px solid #4f46e5 !important;
		border-bottom: 2px solid #4f46e5 !important;
		position: relative;
	}
	.grid-cell.cell-staff::before {
		content: '👨‍✈️';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		font-size: 12px;
		opacity: 0.25;
		pointer-events: none;
		z-index: 1;
	}
	.grid-cell.cell-sold .cell-split,
	.grid-cell.cell-staff .cell-split {
		position: relative;
		z-index: 2;
	}
	.cell-split {
		display: flex;
		width: 100%;
		height: 100%;
	}
	.cell-half {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 0;
		transition: background 0.1s;
	}
	.cell-half.empty {
		background: transparent;
	}
	.cell-left {
		border-right: 1px solid rgba(255, 255, 255, 0.15);
	}
	.cell-left.empty {
		border-right: 1px dotted #e9ecef;
	}
	.cell-half.co-marker {
		position: relative;
		opacity: 0.75;
	}
	.half-label {
		font-size: 8px;
		font-weight: 900;
		line-height: 1;
		opacity: 0.9;
	}
	.transition-divider {
		position: absolute;
		top: 0;
		left: 50%;
		width: 2px;
		height: 100%;
		background: #fbbf24;
		z-index: 2;
		box-shadow: 0 0 4px rgba(251, 191, 36, 0.6);
	}

	/* Tetris wave drag feedback */
	.grid-cell.wave-drag-source {
		opacity: 0.45;
		outline: 2px dashed #818cf8;
		outline-offset: -2px;
	}
	.grid-cell.wave-drop-target {
		outline: 2px dashed #22c55e;
		outline-offset: -2px;
		background: rgba(34, 197, 94, 0.06);
	}
	.cell-half {
		cursor: grab;
	}
	.cell-half:active {
		cursor: grabbing;
	}
	.cell-half.empty {
		cursor: default;
	}

	/* Extra scroll space at the bottom */
	.scroll-spacer td {
		height: 500px;
		border: none !important;
		background: transparent !important;
	}
</style>
