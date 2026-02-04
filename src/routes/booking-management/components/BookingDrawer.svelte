<script>
	import {
		X,
		Package,
		Calendar,
		MapPin,
		Clock,
		User,
		Mail,
		Phone,
		Check,
		CreditCard,
		Building2,
		ChevronDown,
		Plus,
		Eye,
		Briefcase,
		Pencil
	} from 'lucide-svelte';
	import { fade, slide, fly, scale } from 'svelte/transition';
	import { cubicOut, elasticOut, quintOut } from 'svelte/easing';

	let { showDrawer, closeDrawer, existingData } = $props();

	let isBranchDropdownOpen = $state(false);
	let showQuickAddModal = $state(false);
	let activeTab = $state('summary'); // 'summary' | 'applicant' | 'pilgrims'

	const branches = ['Kota Bharu', 'Kuala Lumpur', 'Kuala Terengganu', 'Alor Setar', 'Lembah Klang'];

	// Default Mock data (fallback)
	let bookingDetails = $state({
		packageName: 'SV 05 DEC 2026 (DAN/ELA) - UMRAH ZIARAH CAIRO',
		bookingDate: '09 Desember 2025',
		status: 'Paid',
		sector: 'KUL JED - JED CAI - CAI MED - JED KUL',
		duration: '14H 12M',
		totalPrice: 'RM 13,290.00',
		deposit: 'RM 500.00',
		paid: 'RM 500.00',
		balance: 'RM 12,790.00',
		paymentMethod: 'FPX',
		agent: 'Rayhar HQ',
		branch: 'Kota Bharu',
		primaryPilgrim: {
			name: 'Uponk',
			ic: '031104-01-9932',
			email: 'bookumrah1@gmail.com',
			phone: '+6285733235489',
			dob: '04 November 2003',
			gender: 'Wanita',
			roomType: 'Quad',
			address: 'No 123, Jalan Manggis, Kg Baru, 15400 Kota Bharu, Kelantan'
		},
		pilgrims: [
			{
				no: 1,
				name: 'Uponk',
				ic: '031104-01-9932',
				email: 'bookumrah1@gmail.com',
				phone: '+6285733235489',
				registrant: true,
				gender: 'Lelaki',
				roomType: 'Quad',
				dataStatus: 'Lengkap'
			},
			{
				no: 2,
				name: 'Siti Aisyah',
				ic: '050120-01-8821',
				email: '-',
				phone: '-',
				registrant: false,
				gender: 'Perempuan',
				roomType: 'Quad',
				dataStatus: 'Tidak Lengkap'
			}
		]
	});

	$effect(() => {
		if (existingData) {
			bookingDetails.packageName = existingData.packageName || bookingDetails.packageName;
			bookingDetails.bookingDate = existingData.date || bookingDetails.bookingDate;
			bookingDetails.status = existingData.status || bookingDetails.status;
			bookingDetails.deposit = existingData.deposit || bookingDetails.deposit;
			bookingDetails.paymentMethod = existingData.paymentMethod || bookingDetails.paymentMethod;
			bookingDetails.agent = existingData.agent || bookingDetails.agent;
			bookingDetails.branch = existingData.branch || bookingDetails.branch;

			bookingDetails.primaryPilgrim.name =
				existingData.applicantName || bookingDetails.primaryPilgrim.name;
			bookingDetails.primaryPilgrim.ic = existingData.ic || bookingDetails.primaryPilgrim.ic;
			bookingDetails.primaryPilgrim.address =
				existingData.address || bookingDetails.primaryPilgrim.address;
			bookingDetails.primaryPilgrim.roomType =
				existingData.pilgrims?.[0]?.roomType || bookingDetails.primaryPilgrim.roomType;

			bookingDetails.duration = existingData.duration || bookingDetails.duration;
			bookingDetails.sector = existingData.sector || bookingDetails.sector;
			bookingDetails.pilgrims = existingData.pilgrims || bookingDetails.pilgrims;
		}
	});
</script>

