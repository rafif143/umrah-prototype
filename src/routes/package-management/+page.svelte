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
		Trash2,
		Package,
		X,
		ChevronDown,
		ChevronUp,
		MapPin,
		Clock,
		Tag
	} from 'lucide-svelte';
	import { fade, slide } from 'svelte/transition';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { packageStore } from '$lib/stores/packageStore.svelte.js';

	let viewMode = $state('grid'); // 'grid' | 'list'
	let searchQuery = $state('');

	// Modal State
	let showDetailModal = $state(false);
	let selectedPackage = $state(null);
	let openVariantId = $state(null);

	function openDetails(pkg) {
		selectedPackage = pkg;
		showDetailModal = true;
		openVariantId = pkg.variants?.length > 0 ? pkg.variants[0].id : null;
	}

	function toggleVariant(id) {
		openVariantId = openVariantId === id ? null : id;
	}

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
				<div class="flex items-center gap-2">
					<button
						onclick={() => {
							if (confirm('Reset all package data to initial defaults?')) {
								packageStore.reset();
								window.location.reload();
							}
						}}
						class="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
					>
						Reset to Defaults
					</button>
					<button
						class="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
					>
						<Filter size={16} />
						Filter
					</button>
				</div>
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
								>{pkg.airline || 'Flight Batch'}</span
							>
							<h3 class="mb-2 text-[15px] font-semibold text-gray-900">{pkg.name}</h3>

							<div class="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
								<span class="flex items-center gap-1"
									><Calendar size={14} /> {pkg.departureDate}</span
								>
								<span class="flex items-center gap-1"
									><Package size={14} /> {pkg.variants?.length || 0} Variants</span
								>
							</div>

							<div class="flex items-center justify-between border-t border-gray-100 pt-3">
								<div class="flex flex-col">
									<span class="text-[10px] font-bold tracking-wider text-gray-400 uppercase"
										>Starts from</span
									>
									<span class="text-base font-semibold text-[#972395]">
										{#if pkg.variants?.length > 0}
											RM {Math.min(
												...pkg.variants.map((v) => parseInt(v.price?.replace(/[^0-9]/g, '')) || 0)
											).toLocaleString()}
										{:else}
											N/A
										{/if}
									</span>
								</div>
								<div class="flex gap-1.5">
									<button
										class="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 transition-colors hover:border-[#972395] hover:text-[#972395]"
										onclick={(e) => {
											e.preventDefault();
											openDetails(pkg);
										}}><Eye size={16} /></button
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
											if (confirm('Are you sure you want to delete this package batch?')) {
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

<!-- Detailed Package Modal -->
{#if showDetailModal && selectedPackage}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
		transition:fade={{ duration: 200 }}
	>
		<div
			class="no-scrollbar max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl transition-all duration-300"
			transition:slide={{ axis: 'y', duration: 300 }}
		>
			<!-- Modal Header -->
			<div
				class="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white p-6"
			>
				<div class="flex items-center gap-4">
					<div
						class="flex h-12 w-12 items-center justify-center rounded-xl bg-[#972395]/10 text-3xl"
					>
						{selectedPackage.image}
					</div>
					<div>
						<h2 class="text-xl font-bold text-gray-900">{selectedPackage.name}</h2>
						<div class="mt-1 flex items-center gap-3 text-sm text-gray-500">
							<span class="flex items-center gap-1"
								><Calendar size={14} /> {selectedPackage.departureDate}</span
							>
							<span class="flex items-center gap-1"
								><Plane size={14} /> {selectedPackage.flightCode}</span
							>
						</div>
					</div>
				</div>
				<button
					class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
					onclick={() => (showDetailModal = false)}
				>
					<X size={20} />
				</button>
			</div>

			<!-- Modal Body: Accordion Variants -->
			<div class="space-y-4 p-6">
				<h3 class="text-sm font-bold tracking-wider text-gray-400 uppercase">Available Variants</h3>
				<div class="space-y-3">
					{#each selectedPackage.variants as variant}
						<div
							class="overflow-hidden rounded-xl border border-gray-100 bg-gray-50/50 transition-all"
						>
							<!-- Accordion Trigger -->
							<button
								class="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-gray-100/50"
								onclick={() => toggleVariant(variant.id)}
							>
								<div class="flex items-center gap-3">
									<div
										class="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm"
									>
										<Tag size={16} class="text-[#972395]" />
									</div>
									<div>
										<p class="text-sm font-bold text-gray-900">{variant.name}</p>
										<p class="text-xs text-gray-500">{variant.types?.join(', ') || ''}</p>
									</div>
								</div>
								<div class="flex items-center gap-4">
									<span class="text-sm font-bold text-[#972395]">{variant.price}</span>
									{#if openVariantId === variant.id}
										<ChevronUp size={18} class="text-gray-400" />
									{:else}
										<ChevronDown size={18} class="text-gray-400" />
									{/if}
								</div>
							</button>

							<!-- Accordion Content -->
							{#if openVariantId === variant.id}
								<div class="border-t border-gray-100 bg-white p-4" transition:slide>
									<div class="grid grid-cols-2 gap-4">
										<!-- Duration & Pax -->
										<div class="rounded-lg bg-gray-50 p-3">
											<p class="mb-2 text-[10px] font-bold tracking-wider text-gray-400 uppercase">
												Duration & Pax
											</p>
											<div class="space-y-1.5">
												<div class="flex items-center gap-2 text-sm text-gray-700">
													<Clock size={14} class="text-gray-400" />
													<span>{variant.durationDays} Days / {variant.durationNights} Nights</span>
												</div>
												<div class="flex items-center gap-2 text-sm text-gray-700">
													<Users size={14} class="text-gray-400" />
													<span>Max {variant.paxCapacity || 45} Pax</span>
												</div>
											</div>
										</div>

										<!-- Accommodation Summary -->
										<div class="rounded-lg bg-gray-50 p-3">
											<p class="mb-2 text-[10px] font-bold tracking-wider text-gray-400 uppercase">
												Accommodations
											</p>
											<div class="space-y-1.5">
												{#each variant.hotels as hotel}
													<div class="flex items-center gap-2 text-sm text-gray-700">
														<MapPin size={14} class="text-gray-400" />
														<span class="truncate"
															><strong>{hotel.city}:</strong> {hotel.hotel}</span
														>
													</div>
												{/each}
											</div>
										</div>

										<!-- Pricing Breakdown -->
										<div class="col-span-2 rounded-lg bg-[#972395]/5 p-3">
											<p
												class="mb-2 text-[10px] font-bold tracking-wider text-[#972395]/60 uppercase"
											>
												Pricing Breakdown
											</p>
											<div class="flex justify-between gap-4">
												<div class="flex flex-col">
													<span class="text-[10px] text-gray-500">Double</span>
													<span class="text-sm font-bold text-gray-900"
														>RM {variant.pricing?.double?.toLocaleString() || '0'}</span
													>
												</div>
												<div class="flex flex-col border-l border-gray-200 pl-4">
													<span class="text-[10px] text-gray-500">Triple</span>
													<span class="text-sm font-bold text-gray-900"
														>RM {variant.pricing?.triple?.toLocaleString() || '0'}</span
													>
												</div>
												<div class="flex flex-col border-l border-gray-200 pl-4">
													<span class="text-[10px] text-gray-500">Quad</span>
													<span class="text-sm font-bold text-gray-900"
														>RM {variant.pricing?.quad?.toLocaleString() || '0'}</span
													>
												</div>
												<div class="flex flex-col border-l border-gray-200 pl-4">
													<span class="text-[10px] text-gray-500">Quint</span>
													<span class="text-sm font-bold text-gray-900"
														>RM {variant.pricing?.quint?.toLocaleString() || '0'}</span
													>
												</div>
											</div>
										</div>
									</div>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>

			<!-- Footer Action -->
			<div class="border-t border-gray-100 p-6">
				<button
					class="w-full rounded-xl bg-gray-900 py-3 text-sm font-bold text-white transition-all hover:bg-gray-800"
					onclick={() => {
						showDetailModal = false;
						window.location.href = `/setup-package?id=${selectedPackage.id}`;
					}}
				>
					Edit Full Package Profile
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	:global(body) {
		font-family: 'Inter', sans-serif;
	}

	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}
	.no-scrollbar {
		-ms-overflow-style: none; /* IE and Edge */
		scrollbar-width: none; /* Firefox */
	}
</style>
