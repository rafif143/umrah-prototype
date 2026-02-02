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

<div class="mb-4">
	<button
		class="flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
		onclick={() => (pkgState.showTripSetup = false)}
	>
		<ArrowLeft size={16} />
		Back to Trip List
	</button>
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
