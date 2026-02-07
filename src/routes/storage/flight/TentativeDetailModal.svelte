<script>
	import { Plane, Calendar, Clock, X, Edit3 } from 'lucide-svelte';
	import { fly, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { formatDate } from './flightUtils.js';
	import FlightUsageTable from './FlightUsageTable.svelte';

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
			class="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
			transition:fly={{ y: 30, duration: 300, easing: cubicOut }}
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
			role="document"
		>
			<!-- Header -->
			<div
				class="flex shrink-0 items-center justify-between border-b border-gray-100 bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-5"
			>
				<div>
					<h2 class="text-xl font-bold text-white">{booking.name}</h2>
					<p class="text-sm text-orange-100">Tentative Flight Details</p>
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
				<!-- Sectors -->
				<div class="flex flex-col gap-3">
					<h3 class="text-sm font-semibold text-gray-700">Flight Sectors</h3>
					{#each booking.sectors || [] as sector, sIdx}
						<div class="flex items-center gap-4 rounded-xl bg-orange-50 p-4">
							<!-- Sector Number -->
							<div
								class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white"
							>
								{sIdx + 1}
							</div>

							<!-- Route -->
							<div class="flex-1">
								<div class="flex items-center gap-3 text-base">
									<div class="text-center">
										<span class="font-bold text-gray-900">{sector.origin}</span>
									</div>
									<div class="flex items-center gap-1 text-gray-400">
										<div class="h-px w-6 bg-gray-300"></div>
										<Plane size={14} class="rotate-90" />
										<div class="h-px w-6 bg-gray-300"></div>
									</div>
									<div class="text-center">
										<span class="font-bold text-gray-900">{sector.destination}</span>
									</div>
								</div>
								{#if sector.seat}
									<p class="mt-1 text-xs text-gray-500">Seat: {sector.seat}</p>
								{/if}
							</div>

							<!-- Date & Time -->
							{#if sector.departureDate}
								<div class="flex items-center gap-2 text-sm text-gray-600">
									<Calendar size={14} />
									<span>{formatDate(sector.departureDate)}</span>
									{#if sector.departureTime}
										<span class="text-gray-400">|</span>
										<Clock size={14} />
										<span>{sector.departureTime}</span>
									{/if}
								</div>
							{/if}
						</div>
					{/each}
				</div>

				<!-- Notes Section -->
				{#if booking.notes}
					<div class="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
						<h4 class="mb-2 text-sm font-semibold text-gray-700">Notes</h4>
						<p class="text-sm text-gray-600">{booking.notes}</p>
					</div>
				{/if}

				<!-- Flight Usage Table -->
				<div class="mt-6">
					<FlightUsageTable bookingId={booking.id} isTentative={true} />
				</div>
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
						class="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-orange-600 hover:shadow-md"
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
