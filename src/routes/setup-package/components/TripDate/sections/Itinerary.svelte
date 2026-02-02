<script>
	import { X, Plus } from 'lucide-svelte';

	/** @type {{ state: import('../../packageState.svelte').PackageState }} */
	let { state } = $props();
</script>

<section class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
	<div class="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
		<h3 class="text-base font-semibold text-gray-900">Itinerary</h3>
		<p class="mt-0.5 text-xs text-gray-500">Plan the daily schedule.</p>
	</div>
	<div class="flex flex-col p-6">
		{#each state.itinerary as day, i}
			<div class="relative mb-6 rounded-lg border border-gray-200 bg-gray-50/50 p-4">
				<div class="absolute top-4 right-4">
					<button
						class="text-gray-400 hover:text-red-500"
						onclick={() => (state.itinerary = state.itinerary.filter((_, idx) => idx !== i))}
						><X size={16} /></button
					>
				</div>
				<div class="mb-4">
					<span
						class="inline-flex items-center rounded-md bg-[#972395]/10 px-2.5 py-1 text-xs font-bold text-[#972395]"
						>Day {i + 1}</span
					>
				</div>
				<div class="mb-4 grid grid-cols-2 gap-4">
					<div class="flex flex-col gap-1.5">
						<label class="text-[13px] font-medium text-gray-700">Title</label>
						<input
							type="text"
							placeholder="e.g., Arrival in Jeddah"
							bind:value={day.title}
							class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
						/>
					</div>
					<div class="flex flex-col gap-1.5">
						<label class="text-[13px] font-medium text-gray-700">Location</label>
						<input
							type="text"
							placeholder="e.g., Jeddah Airport"
							bind:value={day.location}
							class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
						/>
					</div>
				</div>
				<div class="flex flex-col gap-1.5">
					<label class="text-[13px] font-medium text-gray-700">Description</label>
					<textarea
						rows="2"
						placeholder="Activities for this day..."
						bind:value={day.description}
						class="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
					></textarea>
				</div>
			</div>
		{/each}
		<button
			class="flex w-fit items-center gap-2.5 rounded-lg border border-dashed border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-[#972395] hover:text-[#972395]"
			onclick={() =>
				(state.itinerary = [
					...state.itinerary,
					{ day: state.itinerary.length + 1, title: '', location: '', description: '' }
				])}
		>
			<Plus size={16} /> Add Day
		</button>
	</div>
</section>
