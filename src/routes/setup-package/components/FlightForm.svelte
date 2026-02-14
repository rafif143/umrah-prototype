<script>
	/** @type {{ state: import('../packageState.svelte.js').PackageState }} */
	let { state } = $props();
</script>

<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
	<!-- Flight Selection from Storage -->
	<div class="col-span-2 rounded-xl border border-purple-100 bg-purple-50 p-6">
		<label class="mb-2 block text-sm font-bold text-gray-900">Select Flight Batch</label>
		<select
			bind:value={state.selectedFlightId}
			class="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#972395] focus:ring-[#972395]"
			onchange={(e) => state.selectFlightBooking(e.target.value)}
		>
			<option value="" disabled>-- Choose from Flight Storage --</option>
			{#each state.availableFlights as booking}
				<option value={booking.id}>
					{booking.airline} - {booking.notes || booking.travelAgent} ({booking.totalSeats}
					seats)
				</option>
			{/each}
		</select>
		<p class="mt-2 text-xs text-purple-600">Selecting a flight will auto-fill the details below.</p>
	</div>

	<!-- Auto-generated Name Section -->
	<div class="col-span-2">
		<label class="mb-2 block text-sm font-bold text-gray-900">Batch Name (Auto-Generated)</label>
		<div class="flex gap-2">
			<input
				type="text"
				bind:value={state.flightInfo.batchName}
				class="w-full rounded-lg border-gray-300 bg-white font-semibold text-[#972395] shadow-sm focus:border-[#972395] focus:ring-[#972395]"
				placeholder="e.g. MH 17 June"
			/>
			<button
				class="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-500 hover:bg-gray-50"
				onclick={() => {
					const code = state.flightInfo.airlineCode || '';
					const date = state.flightInfo.departureDate
						? new Date(state.flightInfo.departureDate).toLocaleDateString('en-GB', {
								day: '2-digit',
								month: 'short'
							})
						: '';
					state.flightInfo.batchName = `${code} ${date}`.trim();
				}}
			>
				Reset Auto
			</button>
		</div>
	</div>

	<!-- Flight Details -->
	<div>
		<label class="mb-1 block text-sm font-medium text-gray-700">Airline Name</label>
		<input
			type="text"
			bind:value={state.flightInfo.airline}
			class="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#972395] focus:ring-[#972395]"
			placeholder="Auto-filled"
		/>
	</div>

	<div class="grid grid-cols-2 gap-4">
		<div>
			<label class="mb-1 block text-sm font-medium text-gray-700">Airline Code</label>
			<input
				type="text"
				bind:value={state.flightInfo.airlineCode}
				readonly
				class="w-full cursor-not-allowed rounded-lg border-gray-300 bg-gray-50 text-gray-500 shadow-sm focus:border-[#972395] focus:ring-[#972395]"
			/>
		</div>
		<div>
			<label class="mb-1 block text-sm font-medium text-gray-700">Flight Number</label>
			<input
				type="text"
				bind:value={state.flightInfo.flightNumber}
				class="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#972395] focus:ring-[#972395]"
			/>
		</div>
	</div>

	<!-- Dates -->
	<div>
		<label class="mb-1 block text-sm font-medium text-gray-700">Departure Date</label>
		<input
			type="date"
			bind:value={state.flightInfo.departureDate}
			class="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#972395] focus:ring-[#972395]"
		/>
	</div>
	<div>
		<label class="mb-1 block text-sm font-medium text-gray-700">Arrival Date</label>
		<input
			type="date"
			bind:value={state.flightInfo.arrivalDate}
			class="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#972395] focus:ring-[#972395]"
		/>
	</div>

	<!-- Cities -->
	<div>
		<label class="mb-1 block text-sm font-medium text-gray-700">Departure City</label>
		<input
			type="text"
			bind:value={state.flightInfo.departureCity}
			class="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#972395] focus:ring-[#972395]"
		/>
	</div>
	<div>
		<label class="mb-1 block text-sm font-medium text-gray-700">Arrival City</label>
		<input
			type="text"
			bind:value={state.flightInfo.arrivalCity}
			class="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#972395] focus:ring-[#972395]"
		/>
	</div>

	<!-- Quota -->
	<div>
		<label class="mb-1 block text-sm font-medium text-gray-700">Total Seat Quota</label>
		<input
			type="number"
			bind:value={state.flightInfo.seatQuota}
			class="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#972395] focus:ring-[#972395]"
		/>
	</div>
</div>
