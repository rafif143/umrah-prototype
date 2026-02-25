<script>
	import { Plus, Edit, X, Save, ShieldCheck, UserCheck, Briefcase } from 'lucide-svelte';
	import { fade, slide } from 'svelte/transition';

	/** @type {{ state: any }} */
	let { state: pkgState } = $props();

	// Use state from PackageState
	let servicesList = $derived(pkgState.activeVariant?.services || []);
	let showModal = $derived(pkgState.showServiceModal);
	let form = $derived(pkgState.serviceForm);

	function handleSaveService() {
		pkgState.saveService();
	}
</script>

<div class="rounded-xl border border-gray-200 bg-white shadow-sm">
	<div class="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
		<div class="flex items-center justify-between">
			<div>
				<h3 class="text-base font-semibold text-gray-900">Services List</h3>
				<p class="mt-0.5 text-xs text-gray-500">
					Manage additional services (Visa, Mutawif, etc.).
				</p>
			</div>
			<button
				class="flex items-center gap-2 rounded-lg bg-[#972395] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7a1c78]"
				onclick={() => (showModal = true)}
			>
				<Plus size={16} />
				Add Service
			</button>
		</div>
	</div>

	<div class="p-6">
		<div class="overflow-hidden rounded-lg border border-gray-200">
			<table class="w-full text-left text-sm">
				<thead class="bg-gray-50 text-gray-600">
					<tr>
						<th class="px-4 py-3 font-medium">Category / Supplier</th>
						<th class="px-4 py-3 font-medium">Description</th>
						<th class="px-4 py-3 text-right font-medium">Cost</th>
						<th class="px-4 py-3 text-right font-medium">Sell</th>
						<th class="px-4 py-3 text-right font-medium">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200">
					{#each servicesList as item, index}
						<tr class="transition-colors hover:bg-gray-50">
							<td class="px-4 py-3">
								<div class="flex items-center gap-3">
									<div
										class="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-[#972395]"
									>
										{#if item.category === 'Visa'}
											<ShieldCheck size={16} />
										{:else if item.category === 'Mutawif'}
											<UserCheck size={16} />
										{:else}
											<Briefcase size={16} />
										{/if}
									</div>
									<div class="flex flex-col">
										<span class="font-medium text-gray-900">{item.category}</span>
										<span class="text-xs text-gray-500">{item.supplier}</span>
									</div>
								</div>
							</td>
							<td class="px-4 py-3 text-gray-600">{item.description}</td>
							<td class="px-4 py-3 text-right font-medium text-gray-900">RM {item.cost}</td>
							<td class="px-4 py-3 text-right font-bold text-[#972395]">RM {item.sell}</td>
							<td class="px-4 py-3 text-right">
								<div class="flex justify-end gap-2">
									<button
										class="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#972395]"
										onclick={() => pkgState.editService(item, index)}
									>
										<Edit size={14} />
									</button>
									<button
										class="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
										onclick={() => pkgState.removeService(index)}
									>
										<X size={14} />
									</button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>

{#if showModal}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
		transition:fade={{ duration: 200 }}
	>
		<div
			class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
			transition:slide={{ axis: 'y', duration: 300 }}
		>
			<div class="flex items-center justify-between border-b border-gray-100 p-6">
				<h2 class="text-xl font-semibold text-gray-900">
					{pkgState.editingServiceIndex !== null ? 'Edit' : 'Add'} Service
				</h2>
				<button
					onclick={() => (pkgState.showServiceModal = false)}
					class="text-gray-400 hover:text-gray-600"
				>
					<X size={20} />
				</button>
			</div>
			<div class="space-y-6 p-6">
				<div class="grid grid-cols-2 gap-4">
					<div class="flex flex-col gap-1.5">
						<label for="svcCategory" class="text-xs font-medium text-gray-700">Category</label>
						<select
							id="svcCategory"
							class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
							bind:value={pkgState.serviceForm.category}
						>
							<option value="">Select category</option>
							{#each pkgState.serviceCategories as category}
								<option value={category}>{category}</option>
							{/each}
						</select>
					</div>
					<div class="flex flex-col gap-1.5">
						<label for="svcSupplier" class="text-xs font-medium text-gray-700">Supplier</label>
						<select
							id="svcSupplier"
							class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
							bind:value={pkgState.serviceForm.supplier}
						>
							<option value="">Select supplier</option>
							{#each pkgState.serviceSuppliers as supplier}
								<option value={supplier}>{supplier}</option>
							{/each}
						</select>
					</div>
					<div class="col-span-2 flex flex-col gap-1.5">
						<label for="svcDesc" class="text-xs font-medium text-gray-700">Description</label>
						<textarea
							id="svcDesc"
							class="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
							rows="2"
							placeholder="Describe the service..."
							bind:value={pkgState.serviceForm.description}
						></textarea>
					</div>
					<div class="flex flex-col gap-1.5">
						<label for="svcCost" class="text-xs font-medium text-gray-700">Cost (RM)</label>
						<input
							id="svcCost"
							type="number"
							class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
							placeholder="0"
							bind:value={pkgState.serviceForm.cost}
						/>
					</div>
					<div class="flex flex-col gap-1.5">
						<label for="svcSell" class="text-xs font-medium text-gray-700">Sell (RM)</label>
						<input
							id="svcSell"
							type="number"
							class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
							placeholder="0"
							bind:value={pkgState.serviceForm.sell}
						/>
					</div>
				</div>
			</div>
			<div class="flex justify-end gap-3 border-t border-gray-100 p-6">
				<button
					onclick={() => (pkgState.showServiceModal = false)}
					class="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700"
					>Cancel</button
				>
				<button
					class="flex items-center gap-2 rounded-lg bg-[#972395] px-5 py-2.5 text-sm font-medium text-white"
					onclick={pkgState.saveService}
					><Save size={18} />{pkgState.editingServiceIndex !== null ? 'Update' : 'Save'} Service</button
				>
			</div>
		</div>
	</div>
{/if}
