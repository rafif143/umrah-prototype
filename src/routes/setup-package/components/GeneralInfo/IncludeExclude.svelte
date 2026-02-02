<script>
	import { X, Plus } from 'lucide-svelte';

	/** @type {{ state: import('../../packageState.svelte').PackageState }} */
	let { state } = $props();
</script>

<div class="mb-6 flex gap-6 border-b border-gray-200">
	<button class="border-b-2 border-[#972395] pb-2 text-sm font-medium text-[#972395]"
		>Include</button
	>
	<button
		class="border-b-2 border-transparent pb-2 text-sm font-medium text-gray-500 hover:text-gray-700"
		>Exclude</button
	>
	<button
		class="border-b-2 border-transparent pb-2 text-sm font-medium text-gray-500 hover:text-gray-700"
		>Bonus</button
	>
</div>
<section class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
	<div class="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
		<h3 class="text-base font-semibold text-gray-900">Included Items</h3>
		<p class="mt-0.5 text-xs text-gray-500">List what's included in this package.</p>
	</div>
	<div class="flex flex-col gap-3 p-6">
		{#each state.includedItems as item, i}
			<div class="flex items-center gap-3">
				<input
					type="text"
					placeholder="e.g., Return flight tickets"
					bind:value={state.includedItems[i]}
					class="flex-1 rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
				/>
				<button
					class="text-gray-400 hover:text-red-500"
					onclick={() => (state.includedItems = state.includedItems.filter((_, idx) => idx !== i))}
					><X size={18} /></button
				>
			</div>
		{/each}
		<button
			class="mt-2 mr-auto flex items-center gap-2 text-sm font-medium text-[#972395] hover:text-[#7a1c78]"
			onclick={() => (state.includedItems = [...state.includedItems, ''])}
		>
			<Plus size={16} /> Add Item
		</button>
	</div>
</section>
