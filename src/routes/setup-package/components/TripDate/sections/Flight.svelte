<script>
	import {
		X,
		Plus,
		Eye,
		Trash2,
		Plane,
		Clock,
		Calendar,
		Search,
		MapPin,
		Check
	} from 'lucide-svelte';
	import { fly, fade } from 'svelte/transition';
	import { flightStorageStore } from '$lib/stores/flightStorageStore.svelte.js';
	import { airlineStore } from '$lib/stores/airlineStore.svelte.js';

	/** @type {{ state: import('../packageState.svelte').PackageState }} */
	let { state: pkgState } = $props();

	// Modal state
	let showPickerModal = $state(false);
	let showDetailModal = $state(false);
	let searchQuery = $state('');
	let viewingFlight = $state(null);

	// Get confirmed flights filtered by search
	let filteredFlights = $derived(
		flightStorageStore.confirmBookings.filter(
			(b) =>
				b.travelAgent?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				b.pnrGroups?.some(
					(g) =>
						g.pnr?.toLowerCase().includes(searchQuery.toLowerCase()) ||
						g.sectors?.some((s) =>
							(s.carrier + s.carrierNo)?.toLowerCase().includes(searchQuery.toLowerCase())
						)
				)
		)
	);

	// Helper functions
	function getAirlineName(code) {
		const airline = airlineStore.airlines?.find((a) => a.code === code);
		return airline ? airline.name : code;
	}

	function formatTime(timeObj) {
		if (!timeObj) return '';
		if (typeof timeObj === 'string') return timeObj;
		return `${timeObj.hour || '00'}:${timeObj.minute || '00'}`;
	}

	function formatDate(dateString) {
		if (!dateString) return '';
		return new Date(dateString).toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'short'
		});
	}

	// Select a flight from storage
	function selectFlight(booking) {
		// Add to package's flight list
		const flightData = {
			id: Date.now().toString(),
			storageId: booking.id, // Reference to original
			name: booking.travelAgent,
			pnrGroups: booking.pnrGroups,
			notes: booking.notes
		};
		pkgState.flightList = [...pkgState.flightList, flightData];
		showPickerModal = false;
		searchQuery = '';
	}

	// Remove flight from package
	function removeFlight(index) {
		pkgState.flightList = pkgState.flightList.filter((_, i) => i !== index);
	}

	// View flight details
	function viewFlightDetail(flight) {
		viewingFlight = flight;
		showDetailModal = true;
	}
</script>

