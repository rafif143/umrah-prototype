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
				<h3 class="text-base font-semibold text-gray-900">Services List</h3>
				<p class="mt-0.5 text-xs text-gray-500">Manage additional services.</p>
			</div>
			<button
				class="flex items-center gap-2 rounded-lg bg-[#972395] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7a1c78]"
				onclick={() => (state.showServiceModal = true)}
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
						<th class="px-4 py-3 font-medium">Service Name</th>
						<th class="px-4 py-3 font-medium">Supplier</th>
						<th class="px-4 py-3 text-right font-medium">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200">
					{#each state.serviceList as item, index}
						<tr class="transition-colors hover:bg-gray-50">
							<td class="px-4 py-3 font-medium text-gray-900">{item.service}</td>
							<td class="px-4 py-3 text-gray-600">{item.supplier}</td>
							<td class="px-4 py-3 text-right">
								<div class="flex justify-end gap-2">
									<button
										class="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#972395]"
										onclick={() => state.editService(item, index)}
									>
										<Edit size={14} />
									</button>
									<button
										class="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
										onclick={() => state.removeService(index)}
									>
										<X size={14} />
									</button>
								</div>
							</td>
						</tr>
					{/each}
					{#if state.serviceList.length === 0}
						<tr>
							<td colspan="3" class="px-4 py-8 text-center text-sm text-gray-500">
								No services added yet. Click "Add Service" to get started.
							</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>

<!-- Service Modal -->
{#if state.showServiceModal}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
		transition:fade={{ duration: 200 }}
	>
		<div
			class="no-scrollbar max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl transition-all duration-300"
			transition:slide={{ axis: 'y', duration: 300 }}
		>
			<div
				class="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white p-6"
			>
				<div>
					<h2 class="text-xl font-semibold text-gray-900">
						{state.editingServiceIndex !== null ? 'Edit' : 'Add'} Service
					</h2>
					<p class="mt-1 text-sm text-gray-500">Configure service details and pricing.</p>
				</div>
				<button
					class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
					onclick={() => {
						state.showServiceModal = false;
						state.resetServiceForm();
					}}
				>
					<X size={20} />
				</button>
			</div>

			<div class="space-y-6 p-6">
				<!-- Section 1: Service Information -->
				<div class="rounded-xl border border-gray-200 bg-gray-50/30 p-5">
					<div class="mb-4 flex items-center gap-3">
						<div
							class="flex h-8 w-8 items-center justify-center rounded-full bg-[#972395] text-sm font-bold text-white"
						>
							1
						</div>
						<h3 class="text-sm font-semibold text-gray-900">Service Information</h3>
					</div>
					<div class="grid grid-cols-2 gap-4">
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700"
								>Supplier <span class="text-red-500">*</span></label
							>
							<select
								class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={state.serviceForm.supplier}
							>
								<option value="">Select supplier</option>
								{#each state.supplierOptions as supplier}
									<option value={supplier}>{supplier}</option>
								{/each}
							</select>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700"
								>Service <span class="text-red-500">*</span></label
							>
							<select
								class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={state.serviceForm.service}
							>
								<option value="">Select service</option>
								{#each state.serviceOptions as service}
									<option value={service}>{service}</option>
								{/each}
							</select>
						</div>
					</div>
				</div>

				<!-- Section 2: Cost Breakdown -->
				<div class="rounded-xl border border-gray-200 bg-gray-50/30 p-5">
					<div class="mb-4 flex items-center gap-3">
						<div
							class="flex h-8 w-8 items-center justify-center rounded-full bg-[#972395] text-sm font-bold text-white"
						>
							2
						</div>
						<h3 class="text-sm font-semibold text-gray-900">Cost Breakdown</h3>
					</div>
					<div class="space-y-4">
						<!-- Adult Row -->
						<div class="rounded-lg border border-gray-200 bg-white p-4">
							<h4 class="mb-3 text-sm font-semibold text-gray-900">Adult Pricing</h4>
							<div class="grid grid-cols-3 gap-3">
								<div class="flex flex-col gap-1">
									<label class="text-xs font-medium text-gray-600">Cost</label>
									<input
										type="number"
										placeholder="0"
										class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={state.serviceForm.adultCost}
									/>
								</div>
								<div class="flex flex-col gap-1">
									<label class="text-xs font-medium text-gray-600">Sell</label>
									<input
										type="number"
										placeholder="0"
										class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={state.serviceForm.adultSell}
									/>
								</div>
								<div class="flex flex-col gap-1">
									<label class="text-xs font-medium text-gray-600">Ors</label>
									<input
										type="number"
										placeholder="0"
										class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={state.serviceForm.adultOrs}
									/>
								</div>
							</div>
						</div>

						<!-- Child Row -->
						<div class="rounded-lg border border-gray-200 bg-white p-4">
							<h4 class="mb-3 text-sm font-semibold text-gray-900">Child Pricing</h4>
							<div class="grid grid-cols-3 gap-3">
								<div class="flex flex-col gap-1">
									<label class="text-xs font-medium text-gray-600">Cost</label>
									<input
										type="number"
										placeholder="0"
										class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={state.serviceForm.childCost}
									/>
								</div>
								<div class="flex flex-col gap-1">
									<label class="text-xs font-medium text-gray-600">Sell</label>
									<input
										type="number"
										placeholder="0"
										class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={state.serviceForm.childSell}
									/>
								</div>
								<div class="flex flex-col gap-1">
									<label class="text-xs font-medium text-gray-600">Ors</label>
									<input
										type="number"
										placeholder="0"
										class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={state.serviceForm.childOrs}
									/>
								</div>
							</div>
						</div>

						<!-- Infant Row -->
						<div class="rounded-lg border border-gray-200 bg-white p-4">
							<h4 class="mb-3 text-sm font-semibold text-gray-900">Infant Pricing</h4>
							<div class="grid grid-cols-3 gap-3">
								<div class="flex flex-col gap-1">
									<label class="text-xs font-medium text-gray-600">Cost</label>
									<input
										type="number"
										placeholder="0"
										class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={state.serviceForm.infantCost}
									/>
								</div>
								<div class="flex flex-col gap-1">
									<label class="text-xs font-medium text-gray-600">Sell</label>
									<input
										type="number"
										placeholder="0"
										class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={state.serviceForm.infantSell}
									/>
								</div>
								<div class="flex flex-col gap-1">
									<label class="text-xs font-medium text-gray-600">Ors</label>
									<input
										type="number"
										placeholder="0"
										class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={state.serviceForm.infantOrs}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div
				class="sticky bottom-0 z-10 flex items-center justify-end gap-3 border-t border-gray-100 bg-white p-6"
			>
				<button
					class="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
					onclick={() => {
						state.showServiceModal = false;
						state.resetServiceForm();
					}}
				>
					Cancel
				</button>
				<button
					class="flex items-center gap-2 rounded-lg bg-[#972395] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#7a1c78]"
					onclick={state.saveService}
				>
					<Save size={18} />
					{state.editingServiceIndex !== null ? 'Update' : 'Add'} Service
				</button>
			</div>
		</div>
	</div>
{/if}
