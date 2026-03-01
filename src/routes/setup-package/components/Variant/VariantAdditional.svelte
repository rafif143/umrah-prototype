<script>
	import { Plus, Edit, X, Save, Calculator } from 'lucide-svelte';
	import { fade, slide } from 'svelte/transition';

	/** @type {{ state: any }} */
	let { state: pkgState } = $props();

	// Use actual state from pkgState
	let additions = $derived(pkgState.activeVariant?.additional || []);
	let showModal = $derived(pkgState.showAdditionalModal);
</script>

<div class="rounded-xl border border-gray-200 bg-white shadow-sm">
	<div class="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
		<div class="flex items-center justify-between">
			<div>
				<h3 class="text-base font-semibold text-gray-900">Additional Costs</h3>
				<p class="mt-0.5 text-xs text-gray-500">Add any ad-hoc fees or miscellaneous costs.</p>
			</div>
			<button
				class="flex items-center gap-2 rounded-lg bg-[#972395] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7a1c78]"
				onclick={() => {
					pkgState.resetAdditionalForm();
					pkgState.showAdditionalModal = true;
				}}
			>
				<Plus size={16} />
				Add Cost
			</button>
		</div>
	</div>

	<div class="p-6">
		<div class="overflow-hidden rounded-lg border border-gray-200">
			<table class="w-full text-left text-sm">
				<thead class="bg-gray-50 text-gray-600">
					<tr>
						<th class="px-4 py-3 font-medium">Item Name</th>
						<th class="px-4 py-3 font-medium">Description</th>
						<th class="px-4 py-3 text-right font-medium">Cost</th>
						<th class="px-4 py-3 text-right font-medium">Sell</th>
						<th class="px-4 py-3 text-right font-medium">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200">
					{#each additions as item, index}
						<tr class="transition-colors hover:bg-gray-50">
							<td class="px-4 py-3">
								<div class="flex items-center gap-3">
									<div
										class="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-[#972395]"
									>
										<Calculator size={16} />
									</div>
									<span class="font-medium text-gray-900">{item.name}</span>
								</div>
							</td>
							<td class="px-4 py-3 text-gray-600">{item.description}</td>
							<td class="px-4 py-3 text-right font-medium text-gray-900">RM {item.cost}</td>
							<td class="px-4 py-3 text-right font-bold text-[#972395]">RM {item.sell}</td>
							<td class="px-4 py-3 text-right">
								<div class="flex justify-end gap-2">
									<button
										class="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#972395]"
										onclick={() => pkgState.editAdditional(item, index)}
									>
										<Edit size={14} />
									</button>
									<button
										class="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
										onclick={() => pkgState.removeAdditional(index)}
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
					{pkgState.editingAdditionalIndex !== null ? 'Edit' : 'Add'} Additional Cost
				</h2>
				<button
					onclick={() => {
						pkgState.showAdditionalModal = false;
						pkgState.resetAdditionalForm();
					}}
					class="text-gray-400 hover:text-gray-600"
				>
					<X size={20} />
				</button>
			</div>
			<div class="space-y-6 p-6">
				<div class="grid grid-cols-2 gap-4">
					<div class="col-span-2 flex flex-col gap-1.5">
						<label for="addItemName" class="text-xs font-medium text-gray-700">Item Name</label>
						<input
							id="addItemName"
							type="text"
							class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
							placeholder="Enter item name..."
							bind:value={pkgState.additionalForm.name}
						/>
					</div>
					<div class="col-span-2 flex flex-col gap-1.5">
						<label for="addItemDesc" class="text-xs font-medium text-gray-700">Description</label>
						<textarea
							id="addItemDesc"
							class="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
							rows="2"
							placeholder="Describe the item..."
							bind:value={pkgState.additionalForm.description}
						></textarea>
					</div>
					<div class="flex flex-col gap-1.5">
						<label for="addItemCost" class="text-xs font-medium text-gray-700">Cost (RM)</label>
						<input
							id="addItemCost"
							type="number"
							class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
							placeholder="0"
							bind:value={pkgState.additionalForm.cost}
						/>
					</div>
					<div class="flex flex-col gap-1.5">
						<label for="addItemSell" class="text-xs font-medium text-gray-700">Sell (RM)</label>
						<input
							id="addItemSell"
							type="number"
							class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
							placeholder="0"
							bind:value={pkgState.additionalForm.sell}
						/>
					</div>
				</div>
			</div>
			<div class="flex justify-end gap-3 border-t border-gray-100 p-6">
				<button
					onclick={() => {
						pkgState.showAdditionalModal = false;
						pkgState.resetAdditionalForm();
					}}
					class="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700"
					>Cancel</button
				>
				<button
					class="flex items-center gap-2 rounded-lg bg-[#972395] px-5 py-2.5 text-sm font-medium text-white"
					onclick={pkgState.saveAdditional}
					><Save size={18} />{pkgState.editingAdditionalIndex !== null ? 'Update' : 'Save'} Cost</button
				>
			</div>
		</div>
	</div>
{/if}
