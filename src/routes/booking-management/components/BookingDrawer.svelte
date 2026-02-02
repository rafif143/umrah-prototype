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
		Building2
	} from 'lucide-svelte';
	import { fade, slide } from 'svelte/transition';

	let { showDrawer, closeDrawer, existingData } = $props();

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
			address: 'No 123, Jalan Manggis, Kg Baru, 15400 Kota Bharu, Kelantan'
		},
		pilgrims: [
			{
				no: 1,
				name: 'Uponk',
				ic: '031104-01-9932',
				email: 'bookumrah1@gmail.com',
				phone: '+6285733235489',
				registrant: true
			},
			{
				no: 2,
				name: 'Siti Aisyah',
				ic: '050120-01-8821',
				email: '-',
				phone: '-',
				registrant: false
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
		}
	});
</script>

{#if showDrawer}
	<!-- Backdrop -->
	<div
		class="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity"
		transition:fade={{ duration: 200 }}
		onclick={closeDrawer}
	></div>

	<!-- Drawer -->
	<div
		class="fixed inset-y-0 right-0 z-50 flex w-full max-w-3xl flex-col bg-white shadow-2xl transition-transform"
		transition:slide={{ axis: 'x', duration: 300 }}
	>
		<!-- Header -->
		<div class="flex items-center justify-between border-b border-gray-100 px-6 py-4">
			<div class="flex items-center gap-2">
				<Package class="text-gray-700" size={20} />
				<div>
					<h2 class="text-base font-bold text-gray-900">Maklumat Tempahan Umrah</h2>
					<p class="text-[11px] text-gray-500 uppercase">{bookingDetails.packageName}</p>
				</div>
			</div>
			<button
				class="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
				onclick={closeDrawer}
			>
				<X size={20} />
			</button>
		</div>

		<!-- Content -->
		<div class="flex-1 overflow-y-auto bg-gray-50/50 p-6">
			<div class="space-y-6">
				<!-- 1. Ringkasan Pakej -->
				<section class="rounded-xl border border-gray-200 bg-white shadow-sm">
					<div class="border-b border-gray-100 px-5 py-4">
						<div class="flex items-center gap-2">
							<Package size={16} class="text-gray-600" />
							<h3 class="text-sm font-bold text-gray-900">Ringkasan Pakej</h3>
						</div>
					</div>
					<div class="p-5">
						<h4 class="mb-4 text-sm font-bold text-gray-900">{bookingDetails.packageName}</h4>

						<div class="grid grid-cols-2 gap-x-12 gap-y-6">
							<div>
								<span class="mb-1 block text-xs text-gray-500">Tarikh Tempahan</span>
								<div class="flex items-center gap-2 text-sm font-medium text-gray-900">
									<Calendar size={14} class="text-gray-400" />
									{bookingDetails.bookingDate}
								</div>
							</div>
							<div>
								<span class="mb-1 block text-xs text-gray-500">Status Tempahan</span>
								<span
									class="inline-flex rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-700"
								>
									{bookingDetails.status}
								</span>
							</div>
							<div class="col-span-2 border-t border-gray-100 pt-4">
								<span class="mb-1 block text-xs text-gray-500">Destinasi</span>
								<div class="text-sm font-medium text-gray-900">{bookingDetails.sector}</div>
							</div>
							<div class="col-span-2 border-t border-gray-100 pt-4">
								<span class="mb-1 block text-xs text-gray-500">Tempoh</span>
								<div class="text-sm font-medium text-gray-900">{bookingDetails.duration}</div>
							</div>

							<!-- New Fields: Payment Method, Agent, Branch -->
							<div class="border-t border-gray-100 pt-4">
								<span class="mb-1 block text-xs text-gray-500">Cara Bayaran</span>
								<div class="flex items-center gap-2 text-sm font-medium text-gray-900">
									<CreditCard size={14} class="text-gray-400" />
									{bookingDetails.paymentMethod}
								</div>
							</div>
							<div class="border-t border-gray-100 pt-4">
								<span class="mb-1 block text-xs text-gray-500">Cawangan / Agent</span>
								<div class="flex items-center gap-2 text-sm font-medium text-gray-900">
									<Building2 size={14} class="text-gray-400" />
									{bookingDetails.agent} ({bookingDetails.branch})
								</div>
							</div>
						</div>

						<div class="mt-6 grid grid-cols-4 gap-4 rounded-lg bg-gray-50 p-4">
							<div>
								<span class="block text-[11px] text-gray-500">Jumlah Harga</span>
								<span class="block text-base font-bold text-gray-900"
									>{bookingDetails.totalPrice}</span
								>
							</div>
							<div>
								<span class="block text-[11px] text-gray-500">Deposit</span>
								<span class="block text-base font-bold text-green-600"
									>{bookingDetails.deposit}</span
								>
							</div>
							<div>
								<span class="block text-[11px] text-gray-500">Jumlah Dibayar</span>
								<span class="block text-base font-bold text-blue-600">{bookingDetails.paid}</span>
							</div>
							<div>
								<span class="block text-[11px] text-gray-500">Baki Harga</span>
								<span class="block text-base font-bold text-orange-600"
									>{bookingDetails.balance}</span
								>
							</div>
						</div>
					</div>
				</section>

				<!-- 2. Maklumat Jemaah -->
				<section class="rounded-xl border border-gray-200 bg-white shadow-sm">
					<div class="border-b border-gray-100 px-5 py-4">
						<div class="flex items-center gap-2">
							<User size={16} class="text-gray-600" />
							<h3 class="text-sm font-bold text-gray-900">Maklumat Jemaah</h3>
						</div>
					</div>
					<div class="p-5">
						<div class="grid grid-cols-2 gap-x-12 gap-y-6">
							<div>
								<span class="mb-1 block text-xs text-gray-500">Nama Penuh</span>
								<div class="text-sm font-medium text-gray-900">
									{bookingDetails.primaryPilgrim.name}
								</div>
							</div>
							<div>
								<span class="mb-1 block text-xs text-gray-500">No K/P / NIK</span>
								<div class="text-sm font-medium text-gray-900">
									{bookingDetails.primaryPilgrim.ic}
								</div>
							</div>
							<div>
								<span class="mb-1 block text-xs text-gray-500">Emel</span>
								<div class="flex items-center gap-2 text-sm font-medium text-gray-900">
									<Mail size={14} class="text-gray-400" />
									{bookingDetails.primaryPilgrim.email}
								</div>
							</div>
							<div>
								<span class="mb-1 block text-xs text-gray-500">No Telefon</span>
								<div class="flex items-center gap-2 text-sm font-medium text-gray-900">
									<Phone size={14} class="text-gray-400" />
									{bookingDetails.primaryPilgrim.phone}
								</div>
							</div>
							<div class="col-span-2 border-t border-gray-100 pt-4">
								<span class="mb-1 block text-xs text-gray-500">Alamat</span>
								<div class="flex items-start gap-2 text-sm font-medium text-gray-900">
									<MapPin size={14} class="mt-0.5 shrink-0 text-gray-400" />
									{bookingDetails.primaryPilgrim.address}
								</div>
							</div>
							<div class="border-t border-gray-100 pt-4">
								<span class="mb-1 block text-xs text-gray-500">Tarikh Lahir</span>
								<div class="text-sm font-medium text-gray-900">
									{bookingDetails.primaryPilgrim.dob}
								</div>
							</div>
							<div class="border-t border-gray-100 pt-4">
								<span class="mb-1 block text-xs text-gray-500">Jantina</span>
								<div class="text-sm font-medium text-gray-900">
									{bookingDetails.primaryPilgrim.gender}
								</div>
							</div>
						</div>
					</div>
				</section>

				<!-- 3. Jumlah Jemaah List -->
				<section class="rounded-xl border border-gray-200 bg-white shadow-sm">
					<div class="flex items-center justify-between border-b border-gray-100 px-5 py-4">
						<div class="flex items-center gap-2">
							<User size={16} class="text-gray-600" />
							<h3 class="text-sm font-bold text-gray-900">
								Jumlah Jemaah ({bookingDetails.pilgrims.length})
							</h3>
						</div>
						<button
							class="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
						>
							$ Bayaran Manual
						</button>
					</div>
					<div class="p-5">
						<div class="overflow-hidden rounded-lg border border-gray-200">
							<table class="w-full text-left text-xs">
								<thead class="bg-gray-50 text-gray-500">
									<tr>
										<th class="px-4 py-3 font-medium">No</th>
										<th class="px-4 py-3 font-medium">Nama Jemaah</th>
										<th class="px-4 py-3 font-medium">No K/P</th>
										<th class="px-4 py-3 font-medium">Emel</th>
										<th class="px-4 py-3 font-medium">Telefon</th>
										<th class="px-4 py-3 text-center font-medium">Registrant</th>
									</tr>
								</thead>
								<tbody class="divide-y divide-gray-100 bg-white">
									{#each bookingDetails.pilgrims as pilgrim}
										<tr>
											<td class="px-4 py-3 text-gray-500">{pilgrim.no}</td>
											<td class="px-4 py-3 font-medium text-gray-900">{pilgrim.name}</td>
											<td class="px-4 py-3 text-gray-600">{pilgrim.ic}</td>
											<td class="px-4 py-3 text-gray-600">{pilgrim.email}</td>
											<td class="px-4 py-3 text-gray-600">{pilgrim.phone}</td>
											<td class="px-4 py-3 text-center">
												{#if pilgrim.registrant}
													<div
														class="mx-auto flex h-5 w-5 items-center justify-center rounded bg-[#972395] text-white"
													>
														<Check size={12} strokeWidth={3} />
													</div>
												{/if}
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				</section>
			</div>
		</div>
	</div>
{/if}
