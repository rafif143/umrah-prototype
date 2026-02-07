<script>
	import { MapPin, Eye, Edit3, Trash2, Plane } from 'lucide-svelte';
	import { formatDate } from './flightUtils.js';

	let { bookings = [], onView, onEdit, onDelete } = $props();
</script>

<div class="flex-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
	<div class="h-full overflow-auto">
		<table class="w-full text-left text-xs">
			<thead class="sticky top-0 z-10 border-b border-gray-100 bg-gray-50/50 shadow-sm">
				<tr>
					<th class="px-4 py-3 font-semibold whitespace-nowrap text-gray-900">Package Name</th>
					<th class="px-4 py-3 font-semibold whitespace-nowrap text-gray-900">Sectors</th>
					<th class="px-4 py-3 font-semibold whitespace-nowrap text-gray-900">Date</th>
					<th class="sticky right-0 bg-gray-50 px-4 py-3 text-right font-semibold text-gray-900"
						>Actions</th
					>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-100">
				{#each bookings as booking}
					{@const totalSectors = booking.sectors?.length || 0}
					{@const firstSector = booking.sectors?.[0]}
					<tr class="group transition-colors hover:bg-gray-50/50">
						<td class="px-4 py-3">
							<div class="flex items-center gap-2">
								<div
									class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600"
								>
									<Plane size={14} />
								</div>
								<span class="font-medium text-gray-900">{booking.name}</span>
							</div>
						</td>
						<td class="px-4 py-3">
							<div class="flex flex-col gap-1">
								<span class="text-sm font-medium text-gray-900"
									>{totalSectors} Sector{totalSectors !== 1 ? 's' : ''}</span
								>
								{#if firstSector}
									<div class="flex items-center gap-1.5 text-xs text-gray-500">
										<MapPin size={10} />
										<span>{firstSector.origin}</span>
										<span class="text-gray-300">→</span>
										<span>{firstSector.destination}</span>
										{#if totalSectors > 1}
											<span class="text-gray-400">+{totalSectors - 1} more</span>
										{/if}
									</div>
								{/if}
							</div>
						</td>
						<td class="px-4 py-3">
							{#if firstSector?.departureDate}
								<span class="text-sm text-gray-600">{formatDate(firstSector.departureDate)}</span>
							{:else}
								<span class="text-sm text-gray-400">-</span>
							{/if}
						</td>
						<td
							class="sticky right-0 w-[120px] bg-white px-4 py-3 text-right group-hover:bg-gray-50/50"
						>
							<div class="flex items-center justify-end gap-1">
								<button
									class="flex items-center gap-1 rounded-lg bg-orange-50 px-2.5 py-1.5 text-xs font-medium text-orange-600 transition-colors hover:bg-orange-100"
									onclick={() => onView(booking)}
									title="View Details"
								>
									<Eye size={12} />
									Detail
								</button>
								<button
									class="rounded-lg p-1.5 text-gray-400 hover:bg-white hover:text-orange-600 hover:shadow-sm"
									onclick={() => onEdit(booking)}
									title="Edit"
								>
									<Edit3 size={14} />
								</button>
								<button
									class="rounded-lg p-1.5 text-gray-400 hover:bg-white hover:text-red-500 hover:shadow-sm"
									onclick={() => onDelete(booking.id)}
									title="Delete"
								>
									<Trash2 size={14} />
								</button>
							</div>
						</td>
					</tr>
				{:else}
					<tr>
						<td colspan="4" class="px-4 py-12 text-center">
							<div class="flex flex-col items-center gap-3 text-gray-400">
								<Plane size={40} strokeWidth={1} />
								<div>
									<p class="font-medium text-gray-500">No tentative flights yet</p>
									<p class="text-sm">Click "Add Tentative" to create a flight package.</p>
								</div>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
