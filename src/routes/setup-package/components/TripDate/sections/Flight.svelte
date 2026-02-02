<script>
	import {
		X,
		Plus,
		Edit,
		Trash2,
		ChevronDown,
		ChevronRight,
		Plane,
		Clock,
		Calendar
	} from 'lucide-svelte';
	import { fly } from 'svelte/transition';

	/** @type {{ state: import('../../packageState.svelte').PackageState }} */
	let { state: pkgState } = $props();

	// Local temporary state for expanded items in list view (optional)
	let expandedGroups = $state({});

	function toggleGroup(id) {
		expandedGroups[id] = !expandedGroups[id];
	}
</script>

<section class="flex flex-col gap-6">
	<div class="flex items-center justify-between">
		<div>
			<h3 class="text-base font-semibold text-gray-900">Flight Details</h3>
			<p class="mt-0.5 text-xs text-gray-500">Manage flight main information and details.</p>
		</div>
		<button
			class="flex items-center gap-2 rounded-lg bg-[#972395] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7a1c78]"
			onclick={() => {
				pkgState.resetFlightForms();
				pkgState.showFlightModal = true;
			}}
		>
			<Plus size={16} />
			Add Flight
		</button>
	</div>

	{#if pkgState.flightList.length === 0}
		<div
			class="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50/50 p-12 text-center"
		>
			<div class="mb-4 rounded-full bg-white p-4 shadow-sm">
				<Plane size={24} class="text-gray-400" />
			</div>
			<h3 class="text-sm font-medium text-gray-900">No flights added</h3>
			<p class="mt-1 text-xs text-gray-500">Start by adding a new flight group.</p>
		</div>
	{:else}
		<div class="grid gap-4">
			{#each pkgState.flightList as group, i}
				<div
					class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md"
				>
					<!-- Group Header -->
					<div
						class="flex cursor-pointer items-center justify-between border-b border-gray-100 bg-gray-50/50 px-5 py-4"
						onclick={() => toggleGroup(group.id)}
					>
						<div class="flex items-center gap-3">
							<button class="text-gray-400 transition-colors hover:text-gray-600">
								{#if expandedGroups[group.id]}
									<ChevronDown size={18} />
								{:else}
									<ChevronRight size={18} />
								{/if}
							</button>
							<div>
								<h4 class="text-sm font-semibold text-gray-900">
									{group.name || 'Untitled Flight'}
								</h4>
								<div class="flex items-center gap-3 text-xs text-gray-500">
									<span class="flex items-center gap-1">
										<Plane size={12} />
										{group.airline || 'No Airline'}
									</span>
									<span>•</span>
									<span>{group.type || 'Type N/A'}</span>
									<span>•</span>
									<span>{group.totalSeats || 0} Seats</span>
								</div>
							</div>
						</div>
						<div class="flex items-center gap-2">
							<button
								class="rounded-lg p-2 text-gray-400 hover:bg-white hover:text-[#972395] hover:shadow-sm"
								onclick={(e) => {
									e.stopPropagation();
									pkgState.editFlightGroup(group, i);
								}}
							>
								<Edit size={16} />
							</button>
							<button
								class="rounded-lg p-2 text-gray-400 hover:bg-white hover:text-red-600 hover:shadow-sm"
								onclick={(e) => {
									e.stopPropagation();
									pkgState.removeFlightGroup(i);
								}}
							>
								<Trash2 size={16} />
							</button>
						</div>
					</div>

					<!-- Items List (Expanded) -->
					{#if expandedGroups[group.id]}
						<div class="divide-y divide-gray-100 bg-white">
							{#if group.items.length === 0}
								<div class="p-6 text-center text-xs text-gray-500">No flight legs added yet.</div>
							{:else}
								{#each group.items as item, j}
									<div class="flex items-start gap-4 p-5 transition-colors hover:bg-gray-50">
										<div
											class="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#972395]/10 text-xs font-bold text-[#972395]"
										>
											{j + 1}
										</div>
										<div class="flex-1 space-y-3">
											<div class="flex items-start justify-between">
												<div>
													<span
														class="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-medium tracking-wide text-blue-700 uppercase"
													>
														{item.type}
													</span>
													<h5 class="mt-1 text-sm font-medium text-gray-900">
														{item.fromCity} <span class="text-gray-400">→</span>
														{item.toCity}
													</h5>
												</div>
											</div>

											<div
												class="grid grid-cols-2 gap-x-8 gap-y-2 text-xs text-gray-600 lg:grid-cols-4"
											>
												<div class="flex items-center gap-1.5">
													<Calendar size={12} class="text-gray-400" />
													{item.departureDate}
												</div>
												<div class="flex items-center gap-1.5">
													<Clock size={12} class="text-gray-400" />
													Dep: {item.departureTime.hour}:{item.departureTime.minute}
													{item.departureTime.ampm}
												</div>
												<div class="flex items-center gap-1.5">
													<Plane size={12} class="text-gray-400" />
													{item.carrier} ({item.carrierNo})
												</div>
											</div>
										</div>
									</div>
								{/each}
							{/if}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</section>

<!-- Main Flight Modal -->
{#if pkgState.showFlightModal}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
		transition:fly={{ duration: 200 }}
	>
		<div
			class="flex h-full max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-gray-50 shadow-2xl"
		>
			<!-- Modal Header -->
			<div class="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
				<div>
					<h3 class="text-lg font-bold text-gray-900">
						{pkgState.editingFlightGroupIndex !== null
							? 'Edit Flight Group'
							: 'Add New Flight Group'}
					</h3>
					<p class="text-xs text-gray-500">Configure main flight details and itinerary legs.</p>
				</div>
				<button
					class="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
					onclick={() => (pkgState.showFlightModal = false)}
				>
					<X size={20} />
				</button>
			</div>

			<!-- Modal Content (Scrollable) -->
			<div class="flex-1 overflow-y-auto p-6">
				<!-- Main Information -->
				<section class="mb-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
					<h4 class="mb-4 border-b border-gray-100 pb-2 text-sm font-semibold text-gray-900">
						Main Information
					</h4>
					<div class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
						<div class="space-y-1.5">
							<label class="text-[13px] font-medium text-gray-700">Flight Name</label>
							<input
								type="text"
								class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								placeholder="e.g. SV Group A"
								bind:value={pkgState.flightGroupForm.name}
							/>
						</div>
						<div class="space-y-1.5">
							<label class="text-[13px] font-medium text-gray-700">Type</label>
							<div class="relative">
								<select
									class="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
									bind:value={pkgState.flightGroupForm.type}
								>
									<option value="">Select Type</option>
									<option value="Domestic">Domestic</option>
									<option value="International">International</option>
								</select>
								<div
									class="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-400"
								>
									<ChevronDown size={14} />
								</div>
							</div>
						</div>
						<div class="space-y-1.5">
							<label class="text-[13px] font-medium text-gray-700">Airline</label>
							<div class="relative">
								<select
									class="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
									bind:value={pkgState.flightGroupForm.airline}
								>
									<option value="">Select Airline</option>
									<option value="Saudi Airlines">Saudi Airlines</option>
									<option value="Malaysia Airlines">Malaysia Airlines</option>
									<option value="Emirates">Emirates</option>
									<option value="Qatar Airways">Qatar Airways</option>
								</select>
								<div
									class="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-400"
								>
									<ChevronDown size={14} />
								</div>
							</div>
						</div>
						<div class="space-y-1.5">
							<label class="text-[13px] font-medium text-gray-700">Total Seats</label>
							<input
								type="number"
								class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								placeholder="0"
								bind:value={pkgState.flightGroupForm.totalSeats}
							/>
						</div>
					</div>
				</section>

				<!-- Item Details (Flight Legs) -->
				<section class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
					<div
						class="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-5 py-3"
					>
						<h4 class="text-sm font-semibold text-gray-900">Flight Legs & Pricing</h4>
						<span class="text-xs text-gray-500"
							>{pkgState.flightGroupForm.items.length} legs added</span
						>
					</div>

					<!-- New Item Form Area -->
					<div class="border-b border-gray-200 bg-blue-50/30 p-5">
						<div class="mb-5 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
							<!-- Row 1 -->
							<div class="space-y-1.5">
								<label class="text-[13px] font-medium text-gray-700"
									>Type <span class="text-red-500">*</span></label
								>
								<select
									class="w-full rounded border border-gray-300 bg-white p-2 text-sm"
									bind:value={pkgState.flightItemForm.type}
								>
									<option value="">Departure</option>
									<option value="Departure">Departure</option>
									<option value="Arrival">Arrival</option>
									<option value="Transit">Transit</option>
								</select>
							</div>
							<div class="space-y-1.5">
								<label class="text-[13px] font-medium text-gray-700">Supplier</label>
								<select
									class="w-full rounded border border-gray-300 bg-white p-2 text-sm"
									bind:value={pkgState.flightItemForm.supplier}
								>
									<option value="">Select</option>
									<option value="Supplier A">Supplier A</option>
									<option value="Supplier B">Supplier B</option>
								</select>
							</div>
							<div class="space-y-1.5">
								<label class="text-[13px] font-medium text-gray-700"
									>Departure Hall <span class="text-red-500">*</span></label
								>
								<input
									type="text"
									class="w-full rounded border border-gray-300 p-2 text-sm uppercase"
									placeholder="e.g. KLIA 1"
									bind:value={pkgState.flightItemForm.departureHall}
								/>
							</div>
							<div class="space-y-1.5">
								<label class="text-[13px] font-medium text-gray-700"
									>Carrier <span class="text-red-500">*</span></label
								>
								<input
									type="text"
									class="w-full rounded border border-gray-300 p-2 text-sm"
									placeholder="e.g. MH"
									bind:value={pkgState.flightItemForm.carrier}
								/>
							</div>

							<!-- Row 2 -->
							<div class="space-y-1.5">
								<label class="text-[13px] font-medium text-gray-700"
									>Carrier No <span class="text-red-500">*</span></label
								>
								<input
									type="text"
									class="w-full rounded border border-gray-300 p-2 text-sm"
									placeholder="e.g. 1335"
									bind:value={pkgState.flightItemForm.carrierNo}
								/>
							</div>
							<div class="space-y-1.5">
								<label class="text-[13px] font-medium text-gray-700"
									>Date <span class="text-red-500">*</span></label
								>
								<input
									type="date"
									class="w-full rounded border border-gray-300 p-2 text-sm"
									bind:value={pkgState.flightItemForm.departureDate}
								/>
							</div>
							<div class="space-y-1.5">
								<label class="text-[13px] font-medium text-gray-700"
									>From City <span class="text-red-500">*</span></label
								>
								<input
									type="text"
									class="w-full rounded border border-gray-300 p-2 text-sm"
									placeholder="From City"
									bind:value={pkgState.flightItemForm.fromCity}
								/>
							</div>
							<div class="grid grid-cols-2 gap-2">
								<div class="space-y-1.5">
									<label class="text-[13px] font-medium text-gray-700"
										>Hour <span class="text-red-500">*</span></label
									>
									<select
										class="w-full rounded border border-gray-300 bg-white p-2 text-sm"
										bind:value={pkgState.flightItemForm.departureTime.hour}
									>
										{#each Array(24) as _, i}
											<option value={i.toString().padStart(2, '0')}
												>{i.toString().padStart(2, '0')}</option
											>
										{/each}
									</select>
								</div>
								<div class="space-y-1.5">
									<label class="text-[13px] font-medium text-gray-700"
										>Minute <span class="text-red-500">*</span></label
									>
									<select
										class="w-full rounded border border-gray-300 bg-white p-2 text-sm"
										bind:value={pkgState.flightItemForm.departureTime.minute}
									>
										{#each Array(60) as _, i}
											<option value={i.toString().padStart(2, '0')}
												>{i.toString().padStart(2, '0')}</option
											>
										{/each}
									</select>
								</div>
							</div>

							<!-- Row 3 -->
							<div class="space-y-1.5">
								<label class="text-[13px] font-medium text-gray-700"
									>To City <span class="text-red-500">*</span></label
								>
								<input
									type="text"
									class="w-full rounded border border-gray-300 p-2 text-sm"
									placeholder="To City"
									bind:value={pkgState.flightItemForm.toCity}
								/>
							</div>
							<div class="grid grid-cols-2 gap-2">
								<div class="space-y-1.5">
									<label class="text-[13px] font-medium text-gray-700"
										>Hour <span class="text-red-500">*</span></label
									>
									<select
										class="w-full rounded border border-gray-300 bg-white p-2 text-sm"
										bind:value={pkgState.flightItemForm.arrivalTime.hour}
									>
										{#each Array(24) as _, i}
											<option value={i.toString().padStart(2, '0')}
												>{i.toString().padStart(2, '0')}</option
											>
										{/each}
									</select>
								</div>
								<div class="space-y-1.5">
									<label class="text-[13px] font-medium text-gray-700"
										>Minute <span class="text-red-500">*</span></label
									>
									<select
										class="w-full rounded border border-gray-300 bg-white p-2 text-sm"
										bind:value={pkgState.flightItemForm.arrivalTime.minute}
									>
										{#each Array(60) as _, i}
											<option value={i.toString().padStart(2, '0')}
												>{i.toString().padStart(2, '0')}</option
											>
										{/each}
									</select>
								</div>
							</div>
							<!-- Trip Field Spacer (Skipped as requested) -->
							<div class="hidden lg:block"></div>
							<div class="space-y-1.5">
								<label class="text-[13px] font-medium text-gray-700"
									>Registration Time (Before Departure)</label
								>
								<input
									type="text"
									class="w-full rounded border border-gray-300 p-2 text-sm"
									placeholder="Registration Time"
									bind:value={pkgState.flightItemForm.registrationTime}
								/>
							</div>

							<!-- Row 4 -->
							<div class="space-y-1.5">
								<label class="text-[13px] font-medium text-gray-700"
									>Reporting Time (Before Check In)</label
								>
								<input
									type="text"
									class="w-full rounded border border-gray-300 p-2 text-sm"
									placeholder="e.g. DUA(2)"
									bind:value={pkgState.flightItemForm.reportingTime}
								/>
							</div>
							<div class="space-y-1.5">
								<label class="text-[13px] font-medium text-gray-700">Notes</label>
								<input
									type="text"
									class="w-full rounded border border-gray-300 p-2 text-sm"
									placeholder="Notes"
									bind:value={pkgState.flightItemForm.notes}
								/>
							</div>
							<div class="space-y-1.5">
								<label class="text-[13px] font-medium text-gray-700">Total Umrah Day</label>
								<input
									type="text"
									class="w-full rounded border border-gray-300 p-2 text-sm"
									placeholder="Total Umrah Day"
									bind:value={pkgState.flightItemForm.totalUmrahDay}
								/>
							</div>
							<div class="flex items-center pt-6">
								<label class="flex cursor-pointer items-center gap-2">
									<input
										type="checkbox"
										class="h-4 w-4 accent-[#972395]"
										bind:checked={pkgState.flightItemForm.skip7DaysRule}
									/>
									<span class="text-sm text-gray-700">Don't Check 7 Days Condition</span>
								</label>
							</div>
						</div>

						<!-- Airfare Cost Table -->
						<div class="mb-4 overflow-hidden rounded-lg border border-gray-200">
							<table class="w-full text-left text-sm">
								<thead class="bg-blue-500 text-xs text-white">
									<tr>
										<th class="px-3 py-2 font-medium">Local Airfare Cost</th>
										<th class="border-l border-white/20 bg-blue-600/50 px-3 py-2 font-medium"
											>Adult Cost</th
										>
										<th class="border-l border-white/20 bg-blue-600/50 px-3 py-2 font-medium"
											>Adult Sell</th
										>
										<th class="border-l border-white/20 bg-blue-600/50 px-3 py-2 font-medium"
											>Child Cost</th
										>
										<th class="border-l border-white/20 bg-blue-600/50 px-3 py-2 font-medium"
											>Child Sell</th
										>
										<th class="border-l border-white/20 bg-blue-600/50 px-3 py-2 font-medium"
											>Infant Cost</th
										>
										<th class="border-l border-white/20 bg-blue-600/50 px-3 py-2 font-medium"
											>Infant Sell</th
										>
									</tr>
								</thead>
								<tbody class="divide-y divide-gray-200 bg-white">
									<tr>
										<td class="px-3 py-2 font-medium text-gray-700">Airfare</td>
										{#each ['adultCost', 'adultSell', 'childCost', 'childSell', 'infantCost', 'infantSell'] as key}
											<td class="border-l border-gray-100 p-1">
												<input
													type="number"
													class="w-full rounded border-gray-200 px-2 py-1 text-xs"
													bind:value={pkgState.flightItemForm.costs.airfare[key]}
													oninput={() => pkgState.calculateFlightItemTotal(pkgState.flightItemForm)}
												/>
											</td>
										{/each}
									</tr>
									<tr>
										<td class="px-3 py-2 font-medium text-gray-700">Airport Tax Malaysia</td>
										{#each ['adultCost', 'adultSell', 'childCost', 'childSell', 'infantCost', 'infantSell'] as key}
											<td class="border-l border-gray-100 p-1">
												<input
													type="number"
													class="w-full rounded border-gray-200 px-2 py-1 text-xs"
													bind:value={pkgState.flightItemForm.costs.tax[key]}
													oninput={() => pkgState.calculateFlightItemTotal(pkgState.flightItemForm)}
												/>
											</td>
										{/each}
									</tr>
									<tr>
										<td class="px-3 py-2 font-medium text-gray-700">UR</td>
										{#each ['adultCost', 'adultSell', 'childCost', 'childSell', 'infantCost', 'infantSell'] as key}
											<td class="border-l border-gray-100 p-1">
												<input
													type="number"
													class="w-full rounded border-gray-200 px-2 py-1 text-xs"
													bind:value={pkgState.flightItemForm.costs.ur[key]}
													oninput={() => pkgState.calculateFlightItemTotal(pkgState.flightItemForm)}
												/>
											</td>
										{/each}
									</tr>
									<tr class="border-t-2 border-gray-100 bg-gray-50">
										<td class="px-3 py-2 font-bold text-gray-900">Flight Total</td>
										{#each ['adultCost', 'adultSell', 'childCost', 'childSell', 'infantCost', 'infantSell'] as key}
											<td
												class="border-l border-gray-200 px-3 py-2 text-xs font-bold text-gray-900"
											>
												{pkgState.flightItemForm.costs.total[key]}
											</td>
										{/each}
									</tr>
								</tbody>
							</table>
						</div>

						<button
							class="w-full rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
							onclick={() => pkgState.addFlightItemToGroup()}
						>
							Add Flight Leg
						</button>
					</div>

					<!-- Existing Items List (Preview) -->
					<ul class="divide-y divide-gray-100">
						{#each pkgState.flightGroupForm.items as item, idx}
							<li class="flex items-center justify-between p-4 hover:bg-gray-50">
								<div class="flex items-center gap-4">
									<span
										class="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600"
									>
										{idx + 1}
									</span>
									<div>
										<p class="text-sm font-medium text-gray-900">{item.fromCity} → {item.toCity}</p>
										<p class="text-xs text-gray-500">{item.carrier} • {item.departureDate}</p>
									</div>
								</div>
								<button
									class="text-gray-400 hover:text-red-500"
									onclick={() => pkgState.removeFlightItemFromGroup(idx)}
								>
									<Trash2 size={16} />
								</button>
							</li>
						{/each}
					</ul>
				</section>
			</div>

			<!-- Modal Footer -->
			<div class="flex items-center justify-end gap-3 border-t border-gray-200 bg-white px-6 py-4">
				<button
					class="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
					onclick={() => (pkgState.showFlightModal = false)}
				>
					Cancel
				</button>
				<button
					class="rounded-lg bg-[#972395] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#861f84]"
					onclick={() => pkgState.saveFlightGroup()}
				>
					Save Flight Group
				</button>
			</div>
		</div>
	</div>
{/if}
