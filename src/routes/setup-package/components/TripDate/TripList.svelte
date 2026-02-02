<script>
	import { Plus } from 'lucide-svelte';

	/** @type {{ state: import('../../packageState.svelte').PackageState }} */
	let { state } = $props();
</script>

<div class="flex flex-col gap-6">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-lg font-semibold text-gray-900">Trip Dates</h2>
			<p class="text-sm text-gray-500">Manage departure dates for this package.</p>
		</div>
		<button
			class="flex items-center gap-2 rounded-lg bg-[#972395] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7a1c78]"
			onclick={() => (state.showTripSetup = true)}
		>
			<Plus size={16} />
			Add Date Trip
		</button>
	</div>

	<div class="space-y-4">
		{#each state.tripDates as trip}
			<div
				class="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white p-6 transition-all hover:shadow-sm"
			>
				<div class="grid flex-1 grid-cols-12 gap-4">
					<div class="col-span-3 flex flex-col justify-center">
						<span class="text-xs font-medium tracking-wide text-gray-500 uppercase"
							>Travel Dates</span
						>
						<div class="flex flex-col">
							<span class="text-sm font-medium text-gray-900">{trip.checkIn}</span>
							<span class="text-xs text-gray-500">to {trip.checkOut}</span>
						</div>
					</div>
					<div class="col-span-3 flex flex-col justify-center">
						<span class="text-xs font-medium tracking-wide text-gray-500 uppercase">Duration</span>
						<span class="text-sm font-medium text-gray-900">{trip.duration}</span>
					</div>
					<div class="col-span-3 flex flex-col justify-center">
						<span class="text-xs font-medium tracking-wide text-gray-500 uppercase"
							>Flight Info</span
						>
						<div class="flex flex-col">
							<span class="text-sm font-medium text-gray-900">{trip.flightCode}</span>
							<span class="text-xs text-gray-500">{trip.date}</span>
						</div>
					</div>
					<div class="col-span-2 flex flex-col justify-center">
						<span class="text-xs font-medium tracking-wide text-gray-500 uppercase">Price</span>
						<span class="text-lg font-bold text-[#972395]">{trip.price}</span>
					</div>
					<div class="col-span-1 flex flex-col justify-center">
						<span class="text-xs font-medium tracking-wide text-gray-500 uppercase">Status</span>
						<span
							class="inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide {trip.status ===
							'Active'
								? 'bg-green-100 text-green-700'
								: 'bg-yellow-100 text-yellow-700'}"
						>
							{trip.status}
						</span>
					</div>
				</div>
				<div class="ml-4 flex items-center">
					<button
						class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium whitespace-nowrap text-gray-600 transition-colors hover:bg-gray-50"
						onclick={() => (state.showTripSetup = true)}
					>
						Edit Setup
					</button>
				</div>
			</div>
		{/each}
	</div>
</div>
