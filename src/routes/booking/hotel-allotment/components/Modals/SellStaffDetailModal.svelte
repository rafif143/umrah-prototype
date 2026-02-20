<script>
	import { ChevronDown, X, DollarSign, Calendar, Bed, Plus, Trash2 } from 'lucide-svelte';
	import { slide } from 'svelte/transition';

	let { show = false, contract, onClose, onUpdateSoldStatus, onUpdatePrice, onAddStaff, onRemoveStaff } = $props();

	let expandedWaveId = $state(null);
	let activeTab = $state('sold'); // 'sold' or 'staff'
	let showAddStaffModal = $state(false);
	let addingStaffForRoom = $state(null);
	let addingStaffForWave = $state(null);
	let newStaffName = $state('');

	function toggleWave(waveId) {
		expandedWaveId = expandedWaveId === waveId ? null : waveId;
	}

	// Group sold/staff cells by wave and room
	function getSoldStaffData() {
		if (!contract?.waves) return [];

		return contract.waves.map((wave) => {
			const soldCells = wave.soldCells || {};
			const staffCells = wave.staffCells || {};

			// Group by room for sold
			const soldRoomGroups = {};
			Object.entries(soldCells).forEach(([cellKey, data]) => {
				const [roomId, dateKey] = cellKey.split('_');
				if (!soldRoomGroups[roomId]) {
					soldRoomGroups[roomId] = { roomId, type: 'sold', periods: [] };
				}
			});

			// Group by room for staff
			const staffRoomGroups = {};
			Object.entries(staffCells).forEach(([cellKey, data]) => {
				const [roomId, dateKey] = cellKey.split('_');
				if (!staffRoomGroups[roomId]) {
					staffRoomGroups[roomId] = { roomId, type: 'staff', periods: [] };
				}
			});

			// Find date ranges for sold rooms
			Object.keys(soldRoomGroups).forEach((roomId) => {
				const dates = Object.keys(soldCells)
					.filter((key) => key.startsWith(roomId + '_'))
					.map((key) => key.split('_')[1])
					.sort();

				const periods = [];
				let currentPeriod = null;

				dates.forEach((date, idx) => {
					const cellKey = `${roomId}_${date}`;
					const cellData = soldCells[cellKey];

					if (!currentPeriod) {
						currentPeriod = {
							checkIn: date,
							checkOut: date,
							status: cellData.status || 'available',
							price: cellData.price || 0
						};
					} else {
						const prevDate = new Date(currentPeriod.checkOut);
						const currDate = new Date(date);
						const diffDays = (currDate - prevDate) / (1000 * 60 * 60 * 24);

						if (diffDays === 1) {
							currentPeriod.checkOut = date;
						} else {
							periods.push(currentPeriod);
							currentPeriod = {
								checkIn: date,
								checkOut: date,
								status: cellData.status || 'available',
								price: cellData.price || 0
							};
						}
					}

					if (idx === dates.length - 1 && currentPeriod) {
						periods.push(currentPeriod);
					}
				});

				soldRoomGroups[roomId].periods = periods;
			});

			// Find date ranges for staff rooms
			Object.keys(staffRoomGroups).forEach((roomId) => {
				const dates = Object.keys(staffCells)
					.filter((key) => key.startsWith(roomId + '_'))
					.map((key) => key.split('_')[1])
					.sort();

				const periods = [];
				let currentPeriod = null;

				dates.forEach((date, idx) => {
					const cellKey = `${roomId}_${date}`;
					const cellData = staffCells[cellKey];

					if (!currentPeriod) {
						currentPeriod = {
							checkIn: date,
							checkOut: date,
							status: cellData.status || 'available',
							price: cellData.price || 0
						};
					} else {
						const prevDate = new Date(currentPeriod.checkOut);
						const currDate = new Date(date);
						const diffDays = (currDate - prevDate) / (1000 * 60 * 60 * 24);

						if (diffDays === 1) {
							currentPeriod.checkOut = date;
						} else {
							periods.push(currentPeriod);
							currentPeriod = {
								checkIn: date,
								checkOut: date,
								status: cellData.status || 'available',
								price: cellData.price || 0
							};
						}
					}

					if (idx === dates.length - 1 && currentPeriod) {
						periods.push(currentPeriod);
					}
				});

				staffRoomGroups[roomId].periods = periods;
			});

			return {
				wave,
				soldRooms: Object.values(soldRoomGroups).filter((r) => r.periods.length > 0),
				staffRooms: Object.values(staffRoomGroups).filter((r) => r.periods.length > 0)
			};
		}).filter((w) => w.soldRooms.length > 0 || w.staffRooms.length > 0);
	}

	let soldStaffData = $derived(getSoldStaffData());

	function formatDate(dateStr) {
		const date = new Date(dateStr);
		return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
	}

	function calculateNights(checkIn, checkOut) {
		const start = new Date(checkIn);
		const end = new Date(checkOut);
		const diffTime = Math.abs(end - start);
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays + 1; // Include both check-in and check-out days
	}

	function handleStatusChange(waveId, roomId, periodIndex, newStatus) {
		if (onUpdateSoldStatus) {
			onUpdateSoldStatus(waveId, roomId, periodIndex, newStatus);
		}
	}

	function handlePriceChange(waveId, roomId, periodIndex, newPrice) {
		if (onUpdatePrice) {
			onUpdatePrice(waveId, roomId, periodIndex, parseFloat(newPrice) || 0);
		}
	}

	function openAddStaffModal(waveId, roomId) {
		addingStaffForWave = waveId;
		addingStaffForRoom = roomId;
		newStaffName = '';
		showAddStaffModal = true;
	}

	function handleAddStaff() {
		if (!newStaffName.trim()) return;
		if (onAddStaff) {
			onAddStaff(addingStaffForWave, addingStaffForRoom, newStaffName.trim());
		}
		showAddStaffModal = false;
		newStaffName = '';
		addingStaffForRoom = null;
		addingStaffForWave = null;
	}

	function handleRemoveStaff(waveId, roomId, staffName) {
		if (onRemoveStaff) {
			onRemoveStaff(waveId, roomId, staffName);
		}
	}

	function getStaffList(wave, roomId) {
		if (!wave.staffCells) return [];
		
		// Get staff list from first cell of this room
		const cellKey = Object.keys(wave.staffCells).find(key => key.startsWith(roomId + '_'));
		if (!cellKey) return [];
		
		return wave.staffCells[cellKey].staffList || [];
	}
