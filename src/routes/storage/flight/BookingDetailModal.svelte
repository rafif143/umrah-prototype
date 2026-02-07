<script>
	import {
		Plane,
		Calendar,
		Clock,
		X,
		Edit3,
		MapPin,
		Users,
		ChevronDown,
		ChevronUp
	} from 'lucide-svelte';
	import { fly, fade, slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { formatDate, formatTime, getAirlineName } from './flightUtils.js';
	import { airlineStore } from '$lib/stores/airlineStore.svelte.js';
	import FlightUsageTable from './FlightUsageTable.svelte';

	let { show = false, booking = null, onClose, onEdit } = $props();

	// Helper to handle both old and new structure during transition (optional, but good for safety)
	let displayData = $derived(
		booking
			? {
					...booking,
					airline: booking.airline || booking.pnrGroups?.[0]?.airline, // Fallback
					sectors: booking.sectors || booking.pnrGroups?.[0]?.sectors || [], // Fallback
					costs:
						booking.costs ||
						booking.sectors?.[0]?.costs ||
						booking.pnrGroups?.[0]?.sectors?.[0]?.costs // Fallback
				}
			: null
	);

	let expandedSectors = $state(new Set());

	function toggleSector(index) {
		const newSet = new Set(expandedSectors);
		if (newSet.has(index)) {
			newSet.delete(index);
		} else {
			newSet.add(index);
		}
		expandedSectors = newSet;
	}
</script>

{#if show && displayData}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
		transition:fade={{ duration: 200 }}
		onclick={onClose}
		role="button"
		tabindex="-1"
		onkeydown={(e) => e.key === 'Escape' && onClose()}
	>
		<!-- Modal Container -->
		<div
			class="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
			transition:fly={{ y: 30, duration: 300, easing: cubicOut }}
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
			role="dialog"
			aria-modal="true"
			tabindex="-1"
		>
			<!-- Header -->
			<div
				class="flex shrink-0 items-center justify-between border-b border-gray-100 bg-gradient-to-r from-[#972395] to-[#7a1c78] px-6 py-5"
			>
				<div>
					<h2 class="max-w-md truncate text-xl font-bold text-white">{displayData.travelAgent}</h2>
					<div class="mt-1 flex items-center gap-3 text-purple-100">
						<span
							class="flex items-center gap-1.5 rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium"
						>
							<Plane size={12} />
							{getAirlineName(displayData.airline, airlineStore.airlines)}
						</span>
						{#if displayData.totalSeats}
							<span
								class="flex items-center gap-1.5 rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium"
							>
								<Users size={12} />
								{displayData.totalSeats} Seats
							</span>
						{/if}
					</div>
				</div>
				<button
					class="rounded-lg p-2 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
					onclick={onClose}
				>
					<X size={24} />
				</button>
			</div>

			<!-- Content -->
			<div class="min-h-0 flex-1 overflow-y-auto bg-gray-50/50 p-6">
				<!-- PNR List (New Structure) -->
				{#if displayData.pnrs?.length}
					<div class="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
						<div
							class="flex items-center justify-between border-b border-gray-100 bg-purple-50/50 px-4 py-3"
						>
							<h3 class="flex items-center gap-2 text-sm font-bold text-gray-900">
								<span class="text-[#972395]"><Plane size={14} /></span> PNR Details
							</h3>
						</div>
						<div class="p-0">
							<table class="w-full text-left text-sm">
								<thead class="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
									<tr>
										<th class="px-4 py-2">PNR</th>
										<th class="px-4 py-2">Class</th>
										<th class="px-4 py-2">Group Name</th>
										<th class="px-4 py-2">Flight No</th>
										<th class="px-4 py-2 text-center">Seats</th>
									</tr>
								</thead>
								<tbody class="divide-y divide-gray-100">
									{#each displayData.pnrs as pnr}
										<tr class="hover:bg-gray-50/50">
											<td class="px-4 py-2 font-medium text-gray-900">{pnr.pnr || '-'}</td>
											<td class="px-4 py-2 text-gray-600">{pnr.class || '-'}</td>
											<td class="px-4 py-2 text-gray-600">{pnr.name || '-'}</td>
											<td class="px-4 py-2 text-gray-600">{pnr.number || '-'}</td>
											<td class="px-4 py-2 text-center font-medium text-gray-900"
												>{pnr.seats || 0}</td
											>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				{:else if displayData.pnrGroups}
					<!-- Fallback for Old Structure -->
					<div class="mb-6 rounded-xl border border-gray-200 bg-white p-4">
						<p class="text-sm text-gray-500 italic">Legacy PNR Structure (Edit to migrate)</p>
						<div class="mt-2 space-y-2">
							{#each displayData.pnrGroups as group}
								<div class="text-xs">
									<span class="font-bold">{group.airline}</span> - PNR: {group.pnr}
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Sectors -->
				<div class="space-y-3">
					{#each displayData.sectors || [] as sector, sIdx}
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<div
							class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
						>
							<!-- Sector Header (Clickable) -->
							<button
								type="button"
								class="flex w-full cursor-pointer items-center justify-between border-0 bg-transparent p-4 text-left transition-colors hover:bg-gray-50/50"
								onclick={() => toggleSector(sIdx)}
							>
								<div class="flex flex-1 items-center gap-4">
									<div class="flex items-center gap-2">
										<span
											class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-[#972395]"
										>
											{sIdx + 1}
										</span>
										{#if sector.type}
											<span
												class="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-medium tracking-wide text-blue-700 uppercase"
											>
												{sector.type}
											</span>
										{/if}
									</div>

									<div class="flex flex-1 items-center gap-4">
										<div class="flex items-center gap-2">
											<span class="text-base font-bold text-gray-900"
												>{sector.fromCity || sector.origin}</span
											>
											<Plane size={14} class="rotate-90 text-[#972395]" />
											<span class="text-base font-bold text-gray-900"
												>{sector.toCity || sector.destination}</span
											>
										</div>
										{#if sector.departureDate}
											<div class="mx-2 h-4 w-px bg-gray-200"></div>
											<div class="flex items-center gap-1.5 text-xs text-gray-500">
												<Calendar size={12} />
												<span>{formatDate(sector.departureDate)}</span>
											</div>
										{/if}
									</div>
								</div>

								<div class="flex items-center gap-3">
									{#if sector.carrier && sector.carrierNo}
										<span class="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600"
											>{sector.carrier} {sector.carrierNo}</span
										>
									{/if}
									{#if expandedSectors.has(sIdx)}
										<ChevronUp size={16} class="text-gray-400" />
									{:else}
										<ChevronDown size={16} class="text-gray-400" />
									{/if}
								</div>
							</button>

							{#if expandedSectors.has(sIdx)}
								<div class="border-t border-gray-100 p-4 pt-0" transition:slide={{ duration: 200 }}>
									<!-- Details Grid -->
									<div
										class="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 rounded-lg border border-gray-100 bg-gray-50/50 p-3 text-xs lg:grid-cols-4"
									>
										{#if sector.departureDate}
											<div class="flex items-center gap-2 text-gray-600">
												<Calendar size={14} class="text-gray-400" />
												<span>{formatDate(sector.departureDate)}</span>
											</div>
										{/if}
										{#if sector.departureTime}
											<div class="flex items-center gap-2 text-gray-600">
												<Clock size={14} class="text-gray-400" />
												<span
													>Dep: <span class="font-medium text-gray-900"
														>{formatTime(sector.departureTime)}</span
													></span
												>
											</div>
										{/if}
										{#if sector.arrivalTime}
											<div class="flex items-center gap-2 text-gray-600">
												<Clock size={14} class="text-gray-400" />
												<span
													>Arr: <span class="font-medium text-gray-900"
														>{formatTime(sector.arrivalTime)}</span
													></span
												>
											</div>
										{/if}
										{#if sector.totalUmrahDay}
											<div class="flex items-center gap-2 text-gray-600">
												<span class="text-gray-400">Duration:</span>
												<span class="font-medium text-gray-900">{sector.totalUmrahDay} days</span>
											</div>
										{/if}
									</div>

									<!-- Extra Details -->
									{#if sector.registrationTime || sector.reportingTime || sector.supplier || sector.departureHall}
										<div class="mt-3 flex flex-wrap gap-2 text-[10px]">
											{#if sector.departureHall}
												<span class="rounded border border-gray-200 px-2 py-1 text-gray-600">
													Hall: <span class="font-medium text-gray-900">{sector.departureHall}</span
													>
												</span>
											{/if}
											{#if sector.registrationTime}
												<span class="rounded border border-gray-200 px-2 py-1 text-gray-600">
													Reg: <span class="font-medium text-gray-900"
														>{sector.registrationTime}</span
													>
												</span>
											{/if}
											{#if sector.reportingTime}
												<span class="rounded border border-gray-200 px-2 py-1 text-gray-600">
													Report: <span class="font-medium text-gray-900"
														>{sector.reportingTime}</span
													>
												</span>
											{/if}
											{#if sector.supplier}
												<span class="rounded border border-gray-200 px-2 py-1 text-gray-600">
													Supplier: <span class="font-medium text-gray-900">{sector.supplier}</span>
												</span>
											{/if}
										</div>
									{/if}

									{#if sector.notes}
										<div
											class="mt-3 rounded border border-yellow-100 bg-yellow-50 p-2 text-xs text-yellow-700"
										>
											<span class="font-medium">Note:</span>
											{sector.notes}
										</div>
									{/if}
								</div>
							{/if}
						</div>
					{/each}
				</div>

				<!-- Cost Breakdown (Booking Level) -->
				{#if displayData.costs}
					<div class="mt-6 rounded-lg border border-gray-200 bg-white shadow-sm">
						<div class="border-b border-gray-100 bg-green-50/50 px-4 py-3">
							<h3 class="text-sm font-bold text-gray-900">Cost Breakdown</h3>
						</div>
						<div class="overflow-x-auto p-4">
							<table class="w-full min-w-[400px] text-left text-xs">
								<thead class="bg-gray-50 text-gray-500">
									<tr>
										<th class="px-3 py-2 font-medium">Type</th>
										<th class="px-3 py-2 text-center font-medium">Adult (Cost)</th>
										<th class="px-3 py-2 text-center font-medium">Adult (Sell)</th>
										<th class="px-3 py-2 text-center font-medium">Child (Cost)</th>
										<th class="px-3 py-2 text-center font-medium">Child (Sell)</th>
										<th class="px-3 py-2 text-center font-medium">Infant (Cost)</th>
										<th class="px-3 py-2 text-center font-medium">Infant (Sell)</th>
									</tr>
								</thead>
								<tbody class="divide-y divide-gray-100">
									{#each ['airfare', 'tax', 'ur'] as type}
										{#if displayData.costs[type]}
											<tr class="hover:bg-gray-50/50">
												<td class="px-3 py-2 font-medium text-gray-700 capitalize">{type}</td>
												<td class="px-3 py-2 text-center text-gray-600"
													>{displayData.costs[type].adultCost || 0}</td
												>
												<td class="px-3 py-2 text-center font-medium text-gray-900"
													>{displayData.costs[type].adultSell || 0}</td
												>
												<td class="px-3 py-2 text-center text-gray-600"
													>{displayData.costs[type].childCost || 0}</td
												>
												<td class="px-3 py-2 text-center font-medium text-gray-900"
													>{displayData.costs[type].childSell || 0}</td
												>
												<td class="px-3 py-2 text-center text-gray-600"
													>{displayData.costs[type].infantCost || 0}</td
												>
												<td class="px-3 py-2 text-center font-medium text-gray-900"
													>{displayData.costs[type].infantSell || 0}</td
												>
											</tr>
										{/if}
									{/each}
									<!-- Total Row (Optional, if we want to sum it up) -->
									{#if displayData.costs.total}
										<tr class="border-t border-gray-200 bg-gray-50 font-bold">
											<td class="px-3 py-2 text-gray-900">Total</td>
											<td class="px-3 py-2 text-center text-gray-900"
												>{displayData.costs.total.adultCost || 0}</td
											>
											<td class="px-3 py-2 text-center text-[#972395]"
												>{displayData.costs.total.adultSell || 0}</td
											>
											<td class="px-3 py-2 text-center text-gray-900"
												>{displayData.costs.total.childCost || 0}</td
											>
											<td class="px-3 py-2 text-center text-[#972395]"
												>{displayData.costs.total.childSell || 0}</td
											>
											<td class="px-3 py-2 text-center text-gray-900"
												>{displayData.costs.total.infantCost || 0}</td
											>
											<td class="px-3 py-2 text-center text-[#972395]"
												>{displayData.costs.total.infantSell || 0}</td
											>
										</tr>
									{/if}
								</tbody>
							</table>
						</div>
					</div>
				{/if}

				<!-- Flight Usage Table -->
				<div class="mt-6 mb-6">
					<FlightUsageTable bookingId={displayData.id} />
				</div>

				<!-- Notes Section -->
				{#if displayData.notes}
					<div class="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
						<h4 class="mb-1 text-sm font-semibold text-gray-700">Booking Notes</h4>
						<p class="text-sm text-gray-600">{displayData.notes}</p>
					</div>
				{/if}
			</div>

			<!-- Footer -->
			<div
				class="flex shrink-0 items-center justify-between border-t border-gray-100 bg-gray-50 px-6 py-4"
			>
				<p class="text-xs text-gray-400">
					{#if booking.createdAt}
						Created: {new Date(booking.createdAt).toLocaleDateString('en-GB', {
							day: 'numeric',
							month: 'short',
							year: 'numeric'
						})}
					{/if}
				</p>
				<div class="flex items-center gap-2">
					<button
						class="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
						onclick={onClose}
					>
						Close
					</button>
					<button
						class="flex items-center gap-2 rounded-lg bg-[#972395] px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#7a1c78] hover:shadow-md"
						onclick={() => {
							onClose();
							onEdit(booking);
						}}
					>
						<Edit3 size={14} />
						Edit
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
