<script>
	import { Plus, Search, Filter, Eye, Edit, Trash2, Calendar } from 'lucide-svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';

	// Simulated package data
	const packages = [
		{
			id: 1,
			name: 'Umrah Ramadhan Premium',
			category: 'Premium',
			duration: '12 Days 11 Nights',
			price: 'RM 12,500',
			status: 'Active',
			image: '🕋'
		},
		{
			id: 2,
			name: 'Umrah Regular Economy',
			category: 'Economy',
			duration: '9 Days 8 Nights',
			price: 'RM 6,800',
			status: 'Active',
			image: '🕌'
		},
		{
			id: 3,
			name: 'Umrah Plus Turkey',
			category: 'Plus',
			duration: '14 Days 13 Nights',
			price: 'RM 18,900',
			status: 'Draft',
			image: '✈️'
		},
		{
			id: 4,
			name: 'Umrah VIP Executive',
			category: 'VIP',
			duration: '10 Days 9 Nights',
			price: 'RM 25,000',
			status: 'Active',
			image: '⭐'
		},
		{
			id: 5,
			name: 'Umrah Akhir Tahun',
			category: 'Premium',
			duration: '11 Days 10 Nights',
			price: 'RM 14,200',
			status: 'Inactive',
			image: '🌙'
		}
	];
</script>

<svelte:head>
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="flex min-h-screen bg-gray-50 font-sans">
	<!-- Sidebar -->
	<Sidebar activePage="package-management" />

	<!-- Main Content -->
	<main class="ml-[200px] min-h-screen flex-1 bg-gray-50/50">
		<div class="p-6">
			<!-- Header -->
			<div class="mb-6 flex items-start justify-between">
				<div>
					<h1 class="mb-1 text-2xl font-semibold text-gray-900">Package Management</h1>
					<p class="text-sm text-gray-500">Manage your Umrah packages</p>
				</div>
				<a
					href="/setup-package"
					class="flex items-center gap-2 rounded-lg bg-[#972395] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#7a1c78]"
				>
					<Plus size={18} />
					Add Package
				</a>
			</div>

			<!-- Search & Filter -->
			<div class="mb-6 flex items-center justify-between">
				<div
					class="flex w-80 items-center gap-2.5 rounded-lg border border-gray-200 bg-white px-4 py-2.5"
				>
					<Search size={18} class="text-gray-400" />
					<input
						type="text"
						placeholder="Search packages..."
						class="flex-1 border-none bg-transparent text-sm outline-none placeholder:text-gray-400"
					/>
				</div>
				<button
					class="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
				>
					<Filter size={16} />
					Filter
				</button>
			</div>

			<!-- Package Cards Grid -->
			<div class="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
				{#each packages as pkg}
					<a
						href="/setup-package"
						class="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
					>
						<div
							class="relative flex h-[120px] items-center justify-center bg-gradient-to-br from-[#972395]/10 to-[#972395]/20"
						>
							<span class="text-5xl">{pkg.image}</span>
							<span
								class="absolute top-3 right-3 rounded-full px-2.5 py-1 text-[11px] font-medium
								{pkg.status === 'Active'
									? 'bg-green-100 text-green-800'
									: pkg.status === 'Draft'
										? 'bg-yellow-100 text-yellow-800'
										: 'bg-red-100 text-red-800'}"
							>
								{pkg.status}
							</span>
						</div>
						<div class="p-4">
							<span
								class="mb-2 inline-block rounded-md bg-[#972395]/10 px-2 py-1 text-[11px] font-medium text-[#972395]"
								>{pkg.category}</span
							>
							<h3 class="mb-2 text-[15px] font-semibold text-gray-900">{pkg.name}</h3>
							<div class="mb-3 flex items-center gap-3 text-xs text-gray-500">
								<span class="flex items-center gap-1"><Calendar size={14} /> {pkg.duration}</span>
							</div>
							<div class="flex items-center justify-between border-t border-gray-100 pt-3">
								<span class="text-base font-semibold text-[#972395]">{pkg.price}</span>
								<div class="flex gap-1.5">
									<button
										class="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 transition-colors hover:border-[#972395] hover:text-[#972395]"
										><Eye size={16} /></button
									>
									<button
										class="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 transition-colors hover:border-[#972395] hover:text-[#972395]"
										><Edit size={16} /></button
									>
									<button
										class="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 transition-colors hover:border-red-500 hover:text-red-500"
										><Trash2 size={16} /></button
									>
								</div>
							</div>
						</div>
					</a>
				{/each}
			</div>
		</div>
	</main>
</div>
