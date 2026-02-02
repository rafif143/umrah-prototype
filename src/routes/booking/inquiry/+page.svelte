<script>
	import {
		Search,
		Filter,
		MoreHorizontal,
		User,
		Phone,
		Package,
		FileText,
		Calendar
	} from 'lucide-svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { inquiryStore } from '$lib/stores/inquiryStore.svelte.js';

	let searchQuery = $state('');

	// Use store data
	let inquiries = $derived(
		inquiryStore.inquiries.filter(
			(i) =>
				i.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
				i.packageName.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);
</script>

<div class="flex min-h-screen bg-gray-50 font-sans">
	<Sidebar activePage="/booking/inquiry" />

	<main class="ml-[200px] min-h-screen flex-1 bg-gray-50/50">
		<div class="flex h-full flex-col p-6">
			<!-- Page Header -->
			<div class="mb-6">
				<h1 class="text-lg font-bold text-gray-900">Daftar Inquiries</h1>
				<p class="mt-1 text-sm text-gray-500">Total: {inquiries.length} inquiries</p>
			</div>

			<!-- Filters & Search -->
			<div
				class="mb-6 flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-2 shadow-sm"
			>
				<div class="relative flex-1">
					<Search class="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" size={18} />
					<input
						type="text"
						placeholder="Search inquiries..."
						class="w-full rounded-lg border-none bg-transparent py-2 pr-4 pl-10 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:ring-0"
						bind:value={searchQuery}
					/>
				</div>
				<div class="h-6 w-px bg-gray-200"></div>
				<button
					class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
				>
					<Filter size={16} />
					Filters
				</button>
			</div>

			<!-- Inquiry List -->
			<div class="flex-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
				<div class="h-full overflow-auto">
					<table class="w-full text-left text-xs">
						<thead class="sticky top-0 z-10 border-b border-gray-100 bg-gray-50/50 shadow-sm">
							<tr>
								<th class="px-4 py-3 font-semibold whitespace-nowrap text-gray-900"
									>Nama Customer</th
								>
								<th class="px-4 py-3 font-semibold whitespace-nowrap text-gray-900">WhatsApp</th>
								<th class="px-4 py-3 font-semibold whitespace-nowrap text-gray-900">Pakej</th>
								<th class="px-4 py-3 font-semibold whitespace-nowrap text-gray-900">Jenis Pakej</th>
								<th class="px-4 py-3 font-semibold whitespace-nowrap text-gray-900">Agent</th>
								<th class="px-4 py-3 font-semibold whitespace-nowrap text-gray-900"
									>Tarikh Inquiry</th
								>
								<th
									class="sticky right-0 bg-gray-50 px-4 py-3 text-right font-semibold text-gray-900"
									>Actions</th
								>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-100">
							{#each inquiries as inquiry}
								<tr class="group transition-colors hover:bg-gray-50/50">
									<td class="px-4 py-3">
										<div class="flex items-center gap-2">
											<div
												class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600"
											>
												<User size={12} />
											</div>
											<span class="font-medium whitespace-nowrap text-gray-900"
												>{inquiry.customerName}</span
											>
										</div>
									</td>
									<td class="px-4 py-3 whitespace-nowrap text-gray-600">
										<div class="flex items-center gap-1.5">
											<Phone size={12} class="text-green-500" />
											{inquiry.whatsapp}
										</div>
									</td>
									<td class="max-w-[300px] min-w-[200px] px-4 py-3">
										<div
											class="flex items-center gap-1.5 truncate text-gray-600"
											title={inquiry.packageName}
										>
											<span class="truncate">{inquiry.packageName}</span>
										</div>
									</td>
									<td class="px-4 py-3 whitespace-nowrap text-gray-600">
										<div class="flex items-center gap-1.5">
											<Package size={12} class="text-gray-400" />
											{inquiry.packageType}
										</div>
									</td>
									<td class="px-4 py-3 whitespace-nowrap text-gray-600">
										<div class="flex items-center gap-1.5">
											<User size={12} class="text-gray-400" />
											{inquiry.agent}
										</div>
									</td>
									<td class="px-4 py-3 whitespace-nowrap text-gray-600">
										<div class="flex items-center gap-1.5">
											<Calendar size={12} class="text-gray-400" />
											{inquiry.inquiryDate}
										</div>
									</td>
									<td
										class="sticky right-0 w-[50px] bg-white px-4 py-3 text-right text-gray-900 group-hover:bg-gray-50/50"
									>
										<button
											class="rounded-lg p-1.5 text-gray-400 hover:bg-white hover:text-[#972395] hover:shadow-sm"
										>
											<MoreHorizontal size={16} />
										</button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</main>
</div>
