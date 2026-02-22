<script>
	import {
		ShoppingBag,
		Plus,
		Search,
		Building2,
		Star,
		ChevronDown,
		Trash2,
		Check,
		X,
		FileText,
		Calendar,
		BedDouble,
		DollarSign,
		Clock,
		AlertCircle,
		Edit2
	} from 'lucide-svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { hotelStorageStore } from '$lib/stores/hotelStorageStore.svelte.js';
	import { sidebarState } from '$lib/runes/sidebarState.svelte.js';
	import { slide } from 'svelte/transition';

	// ─── State ────────────────────────────────────────────

	let showForm = $state(false);
	let searchQuery = $state('');
	let editingPoId = $state(null);

	// Form state
	let formData = $state({
		sourceType: '',
		hotelId: '',
		contractId: '',
		waveId: '',
		checkIn: '',
		checkOut: '',
		notes: ''
	});

	// Room lines (dynamic list of type + qty + price)
	let roomLines = $state([{ type: 'double', qty: 1, price: '' }]);

	// Saved POs
	let purchaseOrders = $state([
		{
			id: 'PO-001',
			sourceType: 'allotment',
			hotelId: 'h-makkah-001',
			hotelName: 'Swissotel Makkah',
			city: 'Makkah',
			starRating: 5,
			roomLines: [
				{ type: 'double', qty: 3, price: 850000 },
				{ type: 'triple', qty: 2, price: 950000 }
			],
			contractId: 'contract-mak-001',
			contractName: 'Kontrak Test Floor System',
			checkIn: '2026-03-01',
			checkOut: '2026-03-10',
			notes: 'Extra rooms for peak season overflow',
			createdAt: '2026-02-20'
		},
		{
			id: 'PO-002',
			sourceType: 'block-booking',
			hotelId: 'h-madinah-001',
			hotelName: 'Oberoi Madinah',
			city: 'Madinah',
			starRating: 5,
			roomLines: [{ type: 'triple', qty: 2, price: 720000 }],
			contractId: 'contract-mad-001',
			contractName: 'Kontrak Madinah 1',
			checkIn: '2026-03-05',
			checkOut: '2026-03-12',
			notes: 'Block booking full, need additional triple rooms',
			createdAt: '2026-02-21'
		}
	]);

	// ─── Derived ──────────────────────────────────────────

	let hotels = $derived(hotelStorageStore.hotels || []);

	let selectedHotel = $derived(
		formData.hotelId ? hotels.find((h) => h.hotelId === formData.hotelId) : null
	);

	let selectedContracts = $derived(selectedHotel ? selectedHotel.contracts || [] : []);

	let selectedContract = $derived(
		formData.contractId ? selectedContracts.find((c) => c.id === formData.contractId) : null
	);

	let selectedWaves = $derived(selectedContract ? selectedContract.waves || [] : []);

	let selectedWave = $derived(
		formData.waveId ? selectedWaves.find((w) => w.id === formData.waveId) : null
	);

	let filteredPOs = $derived(
		purchaseOrders.filter((po) => {
			if (!searchQuery) return true;
			const q = searchQuery.toLowerCase();
			return (
				po.hotelName.toLowerCase().includes(q) ||
				po.id.toLowerCase().includes(q) ||
				po.roomLines.some((rl) => rl.type.toLowerCase().includes(q))
			);
		})
	);

	const roomTypeOptions = [
		{ value: 'single', label: 'Single', capacity: 1 },
		{ value: 'double', label: 'Double', capacity: 2 },
		{ value: 'triple', label: 'Triple', capacity: 3 },
		{ value: 'quad', label: 'Quad', capacity: 4 },
		{ value: 'quint', label: 'Quint', capacity: 5 }
	];

	const typeColors = {
		single: { bg: '#eff6ff', text: '#3b82f6', border: '#bfdbfe' },
		double: { bg: '#eef2ff', text: '#6366f1', border: '#c7d2fe' },
		triple: { bg: '#ecfdf5', text: '#10b981', border: '#a7f3d0' },
		quad: { bg: '#fffbeb', text: '#f59e0b', border: '#fde68a' },
		quint: { bg: '#fdf2f8', text: '#ec4899', border: '#fbcfe8' }
	};

	// ─── Handlers ─────────────────────────────────────────

	function resetForm() {
		formData = {
			sourceType: '',
			hotelId: '',
			contractId: '',
			waveId: '',
			checkIn: '',
			checkOut: '',
			notes: ''
		};
		roomLines = [{ type: 'double', qty: 1, price: '' }];
		editingPoId = null;
	}

	function addRoomLine() {
		roomLines = [...roomLines, { type: 'double', qty: 1, price: '' }];
	}

	function removeRoomLine(idx) {
		if (roomLines.length <= 1) return;
		roomLines = roomLines.filter((_, i) => i !== idx);
	}

	function openNewPO() {
		resetForm();
		showForm = true;
	}

	function editPO(po) {
		resetForm();
		formData = {
			sourceType: po.sourceType,
			hotelId: po.hotelId,
			contractId: po.contractId || '',
			waveId: po.waveId || '',
			checkIn: po.checkIn,
			checkOut: po.checkOut,
			notes: po.notes || ''
		};
		roomLines = po.roomLines.map((rl) => ({
			...rl,
			qty: rl.qty.toString(),
			price: rl.price.toString()
		}));
		editingPoId = po.id;
		showForm = true;
	}

	function cancelForm() {
		showForm = false;
		resetForm();
	}

	function handleContractChange() {
		formData.waveId = '';
		formData.checkIn = '';
		formData.checkOut = '';
	}

	function handleWaveChange() {
		if (selectedWave) {
			formData.checkIn = selectedWave.start || '';
			formData.checkOut = selectedWave.end || '';
		} else {
			formData.checkIn = '';
			formData.checkOut = '';
		}
	}

	function savePO() {
		const hotel = hotels.find((h) => h.hotelId === formData.hotelId);
		if (!hotel) return;

		const validLines = roomLines.filter((rl) => rl.qty > 0 && rl.price);
		if (validLines.length === 0) return;

		const contract = selectedContracts.find((c) => c.id === formData.contractId);

		const newPOData = {
			id: editingPoId || `PO-${String(purchaseOrders.length + 1).padStart(3, '0')}`,
			sourceType: formData.sourceType,
			hotelId: formData.hotelId,
			hotelName: hotel.hotelName,
			city: hotel.city,
			starRating: hotel.starRating,
			contractId: formData.contractId,
			contractName: contract?.name || '-',
			roomLines: validLines.map((rl) => ({
				type: rl.type,
				qty: parseInt(rl.qty) || 1,
				price: parseInt(rl.price) || 0
			})),
			checkIn: formData.checkIn,
			checkOut: formData.checkOut,
			notes: formData.notes,
			createdAt: editingPoId
				? purchaseOrders.find((po) => po.id === editingPoId)?.createdAt
				: new Date().toISOString().split('T')[0]
		};

		if (editingPoId) {
			purchaseOrders = purchaseOrders.map((po) => (po.id === editingPoId ? newPOData : po));
		} else {
			purchaseOrders = [newPOData, ...purchaseOrders];
		}

		showForm = false;
		resetForm();
	}

	function deletePO(poId) {
		purchaseOrders = purchaseOrders.filter((po) => po.id !== poId);
	}

	function formatCurrency(n) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(n);
	}

	function getNights(checkIn, checkOut) {
		if (!checkIn || !checkOut) return 0;
		const diff = new Date(checkOut) - new Date(checkIn);
		return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
	}

	function getPoTotal(po) {
		const nights = getNights(po.checkIn, po.checkOut);
		return po.roomLines.reduce((sum, rl) => sum + nights * rl.price * rl.qty, 0);
	}

	function getTotalRooms(po) {
		return po.roomLines.reduce((sum, rl) => sum + rl.qty, 0);
	}
