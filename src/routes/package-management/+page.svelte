<script>
	import {
		Plus,
		Search,
		Filter,
		LayoutGrid,
		List,
		MoreHorizontal,
		Calendar,
		Users,
		Plane,
		FileText,
		Eye,
		Edit,
		Trash2
	} from 'lucide-svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { packageStore } from '$lib/stores/packageStore.svelte.js';

	let viewMode = $state('grid'); // 'grid' | 'list'
	let searchQuery = $state('');

	// Use store data
	let packages = $derived(
		(packageStore.packages || []).filter((p) =>
			(p?.name || '').toLowerCase().includes((searchQuery || '').toLowerCase())
		)
	);
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
	<main class="ml-[230px] min-h-screen flex-1 bg-gray-50/50">
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
						bind:value={searchQuery}
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
							<span class="text-5xl">{pkg.image || ''}</span>
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
								>{pkg.category || 'Package'}</span
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
										onclick={(e) => e.preventDefault()}><Eye size={16} /></button
									>
									<button
										class="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 transition-colors hover:border-[#972395] hover:text-[#972395]"
										onclick={(e) => {
											e.preventDefault();
											window.location.href = `/setup-package?id=${pkg.id}`;
										}}><Edit size={16} /></button
									>
									<button
										class="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 transition-colors hover:border-red-500 hover:text-red-500"
										onclick={(e) => {
											e.preventDefault();
											if (confirm('Are you sure you want to delete this package?')) {
												packageStore.deletePackage(pkg.id);
											}
										}}><Trash2 size={16} /></button
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
