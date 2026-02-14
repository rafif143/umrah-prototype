<script>
	import { ArrowLeft } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { PackageState } from './packageState.svelte.js';
	import { Sidebar, ContentHeader, FlightForm, VariantList } from './components';
	import VariantInfo from './components/Variant/VariantInfo.svelte';
	import GroundHandling from './components/Variant/GroundHandling.svelte';

	// Instantiate state
	const state = new PackageState();

	onMount(() => {
		// Load existing data logic here eventually
	});
</script>

<div class="flex h-screen bg-gray-50/50">
	<!-- Sidebar Navigation -->
	<Sidebar {state} />

	<!-- Main Content Area -->
	<main class="flex-1 overflow-y-auto bg-gray-50/50 p-8">
		<div class="mx-auto max-w-6xl">
			<!-- Breadcrumbs & Back -->
			<div class="mb-6 flex items-center gap-4">
				<button
					onclick={() => (window.location.href = '/package-management')}
					class="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
				>
					<ArrowLeft class="h-4 w-4" />
					Back to List
				</button>
				<span class="text-gray-300">/</span>
				<span class="text-sm font-medium text-gray-900">Package Management</span>
				<span class="text-gray-300">/</span>
				{#if state.viewMode === 'variant' && state.activeVariant}
					<button
						onclick={() => state.exitVariant()}
						class="text-sm text-gray-500 hover:text-gray-900"
					>
						Add New Package
					</button>
					<span class="text-gray-300">/</span>
					<span class="text-sm text-gray-500">{state.activeVariant.name}</span>
				{:else}
					<span class="text-sm text-gray-500">Add New Package</span>
				{/if}
			</div>

			<div class="rounded-xl border border-gray-200 bg-white shadow-sm">
				<!-- Content Header -->
				<ContentHeader activeSection={state.activeSection} />

				<!-- Dynamic Content -->
				<div class="p-8">
					{#if state.activeSection === 'flight'}
						<FlightForm {state} />
					{:else if state.activeSection === 'packages'}
						<VariantList {state} />
					{:else if state.activeSection === 'variant-info' && state.activeVariant}
						<VariantInfo {state} />
					{:else if state.activeSection === 'variant-ground' && state.activeVariant}
						<GroundHandling {state} />
					{:else}
						<div class="flex h-64 items-center justify-center text-gray-400">
							<p>Content not available</p>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</main>
</div>
