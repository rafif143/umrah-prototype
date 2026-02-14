<script>
	import { Package as PackageIcon } from 'lucide-svelte';
	import VariantInfo from './VariantInfo.svelte';
	import VariantAccommodation from './VariantAccommodation.svelte';
	import VariantMeal from './VariantMeal.svelte';

	/** @type {{ state: import('../../packageState.svelte.js').PackageState }} */
	let { state } = $props();

	let activeVariant = $derived(
		state.activeVariantId ? state.packageVariants.find((v) => v.id === state.activeVariantId) : null
	);
</script>

{#if state.activeVariantId}
	{#if activeVariant}
		<div class="rounded-2xl border border-gray-200 bg-white">
			<!-- Variant Tabs -->
			<div class="border-b border-gray-200 px-2">
				<nav class="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
					{#each ['info', 'hotel', 'meal', 'transport', 'services', 'pricing'] as tab}
						<button
							onclick={() => (state.activeVariantTab = tab)}
							class="border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap {state.activeVariantTab ===
							tab
								? 'border-[#972395] text-[#972395]'
								: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
						>
							{tab.charAt(0).toUpperCase() + tab.slice(1)}
						</button>
					{/each}
				</nav>
			</div>

			<!-- Tab Content -->
			<div class="p-6">
				{#if state.activeVariantTab === 'info'}
					<VariantInfo {activeVariant} />
				{:else if state.activeVariantTab === 'hotel'}
					<VariantAccommodation {state} />
				{:else if state.activeVariantTab === 'meal'}
					<VariantMeal {state} />
				{:else if state.activeVariantTab === 'transport'}
					<div
						class="flex h-40 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-gray-500"
					>
						<div class="text-center">
							<p>Transport functionality will be here</p>
						</div>
					</div>
				{:else if state.activeVariantTab === 'pricing'}
					<div
						class="flex h-40 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-gray-500"
					>
						<div class="text-center">
							<p>Pricing/Costing functionality will be here</p>
						</div>
					</div>
				{:else}
					<div class="py-12 text-center text-gray-500">Feature coming soon...</div>
				{/if}
			</div>
		</div>
	{:else}
		<div class="rounded-xl border border-orange-100 bg-orange-50 p-4 text-orange-800">
			Warning: Selected variant not found. Please select another.
		</div>
	{/if}
{:else}
	<div
		class="flex h-64 flex-col items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 text-gray-500"
	>
		<PackageIcon class="mb-4 h-12 w-12 text-gray-300" />
		<p class="text-lg font-medium">No Package Variant Selected</p>
		<p class="text-sm">Select a variant above or create a new one to edit details.</p>
	</div>
{/if}
