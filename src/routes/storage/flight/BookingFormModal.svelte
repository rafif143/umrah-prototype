<script>
	import { Plus, Plane, X, Check, ChevronDown, ChevronUp, Trash2 } from 'lucide-svelte';
	import { slide, fly, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { airlineStore } from '$lib/stores/airlineStore.svelte.js';
	import { createEmptyBooking, createEmptyPnr, createEmptySector } from './flightUtils.js';

	let { show = false, booking = null, onClose, onSave } = $props();

	// Internal form state
	let formData = $state(createEmptyBooking());
	let isEditing = $derived(!!booking);
	let expandedSectors = $state(new Set([0])); // Default first expanded

	// Watch booking prop changes
	$effect(() => {
		if (show) {
			if (booking) {
				// Migrate old structure if needed
				if (booking.pnrGroups && !booking.pnrs) {
					// Migration Logic
					const firstGroup = booking.pnrGroups[0] || {};
					const airline = firstGroup.airline || '';

					// Collect PNRs
					const pnrs = booking.pnrGroups.map((g) => ({
						pnr: g.pnr || '',
						class: '', // New field
						name: '', // New field
						number: '', // New field
						seats: 0 // New field
					}));

					// Collect Sectors
					const sectors = firstGroup.sectors?.map((s) => {
						const { costs, ...rest } = s; // Exclude costs from sector
						return {
							...createEmptySector(),
							...rest
						};
					}) || [createEmptySector()];

					// Extract costs from first sector or use default
					const migratedCosts = firstGroup.sectors?.[0]?.costs || createEmptyBooking().costs;

					formData = {
						id: booking.id,
						travelAgent: booking.travelAgent || '',
						airline: airline,
						totalSeats: 0,
						pnrs: pnrs.length ? pnrs : [createEmptyPnr()],
						sectors: sectors,
						costs: migratedCosts,
						notes: booking.notes || ''
					};
				} else {
					// Assume new structure or exact match
					// If booking.costs exists use it, otherwise try to migrate from sectors[0]
					const existingCosts =
						booking.costs || booking.sectors?.[0]?.costs || createEmptyBooking().costs;

					formData = {
						...createEmptyBooking(),
						...booking,
						pnrs: booking.pnrs?.length ? booking.pnrs : [createEmptyPnr()],
						sectors: booking.sectors?.length
							? booking.sectors.map((s) => {
									const { costs, ...rest } = s;
									return { ...createEmptySector(), ...rest };
								})
							: [createEmptySector()],
						costs: existingCosts
					};
				}
				expandedSectors = new Set(); // Collapse all on edit open
			} else {
				formData = createEmptyBooking();
				expandedSectors = new Set([0]); // Expand first on create
			}
		}
	});

	// PNR functions
	function addPnr() {
		formData.pnrs = [...formData.pnrs, createEmptyPnr()];
	}

	function removePnr(index) {
		if (formData.pnrs.length > 1) {
			formData.pnrs = formData.pnrs.filter((_, i) => i !== index);
		}
	}

	// Sector functions
	function addSector() {
		formData.sectors = [...formData.sectors, createEmptySector()];
		// Auto expand new sector
		const newSet = new Set(expandedSectors);
		newSet.add(formData.sectors.length - 1);
		expandedSectors = newSet;
	}

	function removeSector(index) {
		if (formData.sectors.length > 1) {
			formData.sectors = formData.sectors.filter((_, i) => i !== index);
			// Optional: Adjust expanded indices or just reset?
			// Simplest: Remove from set.
			const newSet = new Set();
			for (const expandedIdx of expandedSectors) {
				if (expandedIdx < index) newSet.add(expandedIdx);
				else if (expandedIdx > index) newSet.add(expandedIdx - 1);
			}
			expandedSectors = newSet;
		}
	}

	function toggleSector(index) {
		const newSet = new Set(expandedSectors);
		if (newSet.has(index)) {
			newSet.delete(index);
		} else {
			newSet.add(index);
		}
		expandedSectors = newSet;
	}

	// Class Dropdown Logic
	let pnrClasses = $state(['Economy', 'Business', 'First', 'Promo']);

	function handleClassChange(e, pnr) {
		if (e.target.value === '__ADD_NEW__') {
			pnr.isAddingClass = true;
			pnr.tempClass = '';
			pnr.backupClass = pnr.class; // Save current value to restore if cancelled
			pnr.class = ''; // Clear for input
		}
	}

	function saveNewClass(pnr) {
		if (pnr.tempClass && pnr.tempClass.trim()) {
			const newClass = pnr.tempClass.trim();
			if (!pnrClasses.includes(newClass)) {
				pnrClasses = [...pnrClasses, newClass];
			}
			pnr.class = newClass;
			pnr.isAddingClass = false;
		}
	}

	function cancelNewClass(pnr) {
		pnr.class = pnr.backupClass || '';
		pnr.isAddingClass = false;
	}

	function handleSubmit() {
		// Basic Validation
		if (!formData.travelAgent || !formData.airline) {
			alert('Please fill in Travel Agent and Airline');
			return;
		}

		// Clean up data
		const bookingData = {
			...formData,
			totalSeats: Number(formData.totalSeats) || 0,
			pnrs: formData.pnrs.filter((p) => p.pnr || p.name), // Keep valid-ish PNRs
			sectors: formData.sectors,
			costs: formData.costs
		};

		onSave(bookingData, booking?.id);
		onClose();
	}

	// Hour/Minute options
	const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
	const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
</script>

{#if show}
	<div
		class="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
		transition:fade={{ duration: 200 }}
		onclick={onClose}
		role="button"
		tabindex="-1"
		onkeydown={(e) => e.key === 'Escape' && onClose()}
	>
		<!-- Modal -->
		<div
			class="relative z-50 flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
			transition:fly={{ y: 20, duration: 250, easing: cubicOut }}
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
			role="dialog"
			aria-modal="true"
			tabindex="-1"
		>
			<!-- Header -->
			<div class="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
				<div>
					<h2 class="text-xl font-bold text-gray-900">
						{isEditing ? 'Edit Flight Confirm' : 'Add Flight Confirm'}
					</h2>
					<p class="text-sm text-gray-500">Manage flight booking details</p>
				</div>
				<button
					class="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
					onclick={onClose}
				>
					<X size={24} />
				</button>
			</div>

			<!-- Form Body -->
			<div class="min-h-0 flex-1 overflow-y-auto bg-gray-50/50 p-6">
				<div class="flex flex-col gap-6">
					<!-- Top Section: General Info -->
					<div
						class="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-3"
					>
						<!-- Travel Agent -->
						<div class="flex flex-col gap-1.5">
							<label for="travelAgent" class="text-[13px] font-medium text-gray-700">
								Booking Name / Travel Agent <span class="text-red-500">*</span>
							</label>
							<input
								type="text"
								id="travelAgent"
								placeholder="Enter company name"
								class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={formData.travelAgent}
							/>
						</div>

						<!-- Airline -->
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700"
								>Airline <span class="text-red-500">*</span></label
							>
							<select
								class="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={formData.airline}
							>
								<option value="">Select Airline</option>
								{#each airlineStore.airlines as airline}
									<option value={airline.code}>{airline.name}</option>
								{/each}
							</select>
						</div>

						<!-- Total Seats -->
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700">Total Seats</label>
							<input
								type="number"
								placeholder="e.g. 45"
								class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={formData.totalSeats}
							/>
						</div>
					</div>

					<!-- PNR List Section -->
					<div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
						<div
							class="flex items-center justify-between border-b border-gray-100 bg-purple-50/50 px-4 py-3"
						>
							<div class="flex items-center gap-2">
								<div
									class="flex h-6 w-6 items-center justify-center rounded-full bg-[#972395]/10 text-[#972395]"
								>
									<Plane size={14} />
								</div>
								<h3 class="text-sm font-bold text-gray-900">PNR List</h3>
							</div>
							<button
								type="button"
								class="flex items-center gap-1 text-xs font-medium text-[#972395] hover:text-[#7a1c78]"
								onclick={addPnr}
							>
								<Plus size={14} /> Add PNR
							</button>
						</div>

						<div class="p-4">
							<div class="overflow-x-auto rounded-lg border border-gray-200">
								<table class="w-full text-left text-sm">
									<thead
										class="bg-gray-50 text-xs font-semibold tracking-wider text-gray-500 uppercase"
									>
										<tr>
											<th class="px-3 py-2">PNR Code</th>
											<th class="px-3 py-2">Class</th>
											<th class="px-3 py-2">Group Name</th>
											<th class="px-3 py-2">Flight Number</th>
											<th class="w-20 px-3 py-2 text-center">Seats</th>
											<th class="w-10 px-3 py-2"></th>
										</tr>
									</thead>
									<tbody class="divide-y divide-gray-100 bg-white">
										{#each formData.pnrs as pnr, idx}
											<tr>
												<td class="p-2">
													<input
														type="text"
														class="w-full rounded border border-gray-300 px-2 py-1.5 text-sm uppercase focus:border-[#972395] focus:outline-none"
														placeholder="PNR"
														bind:value={pnr.pnr}
													/>
												</td>
												<td class="p-2">
													{#if pnr.isAddingClass}
														<div class="flex items-center gap-1">
															<input
																type="text"
																class="w-full min-w-[80px] rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-[#972395] focus:outline-none"
																placeholder="New Class"
																bind:value={pnr.tempClass}
																autofocus
																onkeydown={(e) => {
																	if (e.key === 'Enter') saveNewClass(pnr);
																	if (e.key === 'Escape') cancelNewClass(pnr);
																}}
															/>
															<button
																class="rounded bg-green-50 p-1 text-green-600 hover:bg-green-100"
																onclick={() => saveNewClass(pnr)}
																title="Save"
															>
																<Check size={14} />
															</button>
															<button
																class="rounded bg-red-50 p-1 text-red-600 hover:bg-red-100"
																onclick={() => cancelNewClass(pnr)}
																title="Cancel"
															>
																<X size={14} />
															</button>
														</div>
													{:else}
														<select
															class="w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-[#972395] focus:outline-none"
															bind:value={pnr.class}
															onchange={(e) => handleClassChange(e, pnr)}
														>
															<option value="">Select</option>
															{#each pnrClasses as cls}
																<option value={cls}>{cls}</option>
															{/each}
															<option value="__ADD_NEW__" class="font-bold text-[#972395]"
																>+ Add Class</option
															>
														</select>
													{/if}
												</td>
												<td class="p-2">
													<input
														type="text"
														class="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-[#972395] focus:outline-none"
														placeholder="Group A"
														bind:value={pnr.name}
													/>
												</td>
												<td class="p-2">
													<input
														type="text"
														class="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-[#972395] focus:outline-none"
														placeholder="SV 819"
														bind:value={pnr.number}
													/>
												</td>
												<td class="p-2">
													<input
														type="number"
														class="w-full rounded border border-gray-300 px-2 py-1.5 text-center text-sm focus:border-[#972395] focus:outline-none"
														bind:value={pnr.seats}
													/>
												</td>
												<td class="p-2 text-center">
													{#if formData.pnrs.length > 1}
														<button
															class="text-gray-400 hover:text-red-500"
															onclick={() => removePnr(idx)}
														>
															<Trash2 size={16} />
														</button>
													{/if}
												</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						</div>
					</div>

					<!-- Flight Sectors Section -->
					<div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
						<div
							class="flex items-center justify-between border-b border-gray-100 bg-blue-50/50 px-4 py-3"
						>
							<div class="flex items-center gap-2">
								<div
									class="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600"
								>
									<Plane size={14} class="rotate-45" />
								</div>
								<h3 class="text-sm font-bold text-gray-900">Flight Sectors (Itinerary)</h3>
							</div>
							<button
								type="button"
								class="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
								onclick={addSector}
							>
								<Plus size={14} /> Add Sector
							</button>
						</div>

						<div class="flex flex-col gap-4 p-4">
							{#each formData.sectors as sector, sIdx}
								<div
									class="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
								>
									<!-- Sector Header (Clickable) -->
									<button
										type="button"
										class="flex w-full cursor-pointer items-center justify-between bg-gray-50/50 px-4 py-3 text-left transition-colors hover:bg-gray-100/50"
										onclick={() => toggleSector(sIdx)}
									>
										<div class="flex items-center gap-3">
											<span
												class="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600"
											>
												{sIdx + 1}
											</span>
											<div>
												<p class="text-sm font-semibold text-gray-900">
													{#if sector.fromCity && sector.toCity}
														{sector.fromCity} → {sector.toCity}
													{:else}
														Sector {sIdx + 1}
													{/if}
												</p>
												{#if sector.departureDate}
													<p class="text-[10px] text-gray-500">
														{sector.departureDate}
														{sector.carrier ? `• ${sector.carrier}` : ''}
													</p>
												{/if}
											</div>
										</div>

										<div class="flex items-center gap-3">
											{#if formData.sectors.length > 1}
												<button
													type="button"
													class="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
													onclick={(e) => {
														e.stopPropagation();
														removeSector(sIdx);
													}}
													title="Remove Sector"
												>
													<Trash2 size={14} />
												</button>
											{/if}
											{#if expandedSectors.has(sIdx)}
												<ChevronUp size={16} class="text-gray-400" />
											{:else}
												<ChevronDown size={16} class="text-gray-400" />
											{/if}
										</div>
									</button>

									{#if expandedSectors.has(sIdx)}
										<div class="border-t border-gray-100 p-4" transition:slide={{ duration: 200 }}>
											<!-- Row 1: Type, Supplier, Departure Hall, Carrier Info -->
											<div class="mb-3 grid grid-cols-5 gap-2">
												<div class="flex flex-col gap-0.5">
													<label class="text-[10px] font-medium text-gray-500">Type</label>
													<select
														class="rounded border border-gray-200 bg-white px-2 py-1.5 text-xs"
														bind:value={sector.type}
													>
														<option value="Departure">Departure</option>
														<option value="Arrival">Arrival</option>
														<option value="Transit">Transit</option>
													</select>
												</div>
												<div class="flex flex-col gap-0.5">
													<label class="text-[10px] font-medium text-gray-500">Supplier</label>
													<select
														class="rounded border border-gray-200 bg-white px-2 py-1.5 text-xs"
														bind:value={sector.supplier}
													>
														<option value="">Select</option>
														<option value="Supplier A">Supplier A</option>
														<option value="Supplier B">Supplier B</option>
													</select>
												</div>
												<div class="flex flex-col gap-0.5">
													<label class="text-[10px] font-medium text-gray-500">Dep Hall</label>
													<input
														type="text"
														class="rounded border border-gray-200 bg-white px-2 py-1.5 text-xs uppercase"
														placeholder="KLIA 1"
														bind:value={sector.departureHall}
													/>
												</div>
												<div class="flex flex-col gap-0.5">
													<label class="text-[10px] font-medium text-gray-500">Carrier</label>
													<input
														type="text"
														class="rounded border border-gray-200 bg-white px-2 py-1.5 text-xs"
														placeholder={formData.airline || 'MH'}
														bind:value={sector.carrier}
													/>
												</div>
												<div class="flex flex-col gap-0.5">
													<label class="text-[10px] font-medium text-gray-500">No</label>
													<input
														type="text"
														class="rounded border border-gray-200 bg-white px-2 py-1.5 text-xs"
														placeholder="123"
														bind:value={sector.carrierNo}
													/>
												</div>
											</div>

											<!-- Row 2: Route & Date -->
											<div class="mb-3 grid grid-cols-4 gap-2">
												<div class="flex flex-col gap-0.5">
													<label class="text-[10px] font-medium text-gray-500">From</label>
													<select
														class="rounded border border-gray-200 bg-white px-2 py-1.5 text-xs"
														bind:value={sector.fromCity}
													>
														<option value="">Select</option>
														{#each airlineStore.airports as airport}
															<option value={airport.code}>{airport.city} ({airport.code})</option>
														{/each}
													</select>
												</div>
												<div class="flex flex-col gap-0.5">
													<label class="text-[10px] font-medium text-gray-500">To</label>
													<select
														class="rounded border border-gray-200 bg-white px-2 py-1.5 text-xs"
														bind:value={sector.toCity}
													>
														<option value="">Select</option>
														{#each airlineStore.airports as airport}
															<option value={airport.code}>{airport.city} ({airport.code})</option>
														{/each}
													</select>
												</div>
												<div class="flex flex-col gap-0.5">
													<label class="text-[10px] font-medium text-gray-500">Date</label>
													<input
														type="date"
														class="rounded border border-gray-200 bg-white px-2 py-1.5 text-xs"
														bind:value={sector.departureDate}
													/>
												</div>
												<div class="flex flex-col gap-0.5">
													<label class="text-[10px] font-medium text-gray-500">Umrah Days</label>
													<input
														type="text"
														class="rounded border border-gray-200 bg-white px-2 py-1.5 text-xs"
														placeholder="10"
														bind:value={sector.totalUmrahDay}
													/>
												</div>
											</div>

											<!-- Row 3: Times -->
											<div class="mb-3 grid grid-cols-4 gap-2">
												<div class="flex flex-col gap-0.5">
													<label class="text-[10px] font-medium text-gray-500">Dep Time</label>
													<div class="flex items-center gap-1">
														<select
															class="rounded border border-gray-200 bg-white px-1 py-1 text-xs"
															bind:value={sector.departureTime.hour}
														>
															{#each hours as h}<option value={h}>{h}</option>{/each}
														</select>
														:
														<select
															class="rounded border border-gray-200 bg-white px-1 py-1 text-xs"
															bind:value={sector.departureTime.minute}
														>
															{#each minutes as m}<option value={m}>{m}</option>{/each}
														</select>
													</div>
												</div>
												<div class="flex flex-col gap-0.5">
													<label class="text-[10px] font-medium text-gray-500">Arr Time</label>
													<div class="flex items-center gap-1">
														<select
															class="rounded border border-gray-200 bg-white px-1 py-1 text-xs"
															bind:value={sector.arrivalTime.hour}
														>
															{#each hours as h}<option value={h}>{h}</option>{/each}
														</select>
														:
														<select
															class="rounded border border-gray-200 bg-white px-1 py-1 text-xs"
															bind:value={sector.arrivalTime.minute}
														>
															{#each minutes as m}<option value={m}>{m}</option>{/each}
														</select>
													</div>
												</div>
												<div class="flex flex-col gap-0.5">
													<label class="text-[10px] font-medium text-gray-500">Reg Time</label>
													<input
														type="text"
														class="rounded border border-gray-200 bg-white px-2 py-1.5 text-xs"
														placeholder="3h"
														bind:value={sector.registrationTime}
													/>
												</div>
												<div class="flex flex-col gap-0.5">
													<label class="text-[10px] font-medium text-gray-500">Rep Time</label>
													<input
														type="text"
														class="rounded border border-gray-200 bg-white px-2 py-1.5 text-xs"
														placeholder="2h"
														bind:value={sector.reportingTime}
													/>
												</div>
											</div>

											<!-- Note -->
											<div class="mb-3">
												<input
													type="text"
													class="w-full rounded border border-gray-200 bg-white px-2 py-1.5 text-xs"
													placeholder="Sector Note..."
													bind:value={sector.notes}
												/>
											</div>
										</div>
									{/if}
								</div>
							{/each}
						</div>
					</div>

					<!-- Cost Breakdown (Booking Level) -->
					<div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
						<div class="border-b border-gray-100 bg-green-50/50 px-4 py-3">
							<h3 class="text-sm font-bold text-gray-900">Cost Breakdown</h3>
						</div>
						<div class="overflow-x-auto p-4">
							<table class="w-full text-left text-[10px]">
								<thead class="bg-gray-50 text-gray-500">
									<tr>
										<th class="px-2 py-1">Type</th>
										<th class="px-1 py-1 text-center">Ad(C)</th>
										<th class="px-1 py-1 text-center">Ad(S)</th>
										<th class="px-1 py-1 text-center">Ch(C)</th>
										<th class="px-1 py-1 text-center">Ch(S)</th>
										<th class="px-1 py-1 text-center">In(C)</th>
										<th class="px-1 py-1 text-center">In(S)</th>
									</tr>
								</thead>
								<tbody class="divide-y divide-gray-100">
									{#each ['airfare', 'tax', 'ur'] as type}
										<tr>
											<td class="px-2 py-1 font-medium text-gray-600 capitalize">{type}</td>
											<td class="p-0.5"
												><input
													type="number"
													class="w-full rounded border border-gray-200 text-center text-[10px]"
													bind:value={formData.costs[type].adultCost}
												/></td
											>
											<td class="p-0.5"
												><input
													type="number"
													class="w-full rounded border border-gray-200 text-center text-[10px]"
													bind:value={formData.costs[type].adultSell}
												/></td
											>
											<td class="p-0.5"
												><input
													type="number"
													class="w-full rounded border border-gray-200 text-center text-[10px]"
													bind:value={formData.costs[type].childCost}
												/></td
											>
											<td class="p-0.5"
												><input
													type="number"
													class="w-full rounded border border-gray-200 text-center text-[10px]"
													bind:value={formData.costs[type].childSell}
												/></td
											>
											<td class="p-0.5"
												><input
													type="number"
													class="w-full rounded border border-gray-200 text-center text-[10px]"
													bind:value={formData.costs[type].infantCost}
												/></td
											>
											<td class="p-0.5"
												><input
													type="number"
													class="w-full rounded border border-gray-200 text-center text-[10px]"
													bind:value={formData.costs[type].infantSell}
												/></td
											>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>

					<!-- Notes -->
					<div class="flex flex-col gap-1.5">
						<label for="notes" class="text-[13px] font-medium text-gray-700">Notes / Remarks</label>
						<textarea
							id="notes"
							rows="3"
							placeholder="Optional notes..."
							class="resize-none rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
							bind:value={formData.notes}
						></textarea>
					</div>
				</div>
			</div>

			<!-- Footer -->
			<div class="flex shrink-0 items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
				<button
					class="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
					onclick={onClose}
				>
					Cancel
				</button>
				<button
					class="flex items-center gap-2 rounded-lg bg-[#972395] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#7a1c78] hover:shadow-md"
					onclick={handleSubmit}
				>
					<Check size={16} />
					{isEditing ? 'Update Booking' : 'Save Booking'}
				</button>
			</div>
		</div>
	</div>
{/if}
