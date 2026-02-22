<script>
	import { getJamaahInRoom } from '../GridView/parts/contractHelpers.js';

	let {
		roomTypeMenu,
		contract,
		localTypeConfig,
		roomCapacity,
		selectedWave,
		selectedCells,
		selectedWaveIndex,
		occupiedRoomIds,
		onClose,
		onChangeRoomType,
		onOpenRoomModal,
		onToggleSold,
		onToggleStaff,
		onRemoveSold,
		onRemoveStaff,
		onClearSelection,
		onOpenQuickDetail,
		onEmptyRoom
	} = $props();
</script>

{#if roomTypeMenu}
	{@const menuWaveIndex = roomTypeMenu.waveId
		? (contract.waves || []).findIndex((w) => w.id === roomTypeMenu.waveId)
		: selectedWaveIndex}
	{@const validWaveIndex = menuWaveIndex !== -1 ? menuWaveIndex : selectedWaveIndex}
	{@const jamaahInRoom =
		validWaveIndex !== -1 ? getJamaahInRoom(contract, validWaveIndex, roomTypeMenu.roomId) : []}

	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div class="fixed inset-0 z-[10000] h-screen w-screen" onclick={onClose}>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div
			class="fixed z-[10001] min-w-[180px] rounded-lg border border-slate-200 bg-white p-1 shadow-[0_4px_15px_rgba(0,0,0,0.1)]"
			style="left: {roomTypeMenu.x}px; top: {roomTypeMenu.y}px;"
			onclick={(e) => e.stopPropagation()}
		>
			<div class="mb-1 border-b border-slate-100 px-2 py-1.5 text-[10px] font-bold text-slate-400">
				Set Tipe Kamar {roomTypeMenu.roomId}
			</div>

			{#each ['unset', 'double', 'triple', 'quad', 'quint'] as t}
				{@const currentRoom = contract.rooms.find((r) => r.id === roomTypeMenu.roomId)}
				{@const currentType = currentRoom?.type || 'unset'}
				<button
					class="flex w-full cursor-pointer items-center gap-2 rounded border-none bg-transparent px-2 py-1.5 text-left text-[11px] text-slate-700 hover:bg-slate-100 {currentType ===
					t
						? 'bg-sky-50 font-semibold text-sky-600'
						: ''}"
					onclick={() => onChangeRoomType(roomTypeMenu.roomId, t, roomTypeMenu.waveId)}
				>
					<span class="h-2 w-2 rounded-full" style="background: {localTypeConfig[t].headerBg};"
					></span>
					{localTypeConfig[t].label} ({roomCapacity[t] === '-' ? '-' : roomCapacity[t]} org)
					{#if currentType === t}<span class="ml-auto">✓</span>{/if}
				</button>
			{/each}

			{#if selectedWave}
				{#if selectedCells.size > 0}
					{@const selectedArray = Array.from(selectedCells)}
					{@const someSold = selectedArray.some((cellKey) => {
						const soldCells = selectedWave.soldCells || {};
						return soldCells[cellKey] !== undefined;
					})}
					{@const someStaff = selectedArray.some((cellKey) => {
						const staffCells = selectedWave.staffCells || {};
						return staffCells[cellKey] !== undefined;
					})}
					{@const allEmpty = selectedArray.every((cellKey) => {
						const soldCells = selectedWave.soldCells || {};
						const staffCells = selectedWave.staffCells || {};
						return soldCells[cellKey] === undefined && staffCells[cellKey] === undefined;
					})}

					<!-- Only show mark options if all selected cells are empty -->
					{#if allEmpty}
						<div class="my-1 h-px bg-slate-100"></div>
						<button
							class="flex w-full cursor-pointer items-center gap-2 rounded border-none bg-transparent px-2 py-1.5 text-left text-[11px] text-slate-700 hover:bg-slate-100"
							onclick={() => {
								const room = contract.rooms.find((r) => r.id === roomTypeMenu.roomId);
								if (room) onOpenRoomModal(room, occupiedRoomIds.has(room.id));
								onClose();
							}}
						>
							🔍 Detail Kamar
						</button>
						<button
							class="flex w-full cursor-pointer items-center gap-2 rounded border-none bg-transparent px-2 py-1.5 text-left text-[11px] text-slate-700 hover:bg-slate-100"
							onclick={() => {
								onToggleSold();
								onClose();
							}}
						>
							💰 Tandai Sebagai Dijual ({selectedCells.size} cell)
						</button>
						<button
							class="flex w-full cursor-pointer items-center gap-2 rounded border-none bg-transparent px-2 py-1.5 text-left text-[11px] text-slate-700 hover:bg-slate-100"
							onclick={() => {
								onToggleStaff();
								onClose();
							}}
						>
							👨‍✈️ Tandai Sebagai Staff ({selectedCells.size} cell)
						</button>
					{/if}

					<!-- Only show remove options if some selected cells have sold/staff -->
					{#if someSold}
						<div class="my-1 h-px bg-slate-100"></div>
						<button
							class="flex w-full cursor-pointer items-center gap-2 rounded border-none bg-transparent px-2 py-1.5 text-left text-[11px] text-slate-700 hover:bg-slate-100"
							onclick={() => {
								onOpenQuickDetail();
								onClose();
							}}
						>
							👁️ Lihat Detail Dijual
						</button>
						<button
							class="flex w-full cursor-pointer items-center gap-2 rounded border-none bg-transparent px-2 py-1.5 text-left text-[11px] text-red-600 hover:bg-red-50"
							onclick={() => {
								onRemoveSold();
								onClose();
							}}
						>
							✕ Hapus Status Dijual ({selectedArray.filter((k) => (selectedWave.soldCells || {})[k])
								.length} cell)
						</button>
					{/if}
					{#if someStaff}
						<div class="my-1 h-px bg-slate-100"></div>
						<button
							class="flex w-full cursor-pointer items-center gap-2 rounded border-none bg-transparent px-2 py-1.5 text-left text-[11px] text-slate-700 hover:bg-slate-100"
							onclick={() => {
								onOpenQuickDetail();
								onClose();
							}}
						>
							👁️ Lihat Detail Staff
						</button>
						<button
							class="flex w-full cursor-pointer items-center gap-2 rounded border-none bg-transparent px-2 py-1.5 text-left text-[11px] text-red-600 hover:bg-red-50"
							onclick={() => {
								onRemoveStaff();
								onClose();
							}}
						>
							✕ Hapus Status Staff ({selectedArray.filter((k) => (selectedWave.staffCells || {})[k])
								.length} cell)
						</button>
					{/if}

					<div class="my-1 h-px bg-slate-100"></div>
					<button
						class="flex w-full cursor-pointer items-center gap-2 rounded border-none bg-transparent px-2 py-1.5 text-left text-[11px] text-slate-700 hover:bg-slate-100"
						onclick={() => {
							onClearSelection();
							onClose();
						}}
					>
						✕ Clear Selection
					</button>
				{:else}
					<!-- Show option to remove sold/staff from entire room if no selection -->
					{@const roomSoldCells = Object.keys(selectedWave.soldCells || {}).filter((key) =>
						key.startsWith(roomTypeMenu.roomId + '_')
					)}
					{@const roomStaffCells = Object.keys(selectedWave.staffCells || {}).filter((key) =>
						key.startsWith(roomTypeMenu.roomId + '_')
					)}

					{#if roomSoldCells.length > 0}
						<button
							class="flex w-full cursor-pointer items-center gap-2 rounded border-none bg-transparent px-2 py-1.5 text-left text-[11px] text-red-600 hover:bg-red-50"
							onclick={() => {
								// Trigger the cleanup via parent handler
								onRemoveSold(roomSoldCells);
								onClose();
							}}
						>
							✕ Hapus Semua Status Dijual di Kamar Ini
						</button>
					{/if}

					{#if roomStaffCells.length > 0}
						<button
							class="flex w-full cursor-pointer items-center gap-2 rounded border-none bg-transparent px-2 py-1.5 text-left text-[11px] text-red-600 hover:bg-red-50"
							onclick={() => {
								// Trigger the cleanup via parent handler
								onRemoveStaff(roomStaffCells);
								onClose();
							}}
						>
							✕ Hapus Semua Status Staff di Kamar Ini
						</button>
					{/if}
				{/if}
			{/if}

			{#if jamaahInRoom.length > 0}
				<div class="my-1 h-px bg-slate-100"></div>
				<button
					class="flex w-full cursor-pointer items-center gap-2 rounded border-none bg-transparent px-2 py-1.5 text-left text-[11px] text-red-600 hover:bg-red-50"
					onclick={() => {
						onEmptyRoom(roomTypeMenu.roomId, roomTypeMenu.waveId);
						onClose();
					}}
				>
					🗑️ Kosongkan Kamar
				</button>
			{/if}
		</div>
	</div>
{/if}
