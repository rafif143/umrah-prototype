<script>
	import { X, Plus, Trash2, Calendar, Palette } from 'lucide-svelte';
	import { fade, slide } from 'svelte/transition';
	import { hotelStorageStore } from '$lib/stores/hotelStorageStore.svelte.js';
	import { gregorianToHijri, hijriToGregorian, hijriMonths } from '$lib/utils/hijri.js';
	import HijriDatePicker from '$lib/components/HijriDatePicker.svelte';

	let { show = false, hotelId = '', hotelName = '', editingContract = null, onClose } = $props();

	// --- Contract Form ---
	let contractName = $state('');
	let dateMode = $state('gregorian'); // 'gregorian' | 'hijri'
	let dateFrom = $state('');
	let dateTo = $state('');
	let hijriFrom = $state({ day: 1, month: 0, year: 1446 });
	let hijriTo = $state({ day: 1, month: 0, year: 1446 });
	let notes = $state('');

	// --- Floor System ---
	let floors = $state([
		{ id: 1, name: 'Floor 1', roomCount: 0 }
	]);

	// Initialize form when editing
	$effect(() => {
		if (show && editingContract) {
			contractName = editingContract.name || '';
			dateFrom = editingContract.contractPeriod?.from || '';
			dateTo = editingContract.contractPeriod?.to || '';
			notes = editingContract.notes || '';
			
			// Convert existing rooms to floors if editing
			if (editingContract.floors) {
				floors = [...editingContract.floors];
			} else {
				// Legacy: convert from old room system
				const totalRooms = editingContract.totalRooms || 0;
				floors = [{ id: 1, name: 'Floor 1', roomCount: totalRooms }];
			}
			
			// Update hijri dates
			if (dateFrom) {
				const h = gregorianToHijri(dateFrom);
				hijriFrom = { ...h };
			}
			if (dateTo) {
				const h = gregorianToHijri(dateTo);
				hijriTo = { ...h };
			}
		} else if (show && !editingContract) {
			// Reset for new contract
			resetForm();
		}
	});

	let totalRooms = $derived(floors.reduce((sum, floor) => sum + (floor.roomCount || 0), 0));

	function addFloor() {
		const newFloorNumber = floors.length + 1;
		floors = [...floors, { 
			id: Date.now(), 
			name: `Floor ${newFloorNumber}`, 
			roomCount: 0 
		}];
	}

	function removeFloor(floorId) {
		if (floors.length <= 1) return; // Keep at least one floor
		floors = floors.filter(f => f.id !== floorId);
	}

	// --- Generate rooms array from floors ---
	function generateRooms() {
		const rooms = [];
		
		floors.forEach((floor, floorIdx) => {
			const floorNumber = floorIdx + 1; // Floor 1, Floor 2, etc.
			for (let i = 0; i < floor.roomCount; i++) {
				const roomNumber = String(i + 1).padStart(2, '0'); // 01, 02, 03, etc.
				const roomId = `R${floorNumber}${roomNumber}`; // R101, R102, R201, etc.
				rooms.push({ 
					id: roomId, 
					floor: floor.name,
					floorId: floor.id,
					type: 'unset', // Default type, will be changed later in grid header
					originalType: 'unset' // Track original type for manipulation detection
				});
			}
		});
		
		return rooms;
	}

	function handleSubmit() {
		if (!contractName || !dateFrom || !dateTo || totalRooms === 0) return;

		const rooms = generateRooms();

		if (editingContract) {
			// Update existing contract
			const updatedContract = {
				...editingContract,
				name: contractName,
				contractPeriod: { from: dateFrom, to: dateTo },
				totalRooms,
				floors: [...floors],
				rooms,
				notes
			};
			hotelStorageStore.updateContract(hotelId, editingContract.id, updatedContract);
		} else {
			// Create new contract
			const contract = {
				name: contractName,
				contractPeriod: { from: dateFrom, to: dateTo },
				totalRooms,
				floors: [...floors],
				rooms,
				waves: [], // Empty waves array - will be added later via "Tambah Gelombang" button
				isOverflow: false,
				notes
			};
			hotelStorageStore.addContract(hotelId, contract);
		}

		resetAndClose();
	}

	function resetForm() {
		contractName = '';
		dateFrom = '';
		dateTo = '';
		notes = '';
		floors = [{ id: 1, name: 'Floor 1', roomCount: 0 }];
	}

	function resetAndClose() {
		resetForm();
		onClose();
	}
