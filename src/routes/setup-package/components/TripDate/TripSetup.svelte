<script>
	import { ArrowLeft } from 'lucide-svelte';
	import TripInformation from './sections/TripInformation.svelte';
	import Itinerary from './sections/Itinerary.svelte';
	import Flight from './sections/Flight.svelte';
	import ResourcesSetup from './sections/ResourcesSetup.svelte';
	import Guide from './sections/Guide.svelte';
	import Calculation from './sections/Calculation.svelte';

	/** @type {{ state: import('../../packageState.svelte').PackageState }} */
	let { state: pkgState } = $props();
</script>

<div class="mb-4 flex items-center justify-between">
	<button
		class="flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
		onclick={() => (pkgState.showTripSetup = false)}
	>
		<ArrowLeft size={16} />
		Back to Trip List
	</button>
	<div class="flex gap-2">
		<button
			class="rounded-lg border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
			onclick={() => (pkgState.showTripSetup = false)}
		>
			Cancel
		</button>
		<button
			class="rounded-lg bg-[#972395] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#861f84]"
			onclick={() => {
				pkgState.saveTrip();
				pkgState.showTripSetup = false;
				alert('Trip Data Updated!');
			}}
		>
			Save Trip Data
		</button>
	</div>
</div>

<!-- Trip Setup Content -->
<div>
	{#if pkgState.activeTripSection === 'information'}
		<TripInformation state={pkgState} />
	{/if}

	{#if pkgState.activeTripSection === 'itinerary'}
		<Itinerary state={pkgState} />
	{/if}

	{#if pkgState.activeTripSection === 'flight'}
		<Flight state={pkgState} />
	{/if}

	{#if pkgState.activeTripSection === 'tripsetup'}
		<ResourcesSetup state={pkgState} />
	{/if}

	{#if pkgState.activeTripSection === 'guide'}
		<Guide state={pkgState} />
	{/if}

	{#if pkgState.activeTripSection === 'calculation'}
		<Calculation state={pkgState} />
	{/if}
</div>
