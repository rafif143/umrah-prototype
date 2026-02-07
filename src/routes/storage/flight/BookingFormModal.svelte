<script>
	import { Plus, Plane, X, Check, ChevronDown } from 'lucide-svelte';
	import { slide, fly, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { airlineStore } from '$lib/stores/airlineStore.svelte.js';
	import { createEmptySector, createEmptyPnrGroup } from './flightUtils.js';

	let { show = false, booking = null, onClose, onSave } = $props();

	const createEmptyFormData = () => ({
		travelAgent: '',
		pnrGroups: [createEmptyPnrGroup()],
		notes: ''
	});

	// Internal form state
	let formData = $state(createEmptyFormData());
	let isEditing = $derived(!!booking);

	// Watch booking prop changes
	$effect(() => {
		if (show) {
			if (booking) {
				formData = {
					travelAgent: booking.travelAgent || '',
					pnrGroups: booking.pnrGroups?.length
						? booking.pnrGroups.map((g) => ({
								...g,
								sectors: g.sectors?.map((s) => ({
									...createEmptySector(),
									...s,
									departureTime: s.departureTime || { hour: '00', minute: '00' },
									arrivalTime: s.arrivalTime || { hour: '00', minute: '00' }
								})) || [createEmptySector()]
							}))
						: [createEmptyPnrGroup()],
					notes: booking.notes || ''
				};
			} else {
				formData = createEmptyFormData();
			}
		}
	});

	// PNR Group functions
	function addPnrGroup() {
		formData.pnrGroups = [...formData.pnrGroups, createEmptyPnrGroup()];
	}

	function removePnrGroup(index) {
		if (formData.pnrGroups.length > 1) {
			formData.pnrGroups = formData.pnrGroups.filter((_, i) => i !== index);
		}
	}

	// Sector functions
	function addSector(pnrGroupIndex) {
		formData.pnrGroups[pnrGroupIndex].sectors = [
			...formData.pnrGroups[pnrGroupIndex].sectors,
			createEmptySector()
		];
	}

	function removeSector(pnrGroupIndex, sectorIndex) {
		if (formData.pnrGroups[pnrGroupIndex].sectors.length > 1) {
			formData.pnrGroups[pnrGroupIndex].sectors = formData.pnrGroups[pnrGroupIndex].sectors.filter(
				(_, i) => i !== sectorIndex
			);
		}
	}

	function handleSubmit() {
		// Validate
		const validPnrGroups = formData.pnrGroups
			.filter((g) => g.airline)
			.map((g) => ({
				...g,
				sectors: g.sectors.filter((s) => s.fromCity && s.toCity)
			}))
			.filter((g) => g.sectors.length > 0);

		if (!formData.travelAgent || validPnrGroups.length === 0) {
			return;
		}

		const bookingData = {
			travelAgent: formData.travelAgent,
			pnrGroups: validPnrGroups.map((g) => ({
				airline: g.airline,
				pnr: g.pnrPending ? '' : g.pnr,
				pnrPending: g.pnrPending || !g.pnr,
				sectors: g.sectors
			})),
			notes: formData.notes
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
		role="dialog"
		aria-modal="true"
		onkeydown={(e) => e.key === 'Escape' && onClose()}
	>
		<!-- Modal -->
		<div
			class="relative z-50 flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
			transition:fly={{ y: 20, duration: 250, easing: cubicOut }}
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
			role="document"
		>
			<!-- Header -->
			<div class="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
				<div>
					<h2 class="text-xl font-bold text-gray-900">
						{isEditing ? 'Edit Flight Confirm' : 'Add Flight Confirm'}
					</h2>
					<p class="text-sm text-gray-500">Fill in the flight booking details</p>
				</div>
				<button
					class="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
					onclick={onClose}
				>
					<X size={24} />
				</button>
			</div>

			<!-- Form Body -->
			<div class="min-h-0 flex-1 overflow-y-auto p-6">
				<div class="flex flex-col gap-5">
					<!-- Travel Agent -->
					<div class="flex flex-col gap-1.5">
						<label for="travelAgent" class="text-[13px] font-medium text-gray-700">
							Name Booking <span class="text-red-500">*</span>
						</label>
						<input
							type="text"
							id="travelAgent"
							placeholder="Enter company name"
							class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
							bind:value={formData.travelAgent}
						/>
					</div>

					<!-- PNR Groups -->
					{#each formData.pnrGroups as pnrGroup, gIdx}
						<div class="rounded-xl border-2 border-purple-200 bg-purple-50/30 p-4">
							<!-- PNR Group Header -->
							<div class="mb-4 flex items-center justify-between">
								<div class="flex items-center gap-2">
									<Plane size={16} class="text-[#972395]" />
									<span class="text-sm font-bold text-[#972395]">PNR Group {gIdx + 1}</span>
								</div>
								{#if formData.pnrGroups.length > 1}
									<button
										type="button"
										class="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50"
										onclick={() => removePnrGroup(gIdx)}
									>
										<X size={12} />
										Remove Group
									</button>
								{/if}
							</div>

							<!-- Airline Selection -->
							<div class="mb-3 flex flex-col gap-1">
								<label class="text-[12px] font-medium text-gray-600"
									>Airline <span class="text-red-500">*</span></label
								>
								<select
									class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
									bind:value={formData.pnrGroups[gIdx].airline}
								>
									<option value="">Select Airline</option>
									{#each airlineStore.airlines as airline}
										<option value={airline.code}>{airline.name}</option>
									{/each}
								</select>
							</div>

							<!-- PNR Section -->
							<div class="mb-4 rounded-lg border border-gray-200 bg-white p-3">
								<div class="flex items-center gap-2">
									<input
										type="checkbox"
										id="pnrPending_{gIdx}"
										class="h-4 w-4 rounded border-gray-300 text-[#972395] focus:ring-[#972395]"
										bind:checked={formData.pnrGroups[gIdx].pnrPending}
									/>
									<label for="pnrPending_{gIdx}" class="text-xs font-medium text-gray-700">
										PNR Pending
									</label>
								</div>
								{#if !formData.pnrGroups[gIdx].pnrPending}
									<div class="mt-2" transition:slide={{ duration: 150 }}>
										<input
											type="text"
											placeholder="Enter PNR code"
											class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
											bind:value={formData.pnrGroups[gIdx].pnr}
										/>
									</div>
								{/if}
							</div>

							<!-- Sectors -->
							<div class="flex flex-col gap-2">
								<span class="text-[11px] font-semibold tracking-wide text-gray-500 uppercase"
									>Sectors</span
								>
								{#each pnrGroup.sectors as sector, sIdx}
									<div class="rounded-lg border border-gray-200 bg-white p-3">
										<!-- Sector Header -->
										<div class="mb-3 flex items-center justify-between">
											<div class="flex items-center gap-1.5">
												<span
													class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-purple-100 text-[10px] font-bold text-[#972395]"
													>{sIdx + 1}</span
												>
												<span class="text-xs font-medium text-gray-600">Sector {sIdx + 1}</span>
											</div>
											{#if pnrGroup.sectors.length > 1}
												<button
													type="button"
													class="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
													onclick={() => removeSector(gIdx, sIdx)}
												>
													<X size={12} />
												</button>
											{/if}
										</div>

										<!-- Row 1: Type, Supplier, Departure Hall, Carrier/CarrierNo -->
										<div class="mb-3 grid grid-cols-5 gap-2">
											<div class="flex flex-col gap-0.5">
												<label class="text-[10px] font-medium text-gray-500">Type *</label>
												<select
													class="rounded border border-gray-200 px-2 py-1.5 text-xs"
													bind:value={formData.pnrGroups[gIdx].sectors[sIdx].type}
												>
													<option value="Departure">Departure</option>
													<option value="Arrival">Arrival</option>
													<option value="Transit">Transit</option>
												</select>
											</div>
											<div class="flex flex-col gap-0.5">
												<label class="text-[10px] font-medium text-gray-500">Supplier</label>
												<select
													class="rounded border border-gray-200 px-2 py-1.5 text-xs"
													bind:value={formData.pnrGroups[gIdx].sectors[sIdx].supplier}
												>
													<option value="">Select</option>
													<option value="Supplier A">Supplier A</option>
													<option value="Supplier B">Supplier B</option>
												</select>
											</div>
											<div class="flex flex-col gap-0.5">
												<label class="text-[10px] font-medium text-gray-500">Departure Hall</label>
												<input
													type="text"
													placeholder="KLIA 1"
													class="rounded border border-gray-200 px-2 py-1.5 text-xs uppercase"
													bind:value={formData.pnrGroups[gIdx].sectors[sIdx].departureHall}
												/>
											</div>
											<div class="flex flex-col gap-0.5">
												<label class="text-[10px] font-medium text-gray-500">Carrier *</label>
												<input
													type="text"
													placeholder="MH"
													class="rounded border border-gray-200 px-2 py-1.5 text-xs"
													bind:value={formData.pnrGroups[gIdx].sectors[sIdx].carrier}
												/>
											</div>
											<div class="flex flex-col gap-0.5">
												<label class="text-[10px] font-medium text-gray-500">Carrier No *</label>
												<input
													type="text"
													placeholder="8001"
													class="rounded border border-gray-200 px-2 py-1.5 text-xs"
													bind:value={formData.pnrGroups[gIdx].sectors[sIdx].carrierNo}
												/>
											</div>
										</div>

										<!-- Row 2: From City, To City, Date -->
										<div class="mb-3 grid grid-cols-4 gap-2">
											<div class="flex flex-col gap-0.5">
												<label class="text-[10px] font-medium text-gray-500">From City *</label>
												<select
													class="rounded border border-gray-200 px-2 py-1.5 text-xs"
													bind:value={formData.pnrGroups[gIdx].sectors[sIdx].fromCity}
												>
													<option value="">Select</option>
													{#each airlineStore.airports as airport}
														<option value={airport.code}>{airport.city} ({airport.code})</option>
													{/each}
												</select>
											</div>
											<div class="flex flex-col gap-0.5">
												<label class="text-[10px] font-medium text-gray-500">To City *</label>
												<select
													class="rounded border border-gray-200 px-2 py-1.5 text-xs"
													bind:value={formData.pnrGroups[gIdx].sectors[sIdx].toCity}
												>
													<option value="">Select</option>
													{#each airlineStore.airports as airport}
														<option value={airport.code}>{airport.city} ({airport.code})</option>
													{/each}
												</select>
											</div>
											<div class="flex flex-col gap-0.5">
												<label class="text-[10px] font-medium text-gray-500">Date *</label>
												<input
													type="date"
													class="rounded border border-gray-200 px-2 py-1.5 text-xs"
													bind:value={formData.pnrGroups[gIdx].sectors[sIdx].departureDate}
												/>
											</div>
											<div class="flex flex-col gap-0.5">
												<label class="text-[10px] font-medium text-gray-500">Total Umrah Day</label>
												<input
													type="text"
													placeholder="10"
													class="rounded border border-gray-200 px-2 py-1.5 text-xs"
													bind:value={formData.pnrGroups[gIdx].sectors[sIdx].totalUmrahDay}
												/>
											</div>
										</div>

										<!-- Row 3: Departure Time, Arrival Time -->
										<div class="mb-3 grid grid-cols-2 gap-4">
											<!-- Departure Time -->
											<div class="rounded border border-gray-100 bg-gray-50 p-2">
												<label class="mb-1 block text-[10px] font-medium text-gray-500"
													>Departure Time</label
												>
												<div class="flex items-center gap-1">
													<select
														class="rounded border border-gray-200 bg-white px-2 py-1 text-xs"
														bind:value={formData.pnrGroups[gIdx].sectors[sIdx].departureTime.hour}
													>
														{#each hours as h}
															<option value={h}>{h}</option>
														{/each}
													</select>
													<span class="text-gray-400">:</span>
													<select
														class="rounded border border-gray-200 bg-white px-2 py-1 text-xs"
														bind:value={formData.pnrGroups[gIdx].sectors[sIdx].departureTime.minute}
													>
														{#each minutes as m}
															<option value={m}>{m}</option>
														{/each}
													</select>
												</div>
											</div>
											<!-- Arrival Time -->
											<div class="rounded border border-gray-100 bg-gray-50 p-2">
												<label class="mb-1 block text-[10px] font-medium text-gray-500"
													>Arrival Time</label
												>
												<div class="flex items-center gap-1">
													<select
														class="rounded border border-gray-200 bg-white px-2 py-1 text-xs"
														bind:value={formData.pnrGroups[gIdx].sectors[sIdx].arrivalTime.hour}
													>
														{#each hours as h}
															<option value={h}>{h}</option>
														{/each}
													</select>
													<span class="text-gray-400">:</span>
													<select
														class="rounded border border-gray-200 bg-white px-2 py-1 text-xs"
														bind:value={formData.pnrGroups[gIdx].sectors[sIdx].arrivalTime.minute}
													>
														{#each minutes as m}
															<option value={m}>{m}</option>
														{/each}
													</select>
												</div>
											</div>
										</div>

										<!-- Row 4: Registration Time, Reporting Time, Notes -->
										<div class="grid grid-cols-3 gap-2">
											<div class="flex flex-col gap-0.5">
												<label class="text-[10px] font-medium text-gray-500"
													>Registration Time</label
												>
												<input
													type="text"
													placeholder="3 JAM"
													class="rounded border border-gray-200 px-2 py-1.5 text-xs"
													bind:value={formData.pnrGroups[gIdx].sectors[sIdx].registrationTime}
												/>
											</div>
											<div class="flex flex-col gap-0.5">
												<label class="text-[10px] font-medium text-gray-500">Reporting Time</label>
												<input
													type="text"
													placeholder="2 JAM"
													class="rounded border border-gray-200 px-2 py-1.5 text-xs"
													bind:value={formData.pnrGroups[gIdx].sectors[sIdx].reportingTime}
												/>
											</div>
											<div class="flex flex-col gap-0.5">
												<label class="text-[10px] font-medium text-gray-500">Sector Notes</label>
												<input
													type="text"
													placeholder="Notes..."
													class="rounded border border-gray-200 px-2 py-1.5 text-xs"
													bind:value={formData.pnrGroups[gIdx].sectors[sIdx].notes}
												/>
											</div>
										</div>
									</div>
								{/each}

								<!-- Add Sector Button -->
								<button
									type="button"
									class="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-purple-300 py-2 text-xs font-medium text-[#972395] transition-colors hover:bg-purple-50"
									onclick={() => addSector(gIdx)}
								>
									<Plus size={12} />
									Add Sector
								</button>
							</div>
						</div>
					{/each}

					<!-- Add PNR Group Button -->
					<button
						type="button"
						class="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#972395] py-3 text-sm font-medium text-[#972395] transition-colors hover:bg-purple-50"
						onclick={addPnrGroup}
					>
						<Plus size={16} />
						Add Another Airline / PNR Group
					</button>

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
