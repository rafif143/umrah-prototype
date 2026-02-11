<script>
	import { X, Plus, Trash2, Calendar, Palette } from 'lucide-svelte';
	import { fade, slide } from 'svelte/transition';
	import { hotelStorageStore } from '$lib/stores/hotelStorageStore.svelte.js';

	let { show = false, hotelId = '', hotelName = '', onClose } = $props();

	// --- Contract Form ---
	let contractName = $state('');
	let dateFrom = $state('');
	let dateTo = $state('');
	let notes = $state('');

	// --- Room Capacities ---
	let doubleCount = $state(0);
	let tripleCount = $state(0);
	let quadCount = $state(0);
	let quintCount = $state(0);

	let totalRooms = $derived(doubleCount + tripleCount + quadCount + quintCount);

	// --- Waves ---
	let waves = $state([]);
	let newWaveName = $state('');
	let newWaveCheckIn = $state('');
	let newWaveCheckOut = $state('');
	let newWaveRoomCount = $state('');
	let newWaveColor = $state('#972395'); // Default purple
	let newWaveFlatRate = $state('');

	function addWave() {
		if (!newWaveName || !newWaveCheckIn || !newWaveCheckOut || !newWaveRoomCount) return;
		const count = parseInt(newWaveRoomCount);
		if (count <= 0 || count > totalRooms) return;

		waves = [
			...waves,
			{
				id: `w-${Date.now()}`,
				name: newWaveName,
				checkIn: newWaveCheckIn,
				checkOut: newWaveCheckOut,
				roomCount: count,
				color: newWaveColor,
				flatRate: parseFloat(newWaveFlatRate) || 0
			}
		];
		newWaveName = '';
		newWaveCheckIn = '';
		newWaveCheckOut = '';
		newWaveRoomCount = '';
		newWaveColor = '#972395';
		newWaveFlatRate = '';
	}

	function removeWave(id) {
		waves = waves.filter((w) => w.id !== id);
	}

	// --- Generate rooms array from capacity counts ---
	function generateRooms() {
		const rooms = [];
		let idx = 1;
		const pad = (n) => String(n).padStart(3, '0');

		for (let i = 0; i < quadCount; i++) {
			rooms.push({ id: `R${pad(idx)}`, type: 'quad', originalType: 'quad' });
			idx++;
		}
		for (let i = 0; i < tripleCount; i++) {
			rooms.push({ id: `R${pad(idx)}`, type: 'triple', originalType: 'triple' });
			idx++;
		}
		for (let i = 0; i < doubleCount; i++) {
			rooms.push({ id: `R${pad(idx)}`, type: 'double', originalType: 'double' });
			idx++;
		}
		for (let i = 0; i < quintCount; i++) {
			rooms.push({ id: `R${pad(idx)}`, type: 'quint', originalType: 'quint' });
			idx++;
		}
		return rooms;
	}

	// --- Distribute rooms into waves sequentially ---
	function generateWaves(rooms) {
		return waves.map((w) => {
			const roomIds = rooms.slice(0, w.roomCount).map((r) => r.id);
			return {
				id: w.id,
				name: w.name,
				checkIn: w.checkIn,
				checkOut: w.checkOut,
				checkOut: w.checkOut,
				roomsUsed: w.roomCount,
				color: w.color,
				flatRate: w.flatRate,
				roomIds
			};
		});
	}

	function handleSubmit() {
		if (!contractName || !dateFrom || !dateTo || totalRooms === 0) return;

		const rooms = generateRooms();
		const generatedWaves = generateWaves(rooms);

		const contract = {
			name: contractName,
			contractPeriod: { from: dateFrom, to: dateTo },
			totalRooms,
			rooms,
			waves: generatedWaves,
			isOverflow: false,
			notes
		};

		hotelStorageStore.addContract(hotelId, contract);
		resetAndClose();
	}

	function resetAndClose() {
		contractName = '';
		dateFrom = '';
		dateTo = '';
		notes = '';
		doubleCount = 0;
		tripleCount = 0;
		quadCount = 0;
		quintCount = 0;
		waves = [];
		newWaveName = '';
		newWaveCheckIn = '';
		newWaveCheckOut = '';
		newWaveRoomCount = '';
		newWaveFlatRate = '';
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
					<h2 class="text-lg font-semibold text-gray-900">Add Contract</h2>
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
				<div class="grid grid-cols-2 gap-3">
					<div>
						<label for="dateFrom" class="mb-1.5 block text-xs font-medium text-gray-600"
							>Tanggal Mulai</label
						>
						<div class="relative">
							<Calendar size={14} class="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
							<input
								type="date"
								id="dateFrom"
								class="w-full rounded-lg border border-gray-200 bg-white py-2.5 pr-3 pl-9 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={dateFrom}
							/>
						</div>
					</div>
					<div>
						<label for="dateTo" class="mb-1.5 block text-xs font-medium text-gray-600"
							>Tanggal Selesai</label
						>
						<div class="relative">
							<Calendar size={14} class="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
							<input
								type="date"
								id="dateTo"
								class="w-full rounded-lg border border-gray-200 bg-white py-2.5 pr-3 pl-9 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={dateTo}
							/>
						</div>
					</div>
				</div>

				<!-- Pricing moved to Wave -->

				<!-- Room Capacity -->
				<div>
					<div class="mb-2 flex items-center justify-between">
						<span class="text-xs font-medium text-gray-600">Kapasitas Kamar</span>
						<span class="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700"
							>Total: {totalRooms} kamar</span
						>
					</div>
					<div class="grid grid-cols-4 gap-2">
						<div
							class="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center transition-shadow focus-within:border-[#972395] focus-within:ring-1 focus-within:ring-[#972395]"
						>
							<div class="mb-1 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
								Double
							</div>
							<input
								type="number"
								min="0"
								class="w-full bg-transparent text-center text-lg font-bold text-gray-900 outline-none"
								bind:value={doubleCount}
							/>
						</div>
						<div
							class="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center transition-shadow focus-within:border-[#972395] focus-within:ring-1 focus-within:ring-[#972395]"
						>
							<div class="mb-1 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
								Triple
							</div>
							<input
								type="number"
								min="0"
								class="w-full bg-transparent text-center text-lg font-bold text-gray-900 outline-none"
								bind:value={tripleCount}
							/>
						</div>
						<div
							class="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center transition-shadow focus-within:border-[#972395] focus-within:ring-1 focus-within:ring-[#972395]"
						>
							<div class="mb-1 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
								Quad
							</div>
							<input
								type="number"
								min="0"
								class="w-full bg-transparent text-center text-lg font-bold text-gray-900 outline-none"
								bind:value={quadCount}
							/>
						</div>
						<div
							class="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center transition-shadow focus-within:border-[#972395] focus-within:ring-1 focus-within:ring-[#972395]"
						>
							<div class="mb-1 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
								Quint
							</div>
							<input
								type="number"
								min="0"
								class="w-full bg-transparent text-center text-lg font-bold text-gray-900 outline-none"
								bind:value={quintCount}
							/>
						</div>
					</div>
				</div>

				<!-- Waves -->
				<div>
					<span class="mb-2 block text-xs font-medium text-gray-600">Gelombang</span>

					<!-- Existing Waves -->
					{#if waves.length > 0}
						<div class="mb-3 space-y-2">
							{#each waves as wave (wave.id)}
								<div
									class="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-2.5"
									transition:slide={{ duration: 150 }}
								>
									<div class="min-w-0">
										<div class="text-sm font-medium text-gray-900">{wave.name}</div>
										<div class="text-xs text-gray-500">
											{wave.checkIn} → {wave.checkOut} · {wave.roomCount} kamar
										</div>
										<div class="mt-0.5 text-[10px] text-gray-400">
											Base: <span class="font-medium text-gray-600"
												>{wave.flatRate?.toLocaleString()}</span
											>
										</div>
									</div>
									<div class="flex items-center gap-2">
										<div
											class="h-4 w-4 rounded-full border border-gray-200"
											style="background-color: {wave.color}"
										></div>
										<button
											class="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
											onclick={() => removeWave(wave.id)}
										>
											<Trash2 size={14} />
										</button>
									</div>
								</div>
							{/each}
						</div>
					{/if}

					<!-- Add Wave Form -->
					<div class="space-y-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3">
						<div class="grid grid-cols-2 gap-2">
							<input
								type="text"
								placeholder="Nama gelombang"
								class="rounded-md border border-gray-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#972395]"
								bind:value={newWaveName}
							/>
							<input
								type="number"
								min="1"
								max={totalRooms}
								placeholder="Jumlah kamar"
								class="rounded-md border border-gray-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#972395]"
								bind:value={newWaveRoomCount}
							/>
						</div>
						<div class="grid grid-cols-[1fr_1fr_auto] gap-2">
							<input
								type="date"
								class="rounded-md border border-gray-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#972395]"
								bind:value={newWaveCheckIn}
							/>
							<input
								type="date"
								class="rounded-md border border-gray-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#972395]"
								bind:value={newWaveCheckOut}
							/>
							<div class="flex items-center rounded-md border border-gray-200 bg-white px-2">
								<input
									type="color"
									class="h-6 w-6 cursor-pointer border-none bg-transparent p-0"
									bind:value={newWaveColor}
									title="Pilih warna gelombang"
								/>
							</div>
						</div>
						<div class="grid grid-cols-2 gap-2">
							<input
								type="number"
								placeholder="Flat Rate"
								class="rounded-md border border-gray-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#972395]"
								bind:value={newWaveFlatRate}
							/>
						</div>
						<button
							class="flex w-full items-center justify-center gap-1 rounded-md border border-gray-200 bg-white py-2 text-xs font-medium text-gray-600 transition-colors hover:border-[#972395] hover:text-[#972395]"
							onclick={addWave}
						>
							<Plus size={12} />
							Add Wave
						</button>
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
					Save Contract
				</button>
			</div>
		</div>
	</div>
{/if}
