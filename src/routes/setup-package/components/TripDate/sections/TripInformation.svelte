<script>
	/** @type {{ state: import('../../packageState.svelte').PackageState }} */
	let { state } = $props();
</script>

<section class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
	<div class="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
		<h3 class="text-base font-semibold text-gray-900">Trip Information</h3>
		<p class="mt-0.5 text-xs text-gray-500">
			Set the travel dates, passenger capacity, and validity period for this trip.
		</p>
	</div>
	<div class="grid grid-cols-3 gap-6 p-6">
		<div class="flex flex-col gap-1.5">
			<label class="text-[13px] font-medium text-gray-700">Check-In Date</label>
			<input
				type="date"
				bind:value={state.activeTrip.checkIn}
				class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
			/>
		</div>
		<div class="flex flex-col gap-1.5">
			<label class="text-[13px] font-medium text-gray-700">Check-Out Date</label>
			<input
				type="date"
				bind:value={state.activeTrip.checkOut}
				class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
			/>
		</div>
		<div class="flex flex-col gap-1.5">
			<label class="text-[13px] font-medium text-gray-700"
				>Pax Capacity <span class="text-red-500">*</span></label
			>
			<input
				type="number"
				placeholder="e.g., 45"
				bind:value={state.activeTrip.paxCapacity}
				class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
			/>
		</div>
		<div class="flex flex-col gap-1.5">
			<label class="text-[13px] font-medium text-gray-700">Duration (Days)</label>
			<input
				type="number"
				placeholder="e.g., 9"
				bind:value={state.activeTrip.duration}
				class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
			/>
		</div>
		<div class="flex flex-col gap-1.5">
			<label class="text-[13px] font-medium text-gray-700">Duration (Nights)</label>
			<input
				type="number"
				placeholder="e.g., 8"
				bind:value={state.activeTrip.durationNights}
				class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
			/>
		</div>
		<div class="flex flex-col gap-1.5">
			<label class="text-[13px] font-medium text-gray-700">Validity Start</label>
			<input
				type="date"
				bind:value={state.activeTrip.validityStart}
				class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
			/>
		</div>
		<div class="col-span-2 flex flex-col gap-1.5">
			<label class="text-[13px] font-medium text-gray-700">Validity End</label>
			<input
				type="date"
				bind:value={state.activeTrip.validityEnd}
				class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
			/>
		</div>
	</div>
</section>
