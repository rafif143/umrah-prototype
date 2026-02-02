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
				<h3 class="text-base font-semibold text-gray-900">Transport List</h3>
				<p class="mt-0.5 text-xs text-gray-500">Manage transportation arrangements.</p>
			</div>
			<button
				class="flex items-center gap-2 rounded-lg bg-[#972395] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7a1c78]"
				onclick={() => (state.showTransportModal = true)}
			>
				<Plus size={16} />
				Add Transportation
			</button>
		</div>
	</div>
	<div class="p-6">
		<div class="overflow-hidden rounded-lg border border-gray-200">
			<table class="w-full text-left text-sm">
				<thead class="bg-gray-50 text-gray-600">
					<tr>
						<th class="px-4 py-3 font-medium">Trip</th>
						<th class="px-4 py-3 font-medium">Supplier</th>
						<th class="px-4 py-3 font-medium">Vehicle</th>
						<th class="px-4 py-3 font-medium">Date</th>
						<th class="px-4 py-3 text-right font-medium">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200">
					{#each state.transportList as item, index}
						<tr class="transition-colors hover:bg-gray-50">
							<td class="px-4 py-3 font-medium text-gray-900">{item.trip}</td>
							<td class="px-4 py-3 text-gray-600">{item.supplier}</td>
							<td class="px-4 py-3">
								<span
									class="inline-flex items-center rounded-full bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700"
								>
									{item.vehicle}
								</span>
							</td>
							<td class="px-4 py-3 text-gray-600">{item.travelDate}</td>
							<td class="px-4 py-3 text-right">
								<div class="flex justify-end gap-2">
									<button
										class="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#972395]"
										onclick={() => state.editTransport(item, index)}
									>
										<Edit size={14} />
									</button>
									<button
										class="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
										onclick={() => state.removeTransport(index)}
									>
										<X size={14} />
									</button>
								</div>
							</td>
						</tr>
					{/each}
					{#if state.transportList.length === 0}
						<tr>
							<td colspan="5" class="px-4 py-8 text-center text-sm text-gray-500">
								No transportation added yet. Click "Add Transportation" to get started.
							</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>

<!-- Transport Modal -->
{#if state.showTransportModal}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
		transition:fade={{ duration: 200 }}
	>
		<div
			class="no-scrollbar max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl transition-all duration-300"
			transition:slide={{ axis: 'y', duration: 300 }}
		>
			<div
				class="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white p-6"
			>
				<div>
					<h2 class="text-xl font-semibold text-gray-900">
						{state.editingTransportIndex !== null ? 'Edit' : 'Add'} Transportation
					</h2>
					<p class="mt-1 text-sm text-gray-500">Configure transportation details and pricing.</p>
				</div>
				<button
					class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
					onclick={() => {
						state.showTransportModal = false;
						state.resetTransportForm();
					}}
				>
					<X size={20} />
				</button>
			</div>

			<div class="space-y-6 p-6">
				<!-- Section 1: Basic Information -->
				<div class="rounded-xl border border-gray-200 bg-gray-50/30 p-5">
					<div class="mb-4 flex items-center gap-3">
						<div
							class="flex h-8 w-8 items-center justify-center rounded-full bg-[#972395] text-sm font-bold text-white"
						>
							1
						</div>
						<h3 class="text-sm font-semibold text-gray-900">Basic Information</h3>
					</div>
					<div class="grid grid-cols-4 gap-4">
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700"
								>Trip <span class="text-red-500">*</span></label
							>
							<select
								class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={state.transportForm.trip}
							>
								<option value="">Select trip</option>
								<option value="Round Trip">Round Trip</option>
								<option value="One Way">One Way</option>
								<option value="Airport Transfer">Airport Transfer</option>
							</select>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700"
								>Supplier <span class="text-red-500">*</span></label
							>
							<select
								class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={state.transportForm.supplier}
							>
								<option value="">Select supplier</option>
								<option value="Hussain">Hussain</option>
								<option value="Al Rajhi Transport">Al Rajhi Transport</option>
								<option value="Saudi Transport Co">Saudi Transport Co</option>
							</select>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700"
								>Travel Date <span class="text-red-500">*</span></label
							>
							<input
								type="date"
								class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={state.transportForm.travelDate}
							/>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700"
								>Vehicle <span class="text-red-500">*</span></label
							>
							<select
								class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={state.transportForm.vehicle}
							>
								<option value="">Select vehicle</option>
								<option value="BUS">BUS</option>
								<option value="VAN">VAN</option>
								<option value="CAR">CAR</option>
								<option value="COASTER">COASTER</option>
							</select>
						</div>
					</div>
				</div>

				<!-- Section 2: Rate & Tax Information -->
				<div class="rounded-xl border border-gray-200 bg-gray-50/30 p-5">
					<div class="mb-4 flex items-center gap-3">
						<div
							class="flex h-8 w-8 items-center justify-center rounded-full bg-[#972395] text-sm font-bold text-white"
						>
							2
						</div>
						<h3 class="text-sm font-semibold text-gray-900">Rate & Tax Information</h3>
					</div>
					<div class="grid grid-cols-3 gap-4">
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700"
								>Rate Code <span class="text-red-500">*</span></label
							>
							<select
								class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={state.transportForm.rateCode}
								onchange={state.calculateTransportTotals}
							>
								<option value="">Select rate code</option>
								<option value="Per Pax">Per Pax</option>
								<option value="Fixed Cost">Fixed Cost</option>
							</select>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700">VAT</label>
							<select
								class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={state.transportForm.vat}
							>
								<option value="">Select VAT</option>
								<option value="VAT_2018">VAT_2018</option>
								<option value="VAT_2020">VAT_2020</option>
							</select>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700">VAT %</label>
							<input
								type="number"
								placeholder="5"
								class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={state.transportForm.vatPercent}
								oninput={state.calculateTransportTotals}
							/>
						</div>
					</div>
				</div>

				<!-- Section 3: Cost Breakdown -->
				<div class="rounded-xl border border-gray-200 bg-gray-50/30 p-5">
					<div class="mb-4 flex items-center gap-3">
						<div
							class="flex h-8 w-8 items-center justify-center rounded-full bg-[#972395] text-sm font-bold text-white"
						>
							3
						</div>
						<h3 class="text-sm font-semibold text-gray-900">Cost Breakdown</h3>
					</div>

					{#if state.transportForm.rateCode === 'Fixed Cost'}
						<!-- Fixed Cost Input -->
						<div class="grid grid-cols-2 gap-4">
							<div class="flex flex-col gap-1.5">
								<label class="text-[13px] font-medium text-gray-700">Fixed Cost Amount</label>
								<input
									type="number"
									placeholder="0"
									class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
									bind:value={state.transportForm.fixedCost}
									oninput={state.calculateTransportTotals}
								/>
							</div>
							<div class="flex flex-col gap-1.5">
								<label class="text-[13px] font-medium text-gray-700">Total (with VAT)</label>
								<div
									class="rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm font-semibold text-[#972395]"
								>
									RM {state.transportForm.fixedTotal || '0.00'}
								</div>
							</div>
						</div>
					{:else if state.transportForm.rateCode === 'Per Pax'}
						<!-- Per Pax Table - Compact Version -->
						<div class="space-y-4">
							<!-- Adult Row -->
							<div class="rounded-lg border border-gray-200 bg-white p-4">
								<h4 class="mb-3 text-sm font-semibold text-gray-900">Adult Pricing</h4>
								<div class="grid grid-cols-4 gap-3">
									<div class="flex flex-col gap-1">
										<label class="text-xs font-medium text-gray-600">Cost</label>
										<input
											type="number"
											placeholder="0"
											class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
											bind:value={state.transportForm.adultCost}
											oninput={state.calculateTransportTotals}
										/>
									</div>
									<div class="flex flex-col gap-1">
										<label class="text-xs font-medium text-gray-600">Sell</label>
										<input
											type="number"
											placeholder="0"
											class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
											bind:value={state.transportForm.adultSell}
											oninput={state.calculateTransportTotals}
										/>
									</div>
									<div class="flex flex-col gap-1">
										<label class="text-xs font-medium text-gray-600">Ors</label>
										<input
											type="number"
											placeholder="0"
											class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
											bind:value={state.transportForm.adultOrs}
											oninput={state.calculateTransportTotals}
										/>
									</div>
									<div class="flex flex-col gap-1">
										<label class="text-xs font-medium text-gray-600">Total</label>
										<div
											class="rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-sm font-semibold text-[#972395]"
										>
											RM {state.transportForm.adultTotal || '0.00'}
										</div>
									</div>
								</div>
							</div>

							<!-- Child Row -->
							<div class="rounded-lg border border-gray-200 bg-white p-4">
								<h4 class="mb-3 text-sm font-semibold text-gray-900">Child Pricing</h4>
								<div class="grid grid-cols-4 gap-3">
									<div class="flex flex-col gap-1">
										<label class="text-xs font-medium text-gray-600">Cost</label>
										<input
											type="number"
											placeholder="0"
											class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
											bind:value={state.transportForm.childCost}
											oninput={state.calculateTransportTotals}
										/>
									</div>
									<div class="flex flex-col gap-1">
										<label class="text-xs font-medium text-gray-600">Sell</label>
										<input
											type="number"
											placeholder="0"
											class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
											bind:value={state.transportForm.childSell}
											oninput={state.calculateTransportTotals}
										/>
									</div>
									<div class="flex flex-col gap-1">
										<label class="text-xs font-medium text-gray-600">Ors</label>
										<input
											type="number"
											placeholder="0"
											class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
											bind:value={state.transportForm.childOrs}
											oninput={state.calculateTransportTotals}
										/>
									</div>
									<div class="flex flex-col gap-1">
										<label class="text-xs font-medium text-gray-600">Total</label>
										<div
											class="rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-sm font-semibold text-[#972395]"
										>
											RM {state.transportForm.childTotal || '0.00'}
										</div>
									</div>
								</div>
							</div>

							<!-- Infant Row -->
							<div class="rounded-lg border border-gray-200 bg-white p-4">
								<h4 class="mb-3 text-sm font-semibold text-gray-900">Infant Pricing</h4>
								<div class="grid grid-cols-4 gap-3">
									<div class="flex flex-col gap-1">
										<label class="text-xs font-medium text-gray-600">Cost</label>
										<input
											type="number"
											placeholder="0"
											class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
											bind:value={state.transportForm.infantCost}
											oninput={state.calculateTransportTotals}
										/>
									</div>
									<div class="flex flex-col gap-1">
										<label class="text-xs font-medium text-gray-600">Sell</label>
										<input
											type="number"
											placeholder="0"
											class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
											bind:value={state.transportForm.infantSell}
											oninput={state.calculateTransportTotals}
										/>
									</div>
									<div class="flex flex-col gap-1">
										<label class="text-xs font-medium text-gray-600">Ors</label>
										<input
											type="number"
											placeholder="0"
											class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
											bind:value={state.transportForm.infantOrs}
											oninput={state.calculateTransportTotals}
										/>
									</div>
									<div class="flex flex-col gap-1">
										<label class="text-xs font-medium text-gray-600">Total</label>
										<div
											class="rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-sm font-semibold text-[#972395]"
										>
											RM {state.transportForm.infantTotal || '0.00'}
										</div>
									</div>
								</div>
							</div>
						</div>
					{:else}
						<!-- Placeholder when no rate code selected -->
						<div class="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
							<p class="text-sm text-gray-500">Please select a rate code to configure pricing</p>
						</div>
					{/if}
				</div>
			</div>

			<div
				class="sticky bottom-0 z-10 flex items-center justify-end gap-3 border-t border-gray-100 bg-white p-6"
			>
				<button
					class="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
					onclick={() => {
						state.showTransportModal = false;
						state.resetTransportForm();
					}}
				>
					Cancel
				</button>
				<button
					class="flex items-center gap-2 rounded-lg bg-[#972395] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#7a1c78]"
					onclick={state.saveTransport}
				>
					<Save size={18} />
					{state.editingTransportIndex !== null ? 'Update' : 'Add'} Transportation
				</button>
			</div>
		</div>
	</div>
{/if}
