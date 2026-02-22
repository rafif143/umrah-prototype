<script>
	import { X, Package, Users, Calendar, Bed, ChevronRight, ChevronDown } from 'lucide-svelte';
	import { packageStore } from '$lib/stores/packageStore.svelte.js';
	import { bookingStore } from '$lib/stores/bookingStore.svelte.js';

	let { isOpen = $bindable(false), wave, onImport } = $props();

	let selectedPackageId = $state('');
	let selectedTripDateId = $state('');
	let bookingsToImport = $state([]);
	let expandedRooms = $state({});

	// Get all packages
	let packages = $derived(packageStore.packages);

	// Get selected package
	let selectedPackage = $derived(packages.find((p) => p.id === selectedPackageId) || null);

	// Get trip dates for selected package
	let tripDates = $derived(selectedPackage?.tripDates || []);

	// Get selected trip date
	let selectedTripDate = $derived(tripDates.find((td) => td.id === selectedTripDateId) || null);

	// Filter bookings by selected package name
	let availableBookings = $derived(() => {
		if (!selectedPackage) return [];
		// Match bookings by package name (you might need to adjust this logic based on your data structure)
		return bookingStore.bookings.filter(
			(b) => b.packageName && b.packageName.includes(selectedPackage.name)
		);
	});

	// Reset form when modal opens
	$effect(() => {
		if (isOpen) {
			selectedPackageId = '';
			selectedTripDateId = '';
			bookingsToImport = [];
			expandedRooms = {};
		}
	});

	// Auto-select bookings when package/trip changes
	$effect(() => {
		if (selectedPackage && selectedTripDate) {
			bookingsToImport = availableBookings().map((b) => b.id);
		} else {
			bookingsToImport = [];
		}
	});

	function toggleBooking(bookingId) {
		if (bookingsToImport.includes(bookingId)) {
			bookingsToImport = bookingsToImport.filter((id) => id !== bookingId);
		} else {
			bookingsToImport = [...bookingsToImport, bookingId];
		}
	}

	function toggleRoom(e, bookingId, type) {
		e.preventDefault();
		e.stopPropagation();
		const key = `${bookingId}-${type}`;
		expandedRooms[key] = !expandedRooms[key];
	}

	// Calculate visual rooms required for a booking based on capacity
	function getRoomsForBooking(booking) {
		const capacities = { double: 2, triple: 3, quad: 4, quint: 5 };
		const typeGroups = {};
		for (const p of booking.pilgrims || []) {
			const rt = (p.roomType || booking.roomType || 'double').toLowerCase();
			if (!typeGroups[rt]) typeGroups[rt] = [];
			typeGroups[rt].push(p);
		}

		const rooms = [];
		for (const [type, pilgrims] of Object.entries(typeGroups)) {
			const cap = capacities[type] || 2;
			const numRooms = Math.ceil(pilgrims.length / cap);
			rooms.push({
				type: type.toUpperCase(),
				roomCount: numRooms,
				pax: pilgrims.length,
				pilgrims: pilgrims
			});
		}
		return rooms;
	}

	function handleImport() {
		if (!selectedPackage || !selectedTripDate) {
			alert('Pilih package dan trip date terlebih dahulu');
			return;
		}

		if (bookingsToImport.length === 0) {
			alert('Pilih minimal 1 booking untuk diimport');
			return;
		}

		// Get selected bookings
		const bookings = bookingStore.bookings.filter((b) => bookingsToImport.includes(b.id));

		// Convert bookings to jamaah format based on individual pilgrim's configured room
		const jamaahList = [];
		bookings.forEach((booking) => {
			booking.pilgrims.forEach((pilgrim, idx) => {
				// Here pilgrim.assignedRoom might be 'quad', 'double', etc based on package allocation
				// default to booking.roomType if available, or 'double' as last resort
				const reqType = (pilgrim.roomType || booking.roomType || 'double').toLowerCase();

				jamaahList.push({
					id: `${booking.id}-${idx}`,
					name: pilgrim.name,
					gender: pilgrim.gender || 'L', // Default to L if not specified
					roomId: '', // Not assigned yet
					bookingId: booking.id,
					bookingName: booking.applicantName, // Pass the parent name
					requestedRoomType: reqType
				});
			});
		});

		onImport({
			packageId: selectedPackageId,
			packageName: selectedPackage.name,
			tripDateId: selectedTripDateId,
			tripDate: selectedTripDate,
			bookings: bookings,
			jamaah: jamaahList
		});

		isOpen = false;
	}
</script>

