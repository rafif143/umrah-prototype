<script>
	import {
		Building2,
		MapPin,
		Eye,
		Edit3,
		Trash2,
		Plane,
		Clock,
		Calendar,
		Users
	} from 'lucide-svelte';
	import { formatDate, formatTime, getAirlineName } from './flightUtils.js';
	import { airlineStore } from '$lib/stores/airlineStore.svelte.js';

	let { bookings = [], onView, onEdit, onDelete } = $props();
</script>

<div class="flex-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
	<div class="h-full overflow-auto">
		<table class="w-full text-left text-xs">
			<thead class="sticky top-0 z-10 border-b border-gray-100 bg-gray-50/50 shadow-sm">
				<tr>
					<th class="px-4 py-3 font-semibold whitespace-nowrap text-gray-900">Name Booking</th>
					<th class="px-4 py-3 font-semibold whitespace-nowrap text-gray-900">Route Info</th>
					<th class="px-4 py-3 font-semibold whitespace-nowrap text-gray-900">PNR & Seats</th>
					<th class="sticky right-0 bg-gray-50 px-4 py-3 text-right font-semibold text-gray-900"
						>Actions</th
					>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-100">
				{#each bookings as booking}
					{@const sectors =
						booking.sectors || booking.pnrGroups?.flatMap((g) => g.sectors || []) || []}
					{@const airlineCode = booking.airline || booking.pnrGroups?.[0]?.airline}
					{@const airlineName = getAirlineName(airlineCode, airlineStore.airlines)}
					{@const firstSector = sectors[0]}
					{@const pnrs =
						booking.pnrs ||
						booking.pnrGroups?.map((g) => ({ pnr: g.pnr, pnrPending: g.pnrPending })) ||
						[]}
					{@const totalSeats = booking.totalSeats || 0}
					{@const pendingPnrs = pnrs.filter((p) => !p.pnr || p.pnr === '').length}

					<tr class="group transition-colors hover:bg-gray-50/50">
						<td class="px-4 py-3">
							<div class="flex flex-col gap-1">
								<div class="flex items-center gap-2">
									<div
										class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-100 text-[#972395]"
									>
										<Building2 size={14} />
									</div>
									<span class="font-medium text-gray-900">{booking.travelAgent}</span>
								</div>
								{#if airlineName}
									<div class="flex items-center gap-1.5 pl-9 text-[10px] text-gray-500">
										<Plane size={10} />
										<span>{airlineName}</span>
									</div>
								{/if}
							</div>
						</td>
						<td class="px-4 py-3">
							<div class="flex flex-col gap-1">
								<div class="flex items-center gap-2 text-sm">
									<span class="font-medium text-gray-900"
										>{sectors.length} Sector{sectors.length !== 1 ? 's' : ''}</span
									>
								</div>
								{#if firstSector}
									<div class="flex items-center gap-1.5 text-xs text-gray-500">
										<MapPin size={10} />
										<span>{firstSector.fromCity || firstSector.origin}</span>
										<span class="text-gray-300">→</span>
										<span>{firstSector.toCity || firstSector.destination}</span>
										{#if firstSector.carrier && firstSector.carrierNo}
											<span class="text-gray-300">|</span>
											<Plane size={10} />
											<span>{firstSector.carrier}{firstSector.carrierNo}</span>
										{/if}
										{#if sectors.length > 1}
											<span class="text-gray-400">+{sectors.length - 1} more</span>
										{/if}
									</div>
								{/if}
							</div>
						</td>
						<td class="px-4 py-3">
							<div class="flex flex-col gap-1.5">
								<!-- Seats -->
								{#if totalSeats > 0}
									<div class="flex items-center gap-1.5 text-xs font-medium text-gray-700">
										<Users size={12} class="text-gray-400" />
										<span>{totalSeats} Seats</span>
									</div>
								{/if}

								<!-- PNR Status -->
								<div class="flex items-center gap-2">
									{#if pnrs.length > 0}
										<div class="flex items-center gap-1 text-[10px]">
											<span class="text-gray-500"
												>{pnrs.length} PNR{pnrs.length !== 1 ? 's' : ''}</span
											>
											{#if pendingPnrs > 0}
												<span
													class="rounded bg-orange-100 px-1.5 py-0.5 font-medium text-orange-700"
												>
													{pendingPnrs} Pending
												</span>
											{:else}
												<span class="rounded bg-green-100 px-1.5 py-0.5 font-medium text-green-700">
													confirmed
												</span>
											{/if}
										</div>
									{:else}
										<span class="text-[10px] text-gray-400 italic">No PNRs</span>
									{/if}
								</div>
							</div>
						</td>
						<td
							class="sticky right-0 w-[120px] bg-white px-4 py-3 text-right group-hover:bg-gray-50/50"
						>
							<div class="flex items-center justify-end gap-1">
								<button
									class="flex items-center gap-1 rounded-lg bg-purple-50 px-2.5 py-1.5 text-xs font-medium text-[#972395] transition-colors hover:bg-purple-100"
									onclick={() => onView(booking)}
									title="View Details"
								>
									<Eye size={12} />
									Detail
								</button>
								<button
									class="rounded-lg p-1.5 text-gray-400 hover:bg-white hover:text-[#972395] hover:shadow-sm"
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
									<p class="font-medium text-gray-500">No confirm bookings yet</p>
									<p class="text-sm">
										Click "Add Flight Confirm" to add your first flight booking.
									</p>
								</div>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