</script>

<div class="flex min-h-screen bg-gray-50 font-sans">
	<Sidebar activePage="purchase-order" />

	<main
		class="flex flex-1 flex-col overflow-hidden px-6 py-6 transition-all duration-300"
		style="margin-left: {sidebarState.isCollapsed ? '72px' : '230px'}"
	>
		<!-- Header -->
		<div class="mb-5 flex items-center justify-between">
			<div class="flex items-center gap-3">
				<div
					class="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-[#972395]"
				>
					<ShoppingBag size={20} />
				</div>
				<div>
					<h1 class="text-xl font-bold text-gray-900">Purchase Order</h1>
					<p class="text-sm text-gray-500">
						Beli kamar hotel tambahan saat allotment/block booking penuh
					</p>
				</div>
			</div>
			<button
				class="flex items-center gap-2 rounded-lg bg-[#972395] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#7a1c78] hover:shadow-md"
				onclick={openNewPO}
			>
				<Plus size={18} />
				Buat PO Baru
			</button>
		</div>

		<!-- Search Bar -->
		<div class="mb-4 flex items-center gap-3">
			<div class="relative max-w-md flex-1">
				<Search size={16} class="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
				<input
					type="text"
					placeholder="Cari berdasarkan hotel, PO ID, atau tipe kamar..."
					class="w-full rounded-lg border border-gray-200 bg-white py-2.5 pr-4 pl-10 text-sm text-gray-900 transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
					bind:value={searchQuery}
				/>
			</div>
			<div
				class="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500"
			>
				<FileText size={14} />
				<span>{purchaseOrders.length} Purchase Orders</span>
			</div>
		</div>

		<!-- New PO Form -->
		{#if showForm}
			<div
				class="mb-5 rounded-xl border border-purple-200 bg-white p-6 shadow-sm"
				transition:slide={{ duration: 200 }}
			>
				<div class="mb-5 flex items-center justify-between">
					<h2 class="text-base font-semibold text-gray-900">
						{editingPoId ? '📝 Edit Purchase Order' : '📝 Buat Purchase Order Baru'}
					</h2>
					<button
						class="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
						onclick={cancelForm}
					>
						<X size={18} />
					</button>
				</div>

				<div class="grid grid-cols-2 gap-x-6 gap-y-4">
					<!-- Source Type -->
					<div>
						<label class="mb-1.5 block text-xs font-semibold tracking-wide text-gray-600 uppercase"
							>Sumber</label
						>
						<div class="flex gap-2">
							<button
								class="flex-1 rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-all
									{formData.sourceType === 'allotment'
									? 'border-indigo-500 bg-indigo-50 text-indigo-700'
									: 'border-gray-200 text-gray-500 hover:border-gray-300'}"
								onclick={() => (formData.sourceType = 'allotment')}
							>
								<Building2 size={16} class="mx-auto mb-1" />
								Allotment
							</button>
							<button
								class="flex-1 rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-all
									{formData.sourceType === 'block-booking'
									? 'border-blue-500 bg-blue-50 text-blue-700'
									: 'border-gray-200 text-gray-500 hover:border-gray-300'}"
								onclick={() => (formData.sourceType = 'block-booking')}
							>
								<BedDouble size={16} class="mx-auto mb-1" />
								Block Booking
							</button>
						</div>
					</div>

					<!-- Hotel Selection -->
					<div>
						<label class="mb-1.5 block text-xs font-semibold tracking-wide text-gray-600 uppercase"
							>Untuk Hotel</label
						>
						<select
							class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
							bind:value={formData.hotelId}
							onchange={() => {
								formData.contractId = '';
								formData.waveId = '';
								formData.checkIn = '';
								formData.checkOut = '';
							}}
						>
							<option value="">-- Pilih Hotel --</option>
							{#each hotels as hotel}
								<option value={hotel.hotelId}
									>{hotel.hotelName} — {hotel.city} {'⭐'.repeat(hotel.starRating)}</option
								>
							{/each}
						</select>
					</div>

					<!-- Contract Selection -->
					<div>
						<label class="mb-1.5 block text-xs font-semibold tracking-wide text-gray-600 uppercase"
							>Terkait Kontrak</label
						>
						<select
							class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395] disabled:bg-gray-100 disabled:text-gray-400"
							bind:value={formData.contractId}
							disabled={!formData.hotelId}
							onchange={handleContractChange}
						>
							<option value="">-- Pilih Kontrak --</option>
							{#each selectedContracts as contract}
								<option value={contract.id}>{contract.name}</option>
							{/each}
						</select>
					</div>

					<!-- Date / Wave Selection -->
					<div class="col-span-1">
						<label class="mb-1.5 block text-xs font-semibold tracking-wide text-gray-600 uppercase"
							>Pilih Gelombang Trip</label
						>
						<select
							class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395] disabled:bg-gray-100 disabled:text-gray-400"
							bind:value={formData.waveId}
							disabled={!formData.contractId}
							onchange={handleWaveChange}
						>
							<option value="">-- Pilih Gelombang --</option>
							{#each selectedWaves as wave}
								<option value={wave.id}>{wave.name} ({wave.start})</option>
							{/each}
						</select>
					</div>

					<!-- Date Info -->
					<div class="col-span-1">
						<label class="mb-1.5 block text-xs font-semibold tracking-wide text-gray-600 uppercase"
							>Durasi Check-in & Check-out</label
						>
						<div
							class="flex h-[42px] w-full items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-500"
						>
							{#if formData.checkIn && formData.checkOut}
								<Calendar size={14} class="text-gray-400" />
								<span>{formData.checkIn}</span>
								<span class="text-gray-300">→</span>
								<span>{formData.checkOut}</span>
							{:else}
								<span class="text-gray-400 italic">Pilih gelombang terlebih dahulu</span>
							{/if}
						</div>
					</div>

					<!-- Room Lines (dynamic) -->
					<div class="col-span-2">
						<label class="mb-2 flex items-center justify-between">
							<span class="text-xs font-semibold tracking-wide text-gray-600 uppercase"
								>Tipe Kamar & Quantity</span
							>
							<button
								class="flex items-center gap-1 rounded-md border border-purple-200 bg-purple-50 px-2 py-1 text-[11px] font-medium text-[#972395] transition-colors hover:bg-purple-100"
								onclick={addRoomLine}
							>
								<Plus size={12} />
								Tambah Tipe
							</button>
						</label>

						<div class="space-y-2">
							{#each roomLines as line, idx}
								{@const tc = typeColors[line.type] || typeColors.double}
								<div
									class="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 p-2.5"
								>
									<!-- Room type selector -->
									<div class="flex flex-wrap gap-1">
										{#each roomTypeOptions as opt}
											{@const optTc = typeColors[opt.value]}
											<button
												class="rounded-md border px-2 py-1 text-[11px] font-semibold transition-all"
												style={line.type === opt.value
													? `border-color:${optTc.text}; background:${optTc.bg}; color:${optTc.text}`
													: 'border-color:#e5e7eb; color:#9ca3af; background:white'}
												onclick={() => (roomLines[idx].type = opt.value)}
											>
												{opt.label}
											</button>
										{/each}
									</div>

									<!-- Qty -->
									<div class="ml-auto flex items-center gap-1">
										<span class="text-[10px] font-medium text-gray-400 uppercase">Qty</span>
										<input
											type="number"
											min="1"
											max="50"
											class="w-16 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-center text-sm font-semibold text-gray-900 outline-none focus:border-[#972395]"
											bind:value={roomLines[idx].qty}
										/>
									</div>

									<!-- Price -->
									<div class="flex items-center gap-1">
										<span class="text-[10px] font-medium text-gray-400">Rp</span>
										<input
											type="number"
											placeholder="850000"
											class="w-28 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-900 outline-none focus:border-[#972395]"
											bind:value={roomLines[idx].price}
										/>
										<span class="text-[10px] whitespace-nowrap text-gray-400">/malam</span>
									</div>

									<!-- Remove -->
									{#if roomLines.length > 1}
										<button
											class="rounded-md p-1 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500"
											onclick={() => removeRoomLine(idx)}
										>
											<Trash2 size={14} />
										</button>
									{/if}
								</div>
							{/each}
						</div>

						<!-- Summary -->
						{#if formData.checkIn && formData.checkOut && roomLines.some((rl) => rl.price)}
							{@const nights = getNights(formData.checkIn, formData.checkOut)}
							{@const grandTotal = roomLines.reduce(
								(sum, rl) => sum + nights * (parseInt(rl.price) || 0) * (parseInt(rl.qty) || 1),
								0
							)}
							{@const totalRooms = roomLines.reduce((sum, rl) => sum + (parseInt(rl.qty) || 0), 0)}
							<div class="mt-3 rounded-lg border border-purple-100 bg-purple-50 p-3">
								<div class="mb-1 flex justify-between text-xs text-gray-500">
									<span>{totalRooms} kamar × {nights} malam</span>
									<span class="text-sm font-bold text-gray-900">{formatCurrency(grandTotal)}</span>
								</div>
								{#each roomLines.filter((rl) => rl.price) as rl}
									{@const rlTc = typeColors[rl.type] || typeColors.double}
									<div class="flex justify-between text-[11px] text-gray-400">
										<span
											><span class="font-semibold" style="color:{rlTc.text}"
												>{rl.type.toUpperCase()}</span
											>
											× {rl.qty}</span
										>
										<span
											>{formatCurrency(
												nights * (parseInt(rl.price) || 0) * (parseInt(rl.qty) || 1)
											)}</span
										>
									</div>
								{/each}
							</div>
						{/if}
					</div>

					<!-- Notes -->
					<div class="col-span-2">
						<label class="mb-1.5 block text-xs font-semibold tracking-wide text-gray-600 uppercase"
							>Catatan</label
						>
						<textarea
							rows="2"
							placeholder="Alasan PO, catatan tambahan..."
							class="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
							bind:value={formData.notes}
						></textarea>
					</div>
				</div>

				<!-- Actions -->
				<div class="mt-5 flex items-center justify-end border-t border-gray-100 pt-4">
					<div class="flex gap-2">
						<button
							class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
							onclick={cancelForm}
						>
							Batal
						</button>
						<button
							class="flex items-center gap-2 rounded-lg bg-[#972395] px-5 py-2 text-sm font-medium text-white transition-all hover:bg-[#7a1c78] disabled:opacity-50"
							onclick={savePO}
							disabled={!formData.sourceType ||
								!formData.hotelId ||
								!formData.checkIn ||
								!formData.checkOut ||
								!roomLines.some((rl) => rl.price && rl.qty > 0)}
						>
							<Check size={16} />
							{editingPoId ? 'Simpan Perubahan' : 'Simpan PO Baru'}
						</button>
					</div>
				</div>
			</div>
		{/if}

		<!-- PO List -->
		<div class="space-y-3">
			{#each filteredPOs as po (po.id)}
				{@const nights = getNights(po.checkIn, po.checkOut)}
				{@const total = getPoTotal(po)}
				{@const totalRooms = getTotalRooms(po)}
				<div
					class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
				>
					<div class="flex items-start gap-4 p-5">
						<!-- Left: Hotel info -->
						<div
							class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-[#972395]"
						>
							<Building2 size={20} />
						</div>
						<div class="min-w-0 flex-1">
							<div class="flex items-center gap-2">
								<span class="text-xs font-bold text-gray-400">{po.id}</span>
								<span
									class="rounded-md px-1.5 py-0.5 text-[10px] font-medium"
									style="background:{po.sourceType === 'block-booking'
										? '#dbeafe'
										: '#eef2ff'}; color:{po.sourceType === 'block-booking' ? '#2563eb' : '#4f46e5'}"
								>
									{po.sourceType === 'block-booking' ? 'Block Booking' : 'Allotment'}
								</span>
							</div>
							<h3 class="mt-0.5 font-semibold text-gray-900">{po.hotelName}</h3>
							<div class="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
								<span class="flex items-center gap-1"><Building2 size={11} />{po.city}</span>
								<span class="flex items-center gap-1">
									<BedDouble size={11} />
									{#each po.roomLines as rl, rIdx}
										{@const rlTc = typeColors[rl.type] || typeColors.double}
										{#if rIdx > 0}<span class="text-gray-300">+</span>{/if}
										<span class="font-medium" style="color:{rlTc.text}"
											>{rl.type.toUpperCase()}</span
										>×{rl.qty}
									{/each}
									<span class="text-gray-400">({totalRooms} kamar)</span>
								</span>
								<span class="flex items-center gap-1">
									<Calendar size={11} />{po.checkIn} → {po.checkOut} ({nights} malam)
								</span>
							</div>
							{#if po.notes}
								<p class="mt-1.5 text-xs text-gray-400 italic">"{po.notes}"</p>
							{/if}
						</div>

						<!-- Right: Price & Actions -->
						<div class="flex shrink-0 flex-col items-end gap-2">
							<div class="text-right">
								<div class="text-xs text-gray-400">Total Estimasi</div>
								<div class="text-lg font-bold text-gray-900">{formatCurrency(total)}</div>
								<div class="text-[10px] text-gray-400">
									{totalRooms} kamar × {nights} malam
								</div>
							</div>
							<div class="flex gap-1">
								<button
									class="flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-100"
									onclick={() => editPO(po)}
								>
									<Edit2 size={12} />
									Edit
								</button>
								<button
									class="flex items-center gap-1 rounded-md bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
									onclick={() => deletePO(po.id)}
								>
									<Trash2 size={12} />
									Hapus
								</button>
							</div>
						</div>
					</div>
				</div>
			{/each}

			{#if filteredPOs.length === 0}
				<div
					class="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16 text-center"
				>
					<div class="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
						<ShoppingBag size={28} class="text-gray-400" />
					</div>
					<h3 class="text-sm font-semibold text-gray-600">
						{searchQuery ? 'Tidak ada PO yang sesuai' : 'Belum ada Purchase Order'}
					</h3>
					<p class="mt-1 max-w-xs text-xs text-gray-400">
						{searchQuery
							? 'Coba kata kunci lain'
							: 'Klik "Buat PO Baru" untuk membeli kamar hotel tambahan saat allotment atau block booking penuh.'}
					</p>
					{#if !searchQuery}
						<button
							class="mt-4 flex items-center gap-1.5 rounded-lg bg-[#972395] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#7a1c78]"
							onclick={openNewPO}
						>
							<Plus size={16} />
							Buat PO Pertama
						</button>
					{/if}
				</div>
			{/if}
		</div>
	</main>
</div>
