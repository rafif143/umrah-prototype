<script>
	import { Plus, Edit, X, Save } from 'lucide-svelte';
	import { fade, slide } from 'svelte/transition';

	/** @type {{ state: import('../../../packageState.svelte').PackageState }} */
	let { state } = $props();
</script>

<div class="rounded-xl border border-gray-200 bg-white shadow-sm">
	<div class="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
		<div class="flex items-center justify-between">
			<div>
				<h3 class="text-base font-semibold text-gray-900">Operational Costs List</h3>
				<p class="mt-0.5 text-xs text-gray-500">Manage operational expenses.</p>
			</div>
			<button
				class="flex items-center gap-2 rounded-lg bg-[#972395] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7a1c78]"
				onclick={() => (state.showOperationalCostModal = true)}
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
						<th class="px-4 py-3 font-medium">Local Cost</th>
						<th class="px-4 py-3 font-medium">Other Cost</th>
						<th class="px-4 py-3 text-right font-medium">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200">
					{#each state.operationalCostList as cost, index}
						<tr class="transition-colors hover:bg-gray-50">
							<td class="px-4 py-3">
								{#if cost.localCost}
									<span
										class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
									>
										{cost.localCost}
									</span>
								{:else}
									<span class="text-gray-400">-</span>
								{/if}
							</td>
							<td class="px-4 py-3">
								{#if cost.otherCost}
									<span
										class="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800"
									>
										{cost.otherCost}
									</span>
								{:else}
									<span class="text-gray-400">-</span>
								{/if}
							</td>
							<td class="px-4 py-3 text-right">
								<div class="flex justify-end gap-2">
									<button
										class="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#972395]"
										onclick={() => state.editOperationalCost(cost, index)}
									>
										<Edit size={14} />
									</button>
									<button
										class="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
										onclick={() => state.removeOperationalCost(index)}
									>
										<X size={14} />
									</button>
								</div>
							</td>
						</tr>
					{/each}
					{#if state.operationalCostList.length === 0}
						<tr>
							<td colspan="3" class="px-4 py-8 text-center text-sm text-gray-500">
								No operational costs added yet. Click "Add Cost" to get started.
							</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>

<!-- Operational Cost Modal -->
{#if state.showOperationalCostModal}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
		transition:fade={{ duration: 200 }}
	>
		<div
			class="w-full max-w-lg rounded-2xl bg-white shadow-2xl transition-all duration-300"
			transition:slide={{ axis: 'y', duration: 300 }}
		>
			<div class="flex items-center justify-between border-b border-gray-100 bg-white p-6">
				<div>
					<h2 class="text-xl font-semibold text-gray-900">
						{state.editingOperationalCostIndex !== null ? 'Edit' : 'Add'} Operational Cost
					</h2>
					<p class="mt-1 text-sm text-gray-500">
						Select local cost and/or other cost (at least one required).
					</p>
				</div>
				<button
					class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
					onclick={() => {
						state.showOperationalCostModal = false;
						state.resetOperationalCostForm();
					}}
				>
					<X size={20} />
				</button>
			</div>

			<div class="space-y-4 p-6">
				<!-- Local Cost Selection -->
				<div class="flex flex-col gap-1.5">
					<label class="text-[13px] font-medium text-gray-700">Local Cost</label>
					<select
						class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
						bind:value={state.operationalCostForm.localCost}
					>
						<option value="">Select local cost (optional)</option>
						{#each state.localCostOptions as option}
							<option value={option}>{option}</option>
						{/each}
					</select>
				</div>

				<!-- Other Cost Selection -->
				<div class="flex flex-col gap-1.5">
					<label class="text-[13px] font-medium text-gray-700">Other Cost</label>
					<select
						class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
						bind:value={state.operationalCostForm.otherCost}
					>
						<option value="">Select other cost (optional)</option>
						{#each state.otherCostOptions as option}
							<option value={option}>{option}</option>
						{/each}
					</select>
				</div>

				<!-- Preview -->
				{#if state.operationalCostForm.localCost || state.operationalCostForm.otherCost}
					<div class="rounded-lg border border-gray-200 bg-gray-50 p-3">
						<p class="text-sm text-gray-600">Preview:</p>
						<div class="mt-2 flex flex-wrap gap-2">
							{#if state.operationalCostForm.localCost}
								<span
									class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
								>
									Local: {state.operationalCostForm.localCost}
								</span>
							{/if}
							{#if state.operationalCostForm.otherCost}
								<span
									class="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800"
								>
									Other: {state.operationalCostForm.otherCost}
								</span>
							{/if}
						</div>
					</div>
				{/if}

				<!-- Validation Message -->
				{#if !state.operationalCostForm.localCost && !state.operationalCostForm.otherCost}
					<div class="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
						<p class="text-sm text-yellow-800">Please select at least one cost (local or other).</p>
					</div>
				{/if}
			</div>

			<div class="flex items-center justify-end gap-3 border-t border-gray-100 bg-white p-6">
				<button
					class="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
					onclick={() => {
						state.showOperationalCostModal = false;
						state.resetOperationalCostForm();
					}}
				>
					Cancel
				</button>
				<button
					class="flex items-center gap-2 rounded-lg bg-[#972395] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#7a1c78] disabled:cursor-not-allowed disabled:opacity-50"
					onclick={state.saveOperationalCost}
					disabled={!state.operationalCostForm.localCost && !state.operationalCostForm.otherCost}
				>
					<Save size={18} />
					{state.editingOperationalCostIndex !== null ? 'Update' : 'Add'} Cost
				</button>
			</div>
		</div>
	</div>
{/if}
