<script>
	import { packageStore } from '$lib/stores/packageStore.svelte.js';
	import { Link, Calendar, Users } from 'lucide-svelte';

	let { bookingId, isTentative = false } = $props();

	let usages = $derived(
		packageStore.packages.flatMap((pkg) =>
			(pkg.tripDates || [])
				.filter((td) => td.flightId === bookingId)
				.map((td) => ({
					pkgName: pkg.name,
					tripDate: td.date,
					pax: td.paxCapacity,
					status: td.status
				}))
		)
	);
</script>

<div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
	<div class="flex items-center gap-2 border-b border-gray-200 bg-blue-50/50 px-4 py-3">
		<Link size={16} class="text-blue-600" />
		<h3 class="text-sm font-bold text-gray-900">Used In Packages</h3>
	</div>

	{#if usages.length === 0}
		<div class="flex flex-col items-center justify-center p-8 text-center text-gray-500">
			<Link size={24} class="mb-2 text-gray-300" />
			<p class="text-xs">This flight is not currently linked to any package.</p>
		</div>
	{:else}
		<table class="w-full text-left text-xs">
			<thead class="bg-gray-50 text-gray-500">
				<tr>
					<th class="px-4 py-2 font-medium">Package Name</th>
					<th class="px-4 py-2 font-medium">Trip Date</th>
					<th class="px-4 py-2 text-center font-medium">Pax Capacity</th>
					<th class="px-4 py-2 text-right font-medium">Trip Status</th>
					<th class="px-4 py-2 text-right font-medium">Usage Status</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-100">
				{#each usages as usage}
					{@const tripDate = new Date(usage.tripDate)}
					{@const today = new Date()}
					{@const isPast = tripDate < today}
					<tr class="hover:bg-gray-50/50">
						<td class="px-4 py-2 font-medium text-gray-900">{usage.pkgName}</td>
						<td class="px-4 py-2 text-gray-600">
							<div class="flex items-center gap-1.5">
								<Calendar size={12} class="text-gray-400" />
								{usage.tripDate}
							</div>
						</td>
						<td class="px-4 py-2 text-center text-gray-900">
							<div class="flex items-center justify-center gap-1">
								<Users size={12} class="text-gray-400" />
								{usage.pax}
							</div>
						</td>
						<td class="px-4 py-2 text-right">
							<span
								class="inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium
								{isPast
									? 'bg-gray-100 text-gray-700'
									: usage.status === 'Active'
										? 'bg-green-100 text-green-700'
										: usage.status === 'Draft'
											? 'bg-gray-100 text-gray-700'
											: 'bg-yellow-100 text-yellow-700'}"
							>
								{isPast ? 'Ended' : usage.status}
							</span>
						</td>
						<td class="px-4 py-2 text-right">
							<span
								class="inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium
								{isPast && !isTentative ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}"
							>
								{isPast && !isTentative ? 'Has been used' : 'Use Now'}
							</span>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</div>
