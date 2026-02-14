<script>
	import { Plus, Edit, X, Save } from 'lucide-svelte';
	import { fade, slide } from 'svelte/transition';

	/** @type {{ state: import('../../packageState.svelte.js').PackageState }} */
	let { state } = $props();

	let activeVariant = $derived(state.packageVariants.find((v) => v.id === state.activeVariantId));
</script>

{#if activeVariant}
	<div class="rounded-xl border border-gray-200 bg-white shadow-sm">
		<div class="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
			<div class="flex items-center justify-between">
				<div>
					<h3 class="text-base font-semibold text-gray-900">Meals List</h3>
					<p class="mt-0.5 text-xs text-gray-500">
						Manage meal plans and catering for <strong>{activeVariant.name}</strong>.
					</p>
				</div>
				<button
					class="flex items-center gap-2 rounded-lg bg-[#972395] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7a1c78]"
					onclick={() => {
						state.resetMealsForm();
						state.showMealsModal = true;
					}}
				>
					<Plus size={16} />
					Add Meal Plan
				</button>
			</div>
		</div>
		<div class="p-6">
			<div class="overflow-hidden rounded-lg border border-gray-200">
				<table class="w-full text-left text-sm">
					<thead class="bg-gray-50 text-gray-600">
						<tr>
							<th class="px-4 py-3 font-medium">Supplier</th>
							<th class="px-4 py-3 font-medium">Hotel</th>
							<th class="px-4 py-3 font-medium">Food Type</th>
							<th class="px-4 py-3 font-medium">Dates</th>
							<th class="px-4 py-3 text-right font-medium">Actions</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200">
						{#each activeVariant.meals as item, index}
							<tr class="transition-colors hover:bg-gray-50">
								<td class="px-4 py-3 font-medium text-gray-900">{item.supplier}</td>
								<td class="px-4 py-3 text-gray-600">{item.hotel}</td>
								<td class="px-4 py-3">
									<span
										class="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700"
									>
										{item.foodType}
									</span>
								</td>
								<td class="px-4 py-3 text-gray-600">{item.fromDate} to {item.toDate}</td>
								<td class="px-4 py-3 text-right">
									<div class="flex justify-end gap-2">
										<button
											class="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#972395]"
											onclick={() => state.editMeals(item, index)}
										>
											<Edit size={14} />
										</button>
										<button
											class="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
											onclick={() => state.removeMeals(index)}
										>
											<X size={14} />
										</button>
									</div>
								</td>
							</tr>
						{/each}
						{#if activeVariant.meals.length === 0}
							<tr>
								<td colspan="5" class="px-4 py-8 text-center text-sm text-gray-500">
									No meal plans added yet. Click "Add Meal Plan" to get started.
								</td>
							</tr>
						{/if}
					</tbody>
				</table>
			</div>
		</div>
	</div>
{/if}

<!-- Meals Modal -->
{#if state.showMealsModal}
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
						{state.editingMealsIndex !== null ? 'Edit' : 'Add'} Meal Plan
					</h2>
					<p class="mt-1 text-sm text-gray-500">Configure meal plan details and pricing.</p>
				</div>
				<button
					class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
					onclick={() => {
						state.showMealsModal = false;
						state.resetMealsForm();
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
					<div class="grid grid-cols-3 gap-4">
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700"
								>Supplier <span class="text-red-500">*</span></label
							>
							<select
								class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={state.mealsForm.supplier}
							>
								<option value="">Select supplier</option>
								<option value="Ibtisam Catering">Ibtisam Catering</option>
								<option value="Dallah Groups">Dallah Groups</option>
								<option value="Al Baik Catering">Al Baik Catering</option>
							</select>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700"
								>Hotel <span class="text-red-500">*</span></label
							>
							<select
								class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={state.mealsForm.hotel}
							>
								<option value="">Select hotel</option>
								<option value="Abdul Aziz Husni">Abdul Aziz Husni</option>
								<option value="Dallah Taibah">Dallah Taibah</option>
								<option value="Al Safwah Royale Orchid">Al Safwah Royale Orchid</option>
							</select>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700"
								>Food Type <span class="text-red-500">*</span></label
							>
							<select
								class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={state.mealsForm.foodType}
							>
								<option value="">Select food type</option>
								<option value="FullBoard">FullBoard</option>
								<option value="Lunch">Lunch</option>
								<option value="Dinner">Dinner</option>
								<option value="Breakfast">Breakfast</option>
							</select>
						</div>
					</div>
				</div>

				<!-- Section 2: Date & Duration -->
				<div class="rounded-xl border border-gray-200 bg-gray-50/30 p-5">
					<div class="mb-4 flex items-center gap-3">
						<div
							class="flex h-8 w-8 items-center justify-center rounded-full bg-[#972395] text-sm font-bold text-white"
						>
							2
						</div>
						<h3 class="text-sm font-semibold text-gray-900">Date & Duration</h3>
					</div>
					<div class="grid grid-cols-3 gap-4">
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700"
								>From Date <span class="text-red-500">*</span></label
							>
							<input
								type="date"
								class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={state.mealsForm.fromDate}
							/>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700"
								>To Date <span class="text-red-500">*</span></label
							>
							<input
								type="date"
								class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={state.mealsForm.toDate}
							/>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700">Nights</label>
							<input
								type="number"
								placeholder="0"
								class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={state.mealsForm.nights}
							/>
						</div>
					</div>
				</div>

				<!-- Section 3: Rate & Tax -->
				<div class="rounded-xl border border-gray-200 bg-gray-50/30 p-5">
					<div class="mb-4 flex items-center gap-3">
						<div
							class="flex h-8 w-8 items-center justify-center rounded-full bg-[#972395] text-sm font-bold text-white"
						>
							3
						</div>
						<h3 class="text-sm font-semibold text-gray-900">Rate & Tax</h3>
					</div>
					<div class="grid grid-cols-3 gap-4">
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700">Rate Code</label>
							<select
								class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={state.mealsForm.rateCode}
							>
								<option value="">Select rate code</option>
								<option value="Per Pax">Per Pax</option>
								<option value="Per Room">Per Room</option>
							</select>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700">VAT</label>
							<select
								class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={state.mealsForm.vat}
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
								placeholder="15"
								class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={state.mealsForm.vatPercent}
								oninput={() => state.calculateMealsTotals()}
							/>
						</div>
					</div>
				</div>

				<!-- Section 4: Cost Breakdown -->
				<div class="rounded-xl border border-gray-200 bg-gray-50/30 p-5">
					<div class="mb-4 flex items-center gap-3">
						<div
							class="flex h-8 w-8 items-center justify-center rounded-full bg-[#972395] text-sm font-bold text-white"
						>
							4
						</div>
						<h3 class="text-sm font-semibold text-gray-900">Cost Breakdown</h3>
					</div>
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
										bind:value={state.mealsForm.adultCost}
										oninput={() => state.calculateMealsTotals()}
									/>
								</div>
								<div class="flex flex-col gap-1">
									<label class="text-xs font-medium text-gray-600">Sell</label>
									<input
										type="number"
										placeholder="0"
										class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={state.mealsForm.adultSell}
										oninput={() => state.calculateMealsTotals()}
									/>
								</div>
								<div class="flex flex-col gap-1">
									<label class="text-xs font-medium text-gray-600">Ors</label>
									<input
										type="number"
										placeholder="0"
										class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={state.mealsForm.adultOrs}
										oninput={() => state.calculateMealsTotals()}
									/>
								</div>
								<div class="flex flex-col gap-1">
									<label class="text-xs font-medium text-gray-600">Total</label>
									<div
										class="rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-sm font-semibold text-[#972395]"
									>
										RM {state.mealsForm.adultTotal || '0.00'}
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
										bind:value={state.mealsForm.childCost}
										oninput={() => state.calculateMealsTotals()}
									/>
								</div>
								<div class="flex flex-col gap-1">
									<label class="text-xs font-medium text-gray-600">Sell</label>
									<input
										type="number"
										placeholder="0"
										class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={state.mealsForm.childSell}
										oninput={() => state.calculateMealsTotals()}
									/>
								</div>
								<div class="flex flex-col gap-1">
									<label class="text-xs font-medium text-gray-600">Ors</label>
									<input
										type="number"
										placeholder="0"
										class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={state.mealsForm.childOrs}
										oninput={() => state.calculateMealsTotals()}
									/>
								</div>
								<div class="flex flex-col gap-1">
									<label class="text-xs font-medium text-gray-600">Total</label>
									<div
										class="rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-sm font-semibold text-[#972395]"
									>
										RM {state.mealsForm.childTotal || '0.00'}
									</div>
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
						state.showMealsModal = false;
						state.resetMealsForm();
					}}
				>
					Cancel
				</button>
				<button
					class="flex items-center gap-2 rounded-lg bg-[#972395] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#7a1c78]"
					onclick={state.saveMeals}
				>
					<Save size={18} />
					{state.editingMealsIndex !== null ? 'Update' : 'Add'} Meal Plan
				</button>
			</div>
		</div>
	</div>
{/if}