</script>

{#if show}
	<div
		class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-12 backdrop-blur-sm"
		transition:fade={{ duration: 200 }}
		onclick={(e) => {
			if (e.target === e.currentTarget) resetAndClose();
		}}
		onkeydown={() => {}}
		role="dialog"
		tabindex="-1"
	>
		<div
			class="mb-12 w-full max-w-lg rounded-2xl bg-white shadow-2xl"
			transition:slide={{ axis: 'y', duration: 300 }}
		>
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-gray-100 p-6">
				<div>
					<h2 class="text-lg font-semibold text-gray-900">
						{editingContract ? 'Edit Contract' : 'Add Contract'}
					</h2>
					<p class="mt-0.5 text-sm text-gray-500">{hotelName}</p>
				</div>
				<button
					class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
					onclick={resetAndClose}
				>
					<X size={20} />
				</button>
			</div>

			<div class="max-h-[60vh] space-y-5 overflow-y-auto p-6">
				<!-- Contract Name -->
				<div>
					<label for="contractName" class="mb-1.5 block text-xs font-medium text-gray-600"
						>Nama Kontrak</label
					>
					<input
						type="text"
						id="contractName"
						placeholder="e.g. Kontrak 1"
						class="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
						bind:value={contractName}
					/>
				</div>

				<!-- Date Range -->
				<div class="space-y-3">
					<!-- Date System Switcher -->
					<div class="flex items-center gap-2">
						<span class="text-xs font-medium text-gray-600">Sistem Tanggal:</span>
						<div class="flex rounded-lg border border-gray-200 bg-gray-50 p-1">
							<button
								class="rounded px-3 py-1 text-xs font-medium transition-colors {dateMode ===
								'gregorian'
									? 'bg-white text-[#972395] shadow-sm'
									: 'text-gray-500 hover:text-gray-700'}"
								onclick={() => (dateMode = 'gregorian')}
							>
								Masehi
							</button>
							<button
								class="rounded px-3 py-1 text-xs font-medium transition-colors {dateMode === 'hijri'
									? 'bg-white text-[#972395] shadow-sm'
									: 'text-gray-500 hover:text-gray-700'}"
								onclick={() => (dateMode = 'hijri')}
							>
								Hijriyah
							</button>
						</div>
					</div>

					<div class="grid grid-cols-2 gap-3">
						<!-- Start Date -->
						<div class="space-y-2">
							<div>
								<label for="dateFrom" class="mb-1.5 block text-xs font-medium text-gray-600"
									>Tanggal Mulai (Masehi)</label
								>
								<div class="relative">
									<Calendar
										size={14}
										class="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
									/>
									<input
										type="date"
										id="dateFrom"
										class="w-full rounded-lg border border-gray-200 bg-white py-2.5 pr-3 pl-9 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395] disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
										bind:value={dateFrom}
										disabled={dateMode === 'hijri'}
										oninput={() => {
											if (dateFrom) {
												const h = gregorianToHijri(dateFrom);
												hijriFrom = { ...h };
											}
										}}
									/>
								</div>
							</div>
							<!-- Hijri Start -->
							<div class="rounded-lg {dateMode === 'hijri' ? '' : ''}">
								<label class="mb-1 block text-[10px] font-medium text-gray-500">Hijriyah</label>
								<HijriDatePicker
									value={hijriFrom}
									disabled={dateMode === 'gregorian'}
									onChange={(val) => {
										hijriFrom = val;
										dateFrom = hijriToGregorian(val.day, val.month, val.year);
									}}
								/>
							</div>
						</div>

						<!-- End Date -->
						<div class="space-y-2">
							<div>
								<label for="dateTo" class="mb-1.5 block text-xs font-medium text-gray-600"
									>Tanggal Selesai (Masehi)</label
								>
								<div class="relative">
									<Calendar
										size={14}
										class="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
									/>
									<input
										type="date"
										id="dateTo"
										class="w-full rounded-lg border border-gray-200 bg-white py-2.5 pr-3 pl-9 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395] disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
										bind:value={dateTo}
										disabled={dateMode === 'hijri'}
										oninput={() => {
											if (dateTo) {
												const h = gregorianToHijri(dateTo);
												hijriTo = { ...h };
											}
										}}
									/>
								</div>
							</div>
							<!-- Hijri End -->
							<div class="rounded-lg {dateMode === 'hijri' ? '' : ''}">
								<label class="mb-1 block text-[10px] font-medium text-gray-500">Hijriyah</label>
								<HijriDatePicker
									value={hijriTo}
									disabled={dateMode === 'gregorian'}
									onChange={(val) => {
										hijriTo = val;
										dateTo = hijriToGregorian(val.day, val.month, val.year);
									}}
								/>
							</div>
						</div>
					</div>
				</div>

				<!-- Pricing moved to Wave -->

				<!-- Floor Management -->
				<div>
					<div class="mb-3 flex items-center justify-between">
						<span class="text-xs font-medium text-gray-600">Floors & Rooms</span>
						<div class="flex items-center gap-2">
							<span class="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700"
								>Total: {totalRooms} kamar</span>
							<button
								class="flex items-center gap-1 rounded-md bg-[#972395] px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#7a1c78]"
								onclick={addFloor}
							>
								<Plus size={12} />
								Add Floor
							</button>
						</div>
					</div>
					
					<div class="space-y-2">
						{#each floors as floor, index (floor.id)}
							<div class="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
								<div class="flex-1">
									<input
										type="text"
										placeholder="Floor name"
										class="w-full bg-transparent text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400"
										bind:value={floor.name}
									/>
								</div>
								<div class="flex items-center gap-2">
									<input
										type="number"
										min="0"
										placeholder="0"
										class="w-16 bg-white rounded border border-gray-200 px-2 py-1 text-center text-sm font-semibold text-gray-900 outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={floor.roomCount}
									/>
									<span class="text-xs text-gray-500">rooms</span>
								</div>
								{#if floors.length > 1}
									<button
										class="rounded p-1 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
										onclick={() => removeFloor(floor.id)}
										title="Remove Floor"
									>
										<Trash2 size={14} />
									</button>
								{/if}
							</div>
						{/each}
					</div>
				</div>

				<!-- Notes -->
				<div>
					<label for="notes" class="mb-1.5 block text-xs font-medium text-gray-600">Catatan</label>
					<textarea
						id="notes"
						placeholder="Catatan opsional..."
						rows="2"
						class="w-full resize-none rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
						bind:value={notes}
					></textarea>
				</div>
			</div>

			<!-- Footer -->
			<div
				class="flex items-center justify-end gap-3 rounded-b-2xl border-t border-gray-100 bg-gray-50 px-6 py-4"
			>
				<button
					class="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
					onclick={resetAndClose}
				>
					Cancel
				</button>
				<button
					class="rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-colors
                        {contractName && dateFrom && dateTo && totalRooms > 0
						? 'bg-[#972395] hover:bg-[#7a1c78]'
						: 'cursor-not-allowed bg-gray-300'}"
					disabled={!contractName || !dateFrom || !dateTo || totalRooms === 0}
					onclick={handleSubmit}
				>
					{editingContract ? 'Update Contract' : 'Save Contract'}
				</button>
			</div>
		</div>
	</div>
{/if}
