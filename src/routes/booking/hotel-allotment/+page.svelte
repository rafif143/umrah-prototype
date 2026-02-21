<script>
	import {
		Building2,
		Plus,
		Search,
		Filter,
		Star,
		ChevronDown,
		LayoutGrid,
		List
	} from 'lucide-svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { hotelStorageStore } from '$lib/stores/hotelStorageStore.svelte.js';
	import ContractCard from './components/CardView/ContractCard.svelte';
	import ContractGridView from './components/GridView/ContractGridView.svelte';
	import AddHotelModal from './components/Modals/AddHotelModal.svelte';
	import AddContractModal from './components/Modals/AddContractModal.svelte';
	import SellStaffDetailModal from './components/Modals/SellStaffDetailModal.svelte';
	import { slide } from 'svelte/transition';

	import { sidebarState } from '$lib/runes/sidebarState.svelte.js';

	let searchQuery = $state('');
	let expandedHotelId = $state(null);
	let expandedContractId = $state(null);
	let activeFilter = $state('all');
	let statusFilter = $state('all');
	let showAddHotelModal = $state(false);
	let showAddContractModal = $state(false);
	let showSellStaffModal = $state(false);
	let viewMode = $state('grid');
	let selectedHotelForContract = $state(null);
	let selectedContractForDetail = $state(null);
	let editingContract = $state(null);

	let hotels = $derived(
		hotelStorageStore.hotels.filter((h) => {
			const q = searchQuery.toLowerCase();
			const matchesSearch =
				!q || h.hotelName.toLowerCase().includes(q) || h.city.toLowerCase().includes(q);
			const matchesFilter =
				activeFilter === 'all' ||
				(activeFilter === 'makkah' && h.city === 'Makkah') ||
				(activeFilter === 'madinah' && h.city === 'Madinah');
			return matchesSearch && matchesFilter;
		})
	);

	function toggleHotel(id) {
		if (expandedHotelId === id) {
			expandedHotelId = null;
			expandedContractId = null;
		} else {
			expandedHotelId = id;
			expandedContractId = null;
		}
	}

	function toggleContract(id) {
		expandedContractId = expandedContractId === id ? null : id;
	}

	function getFilteredContracts(contracts) {
		if (statusFilter === 'all') return contracts;
		return contracts.filter((c) => {
			const hasAlloc = c.waves?.some((w) => w.allocations && Object.keys(w.allocations).length > 0);
			return statusFilter === 'used' ? hasAlloc : !hasAlloc;
		});
	}

	const filters = [
		{ key: 'all', label: 'All' },
		{ key: 'makkah', label: 'Makkah' },
		{ key: 'madinah', label: 'Madinah' }
	];

	const statusFilters = [
		{ key: 'all', label: 'All' },
		{ key: 'unused', label: 'Unused' },
		{ key: 'used', label: 'Used' }
	];

	function handleEditContract(contract) {
		// Find the hotel that contains this contract
		const hotel = hotels.find(h => h.contracts.some(c => c.id === contract.id));
		if (hotel) {
			selectedHotelForContract = hotel;
		}
		editingContract = contract;
		showAddContractModal = true;
	}

	function handleCloseContractModal() {
		showAddContractModal = false;
		editingContract = null;
		selectedHotelForContract = null;
	}

	function handleOpenSellStaffModal(contract) {
		selectedContractForDetail = contract;
		showSellStaffModal = true;
	}

	function handleUpdateSoldStatus(waveId, roomId, periodIndex, newStatus) {
		// Update the sold cell status in the contract
		const hotel = hotels.find(h => h.contracts.some(c => c.id === selectedContractForDetail.id));
		if (!hotel) return;

		const contract = hotel.contracts.find(c => c.id === selectedContractForDetail.id);
		const wave = contract.waves.find(w => w.id === waveId);
		
		if (wave && wave.soldCells) {
			// Find the cells for this room and update status
			Object.keys(wave.soldCells).forEach(cellKey => {
				if (cellKey.startsWith(roomId + '_')) {
					wave.soldCells[cellKey] = {
						...wave.soldCells[cellKey],
						status: newStatus
					};
				}
			});
			
			// Trigger reactivity
			hotelStorageStore.updateContract(hotel.hotelId, contract.id, { waves: contract.waves });
		}
	}

	function handleUpdatePrice(waveId, roomId, periodIndex, newPrice) {
		// Update the price for sold cells
		const hotel = hotels.find(h => h.contracts.some(c => c.id === selectedContractForDetail.id));
		if (!hotel) return;

		const contract = hotel.contracts.find(c => c.id === selectedContractForDetail.id);
		const wave = contract.waves.find(w => w.id === waveId);
		
		if (wave && wave.soldCells) {
			// Find the cells for this room and update price
			Object.keys(wave.soldCells).forEach(cellKey => {
				if (cellKey.startsWith(roomId + '_')) {
					wave.soldCells[cellKey] = {
						...wave.soldCells[cellKey],
						price: newPrice
					};
				}
			});
			
			// Trigger reactivity
			hotelStorageStore.updateContract(hotel.hotelId, contract.id, { waves: contract.waves });
		}
	}

	function handleAddStaff(waveId, roomId, staffName) {
		const hotel = hotels.find(h => h.contracts.some(c => c.id === selectedContractForDetail.id));
		if (!hotel) return;

		const contract = hotel.contracts.find(c => c.id === selectedContractForDetail.id);
		const wave = contract.waves.find(w => w.id === waveId);
		
		if (wave && wave.staffCells) {
			// Add staff to all cells for this room
			Object.keys(wave.staffCells).forEach(cellKey => {
				if (cellKey.startsWith(roomId + '_')) {
					const currentStaffList = wave.staffCells[cellKey].staffList || [];
					wave.staffCells[cellKey] = {
						...wave.staffCells[cellKey],
						staffList: [...currentStaffList, staffName]
					};
				}
			});
			
			// Trigger reactivity
			hotelStorageStore.updateContract(hotel.hotelId, contract.id, { waves: contract.waves });
		}
	}

	function handleRemoveStaff(waveId, roomId, staffName) {
		const hotel = hotels.find(h => h.contracts.some(c => c.id === selectedContractForDetail.id));
		if (!hotel) return;

		const contract = hotel.contracts.find(c => c.id === selectedContractForDetail.id);
		const wave = contract.waves.find(w => w.id === waveId);
		
		if (wave && wave.staffCells) {
			// Remove staff from all cells for this room
			Object.keys(wave.staffCells).forEach(cellKey => {
				if (cellKey.startsWith(roomId + '_')) {
					const currentStaffList = wave.staffCells[cellKey].staffList || [];
					wave.staffCells[cellKey] = {
						...wave.staffCells[cellKey],
						staffList: currentStaffList.filter(name => name !== staffName)
					};
				}
			});
			
			// Trigger reactivity
			hotelStorageStore.updateContract(hotel.hotelId, contract.id, { waves: contract.waves });
		}
	}

	function handleDeleteContract(contract) {
		// Find the hotel that contains this contract
		const hotel = hotels.find(h => h.contracts.some(c => c.id === contract.id));
		if (!hotel) {
			alert('Error: Hotel not found for this contract');
			return;
		}

		// Delete the contract
		hotelStorageStore.deleteContract(hotel.hotelId, contract.id);
		
		// Close expanded states if this contract was expanded
		if (expandedContractId === contract.id) {
			expandedContractId = null;
		}
		
		// Close modal if this contract was being edited
		if (editingContract?.id === contract.id) {
			handleCloseContractModal();
		}
	}
