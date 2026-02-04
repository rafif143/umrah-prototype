<script>
	import { Plus, Search, Filter, Edit, Trash2, X, Save } from 'lucide-svelte';
	import { fade, slide } from 'svelte/transition';

	// --- State ---
	let showForm = $state(false);
	let isEditing = $state(false);

	// --- Trip Data ---
	let trips = $state([
		{
			id: 1,
			name: 'Daily Fee',
			amount: 100,
			currency: 'SAR'
		},
		{
			id: 2,
			name: 'Full Trip',
			amount: 1500,
			currency: 'SAR'
		}
	]);

	// --- Form State ---
	let formData = $state({
		id: null,
		name: '',
		amount: 0,
		currency: 'SAR'
	});

	// --- Helpers ---
	function resetForm() {
		formData = {
			id: null,
			name: '',
			amount: 0,
			currency: 'SAR'
		};
		isEditing = false;
		showForm = false;
	}

	function handleAdd() {
		resetForm();
		showForm = true;
	}

	function handleEdit(item) {
		isEditing = true;
		formData = { ...item };
		showForm = true;
	}

	function handleSave() {
		if (isEditing) {
			const index = trips.findIndex((t) => t.id === formData.id);
			if (index !== -1) trips[index] = { ...formData };
		} else {
			trips.push({
				...formData,
				id: Date.now()
			});
		}
		resetForm();
	}

	function handleDelete(id) {
		if (confirm('Are you sure you want to delete this trip?')) {
			trips = trips.filter((t) => t.id !== id);
		}
	}
</script>

<svelte:head>
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="p-6">
	<!-- Header -->
	<div class="mb-6 flex items-start justify-between">
		<div>
			<h1 class="mb-1 text-2xl font-semibold text-gray-900">Mutawif Pricing</h1>
			<p class="text-sm text-gray-500">Manage mutawif trip pricing</p>
		</div>
		<button
			class="flex items-center gap-2 rounded-lg bg-[#972395] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#7a1c78]"
			onclick={handleAdd}
		>
			<Plus size={18} />
			Add Trip
		</button>
	</div>

	<!-- Search & Filter -->
	<div class="mb-6 flex items-center justify-between">
		<div
			class="flex w-80 items-center gap-2.5 rounded-lg border border-gray-200 bg-white px-4 py-2.5"
		>
			<Search size={18} class="text-gray-400" />
			<input
				type="text"
				placeholder="Search trip..."
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
					<th class="px-6 py-4">Trip</th>
					<th class="px-6 py-4">Pricing</th>
					<th class="px-6 py-4 text-right">Actions</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-200">
				{#each trips as item}
					<tr class="transition-colors hover:bg-gray-50">
						<td class="px-6 py-4 font-medium text-gray-900">{item.name}</td>
						<td class="px-6 py-4 text-gray-500">
							<span class="font-medium text-gray-900">{item.amount} {item.currency}</span>
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
			</tbody>
		</table>
	</div>
</div>

<!-- Modal -->
{#if showForm}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
		transition:fade={{ duration: 200 }}
	>
		<div
			class="w-full max-w-md rounded-2xl bg-white shadow-2xl"
			transition:slide={{ axis: 'y', duration: 300 }}
		>
			<div class="flex items-center justify-between border-b border-gray-100 p-6">
				<div>
					<h2 class="text-xl font-semibold text-gray-900">
						{isEditing ? 'Edit' : 'Add New'} Trip
					</h2>
					<p class="mt-1 text-sm text-gray-500">Enter trip pricing details</p>
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
					<!-- Trip Details -->
					<div>
						<label class="mb-1.5 block text-sm font-medium text-gray-700" for="t-name">
							Trip Name <span class="text-red-500">*</span>
						</label>
						<input
							type="text"
							id="t-name"
							class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
							placeholder="e.g. Full Trip"
							bind:value={formData.name}
						/>
					</div>

					<!-- Pricing Details -->
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label class="mb-1.5 block text-sm font-medium text-gray-700" for="p-amount">
								Amount <span class="text-red-500">*</span>
							</label>
							<input
								type="number"
								id="p-amount"
								class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={formData.amount}
							/>
						</div>
						<div>
							<label class="mb-1.5 block text-sm font-medium text-gray-700" for="p-curr">
								Currency
							</label>
							<select
								id="p-curr"
								class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={formData.currency}
							>
								<option value="SAR">SAR</option>
								<option value="USD">USD</option>
								<option value="IDR">IDR</option>
							</select>
						</div>
					</div>
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
