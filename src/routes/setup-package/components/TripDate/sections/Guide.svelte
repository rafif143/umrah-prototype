<script>
	import { Plus, X } from 'lucide-svelte';

	/** @type {{ state: import('../../../packageState.svelte').PackageState }} */
	let { state } = $props();
</script>

<div class="mb-6 flex gap-6 border-b border-gray-200">
	<button
		class="border-b-2 pb-2 text-sm font-medium transition-colors {state.guideTab === 'guide'
			? 'border-[#972395] text-[#972395]'
			: 'border-transparent text-gray-500 hover:text-gray-700'}"
		onclick={() => (state.guideTab = 'guide')}>Tour Guide</button
	>
	<button
		class="border-b-2 pb-2 text-sm font-medium transition-colors {state.guideTab === 'leader'
			? 'border-[#972395] text-[#972395]'
			: 'border-transparent text-gray-500 hover:text-gray-700'}"
		onclick={() => (state.guideTab = 'leader')}>Tour Leader</button
	>
</div>

{#if state.guideTab === 'guide'}
	<section class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
		<div class="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
			<h3 class="text-base font-semibold text-gray-900">Tour Guide</h3>
			<p class="mt-0.5 text-xs text-gray-500">Assign tour guides.</p>
		</div>
		<div class="flex flex-col p-6">
			{#each state.activeTrip.guides as guide, i}
				<div class="relative mb-4 rounded-lg border border-gray-200 bg-gray-50/50 p-4">
					<div class="absolute top-4 right-4">
						<button
							class="text-gray-400 hover:text-red-500"
							onclick={() =>
								(state.activeTrip.guides = state.activeTrip.guides.filter((_, idx) => idx !== i))}
							><X size={16} /></button
						>
					</div>
					<div class="mb-4">
						<span
							class="flex h-6 w-6 items-center justify-center rounded-full bg-[#972395] text-xs font-bold text-white"
							>{i + 1}</span
						>
					</div>
					<div class="grid grid-cols-2 gap-4">
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700">Select Guide</label>
							<select
								bind:value={guide.name}
								class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
							>
								<option value="">Choose...</option>
								<option>Guide Ali (Makkah)</option>
								<option>Guide Hassan (Madinah)</option>
							</select>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700">Contact</label>
							<input
								type="text"
								placeholder="Auto-filled"
								disabled
								class="rounded-lg border border-gray-200 bg-gray-100 px-3.5 py-2.5 text-sm text-gray-500 outline-none"
							/>
						</div>
					</div>
				</div>
			{/each}
			<button
				class="flex w-fit items-center gap-2.5 rounded-lg border border-dashed border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-[#972395] hover:text-[#972395]"
				onclick={() =>
					(state.activeTrip.guides = [...state.activeTrip.guides, { name: '', type: 'guide' }])}
			>
				<Plus size={16} /> Add Guide
			</button>
		</div>
	</section>
{/if}

{#if state.guideTab === 'leader'}
	<section class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
		<div class="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
			<h3 class="text-base font-semibold text-gray-900">Tour Leader</h3>
			<p class="mt-0.5 text-xs text-gray-500">Assign tour leaders.</p>
		</div>
		<div class="flex flex-col p-6">
			{#each state.activeTrip.leaders as leader, i}
				<div class="relative mb-4 rounded-lg border border-gray-200 bg-gray-50/50 p-4">
					<div class="absolute top-4 right-4">
						<button
							class="text-gray-400 hover:text-red-500"
							onclick={() =>
								(state.activeTrip.leaders = state.activeTrip.leaders.filter((_, idx) => idx !== i))}
							><X size={16} /></button
						>
					</div>
					<div class="mb-4">
						<span
							class="flex h-6 w-6 items-center justify-center rounded-full bg-[#972395] text-xs font-bold text-white"
							>{i + 1}</span
						>
					</div>
					<div class="grid grid-cols-2 gap-4">
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700">Select Leader</label>
							<select
								bind:value={leader.name}
								class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
							>
								<option value="">Choose...</option>
								<option>Ustaz Ahmad</option>
								<option>Ustaz Ibrahim</option>
							</select>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700">Contact</label>
							<input
								type="text"
								placeholder="Auto-filled"
								disabled
								class="rounded-lg border border-gray-200 bg-gray-100 px-3.5 py-2.5 text-sm text-gray-500 outline-none"
							/>
						</div>
					</div>
				</div>
			{/each}
			<button
				class="flex w-fit items-center gap-2.5 rounded-lg border border-dashed border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-[#972395] hover:text-[#972395]"
				onclick={() =>
					(state.activeTrip.leaders = [...state.activeTrip.leaders, { name: '', type: 'leader' }])}
			>
				<Plus size={16} /> Add Leader
			</button>
		</div>
	</section>
{/if}
