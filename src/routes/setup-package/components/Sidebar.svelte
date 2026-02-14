<script>
	import { ArrowLeft } from 'lucide-svelte';

	/** @type {{ state: import('../packageState.svelte.js').PackageState }} */
	let { state } = $props();

	const mainSteps = [
		{ id: 'flight', label: 'Flight', subtitle: 'Airfare & Legs', step: 1 },
		{ id: 'packages', label: 'Varian', subtitle: 'Variants & Pricing', step: 2 }
	];

	const variantSteps = [
		{ id: 'variant-info', label: 'General Information', subtitle: 'Basic Details', step: 1 },
		{ id: 'variant-ground', label: 'Ground Handling', subtitle: 'Hotel, Meal, Transport', step: 2 }
	];

	let steps = $derived(state.viewMode === 'variant' ? variantSteps : mainSteps);
	let currentStepIndex = $derived(steps.findIndex((s) => s.id === state.activeSection) + 1);
	let progressPercent = $derived(Math.round((currentStepIndex / steps.length) * 100));
</script>

<aside class="flex w-72 flex-col border-r border-gray-200 bg-white">
	<div class="border-b border-gray-100 p-6">
		{#if state.viewMode === 'variant' && state.activeVariant}
			<button
				onclick={() => state.exitVariant()}
				class="mb-2 flex items-center gap-1.5 text-xs text-gray-500 transition-colors hover:text-[#972395]"
			>
				<ArrowLeft size={14} />
				Back to Variant List
			</button>
			<h1 class="text-xl font-bold text-gray-900">{state.activeVariant.name}</h1>
			<p class="mt-1 text-xs text-gray-500">Configure this variant</p>
		{:else}
			<h1 class="text-xl font-bold text-gray-900">Package Setup</h1>
			<p class="mt-1 text-xs text-gray-500">Complete all steps to create your package</p>
		{/if}
	</div>

	<nav class="flex-1 space-y-4 p-4">
		{#each steps as s}
			<button
				onclick={() => (state.activeSection = s.id)}
				class="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-all {state.activeSection ===
				s.id
					? 'bg-[#972395] text-white shadow-md'
					: 'text-gray-600 hover:bg-gray-50'}"
			>
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full font-bold {state.activeSection ===
					s.id
						? 'bg-white text-[#972395]'
						: 'bg-gray-100 text-gray-500'}"
				>
					{s.step}
				</div>
				<div>
					<p class="text-sm font-bold">{s.label}</p>
					<p class="text-xs opacity-90">{s.subtitle}</p>
				</div>
			</button>
		{/each}
	</nav>

	<!-- Progress Section -->
	<div class="border-t p-6">
		<div class="mb-2 flex items-center justify-between">
			<span class="text-sm font-bold text-gray-900">Progress</span>
			<span class="text-sm font-bold text-[#972395]">{progressPercent}%</span>
		</div>
		<div class="h-2 w-full rounded-full bg-gray-100">
			<div class="h-2 rounded-full bg-[#972395]" style="width: {progressPercent}%"></div>
		</div>
		<p class="mt-2 text-xs text-gray-500">Step {currentStepIndex} of {steps.length}</p>
	</div>
</aside>
