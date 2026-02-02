<script>
	import { ArrowLeft, Save, Eye, MoreHorizontal, Info, Calendar } from 'lucide-svelte';
	import { fade } from 'svelte/transition';

	// State Management
	import { PackageState } from './packageState.svelte.js';

	// General Info Components
	import BasicInfo from './components/GeneralInfo/BasicInfo.svelte';
	import Description from './components/GeneralInfo/Description.svelte';
	import IncludeExclude from './components/GeneralInfo/IncludeExclude.svelte';
	import FAQ from './components/GeneralInfo/FAQ.svelte';
	import Gallery from './components/GeneralInfo/Gallery.svelte';

	// Trip Date Components
	import TripList from './components/TripDate/TripList.svelte';
	import TripSetup from './components/TripDate/TripSetup.svelte';

	// Instantiate state
	const state = new PackageState();
</script>

<div class="flex h-screen bg-gray-50/50">
	<!-- Sidebar -->
	<aside class="flex h-full w-72 flex-col border-r border-gray-200 bg-white">
		<div class="border-b border-gray-100 px-6 py-6">
			<h1 class="text-xl font-bold text-gray-900">Package Setup</h1>
			<p class="mt-1 text-xs text-gray-500">Complete all steps to create your package</p>
		</div>

		<nav class="scrolbar-hide flex-1 space-y-3 overflow-y-auto p-4">
			{#if state.activeSection === 'general'}
				<!-- General Info Steps -->
				{@const generalSteps = [
					{ id: 'basic', label: 'Detail Package', sub: 'Basic Details' },
					{ id: 'description', label: 'Description', sub: 'Package Details' },
					{ id: 'include-exclude', label: 'Include/Exclude', sub: 'Package Contents' },
					{ id: 'faq', label: 'FAQ', sub: 'Frequently Asked' },
					{ id: 'gallery', label: 'Gallery', sub: 'Photos & Videos' }
				]}

				{#each generalSteps as step, i}
					<button
						onclick={() => (state.activeInfoSection = step.id)}
						class="group relative flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all {state.activeInfoSection ===
						step.id
							? 'bg-[#972395] text-white shadow-md shadow-purple-200'
							: 'bg-gray-50 text-gray-500 hover:bg-gray-100'}"
					>
						<div
							class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors {state.activeInfoSection ===
							step.id
								? 'bg-white text-[#972395]'
								: 'bg-white text-gray-400 group-hover:text-gray-600'}"
						>
							{i + 1}
						</div>
						<div>
							<p
								class="text-sm font-bold {state.activeInfoSection === step.id
									? 'text-white'
									: 'text-gray-900'}"
							>
								{step.label}
							</p>
							<p
								class="text-[10px] {state.activeInfoSection === step.id
									? 'text-purple-100'
									: 'text-gray-500'}"
							>
								{step.sub}
							</p>
						</div>
					</button>
				{/each}
			{:else}
				<!-- Trip Steps -->
				{#if !state.showTripSetup}
					<button
						class="relative flex w-full items-center gap-3 rounded-xl bg-[#972395] p-3 text-left text-white shadow-md shadow-purple-200"
					>
						<div
							class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-[#972395]"
						>
							1
						</div>
						<div>
							<p class="text-sm font-bold">Trip Management</p>
							<p class="text-[10px] text-purple-100">Manage trip dates</p>
						</div>
					</button>
				{:else}
					{@const tripSteps = [
						{ id: 'information', label: 'Information', sub: 'Trip Details' },
						{ id: 'itinerary', label: 'Itinerary', sub: 'Day to Day' },
						{ id: 'flight', label: 'Flight', sub: 'Airfare & Legs' },
						{ id: 'tripsetup', label: 'Resources', sub: 'Hotel, Meal, Transport' },
						{ id: 'guide', label: 'Guide & Leader', sub: 'Staff Assignment' },
						{ id: 'calculation', label: 'Calculation', sub: 'Pricing & Costs' }
					]}

					{#each tripSteps as step, i}
						<button
							onclick={() => (state.activeTripSection = step.id)}
							class="group relative flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all {state.activeTripSection ===
							step.id
								? 'bg-[#972395] text-white shadow-md shadow-purple-200'
								: 'bg-gray-50 text-gray-500 hover:bg-gray-100'}"
						>
							<div
								class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors {state.activeTripSection ===
								step.id
									? 'bg-white text-[#972395]'
									: 'bg-white text-gray-400 group-hover:text-gray-600'}"
							>
								{i + 1}
							</div>
							<div>
								<p
									class="text-sm font-bold {state.activeTripSection === step.id
										? 'text-white'
										: 'text-gray-900'}"
								>
									{step.label}
								</p>
								<p
									class="text-[10px] {state.activeTripSection === step.id
										? 'text-purple-100'
										: 'text-gray-500'}"
								>
									{step.sub}
								</p>
							</div>
						</button>
					{/each}
				{/if}
			{/if}
		</nav>

		<!-- Progress Footer -->
		<div class="border-t border-gray-200 p-6">
			<div class="mb-2 flex justify-between text-xs font-medium text-gray-900">
				<span>Progress</span>
				<span>20%</span>
			</div>
			<div class="h-2 w-full rounded-full bg-gray-100">
				<div class="h-2 w-1/5 rounded-full bg-[#972395]"></div>
			</div>
			<p class="mt-2 text-[10px] text-gray-500">Step 1 of 5</p>
		</div>
	</aside>

	<!-- Main Content -->
	<main class="relative flex h-full flex-1 flex-col overflow-hidden bg-white">
		<!-- Top Bar / Breadcrumb area -->
		<div class="flex items-center justify-between border-b border-gray-200 bg-white px-8 py-4">
			<div class="flex items-center gap-2 text-xs text-gray-500">
				<span>Package Management</span>
				<span class="text-gray-300">/</span>
				<span class="font-medium text-gray-900">Add New Package</span>
			</div>
		</div>

		<!-- Toggle Header -->
		<div class="bg-white px-8 pt-6 pb-4">
			<div class="flex rounded-lg bg-gray-100 p-1">
				<button
					onclick={() => (state.activeSection = 'general')}
					class="flex-1 rounded-md py-2 text-sm font-medium transition-all {state.activeSection ===
					'general'
						? 'bg-white text-gray-900 shadow-sm'
						: 'text-gray-500 hover:text-gray-900'}"
				>
					General Info
				</button>
				<button
					onclick={() => (state.activeSection = 'trip')}
					class="flex-1 rounded-md py-2 text-sm font-medium transition-all {state.activeSection ===
					'trip'
						? 'bg-white text-gray-900 shadow-sm'
						: 'text-gray-500 hover:text-gray-900'}"
				>
					Trip Dates
				</button>
			</div>
		</div>

		<!-- Dynamic Content Area -->
		<div class="flex-1 overflow-y-auto p-8">
			<div class="w-full rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
				{#if state.activeSection === 'general'}
					<div class="mb-6 border-b border-gray-100 pb-4">
						<h2 class="text-lg font-bold text-gray-900">
							{#if state.activeInfoSection === 'basic'}General Information
							{:else if state.activeInfoSection === 'description'}Package Description
							{:else if state.activeInfoSection === 'include-exclude'}Included & Excluded
							{:else if state.activeInfoSection === 'faq'}F.A.Q
							{:else if state.activeInfoSection === 'gallery'}Gallery{/if}
						</h2>
						<p class="text-sm text-gray-500">
							Basic details about your package including name, duration, and destinations.
						</p>
					</div>
				{/if}

				{#if state.activeSection === 'general'}
					{#if state.activeInfoSection === 'basic'}
						<BasicInfo {state} />
					{/if}
					{#if state.activeInfoSection === 'penerangan' || state.activeInfoSection === 'description'}
						<Description {state} />
					{/if}
					{#if state.activeInfoSection === 'include' || state.activeInfoSection === 'include-exclude'}
						<IncludeExclude {state} />
					{/if}
					{#if state.activeInfoSection === 'faq'}
						<FAQ {state} />
					{/if}
					{#if state.activeInfoSection === 'gallery'}
						<Gallery {state} />
					{/if}
				{:else if state.activeSection === 'trip'}
					{#if !state.showTripSetup}
						<TripList {state} />
					{:else}
						<TripSetup {state} />
					{/if}
				{/if}

				<!-- Form Actions -->
				<div class="mt-8 flex items-center justify-end gap-3 border-t border-gray-100 pt-6">
					<button
						class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
					>
						Cancel
					</button>
					<button
						class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
					>
						Save Draft
					</button>
					<button
						class="rounded-lg bg-[#972395] px-6 py-2 text-sm font-medium text-white hover:bg-[#861f84]"
					>
						Next Step &rarr;
					</button>
				</div>
			</div>
		</div>
	</main>
</div>

<style>
	/* Global styles or overrides if needed */
	:global(body) {
		font-family:
			'Inter',
			system-ui,
			-apple-system,
			sans-serif;
	}

	/* Scrollbar styling for webkit browsers */
	:global(.no-scrollbar::-webkit-scrollbar) {
		display: none;
	}
	:global(.no-scrollbar) {
		-ms-overflow-style: none; /* IE and Edge */
		scrollbar-width: none; /* Firefox */
	}
</style>
