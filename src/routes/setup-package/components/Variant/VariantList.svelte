<script>
	import { Plus, Trash2, Edit } from 'lucide-svelte';

	/** @type {{ state: import('../../packageState.svelte.js').PackageState }} */
	let { state } = $props();
</script>

<div class="space-y-4">
	<!-- Add Button -->
	<div class="flex justify-end">
		<button
			onclick={() => state.addVariant()}
			class="flex items-center gap-2 rounded-lg bg-[#972395] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7a1c78]"
		>
			<Plus size={16} />
			Add Variant
		</button>
	</div>

	<!-- Table -->
	<div class="overflow-hidden rounded-lg border border-gray-200">
		<table class="w-full text-left text-sm">
			<thead class="bg-gray-50 text-gray-600">
				<tr>
					<th class="px-4 py-3 font-medium">Name</th>
					<th class="px-4 py-3 font-medium">Room</th>
					<th class="px-4 py-3 font-medium">Category</th>
					<th class="px-4 py-3 font-medium">Type</th>
					<th class="px-4 py-3 font-medium">Pax</th>
					<th class="px-4 py-3 font-medium">Duration</th>
					<th class="px-4 py-3 text-right font-medium">Actions</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-200">
				{#each state.packageVariants as variant}
					<tr
						class="cursor-pointer transition-colors hover:bg-gray-50"
						onclick={() => state.enterVariant(variant.id)}
					>
						<td class="px-4 py-3 font-medium text-gray-900">{variant.name}</td>
						<td class="px-4 py-3 text-gray-600">
							<span
								class="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
							>
								{variant.type}
							</span>
						</td>
						<td class="px-4 py-3 text-gray-600">
							{#if variant.categories.length > 0}
								{variant.categories.join(', ')}
							{:else}
								<span class="text-gray-400">—</span>
							{/if}
						</td>
						<td class="px-4 py-3 text-gray-600">
							{#if variant.types.length > 0}
								{variant.types.join(', ')}
							{:else}
								<span class="text-gray-400">—</span>
							{/if}
						</td>
						<td class="px-4 py-3 text-gray-600">{variant.paxCapacity || '—'}</td>
						<td class="px-4 py-3 text-gray-600">
							{#if variant.durationDays}
								{variant.durationDays}D / {variant.durationNights}N
							{:else}
								<span class="text-gray-400">—</span>
							{/if}
						</td>
						<td class="px-4 py-3 text-right">
							<div class="flex justify-end gap-2">
								<button
									class="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#972395]"
									onclick={(e) => {
										e.stopPropagation();
										state.enterVariant(variant.id);
									}}
								>
									<Edit size={14} />
								</button>
								<button
									class="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
									onclick={(e) => {
										e.stopPropagation();
										state.removeVariant(variant.id);
									}}
								>
									<Trash2 size={14} />
								</button>
							</div>
						</td>
					</tr>
				{/each}
				{#if state.packageVariants.length === 0}
					<tr>
						<td colspan="7" class="px-4 py-8 text-center text-sm text-gray-500">
							No variants added yet. Click "Add Variant" to get started.
						</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>
</div>