</script>

<div class="flex min-h-screen bg-gray-50 font-sans">
	<Sidebar activePage="hotel-allotment" />

	<main
		class="flex flex-1 flex-col overflow-hidden px-6 py-6 transition-all duration-300"
		style="margin-left: {sidebarState.isCollapsed ? '72px' : '230px'}"
	>
		<!-- Header -->
		<div class="mb-4 flex items-center justify-between">
			<div class="flex items-center gap-3">
				<div
					class="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-[#972395]"
				>
					<Building2 size={20} />
				</div>
				<div>
					<h1 class="text-xl font-bold text-gray-900">Hotel Allotment</h1>
					<p class="text-sm text-gray-500">Manage hotel contracts & room allocation</p>
				</div>
			</div>
			<button
				class="flex items-center gap-2 rounded-lg bg-[#972395] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#7a1c78] hover:shadow-md"
				onclick={() => (showAddHotelModal = true)}
			>
				<Plus size={18} />
				Add Hotel
			</button>
		</div>

		<!-- Search, Location Filter & Filter -->
		<div class="mb-4 flex items-center gap-3">
			<div class="relative max-w-md flex-1">
				<Search size={16} class="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
				<input
					type="text"
					placeholder="Search by hotel name or city..."
					class="w-full rounded-lg border border-gray-200 bg-white py-2.5 pr-4 pl-10 text-sm text-gray-900 transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
					bind:value={searchQuery}
				/>
			</div>
			<div class="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">
				{#each filters as f}
					<button
						class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors
							{activeFilter === f.key ? 'bg-[#972395] text-white' : 'text-gray-600 hover:bg-gray-50'}"
						onclick={() => (activeFilter = f.key)}
					>
						{f.label}
					</button>
				{/each}
			</div>
		</div>

		<!-- Hotel List -->
		<div class="space-y-3">
			{#each hotels as hotel (hotel.hotelId)}
				<div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
					<!-- Hotel Header Row -->
					<button
						class="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-gray-50"
						onclick={() => toggleHotel(hotel.hotelId)}
					>
						<div class="flex min-w-0 items-center gap-3">
							<div
								class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-50 text-[#972395]"
							>
								<Building2 size={16} />
							</div>
							<div class="min-w-0">
								<div class="flex items-center gap-2">
									<h3 class="truncate text-sm font-semibold text-gray-900">{hotel.hotelName}</h3>
									<div class="flex gap-0.5">
										{#each Array(hotel.starRating || 0) as _}
											<Star size={10} class="fill-yellow-400 text-yellow-400" />
										{/each}
									</div>
								</div>
								<div class="flex items-center gap-3 text-xs text-gray-500">
									<span>{hotel.city}</span>
									<span class="text-gray-300">·</span>
									<span>{hotel.contracts.length} kontrak</span>
									<span class="text-gray-300">·</span>
									<span>{hotel.contracts.reduce((s, c) => s + c.totalRooms, 0)} kamar</span>
								</div>
							</div>
						</div>
						<ChevronDown
							size={16}
							class="text-gray-400 transition-transform duration-200
                                {expandedHotelId === hotel.hotelId ? 'rotate-180' : ''}"
						/>
					</button>

					<!-- Expanded: Contracts List -->
					{#if expandedHotelId === hotel.hotelId}
						<div
							class="border-t border-gray-100 bg-gray-50 px-6 py-4"
							transition:slide={{ duration: 200 }}
						>
							<div class="mb-3 flex items-center justify-between">
								<div class="flex items-center gap-3">
									<h4 class="text-xs font-semibold tracking-wider text-gray-500 uppercase">
										Daftar Kontrak
									</h4>
									<div
										class="flex items-center gap-0.5 rounded-md border border-gray-200 bg-white p-0.5"
									>
										{#each statusFilters as sf}
											<button
												class="rounded px-2 py-1 text-[11px] font-medium transition-colors
													{statusFilter === sf.key ? 'bg-[#972395] text-white' : 'text-gray-500 hover:bg-gray-50'}"
												onclick={() => (statusFilter = sf.key)}
											>
												{sf.label}
											</button>
										{/each}
									</div>
								</div>
								<button
									class="flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-[#972395] transition-colors hover:border-[#972395] hover:bg-purple-50"
									onclick={() => {
										selectedHotelForContract = hotel;
										showAddContractModal = true;
									}}
								>
									<Plus size={14} />
									Add Contract
								</button>
							</div>
							<div class="space-y-3">
								{#each getFilteredContracts(hotel.contracts) as contract, idx (contract.id)}
									<div class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
										<ContractCard
											{contract}
											index={idx + 1}
											isExpanded={expandedContractId === contract.id}
											onToggle={toggleContract}
											onEdit={handleEditContract}
											onDelete={handleDeleteContract}
										/>

										{#if expandedContractId === contract.id}
											<div class="border-t border-gray-100" transition:slide={{ duration: 200 }}>
												<!-- View Mode Toggle -->
												<div class="flex items-center justify-end gap-1 px-5 pt-3 pb-1">
													<span
														class="mr-2 text-[10px] font-semibold tracking-wider text-gray-400 uppercase"
														>Tampilan</span
													>
													<button
														class="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors
															{viewMode === 'grid' ? 'bg-[#972395] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}"
														onclick={() => (viewMode = 'grid')}
													>
														<LayoutGrid size={12} />
														Grid
													</button>
													<button
														class="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors
															{viewMode === 'detail' ? 'bg-[#972395] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}"
														onclick={() => handleOpenSellStaffModal(contract)}
													>
														<List size={12} />
														Sell and Staff Detail
													</button>
												</div>

												{#if viewMode === 'grid'}
													<!-- Grid View (Spreadsheet Style) -->
													<div class="px-3 py-3">
														<ContractGridView {contract} hotelId={hotel.hotelId} />
													</div>
												{/if}
											</div>
										{/if}
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			{/each}

			{#if hotels.length === 0}
				<div
					class="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16 text-center"
				>
					<div class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
						<Building2 size={24} class="text-gray-400" />
					</div>
					<h3 class="mt-3 text-sm font-semibold text-gray-600">No hotels found</h3>
					<p class="mt-1 text-xs text-gray-400">
						{searchQuery ? 'Try different search terms' : 'Add your first hotel contract'}
					</p>
				</div>
			{/if}
		</div>
	</main>
</div>

<AddHotelModal show={showAddHotelModal} onClose={() => (showAddHotelModal = false)} />

<AddContractModal
	show={showAddContractModal}
	hotelId={selectedHotelForContract?.hotelId}
	hotelName={selectedHotelForContract?.hotelName}
	editingContract={editingContract}
	onClose={handleCloseContractModal}
/>

<SellStaffDetailModal
	show={showSellStaffModal}
	contract={selectedContractForDetail}
	onClose={() => {
		showSellStaffModal = false;
		selectedContractForDetail = null;
	}}
	onUpdateSoldStatus={handleUpdateSoldStatus}
	onUpdatePrice={handleUpdatePrice}
	onAddStaff={handleAddStaff}
	onRemoveStaff={handleRemoveStaff}
/>
