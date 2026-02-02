<script>
	import {
		Plus,
		Search,
		Filter,
		Eye,
		Edit,
		Trash2,
		X,
		Save,
		ArrowLeft,
		UtensilsCrossed,
		Check,
		Calendar
	} from 'lucide-svelte';
	import { fade, slide } from 'svelte/transition';
	import Sidebar from '$lib/components/Sidebar.svelte';

	// --- State ---
	let activeTab = $state('food-type'); // 'food-type' | 'basis'
	let showForm = $state(false);
	let isEditing = $state(false);

	// --- Food Types Data ---
	let foodTypes = $state([
		{ id: 1, name: 'International', description: 'Standard international buffet' },
		{ id: 2, name: 'Asian', description: 'Asian cuisine including rice and noodles' },
		{ id: 3, name: 'Middle Eastern', description: 'Traditional Arab dishes' },
		{ id: 4, name: 'Local', description: 'Local specialties' }
	]);

	// --- Basis Data ---
	let bases = $state([
		{ id: 1, name: 'Full Board', foodTypeIds: [1, 3] },
		{ id: 2, name: 'Half Board', foodTypeIds: [1] },
		{ id: 3, name: 'Bed & Breakfast', foodTypeIds: [] },
		{ id: 4, name: 'All Inclusive', foodTypeIds: [1, 2, 3, 4] }
	]);

	let suppliers = $state([
		{ id: 1, name: 'Catering Al-Woqood' },
		{ id: 2, name: 'Makkah Kitchen' },
		{ id: 3, name: 'Madinah Meals' }
	]);

	let hotels = $state([
		{ id: 1, name: 'Hilton Makkah Convention' },
		{ id: 2, name: 'Anjum Hotel Makkah' },
		{ id: 3, name: 'Pullman ZamZam Madinah' }
	]);

	// --- Forms State ---
	let foodTypeForm = $state({
		id: null,
		name: '',
		description: ''
	});

	let basisForm = $state({
		id: null,
		name: '',
		foodTypeIds: []
	});

	// --- Constants ---
	const tabs = [
		{ id: 'food-type', label: 'Food Type' },
		{ id: 'basis', label: 'Basis' }
	];

	// --- Helpers ---
	function getFoodTypeNames(ids) {
		if (!ids || ids.length === 0) return 'None';
		return ids
			.map((id) => foodTypes.find((f) => f.id === id)?.name)
			.filter(Boolean)
			.join(', ');
	}

	function resetForms() {
		foodTypeForm = { id: null, name: '', description: '' };
		basisForm = { id: null, name: '', foodTypeIds: [] };
		isEditing = false;
		showForm = false;
	}

	function handleAdd() {
		resetForms();
		showForm = true;
	}

	function handleEdit(item) {
		isEditing = true;
		if (activeTab === 'food-type') {
			foodTypeForm = { ...item };
		} else if (activeTab === 'basis') {
			basisForm = { ...item, foodTypeIds: [...item.foodTypeIds] };
		}
		showForm = true;
	}

	function handleSave() {
		if (activeTab === 'food-type') {
			if (isEditing) {
				const index = foodTypes.findIndex((f) => f.id === foodTypeForm.id);
				if (index !== -1) foodTypes[index] = { ...foodTypeForm };
			} else {
				foodTypes.push({
					id: Date.now(),
					name: foodTypeForm.name,
					description: foodTypeForm.description
				});
			}
		} else if (activeTab === 'basis') {
			if (isEditing) {
				const index = bases.findIndex((b) => b.id === basisForm.id);
				if (index !== -1) bases[index] = { ...basisForm, foodTypeIds: [...basisForm.foodTypeIds] };
			} else {
				bases.push({
					id: Date.now(),
					name: basisForm.name,
					foodTypeIds: [...basisForm.foodTypeIds]
				});
			}
		}
		resetForms();
	}

	function handleDelete(id) {
		if (confirm('Are you sure you want to delete this item?')) {
			if (activeTab === 'food-type') {
				foodTypes = foodTypes.filter((f) => f.id !== id);
			} else {
				bases = bases.filter((b) => b.id !== id);
			}
		}
	}

	function toggleFoodTypeInBasis(foodTypeId) {
		if (basisForm.foodTypeIds.includes(foodTypeId)) {
			basisForm.foodTypeIds = basisForm.foodTypeIds.filter((id) => id !== foodTypeId);
		} else {
			basisForm.foodTypeIds.push(foodTypeId);
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
	<Sidebar activePage="meals" />

	<!-- Main Content -->
	<main class="ml-[200px] min-h-screen flex-1 bg-gray-50/50">
		<div class="p-6">
			<!-- Header -->
			<div class="mb-6 flex items-start justify-between">
				<div>
					<h1 class="mb-1 text-2xl font-semibold text-gray-900">Meals Master Data</h1>
					<p class="text-sm text-gray-500">Manage food types and basis configurations</p>
				</div>
				<button
					class="flex items-center gap-2 rounded-lg bg-[#972395] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#7a1c78]"
					onclick={handleAdd}
				>
					<Plus size={18} />
					Add {activeTab === 'food-type' ? 'Food Type' : 'Basis'}
				</button>
			</div>

			<!-- dihals -->
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
						placeholder="Search {activeTab === 'food-type' ? 'food types' : 'basis'}..."
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
							{#if activeTab === 'food-type'}
								<th class="px-6 py-4">Name</th>
								<th class="px-6 py-4">Description</th>
							{:else}
								<th class="px-6 py-4">Name</th>
								<th class="px-6 py-4">Food Types Included</th>
							{/if}
							<th class="px-6 py-4 text-right">Actions</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200">
						{#if activeTab === 'food-type'}
							{#each foodTypes as item}
								<tr class="transition-colors hover:bg-gray-50">
									<td class="px-6 py-4 font-medium text-gray-900">{item.name}</td>
									<td class="px-6 py-4 text-gray-500">{item.description}</td>
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
						{:else if activeTab === 'basis'}
							{#each bases as item}
								<tr class="transition-colors hover:bg-gray-50">
									<td class="px-6 py-4 font-medium text-gray-900">{item.name}</td>
									<td class="px-6 py-4 text-gray-500">
										<div class="flex flex-wrap gap-1">
											{#each item.foodTypeIds as typeId}
												{@const type = foodTypes.find((f) => f.id === typeId)}
												{#if type}
													<span
														class="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-purple-700/10 ring-inset"
													>
														{type.name}
													</span>
												{/if}
											{/each}
										</div>
									</td>
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
						{/if}
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
							{isEditing ? 'Edit' : 'Add New'}
							{activeTab === 'food-type'
								? 'Food Type'
								: 'Basis'}
						</h2>
						<p class="mt-1 text-sm text-gray-500">
							{activeTab === 'food-type'
								? 'Enter details for this food type'
								: 'Configure meal basis settings'}
						</p>
					</div>
					<button
						class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
						onclick={() => (showForm = false)}
					>
						<X size={20} />
					</button>
				</div>
				<div class="p-6">
					<div class="space-y-4">
						{#if activeTab === 'food-type'}
							<!-- Food Type Form -->
							<div>
								<label class="mb-1.5 block text-sm font-medium text-gray-700" for="ft-name">
									Food Type Name <span class="text-red-500">*</span>
								</label>
								<input
									type="text"
									id="ft-name"
									class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
									placeholder="e.g. Asian, International"
									bind:value={foodTypeForm.name}
								/>
							</div>
							<div>
								<label class="mb-1.5 block text-sm font-medium text-gray-700" for="ft-desc">
									Description
								</label>
								<textarea
									id="ft-desc"
									rows="3"
									class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
									placeholder="Describe the food type..."
									bind:value={foodTypeForm.description}
								></textarea>
							</div>
						{:else if activeTab === 'basis'}
							<!-- Basis Form -->
							<div>
								<label class="mb-1.5 block text-sm font-medium text-gray-700" for="b-name">
									Basis Name <span class="text-red-500">*</span>
								</label>
								<input
									type="text"
									id="b-name"
									class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
									placeholder="e.g. Full Board, Bed & Breakfast"
									bind:value={basisForm.name}
								/>
							</div>
							<div>
								<label class="mb-1.5 block text-sm font-medium text-gray-700" for="b-food-types">
									Include Food Types
								</label>
								<div class="relative">
									<select
										id="b-food-types"
										class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										onchange={(e) => {
											const id = parseInt(e.target.value);
											if (id && !basisForm.foodTypeIds.includes(id)) {
												basisForm.foodTypeIds = [...basisForm.foodTypeIds, id];
											}
											e.target.value = '';
										}}
									>
										<option value="">Select Food Type to add...</option>
										{#each foodTypes.filter((ft) => !basisForm.foodTypeIds.includes(ft.id)) as ft}
											<option value={ft.id}>{ft.name}</option>
										{/each}
									</select>
								</div>
								<!-- Selected Tags -->
								{#if basisForm.foodTypeIds.length > 0}
									<div class="mt-2 flex flex-wrap gap-2">
										{#each basisForm.foodTypeIds as id}
											{@const ft = foodTypes.find((f) => f.id === id)}
											{#if ft}
												<span
													class="inline-flex items-center gap-1.5 rounded-full bg-[#972395]/10 px-3 py-1 text-sm font-medium text-[#972395]"
												>
													{ft.name}
													<button
														type="button"
														class="rounded-full p-0.5 hover:bg-[#972395]/20"
														onclick={() => {
															basisForm.foodTypeIds = basisForm.foodTypeIds.filter((i) => i !== id);
														}}
													>
														<X size={12} />
													</button>
												</span>
											{/if}
										{/each}
									</div>
								{/if}
							</div>
						{/if}
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