{#if showDrawer}
	<!-- Backdrop with blur -->
	<div
		class="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
		in:fade={{ duration: 300, easing: cubicOut }}
		out:fade={{ duration: 200, easing: cubicOut }}
		onclick={closeDrawer}
	></div>

	<!-- Drawer with smooth slide -->
	<div
		class="fixed inset-y-0 right-0 z-50 flex w-full max-w-3xl flex-col bg-white shadow-2xl"
		in:fly={{ x: 600, duration: 500, easing: quintOut }}
		out:fly={{ x: 400, duration: 300, easing: cubicOut }}
	>
		<!-- Header with subtle fade in -->
		<div
			class="flex items-center justify-between border-b border-gray-100 px-6 py-4"
			in:fly={{ y: -20, duration: 400, delay: 200, easing: cubicOut }}
		>
			<div class="flex items-center gap-2">
				<div
					class="rounded-lg bg-purple-50 p-2"
					in:scale={{ duration: 400, delay: 300, start: 0.5, easing: elasticOut }}
				>
					<Package class="text-[#972395]" size={20} />
				</div>
				<div>
					<h2 class="text-base font-bold text-gray-900">Maklumat Tempahan Umrah</h2>
					<p class="text-[11px] text-gray-500 uppercase">{bookingDetails.packageName}</p>
				</div>
			</div>
			<button
				class="rounded-full p-2 text-gray-400 transition-all duration-200 hover:rotate-90 hover:bg-gray-100 hover:text-gray-600"
				onclick={closeDrawer}
				in:scale={{ duration: 400, delay: 400, start: 0, easing: elasticOut }}
			>
				<X size={20} />
			</button>
		</div>

		<!-- Tab Navigation with stagger -->
		<div
			class="border-b border-gray-100 px-6"
			in:fly={{ y: -10, duration: 400, delay: 300, easing: cubicOut }}
		>
			<div class="flex gap-6">
				<button
					class="relative pb-3 text-sm font-medium transition-all duration-300 hover:text-[#972395] {activeTab ===
					'summary'
						? 'text-[#972395]'
						: 'text-gray-500'}"
					onclick={() => (activeTab = 'summary')}
				>
					Ringkasan Pakej
					{#if activeTab === 'summary'}
						<div
							class="absolute right-0 bottom-0 left-0 h-0.5 bg-[#972395]"
							in:fly={{ y: 5, duration: 300, easing: cubicOut }}
						></div>
					{/if}
				</button>
				<button
					class="relative pb-3 text-sm font-medium transition-all duration-300 hover:text-[#972395] {activeTab ===
					'applicant'
						? 'text-[#972395]'
						: 'text-gray-500'}"
					onclick={() => (activeTab = 'applicant')}
				>
					Maklumat Pemohon
					{#if activeTab === 'applicant'}
						<div
							class="absolute right-0 bottom-0 left-0 h-0.5 bg-[#972395]"
							in:fly={{ y: 5, duration: 300, easing: cubicOut }}
						></div>
					{/if}
				</button>
				<button
					class="relative pb-3 text-sm font-medium transition-all duration-300 hover:text-[#972395] {activeTab ===
					'pilgrims'
						? 'text-[#972395]'
						: 'text-gray-500'}"
					onclick={() => (activeTab = 'pilgrims')}
				>
					Senarai Jemaah
					<span
						class="ml-1 rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600 transition-all duration-300 {activeTab ===
						'pilgrims'
							? 'scale-110 bg-purple-100 text-[#972395]'
							: ''}"
					>
						{bookingDetails.pilgrims.length}
					</span>
					{#if activeTab === 'pilgrims'}
						<div
							class="absolute right-0 bottom-0 left-0 h-0.5 bg-[#972395]"
							in:fly={{ y: 5, duration: 300, easing: cubicOut }}
						></div>
					{/if}
				</button>
			</div>
		</div>

		<!-- Content -->
		<div class="flex-1 overflow-y-auto bg-gray-50/50 p-6">
			<div class="space-y-6">
				{#if activeTab === 'summary'}
					<!-- 1. Ringkasan Pakej -->
					<section
						class="rounded-xl border border-gray-200 bg-white shadow-sm"
						in:fly={{ x: 50, duration: 400, delay: 50, easing: cubicOut }}
						out:fly={{ x: -50, duration: 200, easing: cubicOut }}
					>
						<div class="p-5">
							<h4
								class="mb-4 text-sm font-bold text-gray-900"
								in:fly={{ y: 10, duration: 400, delay: 150, easing: cubicOut }}
							>
								{bookingDetails.packageName}
							</h4>

							<div
								class="grid grid-cols-2 gap-x-12 gap-y-6"
								in:fly={{ y: 10, duration: 400, delay: 200, easing: cubicOut }}
							>
								<div in:scale={{ duration: 300, delay: 250, start: 0.95, easing: cubicOut }}>
									<span class="mb-1 block text-xs text-gray-500">Tarikh Tempahan</span>
									<div class="flex items-center gap-2 text-sm font-medium text-gray-900">
										<Calendar size={14} class="text-gray-400" />
										{bookingDetails.bookingDate}
									</div>
								</div>
								<div in:scale={{ duration: 300, delay: 300, start: 0.95, easing: cubicOut }}>
									<span class="mb-1 block text-xs text-gray-500">Status Tempahan</span>
									<span
										class="inline-flex rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-700"
									>
										{bookingDetails.status}
									</span>
								</div>
								<div
									class="col-span-2 border-t border-gray-100 pt-4"
									in:scale={{ duration: 300, delay: 350, start: 0.95, easing: cubicOut }}
								>
									<span class="mb-1 block text-xs text-gray-500">Destinasi</span>
									<div class="text-sm font-medium text-gray-900">{bookingDetails.sector}</div>
								</div>
								<div
									class="border-t border-gray-100 pt-4"
									in:scale={{ duration: 300, delay: 400, start: 0.95, easing: cubicOut }}
								>
									<span class="mb-1 block text-xs text-gray-500">Tempoh</span>
									<div class="text-sm font-medium text-gray-900">{bookingDetails.duration}</div>
								</div>
								<div
									class="border-t border-gray-100 pt-4"
									in:scale={{ duration: 300, delay: 450, start: 0.95, easing: cubicOut }}
								>
									<span class="mb-1 block text-xs text-gray-500">Agent</span>
									<div class="flex items-center gap-2 text-sm font-medium text-gray-900">
										<Briefcase size={14} class="text-gray-400" />
										{bookingDetails.agent}
									</div>
								</div>
								<div
									class="border-t border-gray-100 pt-4"
									in:scale={{ duration: 300, delay: 500, start: 0.95, easing: cubicOut }}
								>
									<span class="mb-1 block text-xs text-gray-500">Cara Bayaran</span>
									<div class="flex items-center gap-2 text-sm font-medium text-gray-900">
										<CreditCard size={14} class="text-gray-400" />
										{bookingDetails.paymentMethod}
									</div>
								</div>
								<div
									class="border-t border-gray-100 pt-4"
									in:scale={{ duration: 300, delay: 550, start: 0.95, easing: cubicOut }}
								>
									<span class="mb-1 block text-xs text-gray-500">Cawangan</span>
									<div class="relative">
										<button
											class="flex items-center gap-2 text-sm font-medium text-gray-900 transition-colors hover:text-gray-700 focus:outline-none"
											onclick={() => (isBranchDropdownOpen = !isBranchDropdownOpen)}
										>
											<Building2 size={14} class="text-gray-400" />
											<span>{bookingDetails.branch}</span>
											<ChevronDown
												size={14}
												class="text-gray-400 transition-transform duration-200 {isBranchDropdownOpen
													? 'rotate-180'
													: ''}"
											/>
										</button>

										{#if isBranchDropdownOpen}
											<div
												class="absolute top-full left-0 z-10 mt-1 w-48 rounded-lg border border-gray-100 bg-white shadow-lg ring-1 ring-black/5"
												transition:slide={{ duration: 150 }}
											>
												<div class="py-1">
													{#each branches as branch}
														<button
															class="block w-full px-4 py-2 text-left text-xs text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900 {bookingDetails.branch ===
															branch
																? 'bg-gray-50 font-medium text-[#972395]'
																: ''}"
															onclick={() => {
																bookingDetails.branch = branch;
																isBranchDropdownOpen = false;
															}}
														>
															{branch}
														</button>
													{/each}
												</div>
											</div>
										{/if}
									</div>
								</div>
							</div>

							<div
								class="mt-6 grid grid-cols-4 gap-4 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100/50 p-4 shadow-inner"
								in:fly={{ y: 20, duration: 400, delay: 600, easing: cubicOut }}
							>
								<div in:scale={{ duration: 300, delay: 650, start: 0.9, easing: cubicOut }}>
									<span class="block text-[11px] text-gray-500">Jumlah Harga</span>
									<span class="block text-base font-bold text-gray-900"
										>{bookingDetails.totalPrice}</span
									>
								</div>
								<div in:scale={{ duration: 300, delay: 700, start: 0.9, easing: cubicOut }}>
									<span class="block text-[11px] text-gray-500">Deposit</span>
									<span class="block text-base font-bold text-green-600"
										>{bookingDetails.deposit}</span
									>
								</div>
								<div in:scale={{ duration: 300, delay: 750, start: 0.9, easing: cubicOut }}>
									<span class="block text-[11px] text-gray-500">Jumlah Dibayar</span>
									<span class="block text-base font-bold text-blue-600">{bookingDetails.paid}</span>
								</div>
								<div in:scale={{ duration: 300, delay: 800, start: 0.9, easing: cubicOut }}>
									<span class="block text-[11px] text-gray-500">Baki Harga</span>
									<span class="block text-base font-bold text-orange-600"
										>{bookingDetails.balance}</span
									>
								</div>
							</div>
						</div>
					</section>
				{/if}

				{#if activeTab === 'applicant'}
					<!-- 2. Maklumat Jemaah (Applicant) -->
					<section
						class="rounded-xl border border-gray-200 bg-white shadow-sm"
						in:fly={{ x: 50, duration: 400, delay: 50, easing: cubicOut }}
						out:fly={{ x: -50, duration: 200, easing: cubicOut }}
					>
						<div class="p-5">
							<div
								class="grid grid-cols-2 gap-x-12 gap-y-6"
								in:fly={{ y: 10, duration: 400, delay: 150, easing: cubicOut }}
							>
								<div in:scale={{ duration: 300, delay: 200, start: 0.95, easing: cubicOut }}>
									<span class="mb-1 block text-xs text-gray-500">Nama Penuh</span>
									<div class="text-sm font-medium text-gray-900">
										{bookingDetails.primaryPilgrim.name}
									</div>
								</div>
								<div in:scale={{ duration: 300, delay: 250, start: 0.95, easing: cubicOut }}>
									<span class="mb-1 block text-xs text-gray-500">No K/P / NIK</span>
									<div class="text-sm font-medium text-gray-900">
										{bookingDetails.primaryPilgrim.ic}
									</div>
								</div>
								<div in:scale={{ duration: 300, delay: 300, start: 0.95, easing: cubicOut }}>
									<span class="mb-1 block text-xs text-gray-500">Emel</span>
									<div class="flex items-center gap-2 text-sm font-medium text-gray-900">
										<Mail size={14} class="text-gray-400" />
										{bookingDetails.primaryPilgrim.email}
									</div>
								</div>
								<div in:scale={{ duration: 300, delay: 350, start: 0.95, easing: cubicOut }}>
									<span class="mb-1 block text-xs text-gray-500">No Telefon</span>
									<div class="flex items-center gap-2 text-sm font-medium text-gray-900">
										<Phone size={14} class="text-gray-400" />
										{bookingDetails.primaryPilgrim.phone}
									</div>
								</div>
								<div
									class="col-span-2 border-t border-gray-100 pt-4"
									in:scale={{ duration: 300, delay: 400, start: 0.95, easing: cubicOut }}
								>
									<span class="mb-1 block text-xs text-gray-500">Alamat</span>
									<div class="flex items-start gap-2 text-sm font-medium text-gray-900">
										<MapPin size={14} class="mt-0.5 shrink-0 text-gray-400" />
										{bookingDetails.primaryPilgrim.address}
									</div>
								</div>
								<div
									class="border-t border-gray-100 pt-4"
									in:scale={{ duration: 300, delay: 450, start: 0.95, easing: cubicOut }}
								>
									<span class="mb-1 block text-xs text-gray-500">Tarikh Lahir</span>
									<div class="text-sm font-medium text-gray-900">
										{bookingDetails.primaryPilgrim.dob}
									</div>
								</div>
								<div
									class="border-t border-gray-100 pt-4"
									in:scale={{ duration: 300, delay: 500, start: 0.95, easing: cubicOut }}
								>
									<span class="mb-1 block text-xs text-gray-500">Jantina</span>
									<div class="text-sm font-medium text-gray-900">
										{bookingDetails.primaryPilgrim.gender}
									</div>
								</div>
								<div
									class="border-t border-gray-100 pt-4"
									in:scale={{ duration: 300, delay: 550, start: 0.95, easing: cubicOut }}
								>
									<span class="mb-1 block text-xs text-gray-500">Bilik</span>
									<div class="text-sm font-medium text-gray-900">
										{bookingDetails.primaryPilgrim.roomType}
									</div>
								</div>
							</div>
						</div>
					</section>
				{/if}

				{#if activeTab === 'pilgrims'}
					<!-- 3. Jumlah Jemaah List -->
					<section
						class="rounded-xl border border-gray-200 bg-white shadow-sm"
						in:fly={{ x: 50, duration: 400, delay: 50, easing: cubicOut }}
						out:fly={{ x: -50, duration: 200, easing: cubicOut }}
					>
						<div
							class="flex items-center justify-between border-b border-gray-100 px-5 py-4"
							in:fly={{ y: -10, duration: 400, delay: 150, easing: cubicOut }}
						>
							<div class="flex items-center gap-2">
								<div
									class="rounded-lg bg-purple-50 p-1.5"
									in:scale={{ duration: 400, delay: 200, start: 0.5, easing: elasticOut }}
								>
									<User size={16} class="text-[#972395]" />
								</div>
								<h3 class="text-sm font-bold text-gray-900">Senarai Jemaah</h3>
							</div>
							<button
								class="flex items-center gap-1.5 rounded-md border border-[#972395] bg-[#972395] px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-all duration-200 hover:scale-105 hover:bg-[#801e80] hover:shadow-md"
								in:scale={{ duration: 400, delay: 250, start: 0.8, easing: elasticOut }}
								onclick={() => (showQuickAddModal = true)}
							>
								<Plus size={14} />
								Quick Add Jemaah
							</button>
						</div>
						<div class="p-5" in:fly={{ y: 10, duration: 400, delay: 200, easing: cubicOut }}>
							<div class="overflow-x-auto rounded-lg border border-gray-200">
								<table class="w-full text-left text-xs">
									<thead class="bg-gray-50 text-gray-500">
										<tr>
											<th class="px-2 py-3 font-medium">No</th>
											<th class="px-4 py-3 font-medium">Nama Jemaah</th>
											<th class="px-4 py-3 font-medium">No K/P</th>
											<th class="px-2 py-3 font-medium">Jantina</th>
											<th class="px-2 py-3 font-medium">Bilik</th>
											<th class="px-4 py-3 font-medium">Telefon</th>
											<th class="px-2 py-3 text-center font-medium">Registrant</th>
											<th class="px-2 py-3 text-center font-medium">Status Data</th>
											<th class="px-2 py-3 text-center font-medium"></th>
										</tr>
									</thead>
									<tbody class="divide-y divide-gray-100 bg-white">
										{#each bookingDetails.pilgrims as pilgrim, i}
											<tr
												in:fly={{
													y: 20,
													duration: 300,
													delay: 300 + i * 100,
													easing: cubicOut
												}}
												class="group transition-colors duration-150 hover:bg-purple-50/30"
											>
												<td class="px-2 py-3 text-gray-500">{pilgrim.no}</td>
												<td class="px-4 py-3 font-medium whitespace-nowrap text-gray-900"
													>{pilgrim.name}</td
												>
												<td class="px-4 py-3 whitespace-nowrap text-gray-600">{pilgrim.ic}</td>
												<td class="px-2 py-3 text-gray-600">{pilgrim.gender}</td>
												<td class="px-2 py-3 text-gray-600">{pilgrim.roomType}</td>
												<td class="px-4 py-3 whitespace-nowrap text-gray-600">{pilgrim.phone}</td>
												<td class="px-2 py-3 text-center">
													{#if pilgrim.registrant}
														<div
															class="mx-auto flex h-5 w-5 items-center justify-center rounded bg-[#972395] text-white shadow-sm"
															in:scale={{
																duration: 400,
																delay: 400 + i * 100,
																start: 0.3,
																easing: elasticOut
															}}
														>
															<Check size={12} strokeWidth={3} />
														</div>
													{/if}
												</td>
												<td class="px-2 py-3 text-center">
													<span
														class="text-[10px] font-bold {pilgrim.dataStatus === 'Lengkap'
															? 'text-green-600'
															: 'text-red-500'}"
													>
														{pilgrim.dataStatus}
													</span>
												</td>
												<td class="px-2 py-3 text-center">
													<a
														href="/booking-management/pilgrim-details/{pilgrim.ic}?bookingId={existingData?.id}"
														class="inline-flex items-center justify-center rounded-full p-1.5 text-gray-400 transition-all duration-200 hover:scale-110 hover:bg-purple-50 hover:text-[#972395]"
														title="Edit"
													>
														<Pencil size={14} />
													</a>
												</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						</div>
					</section>
				{/if}
			</div>
		</div>
	</div>

	<!-- Quick Add Modal -->
	{#if showQuickAddModal}
		<div
			class="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
			in:fade={{ duration: 200 }}
			out:fade={{ duration: 150 }}
			onclick={() => (showQuickAddModal = false)}
			role="button"
			tabindex="0"
			onkeydown={(e) => e.key === 'Escape' && (showQuickAddModal = false)}
		>
			<div
				class="w-full max-w-md scale-100 rounded-2xl bg-white p-6 shadow-2xl"
				in:scale={{ duration: 400, start: 0.8, easing: elasticOut }}
				out:scale={{ duration: 200, start: 0.95, opacity: 0 }}
				onclick={(e) => e.stopPropagation()}
				role="dialog"
				aria-modal="true"
			>
				<div class="mb-6 flex items-center justify-between">
					<h3 class="text-lg font-bold text-gray-900">Tambah Jemaah Pantas</h3>
					<button
						class="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
						onclick={() => (showQuickAddModal = false)}
					>
						<X size={20} />
					</button>
				</div>

				<div class="space-y-4">
					<div>
						<label for="name" class="mb-1.5 block text-xs font-medium text-gray-700"
							>Nama Penuh</label
						>
						<div class="relative">
							<User size={16} class="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
							<input
								type="text"
								id="name"
								placeholder="Masukkan nama penuh"
								class="w-full rounded-lg border border-gray-200 py-2.5 pr-4 pl-10 text-sm transition-all outline-none focus:border-[#972395] focus:ring-4 focus:ring-purple-50"
							/>
						</div>
					</div>
					<div>
						<label for="ic" class="mb-1.5 block text-xs font-medium text-gray-700">No. K/P</label>
						<div class="relative">
							<CreditCard
								size={16}
								class="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
							/>
							<input
								type="text"
								id="ic"
								placeholder="Contoh: 900101-01-1234"
								class="w-full rounded-lg border border-gray-200 py-2.5 pr-4 pl-10 text-sm transition-all outline-none focus:border-[#972395] focus:ring-4 focus:ring-purple-50"
							/>
						</div>
					</div>
					<div>
						<label for="phone" class="mb-1.5 block text-xs font-medium text-gray-700"
							>No. Telefon</label
						>
						<div class="relative">
							<Phone size={16} class="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
							<input
								type="text"
								id="phone"
								placeholder="Contoh: +60123456789"
								class="w-full rounded-lg border border-gray-200 py-2.5 pr-4 pl-10 text-sm transition-all outline-none focus:border-[#972395] focus:ring-4 focus:ring-purple-50"
							/>
						</div>
					</div>

					<div class="mt-6 flex gap-3">
						<button
							class="flex-1 rounded-lg border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
							onclick={() => (showQuickAddModal = false)}
						>
							Batal
						</button>
						<button
							class="flex-1 rounded-lg bg-[#972395] py-2.5 text-sm font-bold text-white shadow-md shadow-purple-200 transition-all hover:bg-[#801e80] hover:shadow-lg hover:shadow-purple-300"
							onclick={() => (showQuickAddModal = false)}
						>
							Simpan Jemaah
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}
{/if}
