<script>
	import { Plus, Edit, X, Save } from 'lucide-svelte';
	import { fade, slide } from 'svelte/transition';

	/** @type {{ state: import('../../packageState.svelte.js').PackageState }} */
	let { state } = $props();

	// specific to this component, we need to know the active variant
	let activeVariant = $derived(state.packageVariants.find((v) => v.id === state.activeVariantId));
</script>

{#if activeVariant}
	<div class="rounded-xl border border-gray-200 bg-white shadow-sm">
		<div class="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
			<div class="flex items-center justify-between">
				<div>
					<h3 class="text-base font-semibold text-gray-900">Accommodation List</h3>
					<p class="mt-0.5 text-xs text-gray-500">
						Manage hotel accommodations for <strong>{activeVariant.name}</strong>.
					</p>
				</div>
				<button
					class="flex items-center gap-2 rounded-lg bg-[#972395] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7a1c78]"
					onclick={() => {
						state.resetAccommodationForm();
						state.showAccommodationModal = true;
					}}
				>
					<Plus size={16} />
					Add Accommodation
				</button>
			</div>
		</div>
		<div class="p-6">
			<div class="overflow-hidden rounded-lg border border-gray-200">
				<table class="w-full text-left text-sm">
					<thead class="bg-gray-50 text-gray-600">
						<tr>
							<th class="px-4 py-3 font-medium">City</th>
							<th class="px-4 py-3 font-medium">Hotel</th>
							<th class="px-4 py-3 font-medium">Room Type</th>
							<th class="px-4 py-3 font-medium">Check In</th>
							<th class="px-4 py-3 font-medium">Check Out</th>
							<th class="px-4 py-3 text-right font-medium">Actions</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200">
						{#each activeVariant.hotels as item, index}
							<tr class="transition-colors hover:bg-gray-50">
								<td class="px-4 py-3 font-medium text-gray-900">{item.city}</td>
								<td class="px-4 py-3 text-gray-600">{item.hotel}</td>
								<td class="px-4 py-3">
									<span
										class="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
									>
										{item.roomType}
									</span>
								</td>
								<td class="px-4 py-3 text-gray-600">{item.checkIn}</td>
								<td class="px-4 py-3 text-gray-600">{item.checkOut}</td>
								<td class="px-4 py-3 text-right">
									<div class="flex justify-end gap-2">
										<button
											class="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#972395]"
											onclick={() => state.editAccommodation(item, index)}
										>
											<Edit size={14} />
										</button>
										<button
											class="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
											onclick={() => state.removeAccommodation(index)}
										>
											<X size={14} />
										</button>
									</div>
								</td>
							</tr>
						{/each}
						{#if activeVariant.hotels.length === 0}
							<tr>
								<td colspan="6" class="px-4 py-8 text-center text-sm text-gray-500">
									No accommodation added yet. Click "Add Accommodation" to get started.
								</td>
							</tr>
						{/if}
					</tbody>
				</table>
			</div>
		</div>
	</div>
{/if}

<!-- Accommodation Modal -->
{#if state.showAccommodationModal}
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
						{state.editingAccommodationIndex !== null ? 'Edit' : 'Add'} Accommodation
					</h2>
					<p class="mt-1 text-sm text-gray-500">
						Configure hotel accommodation details and pricing.
					</p>
				</div>
				<button
					class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
					onclick={() => {
						state.showAccommodationModal = false;
						state.resetAccommodationForm();
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
								>City <span class="text-red-500">*</span></label
							>
							<select
								class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={state.accommodationForm.city}
							>
								<option value="">Select city</option>
								<option value="Makkah">Makkah</option>
								<option value="Madinah">Madinah</option>
								<option value="Jeddah">Jeddah</option>
							</select>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700"
								>Hotel <span class="text-red-500">*</span></label
							>
							<select
								class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={state.accommodationForm.hotel}
							>
								<option value="">Select hotel</option>
								<option value="Al Safwah Royale Orchid">Al Safwah Royale Orchid</option>
								<option value="Hilton Makkah">Hilton Makkah</option>
								<option value="Swissotel Makkah">Swissotel Makkah</option>
								<option value="Oberoi Madina">Oberoi Madina</option>
							</select>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700"
								>Supplier <span class="text-red-500">*</span></label
							>
							<select
								class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={state.accommodationForm.supplier}
							>
								<option value="">Select supplier</option>
								<option value="Al Safwah Royale Orchid">Al Safwah Royale Orchid</option>
								<option value="Medina Oberoi">Medina Oberoi</option>
							</select>
						</div>
					</div>
				</div>

				<!-- Section 2: Room & Stay Details -->
				<div class="rounded-xl border border-gray-200 bg-gray-50/30 p-5">
					<div class="mb-4 flex items-center gap-3">
						<div
							class="flex h-8 w-8 items-center justify-center rounded-full bg-[#972395] text-sm font-bold text-white"
						>
							2
						</div>
						<h3 class="text-sm font-semibold text-gray-900">Room & Stay Details</h3>
					</div>
					<div class="grid grid-cols-4 gap-4">
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700"
								>Room Type <span class="text-red-500">*</span></label
							>
							<select
								class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={state.accommodationForm.roomType}
							>
								<option value="">Select room type</option>
								<option value="DBL">DBL</option>
								<option value="TWN">TWN</option>
								<option value="TRP">TRP</option>
								<option value="QUD">QUD</option>
							</select>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700"
								>Check-in <span class="text-red-500">*</span></label
							>
							<input
								type="date"
								class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={state.accommodationForm.checkIn}
								onchange={() => state.calculateNights()}
							/>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700"
								>Check-out <span class="text-red-500">*</span></label
							>
							<input
								type="date"
								class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={state.accommodationForm.checkOut}
								onchange={() => state.calculateNights()}
							/>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700">Nights</label>
							<input
								type="number"
								class="rounded-lg border border-gray-300 bg-gray-100 px-3.5 py-2.5 text-sm outline-none"
								bind:value={state.accommodationForm.nights}
								readonly
							/>
						</div>
					</div>
				</div>

				<!-- Section 3: Service & Amenities -->
				<div class="rounded-xl border border-gray-200 bg-gray-50/30 p-5">
					<div class="mb-4 flex items-center gap-3">
						<div
							class="flex h-8 w-8 items-center justify-center rounded-full bg-[#972395] text-sm font-bold text-white"
						>
							3
						</div>
						<h3 class="text-sm font-semibold text-gray-900">Service & Amenities</h3>
					</div>
					<div class="grid grid-cols-4 gap-4">
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700">Basis</label>
							<select
								class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={state.accommodationForm.basis}
							>
								<option value="">Select basis</option>
								<option value="Room Only">Room Only</option>
								<option value="Bed & Breakfast">Bed & Breakfast</option>
								<option value="Half Board">Half Board</option>
								<option value="Full Board">Full Board</option>
							</select>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700">Rate Code</label>
							<select
								class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={state.accommodationForm.rateCode}
							>
								<option value="">Select rate code</option>
								<option value="Per Room Per Night">Per Room Per Night</option>
								<option value="Per Person Per Night">Per Person Per Night</option>
							</select>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700">Package Meals</label>
							<select
								class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={state.accommodationForm.packageMeals}
							>
								<option value="">Select meals</option>
								<option value="Breakfast Asian">Breakfast Asian</option>
								<option value="Lunch Asian">Lunch Asian</option>
								<option value="Dinner Asian">Dinner Asian</option>
							</select>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700">Hotel View</label>
							<select
								class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={state.accommodationForm.hotelView}
							>
								<option value="">Select view</option>
								<option value="Haram View">Haram View</option>
								<option value="City View">City View</option>
								<option value="Sea View">Sea View</option>
							</select>
						</div>
					</div>
				</div>

				<!-- Section 4: Tax & Additional Charges -->
				<div class="rounded-xl border border-gray-200 bg-gray-50/30 p-5">
					<div class="mb-4 flex items-center gap-3">
						<div
							class="flex h-8 w-8 items-center justify-center rounded-full bg-[#972395] text-sm font-bold text-white"
						>
							4
						</div>
						<h3 class="text-sm font-semibold text-gray-900">Tax & Additional Charges</h3>
					</div>
					<div class="grid grid-cols-4 gap-4">
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700">VAT</label>
							<select
								class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={state.accommodationForm.vat}
							>
								<option value="">Select VAT</option>
								<option value="Select">Select</option>
							</select>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700">Municipality Tax</label>
							<select
								class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={state.accommodationForm.municipalityTax}
							>
								<option value="">Select</option>
								<option value="Select">Select</option>
							</select>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700">VAT %</label>
							<input
								type="number"
								placeholder="15"
								class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={state.accommodationForm.vatPercent}
								oninput={() => state.calculateTotals()}
							/>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700">Municipality Tax %</label>
							<input
								type="number"
								placeholder="5"
								class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={state.accommodationForm.municipalityTaxPercent}
								oninput={() => state.calculateTotals()}
							/>
						</div>
					</div>
				</div>

				<!-- Section 5: Cost Breakdown -->
				<div class="rounded-xl border border-gray-200 bg-gray-50/30 p-5">
					<div class="mb-4 flex items-center gap-3">
						<div
							class="flex h-8 w-8 items-center justify-center rounded-full bg-[#972395] text-sm font-bold text-white"
						>
							5
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
										bind:value={state.accommodationForm.adultCost}
										oninput={() => state.calculateTotals()}
									/>
								</div>
								<div class="flex flex-col gap-1">
									<label class="text-xs font-medium text-gray-600">Sell</label>
									<input
										type="number"
										placeholder="0"
										class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={state.accommodationForm.adultSell}
										oninput={() => state.calculateTotals()}
									/>
								</div>
								<div class="flex flex-col gap-1">
									<label class="text-xs font-medium text-gray-600">Ors</label>
									<input
										type="number"
										placeholder="0"
										class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={state.accommodationForm.adultOrs}
										oninput={() => state.calculateTotals()}
									/>
								</div>
								<div class="flex flex-col gap-1">
									<label class="text-xs font-medium text-gray-600">Total</label>
									<div
										class="rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-sm font-semibold text-[#972395]"
									>
										RM {state.accommodationForm.adultTotal || '0.00'}
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
										bind:value={state.accommodationForm.childCost}
										oninput={() => state.calculateTotals()}
									/>
								</div>
								<div class="flex flex-col gap-1">
									<label class="text-xs font-medium text-gray-600">Sell</label>
									<input
										type="number"
										placeholder="0"
										class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={state.accommodationForm.childSell}
										oninput={() => state.calculateTotals()}
									/>
								</div>
								<div class="flex flex-col gap-1">
									<label class="text-xs font-medium text-gray-600">Ors</label>
									<input
										type="number"
										placeholder="0"
										class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={state.accommodationForm.childOrs}
										oninput={() => state.calculateTotals()}
									/>
								</div>
								<div class="flex flex-col gap-1">
									<label class="text-xs font-medium text-gray-600">Total</label>
									<div
										class="rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-sm font-semibold text-[#972395]"
									>
										RM {state.accommodationForm.childTotal || '0.00'}
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
						state.showAccommodationModal = false;
						state.resetAccommodationForm();
					}}
				>
					Cancel
				</button>
				<button
					class="flex items-center gap-2 rounded-lg bg-[#972395] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#7a1c78]"
					onclick={state.saveAccommodation}
				>
					<Save size={18} />
					{state.editingAccommodationIndex !== null ? 'Update' : 'Add'} Accommodation
				</button>
			</div>
		</div>
	</div>
{/if}