</script>

{#if show}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={onClose}>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="modal-container" onclick={(e) => e.stopPropagation()}>
			<!-- Header -->
			<div class="modal-header">
				<div class="flex items-center gap-3">
					<div class="icon-wrapper">
						<DollarSign size={20} />
					</div>
					<div>
						<h2 class="modal-title">Sell & Staff Detail</h2>
						<p class="modal-subtitle">{contract?.name || 'Contract'}</p>
					</div>
				</div>
				<button class="close-btn" onclick={onClose}>
					<X size={20} />
				</button>
			</div>

			<!-- Content -->
			<div class="modal-content">
				<!-- Tabs -->
				<div class="tabs-container">
					<button
						class="tab-btn"
						class:active={activeTab === 'sold'}
						onclick={() => (activeTab = 'sold')}
					>
						<span class="tab-icon">💰</span>
						<span class="tab-label">Dijual</span>
						<span class="tab-count">
							{soldStaffData.reduce((sum, w) => sum + w.soldRooms.length, 0)}
						</span>
					</button>
					<button
						class="tab-btn"
						class:active={activeTab === 'staff'}
						onclick={() => (activeTab = 'staff')}
					>
						<span class="tab-icon">👨‍✈️</span>
						<span class="tab-label">Staff</span>
						<span class="tab-count">
							{soldStaffData.reduce((sum, w) => sum + w.staffRooms.length, 0)}
						</span>
					</button>
				</div>

				<!-- Tab Content -->
				<div class="tab-content">
					{#if activeTab === 'sold'}
						{@const hasSoldRooms = soldStaffData.some((w) => w.soldRooms.length > 0)}
						{#if !hasSoldRooms}
							<div class="empty-state">
								<div class="empty-icon">💰</div>
								<p class="empty-text">Belum ada kamar yang ditandai sebagai dijual</p>
								<p class="empty-hint">
									Pilih cell di grid dan klik kanan untuk menandai sebagai dijual
								</p>
							</div>
						{:else}
							<div class="accordion-list">
								{#each soldStaffData as { wave, soldRooms }}
									{#if soldRooms.length > 0}
										<div class="accordion-item">
											<button class="accordion-header" onclick={() => toggleWave(wave.id)}>
												<div class="flex items-center gap-2">
													<ChevronDown
														size={16}
														class="transition-transform {expandedWaveId === wave.id
															? 'rotate-180'
															: ''}"
													/>
													<span class="wave-name">{wave.name}</span>
													<span class="wave-badge sold-badge">{soldRooms.length} kamar</span>
												</div>
												<div class="wave-dates">
													{formatDate(wave.start || wave.checkIn)} - {formatDate(
														wave.end || wave.checkOut
													)}
												</div>
											</button>

											{#if expandedWaveId === wave.id}
												<div class="accordion-content" transition:slide={{ duration: 200 }}>
													{#each soldRooms as room}
														<div class="room-card">
															<div class="room-header">
																<div class="flex items-center gap-2">
																	<Bed size={14} class="text-gray-400" />
																	<span class="room-id">Kamar {room.roomId}</span>
																	<span class="type-badge type-sold">💰 Dijual</span>
																</div>
															</div>

															<div class="periods-list">
																{#each room.periods as period, idx}
																	<div class="period-item">
																		<div class="period-info">
																			<div class="date-range">
																				<Calendar size={12} class="text-gray-400" />
																				<span class="date-text">
																					{formatDate(period.checkIn)} → {formatDate(period.checkOut)}
																				</span>
																				<span class="nights-badge">
																					{calculateNights(period.checkIn, period.checkOut)} malam
																				</span>
																			</div>

																			<div class="period-controls">
																				<div class="status-group">
																					<label class="status-label">Status:</label>
																					<select
																						class="status-select"
																						value={period.status}
																						onchange={(e) =>
																							handleStatusChange(
																								wave.id,
																								room.roomId,
																								idx,
																								e.target.value
																							)}
																					>
																						<option value="available">Available</option>
																						<option value="sold">Sold</option>
																					</select>
																				</div>

																				<div class="price-group">
																					<label class="price-label">
																						<DollarSign size={12} />
																						Harga:
																					</label>
																					<input
																						type="number"
																						class="price-input"
																						value={period.price}
																						placeholder="0"
																						oninput={(e) =>
																							handlePriceChange(
																								wave.id,
																								room.roomId,
																								idx,
																								e.target.value
																							)}
																					/>
																				</div>
																			</div>
																		</div>
																	</div>
																{/each}
															</div>
														</div>
													{/each}
												</div>
											{/if}
										</div>
									{/if}
								{/each}
							</div>
						{/if}
					{:else}
						{@const hasStaffRooms = soldStaffData.some((w) => w.staffRooms.length > 0)}
						{#if !hasStaffRooms}
							<div class="empty-state">
								<div class="empty-icon">👨‍✈️</div>
								<p class="empty-text">Belum ada kamar yang ditandai untuk staff</p>
								<p class="empty-hint">
									Pilih cell di grid dan klik kanan untuk menandai sebagai staff
								</p>
							</div>
						{:else}
							<div class="accordion-list">
								{#each soldStaffData as { wave, staffRooms }}
									{#if staffRooms.length > 0}
										<div class="accordion-item">
											<button class="accordion-header" onclick={() => toggleWave(wave.id)}>
												<div class="flex items-center gap-2">
													<ChevronDown
														size={16}
														class="transition-transform {expandedWaveId === wave.id
															? 'rotate-180'
															: ''}"
													/>
													<span class="wave-name">{wave.name}</span>
													<span class="wave-badge staff-badge">{staffRooms.length} kamar</span>
												</div>
												<div class="wave-dates">
													{formatDate(wave.start || wave.checkIn)} - {formatDate(
														wave.end || wave.checkOut
													)}
												</div>
											</button>

											{#if expandedWaveId === wave.id}
												<div class="accordion-content" transition:slide={{ duration: 200 }}>
													{#each staffRooms as room}
														{@const staffList = getStaffList(wave, room.roomId)}
														<div class="room-card staff-room-card">
															<div class="room-header">
																<div class="flex items-center gap-2">
																	<Bed size={14} class="text-gray-400" />
																	<span class="room-id">Kamar {room.roomId}</span>
																	<span class="type-badge type-staff">👨‍✈️ Staff</span>
																</div>
																<button
																	class="add-staff-btn"
																	onclick={() => openAddStaffModal(wave.id, room.roomId)}
																>
																	<Plus size={14} />
																	Add Staff
																</button>
															</div>

															<div class="date-range-info">
																<Calendar size={12} class="text-gray-400" />
																<span class="date-text">
																	{#if room.periods.length > 0}
																		{formatDate(room.periods[0].checkIn)} → {formatDate(
																			room.periods[room.periods.length - 1].checkOut
																		)}
																	{/if}
																</span>
															</div>

															{#if staffList.length === 0}
																<div class="staff-empty">
																	<p class="staff-empty-text">Belum ada staff ditambahkan</p>
																</div>
															{:else}
																<div class="staff-list">
																	{#each staffList as staffName, idx}
																		<div class="staff-item">
																			<div class="staff-info">
																				<span class="staff-number">{idx + 1}</span>
																				<span class="staff-name">{staffName}</span>
																			</div>
																			<button
																				class="remove-staff-btn"
																				onclick={() =>
																					handleRemoveStaff(wave.id, room.roomId, staffName)}
																				title="Hapus staff"
																			>
																				<Trash2 size={14} />
																			</button>
																		</div>
																	{/each}
																</div>
															{/if}
														</div>
													{/each}
												</div>
											{/if}
										</div>
									{/if}
								{/each}
							</div>
						{/if}
					{/if}
				</div>
			</div>

			<!-- Footer -->
			<div class="modal-footer">
				<button class="btn-secondary" onclick={onClose}>Tutup</button>
			</div>
		</div>
	</div>
{/if}

<!-- Add Staff Modal -->
{#if showAddStaffModal}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="add-staff-overlay" onclick={() => (showAddStaffModal = false)}>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="add-staff-modal" onclick={(e) => e.stopPropagation()}>
			<div class="add-staff-header">
				<h3 class="add-staff-title">Tambah Staff</h3>
				<button class="close-btn-small" onclick={() => (showAddStaffModal = false)}>
					<X size={16} />
				</button>
			</div>
			<div class="add-staff-body">
				<label class="input-label">Nama Staff:</label>
				<input
					type="text"
					class="staff-name-input"
					bind:value={newStaffName}
					placeholder="Masukkan nama staff..."
					onkeydown={(e) => e.key === 'Enter' && handleAddStaff()}
				/>
			</div>
			<div class="add-staff-footer">
				<button class="btn-cancel" onclick={() => (showAddStaffModal = false)}>Batal</button>
				<button class="btn-add" onclick={handleAddStaff} disabled={!newStaffName.trim()}>
					<Plus size={14} />
					Tambah
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10100;
		backdrop-filter: blur(2px);
	}

	.modal-container {
		background: white;
		border-radius: 16px;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
		width: 90%;
		max-width: 800px;
		max-height: 85vh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20px 24px;
		border-bottom: 1px solid #e5e7eb;
		background: linear-gradient(135deg, #f9fafb, #ffffff);
	}

	.icon-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: 10px;
		background: linear-gradient(135deg, #16a34a, #15803d);
		color: white;
	}

	.modal-title {
		font-size: 18px;
		font-weight: 700;
		color: #111827;
		margin: 0;
	}

	.modal-subtitle {
		font-size: 13px;
		color: #6b7280;
		margin: 2px 0 0 0;
	}

	.close-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: 8px;
		border: none;
		background: #f3f4f6;
		color: #6b7280;
		cursor: pointer;
		transition: all 0.15s;
	}

	.close-btn:hover {
		background: #e5e7eb;
		color: #111827;
	}

	.modal-content {
		flex: 1;
		overflow-y: auto;
		padding: 0;
	}

	.tabs-container {
		display: flex;
		gap: 0;
		padding: 16px 24px 0 24px;
		border-bottom: 2px solid #e5e7eb;
		background: #f9fafb;
	}

	.tab-btn {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 20px;
		border: none;
		background: transparent;
		color: #6b7280;
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		border-bottom: 3px solid transparent;
		margin-bottom: -2px;
		transition: all 0.2s;
		position: relative;
	}

	.tab-btn:hover {
		color: #374151;
		background: rgba(255, 255, 255, 0.5);
	}

	.tab-btn.active {
		color: #16a34a;
		border-bottom-color: #16a34a;
		background: white;
	}

	.tab-btn.active .tab-icon {
		transform: scale(1.1);
	}

	.tab-icon {
		font-size: 16px;
		transition: transform 0.2s;
	}

	.tab-label {
		font-size: 13px;
		font-weight: 600;
	}

	.tab-count {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 20px;
		height: 20px;
		padding: 0 6px;
		background: #e5e7eb;
		color: #6b7280;
		font-size: 11px;
		font-weight: 700;
		border-radius: 10px;
		transition: all 0.2s;
	}

	.tab-btn.active .tab-count {
		background: #dcfce7;
		color: #15803d;
	}

	.tab-content {
		padding: 20px 24px;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 60px 20px;
		text-align: center;
	}

	.empty-icon {
		font-size: 48px;
		margin-bottom: 16px;
		opacity: 0.5;
	}

	.empty-text {
		font-size: 14px;
		font-weight: 600;
		color: #374151;
		margin: 0 0 8px 0;
	}

	.empty-hint {
		font-size: 12px;
		color: #9ca3af;
		margin: 0;
	}

	.accordion-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.accordion-item {
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		overflow: hidden;
		background: white;
	}

	.accordion-header {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 14px 16px;
		border: none;
		background: #f9fafb;
		cursor: pointer;
		transition: background 0.15s;
		text-align: left;
	}

	.accordion-header:hover {
		background: #f3f4f6;
	}

	.wave-name {
		font-size: 14px;
		font-weight: 600;
		color: #111827;
	}

	.wave-badge {
		font-size: 11px;
		font-weight: 600;
		color: #6b7280;
		background: #e5e7eb;
		padding: 2px 8px;
		border-radius: 6px;
	}

	.wave-badge.sold-badge {
		background: #dcfce7;
		color: #15803d;
	}

	.wave-badge.staff-badge {
		background: #e0e7ff;
		color: #4338ca;
	}

	.wave-dates {
		font-size: 12px;
		color: #6b7280;
	}

	.accordion-content {
		padding: 12px;
		background: white;
		border-top: 1px solid #e5e7eb;
	}

	.room-card {
		background: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		padding: 12px;
		margin-bottom: 8px;
	}

	.room-card:last-child {
		margin-bottom: 0;
	}

	.staff-room-card {
		background: #fefce8;
		border-color: #fde047;
	}

	.room-header {
		margin-bottom: 12px;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.add-staff-btn {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 5px 10px;
		background: #4f46e5;
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 11px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.15s;
	}

	.add-staff-btn:hover {
		background: #4338ca;
		transform: translateY(-1px);
		box-shadow: 0 2px 4px rgba(79, 70, 229, 0.3);
	}

	.date-range-info {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 12px;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		margin-bottom: 12px;
	}

	.staff-empty {
		padding: 20px;
		text-align: center;
		background: white;
		border: 1px dashed #d1d5db;
		border-radius: 6px;
	}

	.staff-empty-text {
		font-size: 12px;
		color: #9ca3af;
		margin: 0;
	}

	.staff-list {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.staff-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 10px 12px;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		transition: all 0.15s;
	}

	.staff-item:hover {
		border-color: #4f46e5;
		box-shadow: 0 2px 4px rgba(79, 70, 229, 0.1);
	}

	.staff-info {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.staff-number {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		background: #e0e7ff;
		color: #4338ca;
		font-size: 11px;
		font-weight: 700;
		border-radius: 50%;
	}

	.staff-name {
		font-size: 13px;
		font-weight: 600;
		color: #111827;
	}

	.remove-staff-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		background: #fef2f2;
		color: #dc2626;
		border: 1px solid #fecaca;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.15s;
	}

	.remove-staff-btn:hover {
		background: #dc2626;
		color: white;
		border-color: #dc2626;
	}

	.room-id {
		font-size: 13px;
		font-weight: 700;
		color: #111827;
	}

	.type-badge {
		font-size: 11px;
		font-weight: 600;
		padding: 3px 8px;
		border-radius: 6px;
	}

	.type-sold {
		background: #dcfce7;
		color: #15803d;
	}

	.type-staff {
		background: #e0e7ff;
		color: #4338ca;
	}

	.periods-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.period-item {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		padding: 12px;
	}

	.period-info {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.date-range {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.date-text {
		font-size: 12px;
		font-weight: 600;
		color: #374151;
	}

	.nights-badge {
		font-size: 10px;
		font-weight: 600;
		color: #6b7280;
		background: #f3f4f6;
		padding: 2px 6px;
		border-radius: 4px;
	}

	.period-controls {
		display: flex;
		gap: 12px;
		align-items: center;
	}

	.status-group,
	.price-group {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.status-label,
	.price-label {
		font-size: 11px;
		font-weight: 600;
		color: #6b7280;
		display: flex;
		align-items: center;
		gap: 3px;
	}

	.status-select {
		font-size: 11px;
		font-weight: 600;
		padding: 4px 8px;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		background: white;
		color: #374151;
		cursor: pointer;
		transition: all 0.15s;
	}

	.status-select:focus {
		outline: none;
		border-color: #16a34a;
		box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
	}

	.price-input {
		font-size: 12px;
		font-weight: 600;
		padding: 4px 8px;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		background: white;
		color: #374151;
		width: 120px;
		transition: all 0.15s;
	}

	.price-input:focus {
		outline: none;
		border-color: #16a34a;
		box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
	}

	.modal-footer {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 10px;
		padding: 16px 24px;
		border-top: 1px solid #e5e7eb;
		background: #f9fafb;
	}

	.btn-secondary {
		padding: 8px 16px;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		background: white;
		color: #374151;
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.15s;
	}

	.btn-secondary:hover {
		background: #f3f4f6;
		border-color: #9ca3af;
	}

	/* Add Staff Modal */
	.add-staff-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: rgba(0, 0, 0, 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10200;
	}

	.add-staff-modal {
		background: white;
		border-radius: 12px;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
		width: 90%;
		max-width: 400px;
		overflow: hidden;
	}

	.add-staff-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px 20px;
		border-bottom: 1px solid #e5e7eb;
		background: #f9fafb;
	}

	.add-staff-title {
		font-size: 16px;
		font-weight: 700;
		color: #111827;
		margin: 0;
	}

	.close-btn-small {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border-radius: 6px;
		border: none;
		background: #f3f4f6;
		color: #6b7280;
		cursor: pointer;
		transition: all 0.15s;
	}

	.close-btn-small:hover {
		background: #e5e7eb;
		color: #111827;
	}

	.add-staff-body {
		padding: 20px;
	}

	.input-label {
		display: block;
		font-size: 12px;
		font-weight: 600;
		color: #374151;
		margin-bottom: 8px;
	}

	.staff-name-input {
		width: 100%;
		padding: 10px 12px;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		font-size: 13px;
		color: #111827;
		transition: all 0.15s;
	}

	.staff-name-input:focus {
		outline: none;
		border-color: #4f46e5;
		box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
	}

	.add-staff-footer {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 10px;
		padding: 16px 20px;
		border-top: 1px solid #e5e7eb;
		background: #f9fafb;
	}

	.btn-cancel {
		padding: 8px 16px;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		background: white;
		color: #374151;
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.15s;
	}

	.btn-cancel:hover {
		background: #f3f4f6;
		border-color: #9ca3af;
	}

	.btn-add {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 16px;
		border: none;
		border-radius: 8px;
		background: #4f46e5;
		color: white;
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.15s;
	}

	.btn-add:hover:not(:disabled) {
		background: #4338ca;
		transform: translateY(-1px);
		box-shadow: 0 4px 6px rgba(79, 70, 229, 0.3);
	}

	.btn-add:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