<section class="flex flex-col gap-6">
	<div class="flex items-center justify-between">
		<div>
			<h3 class="text-base font-semibold text-gray-900">Flight Details</h3>
			<p class="mt-0.5 text-xs text-gray-500">Select flights from confirmed bookings.</p>
		</div>
		<button
			class="flex items-center gap-2 rounded-lg bg-[#972395] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7a1c78]"
			onclick={() => (showPickerModal = true)}
		>
			<Plus size={16} />
			Add Flight
		</button>
	</div>

	{#if pkgState.flightList.length === 0}
		<div
			class="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50/50 p-12 text-center"
		>
			<div class="mb-4 rounded-full bg-white p-4 shadow-sm">
				<Plane size={24} class="text-gray-400" />
			</div>
			<h3 class="text-sm font-medium text-gray-900">No flights added</h3>
			<p class="mt-1 text-xs text-gray-500">
				Click "Add Flight" to select from confirmed bookings.
			</p>
		</div>
	{:else}
		<!-- Selected Flights List -->
		<div class="grid gap-4">
			{#each pkgState.flightList as flight, i}
				{@const totalSectors =
					flight.pnrGroups?.reduce((acc, g) => acc + (g.sectors?.length || 0), 0) || 0}
				{@const firstSector = flight.pnrGroups?.[0]?.sectors?.[0]}
				<div
					class="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md"
				>
					<div class="flex items-center justify-between px-5 py-4">
						<div class="flex items-center gap-4">
							<div
								class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-[#972395]"
							>
								<Plane size={18} />
							</div>
							<div>
								<h4 class="text-sm font-semibold text-gray-900">{flight.name}</h4>
								<div class="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
									<span>{totalSectors} Sector{totalSectors !== 1 ? 's' : ''}</span>
									{#if firstSector}
										<span class="text-gray-300">•</span>
										<span class="flex items-center gap-1">
											<MapPin size={10} />
											{firstSector.fromCity || firstSector.origin} → {firstSector.toCity ||
												firstSector.destination}
										</span>
									{/if}
								</div>
							</div>
						</div>
						<div class="flex items-center gap-2">
							<button
								class="flex items-center gap-1 rounded-lg bg-purple-50 px-3 py-1.5 text-xs font-medium text-[#972395] transition-colors hover:bg-purple-100"
								onclick={() => viewFlightDetail(flight)}
							>
								<Eye size={12} />
								Detail
							</button>
							<button
								class="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
								onclick={() => removeFlight(i)}
							>
								<Trash2 size={16} />
							</button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</section>

<!-- Flight Picker Modal -->
{#if showPickerModal}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
		transition:fade={{ duration: 200 }}
		onclick={() => (showPickerModal = false)}
		role="dialog"
		aria-modal="true"
	>
		<div
			class="flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
			transition:fly={{ y: 20, duration: 250 }}
			onclick={(e) => e.stopPropagation()}
			role="document"
		>
			<!-- Header -->
			<div class="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
				<div>
					<h2 class="text-lg font-bold text-gray-900">Select Flight</h2>
					<p class="text-sm text-gray-500">Choose from confirmed bookings</p>
				</div>
				<button
					class="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
					onclick={() => (showPickerModal = false)}
				>
					<X size={20} />
				</button>
			</div>

			<!-- Search -->
			<div class="border-b border-gray-100 px-6 py-3">
				<div class="relative">
					<Search size={16} class="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
					<input
						type="text"
						placeholder="Search by name, PNR, or flight number..."
						class="w-full rounded-lg border border-gray-200 py-2.5 pr-4 pl-10 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
						bind:value={searchQuery}
					/>
				</div>
			</div>

			<!-- Flight List -->
			<div class="min-h-0 flex-1 overflow-y-auto p-4">
				{#if filteredFlights.length === 0}
					<div class="flex flex-col items-center justify-center py-12 text-center text-gray-400">
						<Plane size={40} strokeWidth={1} />
						<p class="mt-3 text-sm">No confirmed flights found</p>
					</div>
				{:else}
					<div class="space-y-2">
						{#each filteredFlights as booking}
							{@const totalSectors =
								booking.pnrGroups?.reduce((acc, g) => acc + (g.sectors?.length || 0), 0) || 0}
							{@const firstSector = booking.pnrGroups?.[0]?.sectors?.[0]}
							{@const isAlreadyAdded = pkgState.flightList.some((f) => f.storageId === booking.id)}
							<button
								class="flex w-full items-center gap-4 rounded-xl border border-gray-200 p-4 text-left transition-all hover:border-[#972395] hover:bg-purple-50/30 disabled:cursor-not-allowed disabled:opacity-50"
								onclick={() => selectFlight(booking)}
								disabled={isAlreadyAdded}
							>
								<div
									class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-[#972395]"
								>
									<Plane size={18} />
								</div>
								<div class="flex-1">
									<h4 class="text-sm font-semibold text-gray-900">{booking.travelAgent}</h4>
									<div class="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
										<span>{totalSectors} Sector{totalSectors !== 1 ? 's' : ''}</span>
										{#if firstSector}
											<span class="text-gray-300">•</span>
											<span>{firstSector.fromCity} → {firstSector.toCity}</span>
											{#if firstSector.departureDate}
												<span class="text-gray-300">•</span>
												<span class="flex items-center gap-1">
													<Calendar size={10} />
													{formatDate(firstSector.departureDate)}
												</span>
											{/if}
										{/if}
									</div>
								</div>
								{#if isAlreadyAdded}
									<span
										class="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-[10px] font-medium text-green-700"
									>
										<Check size={10} />
										Added
									</span>
								{/if}
							</button>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<!-- Flight Detail Modal -->
{#if showDetailModal && viewingFlight}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
		transition:fade={{ duration: 200 }}
		onclick={() => (showDetailModal = false)}
		role="dialog"
		aria-modal="true"
	>
		<div
			class="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
			transition:fly={{ y: 20, duration: 250 }}
			onclick={(e) => e.stopPropagation()}
			role="document"
		>
			<!-- Header -->
			<div
				class="flex shrink-0 items-center justify-between border-b border-gray-100 bg-gradient-to-r from-[#972395] to-[#7a1c78] px-6 py-5"
			>
				<div>
					<h2 class="text-lg font-bold text-white">{viewingFlight.name}</h2>
					<p class="text-sm text-purple-200">Flight Details</p>
				</div>
				<button
					class="rounded-lg p-2 text-white/70 hover:bg-white/20 hover:text-white"
					onclick={() => (showDetailModal = false)}
				>
					<X size={20} />
				</button>
			</div>

			<!-- Content -->
			<div class="min-h-0 flex-1 overflow-y-auto p-6">
				{#each viewingFlight.pnrGroups || [] as pnrGroup, gIdx}
					<div class="mb-6 rounded-xl border border-gray-200 bg-gray-50/50 p-4">
						<!-- PNR Group Header -->
						<div class="mb-3 flex items-center justify-between border-b border-gray-200 pb-2">
							<div class="flex items-center gap-2">
								<span
									class="flex h-6 w-6 items-center justify-center rounded-full bg-[#972395] text-xs font-bold text-white"
									>{gIdx + 1}</span
								>
								<span class="text-sm font-semibold text-gray-900"
									>{getAirlineName(pnrGroup.airline)}</span
								>
								{#if pnrGroup.pnr}
									<span class="text-xs text-gray-500">PNR: {pnrGroup.pnr}</span>
								{:else}
									<span class="rounded bg-orange-100 px-1.5 py-0.5 text-[10px] text-orange-700"
										>Pending</span
									>
								{/if}
							</div>
						</div>

						<!-- Sectors -->
						<div class="space-y-2">
							{#each pnrGroup.sectors || [] as sector, sIdx}
								<div class="rounded-lg border border-gray-200 bg-white p-3">
									<div class="flex items-center gap-4">
										<span
											class="flex h-5 w-5 items-center justify-center rounded-full bg-purple-100 text-[10px] font-bold text-[#972395]"
											>{sIdx + 1}</span
										>
										<div class="flex-1">
											<div class="flex items-center gap-2 text-sm font-medium text-gray-900">
												{#if sector.type}
													<span
														class="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-700 uppercase"
														>{sector.type}</span
													>
												{/if}
												<span>{sector.fromCity || sector.origin}</span>
												<span class="text-gray-400">→</span>
												<span>{sector.toCity || sector.destination}</span>
												{#if sector.carrier && sector.carrierNo}
													<span class="text-xs text-gray-500"
														>({sector.carrier}{sector.carrierNo})</span
													>
												{/if}
											</div>
											<div class="mt-1 flex items-center gap-3 text-xs text-gray-500">
												{#if sector.departureDate}
													<span class="flex items-center gap-1">
														<Calendar size={10} />
														{formatDate(sector.departureDate)}
													</span>
												{/if}
												{#if sector.departureTime}
													<span class="flex items-center gap-1">
														<Clock size={10} />
														Dep: {formatTime(sector.departureTime)}
													</span>
												{/if}
												{#if sector.arrivalTime}
													<span class="flex items-center gap-1">
														<Clock size={10} />
														Arr: {formatTime(sector.arrivalTime)}
													</span>
												{/if}
											</div>
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/each}

				{#if viewingFlight.notes}
					<div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
						<h4 class="mb-1 text-xs font-semibold text-gray-700">Notes</h4>
						<p class="text-sm text-gray-600">{viewingFlight.notes}</p>
					</div>
				{/if}
			</div>

			<!-- Footer -->
			<div class="flex shrink-0 items-center justify-end border-t border-gray-100 px-6 py-4">
				<button
					class="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
					onclick={() => (showDetailModal = false)}
				>
					Close
				</button>
			</div>
		</div>
	</div>
{/if}
