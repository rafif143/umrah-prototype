<script>
	import { Plane, Calendar, Clock, X, Edit3, MapPin } from 'lucide-svelte';
	import { fly, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { formatDate, formatTime, getAirlineName } from './flightUtils.js';
	import { airlineStore } from '$lib/stores/airlineStore.svelte.js';

	let { show = false, booking = null, onClose, onEdit } = $props();
</script>

{#if show && booking}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
		transition:fade={{ duration: 200 }}
		onclick={onClose}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		onkeydown={(e) => e.key === 'Escape' && onClose()}
	>
		<!-- Modal Container -->
		<div
			class="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
			transition:fly={{ y: 30, duration: 300, easing: cubicOut }}
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
			role="document"
		>
			<!-- Header -->
			<div
				class="flex shrink-0 items-center justify-between border-b border-gray-100 bg-gradient-to-r from-[#972395] to-[#7a1c78] px-6 py-5"
			>
				<div>
					<h2 class="text-xl font-bold text-white">{booking.travelAgent}</h2>
					<p class="text-sm text-purple-200">Flight Confirm Details</p>
				</div>
				<button
					class="rounded-lg p-2 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
					onclick={onClose}
				>
					<X size={24} />
				</button>
			</div>

			<!-- Content -->
			<div class="min-h-0 flex-1 overflow-y-auto p-6">
				<!-- PNR Groups -->
				{#each booking.pnrGroups || [] as pnrGroup, gIdx}
					<div class="mb-6 rounded-xl border border-gray-200 bg-gray-50/50 p-4">
						<!-- PNR Group Header -->
						<div class="mb-4 flex items-center justify-between border-b border-gray-200 pb-3">
							<div class="flex items-center gap-3">
								<div
									class="flex h-8 w-8 items-center justify-center rounded-full bg-[#972395] text-sm font-bold text-white"
								>
									{gIdx + 1}
								</div>
								<div>
									<h3 class="text-sm font-semibold text-gray-900">
										{getAirlineName(pnrGroup.airline, airlineStore.airlines)}
									</h3>
									{#if pnrGroup.pnrPending}
										<span
											class="inline-flex items-center gap-1 rounded bg-orange-100 px-2 py-0.5 text-[10px] font-medium text-orange-700"
										>
											PNR Pending
										</span>
									{:else}
										<span class="text-xs text-gray-500">PNR: {pnrGroup.pnr}</span>
									{/if}
								</div>
							</div>
							<span class="text-xs text-gray-400">{pnrGroup.sectors?.length || 0} sector(s)</span>
						</div>

						<!-- Sectors -->
						<div class="space-y-3">
							{#each pnrGroup.sectors || [] as sector, sIdx}
								<div class="rounded-lg border border-gray-200 bg-white p-4">
									<!-- Sector Header -->
									<div class="mb-3 flex items-center justify-between">
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
										{#if sector.carrier && sector.carrierNo}
											<span class="text-xs font-medium text-gray-600"
												>{sector.carrier} {sector.carrierNo}</span
											>
										{/if}
									</div>

									<!-- Route -->
									<div class="mb-3 flex items-center gap-4">
										<div class="text-center">
											<p class="text-lg font-bold text-gray-900">
												{sector.fromCity || sector.origin}
											</p>
											{#if sector.departureHall}
												<p class="text-[10px] text-gray-500">{sector.departureHall}</p>
											{/if}
										</div>
										<div class="flex flex-1 items-center gap-2">
											<div class="h-px flex-1 bg-gray-200"></div>
											<Plane size={16} class="rotate-90 text-[#972395]" />
											<div class="h-px flex-1 bg-gray-200"></div>
										</div>
										<div class="text-center">
											<p class="text-lg font-bold text-gray-900">
												{sector.toCity || sector.destination}
											</p>
										</div>
									</div>

									<!-- Details Grid -->
									<div class="grid grid-cols-2 gap-x-6 gap-y-2 text-xs lg:grid-cols-4">
										{#if sector.departureDate}
											<div class="flex items-center gap-1.5 text-gray-600">
												<Calendar size={12} class="text-gray-400" />
												<span>{formatDate(sector.departureDate)}</span>
											</div>
										{/if}
										{#if sector.departureTime}
											<div class="flex items-center gap-1.5 text-gray-600">
												<Clock size={12} class="text-gray-400" />
												<span>Dep: {formatTime(sector.departureTime)}</span>
											</div>
										{/if}
										{#if sector.arrivalTime}
											<div class="flex items-center gap-1.5 text-gray-600">
												<Clock size={12} class="text-gray-400" />
												<span>Arr: {formatTime(sector.arrivalTime)}</span>
											</div>
										{/if}
										{#if sector.totalUmrahDay}
											<div class="flex items-center gap-1.5 text-gray-600">
												<span class="font-medium">{sector.totalUmrahDay} days</span>
											</div>
										{/if}
									</div>

									<!-- Extra Details -->
									{#if sector.registrationTime || sector.reportingTime || sector.supplier}
										<div class="mt-3 flex flex-wrap gap-2 border-t border-gray-100 pt-3">
											{#if sector.registrationTime}
												<span class="rounded bg-gray-100 px-2 py-1 text-[10px] text-gray-600">
													Reg: {sector.registrationTime}
												</span>
											{/if}
											{#if sector.reportingTime}
												<span class="rounded bg-gray-100 px-2 py-1 text-[10px] text-gray-600">
													Report: {sector.reportingTime}
												</span>
											{/if}
											{#if sector.supplier}
												<span class="rounded bg-gray-100 px-2 py-1 text-[10px] text-gray-600">
													{sector.supplier}
												</span>
											{/if}
										</div>
									{/if}

									{#if sector.notes}
										<p class="mt-2 text-xs text-gray-500 italic">{sector.notes}</p>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				{/each}

				<!-- Notes Section -->
				{#if booking.notes}
					<div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
						<h4 class="mb-2 text-sm font-semibold text-gray-700">Notes</h4>
						<p class="text-sm text-gray-600">{booking.notes}</p>
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
