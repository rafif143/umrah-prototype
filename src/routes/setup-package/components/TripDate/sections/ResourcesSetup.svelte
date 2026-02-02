<script>
	import Accommodation from './Accommodation.svelte';
	import Meal from './Meal.svelte';
	import Transport from './Transport.svelte';
	import Service from './Service.svelte';
	import OperationalCost from './OperationalCost.svelte';

	/** @type {{ state: import('../../../packageState.svelte').PackageState }} */
	let { state } = $props();
</script>

<div class="flex flex-col gap-6">
	<div>
		<h3 class="text-base font-semibold text-gray-900">Trip Resources</h3>
		<p class="mt-0.5 text-xs text-gray-500">
			Manage accommodations, meals, transport, and other services.
		</p>
	</div>

	<div class="border-b border-gray-200">
		<div class="flex gap-6">
			{#each [{ id: 'accomodation', label: 'Accommodation' }, { id: 'meal', label: 'Meals' }, { id: 'transport', label: 'Transport' }, { id: 'service', label: 'Services' }, { id: 'opscost', label: 'Operational Cost' }] as tab}
				<button
					class="border-b-2 pb-2 text-sm font-medium transition-colors {state.tripSetupTab ===
					tab.id
						? 'border-[#972395] text-[#972395]'
						: 'border-transparent text-gray-500 hover:text-gray-700'}"
					onclick={() => (state.tripSetupTab = tab.id)}
				>
					{tab.label}
				</button>
			{/each}
		</div>
	</div>

	{#if state.tripSetupTab === 'accomodation'}
		<Accommodation {state} />
	{/if}

	{#if state.tripSetupTab === 'meal'}
		<Meal {state} />
	{/if}

	{#if state.tripSetupTab === 'transport'}
		<Transport {state} />
	{/if}

	{#if state.tripSetupTab === 'service'}
		<Service {state} />
	{/if}

	{#if state.tripSetupTab === 'opscost'}
		<OperationalCost {state} />
	{/if}
</div>
