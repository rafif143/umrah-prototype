<script>
	import { Plus, Search, Filter, Edit, Trash2, X, Save, Wrench } from 'lucide-svelte';
	import { fade, slide } from 'svelte/transition';
	import Sidebar from '$lib/components/Sidebar.svelte';

	// --- State ---
	let activeTab = $state('services'); // 'services' | 'pricing'
	let showForm = $state(false);
	let isEditing = $state(false);

	// --- Services Data ---
	let services = $state([
		{ id: 1, name: 'Bag' },
		{ id: 2, name: 'Handling' },
		{ id: 3, name: 'Visa Processing' }
	]);

	// --- Form State ---
	let serviceForm = $state({
		id: null,
		name: ''
	});

	// --- Constants ---
	const tabs = [
		{ id: 'services', label: 'Services', icon: Wrench }
	];

	// --- Helpers ---
	function resetForm() {
		serviceForm = { id: null, name: '' };
		isEditing = false;
		showForm = false;
	}

	function handleAdd() {
		resetForm();
		showForm = true;
	}

	function handleEdit(item) {
		isEditing = true;
		serviceForm = { ...item };
		showForm = true;
	}

	function handleSave() {
		if (isEditing) {
			const index = services.findIndex((s) => s.id === serviceForm.id);
			if (index !== -1) services[index] = { ...serviceForm };
		} else {
			services.push({
				id: Date.now(),
				name: serviceForm.name
			});
		}
		resetForm();
	}

	function handleDelete(id) {
		if (confirm('Are you sure you want to delete this item?')) {
			services = services.filter((s) => s.id !== id);
		}
	}
</script>

<svelte:head>
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="flex min-h-screen bg-gray-50 font-sans">
	<!-- Sidebar -->
	<Sidebar activePage="services" />

	<!-- Main Content -->
	<main class="ml-[200px] min-h-screen flex-1 bg-gray-50/50">
		<div class="p-6">
			<!-- Header -->
			<div class="mb-6 flex items-start justify-between">
				<div>
					<h1 class="mb-1 text-2xl font-semibold text-gray-900">Services Master Data</h1>
					<p class="text-sm text-gray-500">Manage available services and pricing</p>
				</div>
				<button
					class="flex items-center gap-2 rounded-lg bg-[#972395] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#7a1c78]"
					onclick={handleAdd}
				>
					<Plus size={18} />
					Add Service
				</button>
			</div>

			<!-- Tabs -->
			<div class="mb-6 rounded-xl bg-gray-100 p-1">
				<div class="flex">
					{#each tabs as tab}
						<button
							class="flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all duration-200 {activeTab ===
							tab.id
								? 'bg-white text-[#972395] shadow-sm'
								: 'text-gray-500 hover:bg-gray-200/50 hover:text-gray-700'}"
							onclick={() => {
								activeTab = tab.id;
								showForm = false;
							}}
						>
							<tab.icon size={16} />
							{tab.label}
						</button>
					{/each}
				</div>
			</div>

			<!-- Search & Filter -->
			<div class="mb-6 flex items-center justify-between">
				<div
					class="flex w-80 items-center gap-2.5 rounded-lg border border-gray-200 bg-white px-4 py-2.5"
				>
					<Search size={18} class="text-gray-400" />
					<input
						type="text"
						placeholder="Search services..."
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

			<!-- Content Table -->
			<div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
				<table class="w-full text-left text-sm">
					<thead class="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
						<tr>
							<th class="px-6 py-4">Service Name</th>
							<th class="px-6 py-4 text-right">Actions</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200">
						{#each services as item}
							<tr class="transition-colors hover:bg-gray-50">
								<td class="px-6 py-4 font-medium text-gray-900">{item.name}</td>
								<td class="px-6 py-4 text-right">
									<div class="flex justify-end gap-2">
										<button
											class="rounded-md p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#972395]"
											onclick={() => handleEdit(item)}
										>
											<Edit size={16} />
										</button>
										<button
											class="rounded-md p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
											onclick={() => handleDelete(item.id)}
										>
											<Trash2 size={16} />
										</button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</main>

	<!-- Modal -->
	{#if showForm}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
			transition:fade={{ duration: 200 }}
		>
			<div
				class="max-w-md w-full rounded-2xl bg-white shadow-2xl transition-all duration-300"
				transition:slide={{ axis: 'y', duration: 300 }}
			>
				<div class="flex items-center justify-between border-b border-gray-100 p-6">
					<div>
						<h2 class="text-xl font-semibold text-gray-900">
							{isEditing ? 'Edit' : 'Add New'} Service
						</h2>
						<p class="mt-1 text-sm text-gray-500">Enter service details</p>
					</div>
					<button
						class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
						onclick={() => (showForm = false)}
					>
						<X size={20} />
					</button>
				</div>
				<div class="p-6">
					<div>
						<label class="mb-1.5 block text-sm font-medium text-gray-700" for="s-name">
							Service Name <span class="text-red-500">*</span>
						</label>
						<input
							type="text"
							id="s-name"
							class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
							placeholder="e.g. Mutawif"
							bind:value={serviceForm.name}
						/>
					</div>
				</div>
				<div class="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50 p-6">
					<button
						class="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
						onclick={() => (showForm = false)}
					>
						Cancel
					</button>
					<button
						class="flex items-center gap-2 rounded-lg bg-[#972395] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#7a1c78]"
						onclick={handleSave}
					>
						<Save size={18} />
						Save Changes
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	/* Hide scrollbar for clean UI */
	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}
	.no-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