{#if isOpen}
	<div class="modal-backdrop" onclick={() => (isOpen = false)} role="button" tabindex="0">
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div class="modal-content" onclick={(e) => e.stopPropagation()} role="button" tabindex="0">
			<div class="modal-header">
				<div class="header-title">
					<Package size={18} />
					<h3>Import Package ke {wave?.name || 'Gelombang'}</h3>
				</div>
				<button class="close-btn" onclick={() => (isOpen = false)}>
					<X size={18} />
				</button>
			</div>

			<div class="modal-body">
				<!-- Package Selection -->
				<div class="form-group">
					<label for="package-select">
						<Package size={14} />
						Pilih Package
					</label>
					<select id="package-select" bind:value={selectedPackageId}>
						<option value="">-- Pilih Package --</option>
						{#each packages as pkg}
							<option value={pkg.id}>{pkg.name} ({pkg.category})</option>
						{/each}
					</select>
				</div>

				<!-- Trip Date Selection -->
				{#if selectedPackage}
					<div class="form-group">
						<label for="trip-date-select">
							<Calendar size={14} />
							Pilih Trip Date
						</label>
						<select id="trip-date-select" bind:value={selectedTripDateId}>
							<option value="">-- Pilih Trip Date --</option>
							{#each tripDates as td}
								<option value={td.id}>
									{td.date} ({td.checkIn} s/d {td.checkOut}) - {td.currentPax}/{td.paxCapacity} pax
								</option>
							{/each}
						</select>
					</div>
				{/if}

				<!-- Bookings List -->
				{#if selectedTripDate}
					<div class="bookings-section">
						<div class="section-header">
							<Users size={14} />
							<span>Bookings Tersedia ({availableBookings().length})</span>
							<button
								class="btn-select-all"
								onclick={() => {
									if (bookingsToImport.length === availableBookings().length) {
										bookingsToImport = [];
									} else {
										bookingsToImport = availableBookings().map((b) => b.id);
									}
								}}
							>
								{bookingsToImport.length === availableBookings().length
									? 'Unselect All'
									: 'Select All'}
							</button>
						</div>

						{#if availableBookings().length === 0}
							<div class="empty-state">
								<p>Tidak ada booking untuk package ini</p>
								<small>Pastikan booking sudah dibuat dengan package name yang sesuai</small>
							</div>
						{:else}
							<div class="bookings-list">
								{#each availableBookings() as booking}
									{@const types = Array.from(
										new Set(
											(booking.pilgrims || []).map((p) =>
												(p.roomType || booking.roomType || 'N/A').toUpperCase()
											)
										)
									).join(', ')}
									<label class="booking-card">
										<input
											type="checkbox"
											checked={bookingsToImport.includes(booking.id)}
											onchange={() => toggleBooking(booking.id)}
										/>
										<div class="booking-info">
											<div class="booking-header">
												<span class="booking-id">{booking.id}</span>
												<span class="booking-type">{types}</span>
											</div>
											<div class="booking-name">{booking.applicantName}</div>
											<div class="booking-pax">
												<Users size={12} />
												{booking.pilgrims?.length || 0} jamaah
											</div>

											<div class="booking-sub-rooms">
												{#each getRoomsForBooking(booking) as room}
													{@const roomKey = `${booking.id}-${room.type}`}
													<!-- svelte-ignore a11y_click_events_have_key_events -->
													<!-- svelte-ignore a11y_no_static_element_interactions -->
													<div class="sub-room-container">
														<div
															class="sub-room-badge"
															onclick={(e) => toggleRoom(e, booking.id, room.type)}
															style="cursor: pointer;"
														>
															<span class="sub-room-icon-count">
																{#if expandedRooms[roomKey]}
																	<ChevronDown size={14} />
																{:else}
																	<ChevronRight size={14} />
																{/if}
																<Bed size={12} />
																{room.roomCount}x {room.type}
															</span>
															<span class="sub-room-pax">{room.pax} pax</span>
														</div>
														{#if expandedRooms[roomKey]}
															<div class="sub-room-pilgrims">
																{#each room.pilgrims as pilgrim}
																	<div class="pilgrim-row">
																		<span class="pilgrim-name">• {pilgrim.name}</span>
																		<span
																			class="pilgrim-gender"
																			class:male={pilgrim.gender === 'L'}
																			class:female={pilgrim.gender === 'P'}>{pilgrim.gender}</span
																		>
																	</div>
																{/each}
															</div>
														{/if}
													</div>
												{/each}
											</div>
										</div>
									</label>
								{/each}
							</div>
						{/if}
					</div>
				{/if}

				<!-- Summary -->
				{#if bookingsToImport.length > 0}
					<div class="import-summary">
						<strong>Summary:</strong>
						{bookingsToImport.length} booking(s) akan diimport dengan total{' '}
						{bookingStore.bookings
							.filter((b) => bookingsToImport.includes(b.id))
							.reduce((sum, b) => sum + (b.pilgrims?.length || 0), 0)} jamaah
					</div>
				{/if}
			</div>

			<div class="modal-footer">
				<button class="btn-cancel" onclick={() => (isOpen = false)}>Batal</button>
				<button class="btn-import" onclick={handleImport} disabled={bookingsToImport.length === 0}>
					Import {bookingsToImport.length > 0 ? `(${bookingsToImport.length})` : ''}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
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
	}

	.modal-content {
		background: white;
		width: 600px;
		max-width: 90vw;
		max-height: 85vh;
		border-radius: 12px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.modal-header {
		padding: 16px 20px;
		border-bottom: 1px solid #e2e8f0;
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: #f8fafc;
	}

	.header-title {
		display: flex;
		align-items: center;
		gap: 10px;
		color: #972395;
	}

	.header-title h3 {
		margin: 0;
		font-size: 15px;
		font-weight: 600;
		color: #1e293b;
	}

	.close-btn {
		background: none;
		border: none;
		cursor: pointer;
		color: #64748b;
		padding: 4px;
		border-radius: 4px;
	}

	.close-btn:hover {
		background: #e2e8f0;
		color: #ef4444;
	}

	.modal-body {
		padding: 20px;
		overflow-y: auto;
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.form-group label {
		font-size: 13px;
		font-weight: 600;
		color: #475569;
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.form-group select {
		padding: 10px 12px;
		border: 1px solid #e2e8f0;
		border-radius: 6px;
		font-size: 13px;
		color: #1e293b;
		background: white;
		cursor: pointer;
	}

	.form-group select:focus {
		border-color: #972395;
		outline: none;
		box-shadow: 0 0 0 2px rgba(151, 35, 149, 0.1);
	}

	.bookings-section {
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		overflow: hidden;
	}

	.section-header {
		padding: 10px 12px;
		background: #f8fafc;
		border-bottom: 1px solid #e2e8f0;
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 13px;
		font-weight: 600;
		color: #475569;
	}

	.section-header span {
		flex: 1;
	}

	.btn-select-all {
		padding: 4px 10px;
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 4px;
		font-size: 11px;
		font-weight: 500;
		color: #64748b;
		cursor: pointer;
	}

	.btn-select-all:hover {
		background: #f1f5f9;
		color: #972395;
		border-color: #972395;
	}

	.empty-state {
		padding: 40px 20px;
		text-align: center;
		color: #94a3b8;
	}

	.empty-state p {
		margin: 0 0 8px 0;
		font-size: 14px;
		font-weight: 500;
	}

	.empty-state small {
		font-size: 12px;
	}

	.bookings-list {
		max-height: 300px;
		overflow-y: auto;
		padding: 8px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.booking-card {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		padding: 12px;
		border: 2px solid #e2e8f0;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.15s;
		background: white;
	}

	.booking-card:hover {
		border-color: #972395;
		background: #faf5ff;
	}

	.booking-card input[type='checkbox'] {
		margin-top: 2px;
		cursor: pointer;
		width: 16px;
		height: 16px;
		accent-color: #972395;
	}

	.booking-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.booking-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}

	.booking-id {
		font-size: 11px;
		font-weight: 700;
		color: #972395;
		font-family: monospace;
	}

	.booking-type {
		font-size: 10px;
		font-weight: 700;
		padding: 2px 8px;
		background: #f1f5f9;
		color: #64748b;
		border-radius: 4px;
		text-transform: uppercase;
	}

	.booking-name {
		font-size: 13px;
		font-weight: 600;
		color: #1e293b;
	}

	.booking-pax {
		font-size: 11px;
		color: #64748b;
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.booking-sub-rooms {
		margin-top: 8px;
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding-top: 8px;
		border-top: 1px dashed #e2e8f0;
	}

	.sub-room-badge {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		padding: 4px 8px;
		border-radius: 6px;
		font-size: 11px;
		color: #475569;
		user-select: none;
		transition: background-color 0.15s;
	}

	.sub-room-badge:hover {
		background: #f1f5f9;
	}

	.sub-room-container {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.sub-room-pilgrims {
		padding-left: 12px;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.pilgrim-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 11px;
		padding: 2px 4px;
	}

	.pilgrim-name {
		color: #475569;
	}

	.pilgrim-gender {
		font-size: 9px;
		font-weight: 700;
		padding: 2px 4px;
		border-radius: 4px;
	}

	.pilgrim-gender.male {
		background: #e0f2fe;
		color: #0284c7;
	}

	.pilgrim-gender.female {
		background: #fce7f3;
		color: #db2777;
	}

	.sub-room-icon-count {
		display: flex;
		align-items: center;
		gap: 4px;
		font-weight: 500;
	}

	.sub-room-pax {
		font-weight: 500;
		color: #64748b;
	}

	.import-summary {
		padding: 12px;
		background: #f0f9ff;
		border: 1px solid #bae6fd;
		border-radius: 6px;
		font-size: 12px;
		color: #0c4a6e;
	}

	.import-summary strong {
		font-weight: 700;
	}

	.modal-footer {
		padding: 16px 20px;
		border-top: 1px solid #e2e8f0;
		display: flex;
		justify-content: flex-end;
		gap: 10px;
		background: #f8fafc;
	}

	.btn-cancel {
		padding: 8px 16px;
		border: 1px solid #e2e8f0;
		background: white;
		border-radius: 6px;
		cursor: pointer;
		font-weight: 500;
		font-size: 13px;
		color: #64748b;
	}

	.btn-cancel:hover {
		background: #f1f5f9;
		color: #1e293b;
	}

	.btn-import {
		padding: 8px 16px;
		background: #972395;
		color: white;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-weight: 500;
		font-size: 13px;
	}

	.btn-import:hover:not(:disabled) {
		background: #7c1d7e;
	}

	.btn-import:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
