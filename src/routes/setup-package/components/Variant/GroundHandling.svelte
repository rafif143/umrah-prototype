<script>
	import VariantAccommodation from './VariantAccommodation.svelte';
	import VariantMeal from './VariantMeal.svelte';

	/** @type {{ state: import('../../packageState.svelte.js').PackageState }} */
	let { state } = $props();

	const tabs = [
		{ id: 'hotel', label: 'Hotel' },
		{ id: 'meal', label: 'Meal' },
		{ id: 'transport', label: 'Transport' },
		{ id: 'services', label: 'Services' },
		{ id: 'additional', label: 'Additional Cost' }
	];
</script>

<div class="space-y-6">
	<!-- Tabs -->
	<div class="border-b border-gray-200">
		<nav class="-mb-px flex space-x-6 overflow-x-auto" aria-label="Ground Handling Tabs">
			{#each tabs as tab}
				<button
					onclick={() => (state.activeVariantTab = tab.id)}
					class="border-b-2 px-1 py-3 text-sm font-medium whitespace-nowrap transition-colors {state.activeVariantTab ===
					tab.id
						? 'border-[#972395] text-[#972395]'
						: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
				>
					{tab.label}
				</button>
			{/each}
		</nav>
	</div>

	<!-- Tab Content -->
	<div>
		{#if state.activeVariantTab === 'hotel'}
			<VariantAccommodation {state} />
		{:else if state.activeVariantTab === 'meal'}
			<VariantMeal {state} />
		{:else if state.activeVariantTab === 'transport'}
			<div
				class="flex h-40 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-gray-500"
			>
				<p>Transport functionality will be here</p>
			</div>
		{:else if state.activeVariantTab === 'services'}
			<div
				class="flex h-40 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-gray-500"
			>
				<p>Services functionality will be here</p>
			</div>
		{:else if state.activeVariantTab === 'additional'}
			<div
				class="flex h-40 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-gray-500"
			>
				<p>Additional Cost functionality will be here</p>
			</div>
		{/if}
	</div>
</div>
