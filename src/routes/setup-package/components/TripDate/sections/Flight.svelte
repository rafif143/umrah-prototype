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
		Check,
		Users,
		ChevronDown,
		ChevronUp
	} from 'lucide-svelte';
	import { fly, fade, slide } from 'svelte/transition';
	import { flightStorageStore } from '$lib/stores/flightStorageStore.svelte.js';
	import { airlineStore } from '$lib/stores/airlineStore.svelte.js';

	/** @type {{ state: import('../packageState.svelte').PackageState }} */
	let { state: pkgState } = $props();

	// Modal state
	let showPickerModal = $state(false);
	let showDetailModal = $state(false);
	let searchQuery = $state('');
	let viewingFlight = $state(null);
	let expandedSectors = $state(new Set());

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
				) ||
				b.pnrs?.some((p) => p.pnr?.toLowerCase().includes(searchQuery.toLowerCase()))
		)
	);

	function toggleSector(index) {
		const newSet = new Set(expandedSectors);
		if (newSet.has(index)) {
			newSet.delete(index);
		} else {
			newSet.add(index);
		}
		expandedSectors = newSet;
	}

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
			// New fields
			airline: booking.airline,
			totalSeats: booking.totalSeats,
			pnrs: booking.pnrs,
			sectors: booking.sectors,
			// Fallback for old data compatibility
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
		// Prepare view data to handle both structures
		viewingFlight = {
			...flight,
			airline: flight.airline || flight.pnrGroups?.[0]?.airline,
			sectors: flight.sectors || flight.pnrGroups?.[0]?.sectors || [],
			pnrs:
				flight.pnrs ||
				flight.pnrGroups?.map((g) => ({ pnr: g.pnr, pnrPending: g.pnrPending })) ||
				[]
		};
		expandedSectors = new Set(); // Reset
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
				{@const sectors = flight.sectors || flight.pnrGroups?.flatMap((g) => g.sectors || []) || []}
				{@const firstSector = sectors[0]}
				{@const airlineCode = flight.airline || flight.pnrGroups?.[0]?.airline}

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
								<div class="flex items-center gap-2">
									<h4 class="text-sm font-semibold text-gray-900">{flight.name}</h4>
									{#if airlineCode}
										<span class="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
											{getAirlineName(airlineCode)}
										</span>
									{/if}
								</div>
								<div class="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
									<span>{sectors.length} Sector{sectors.length !== 1 ? 's' : ''}</span>
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
		role="button"
		tabindex="-1"
		onkeydown={(e) => e.key === 'Escape' && (showPickerModal = false)}
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
							{@const sectors =
								booking.sectors || booking.pnrGroups?.flatMap((g) => g.sectors || []) || []}
							{@const firstSector = sectors[0]}
							{@const isAlreadyAdded = pkgState.flightList.some((f) => f.storageId === booking.id)}
							{@const airlineCode = booking.airline || booking.pnrGroups?.[0]?.airline}

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
									<div class="flex items-center gap-2">
										<h4 class="text-sm font-semibold text-gray-900">{booking.travelAgent}</h4>
										{#if airlineCode}
											<span class="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
												{getAirlineName(airlineCode)}
											</span>
										{/if}
									</div>
									<div class="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
										<span>{sectors.length} Sector{sectors.length !== 1 ? 's' : ''}</span>
										{#if firstSector}
											<span class="text-gray-300">•</span>
											<span
												>{firstSector.fromCity || firstSector.origin} → {firstSector.toCity ||
													firstSector.destination}</span
											>
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
		role="button"
		tabindex="-1"
		onkeydown={(e) => e.key === 'Escape' && (showDetailModal = false)}
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
					<h2 class="max-w-md truncate text-lg font-bold text-white">{viewingFlight.name}</h2>
					<div class="mt-1 flex items-center gap-3 text-purple-100">
						<span
							class="flex items-center gap-1.5 rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium"
						>
							<Plane size={12} />
							{getAirlineName(viewingFlight.airline)}
						</span>
						{#if viewingFlight.totalSeats}
							<span
								class="flex items-center gap-1.5 rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium"
							>
								<Users size={12} />
								{viewingFlight.totalSeats} Seats
							</span>
						{/if}
					</div>
				</div>
				<button
					class="rounded-lg p-2 text-white/70 hover:bg-white/20 hover:text-white"
					onclick={() => (showDetailModal = false)}
				>
					<X size={20} />
				</button>
			</div>

			<!-- Content -->
			<div class="min-h-0 flex-1 overflow-y-auto bg-gray-50/50 p-6">
				<!-- PNRs -->
				{#if viewingFlight.pnrs?.length}
					<div class="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
						<div class="border-b border-gray-200 bg-gray-50 px-4 py-2">
							<h3 class="text-xs font-semibold tracking-wider text-gray-700 uppercase">
								PNR Details
							</h3>
						</div>
						<table class="w-full text-left text-xs">
							<thead class="bg-gray-50 text-gray-500">
								<tr>
									<th class="px-4 py-2 font-medium">PNR</th>
									<th class="px-4 py-2 font-medium">Class</th>
									<th class="px-4 py-2 font-medium">Group</th>
									<th class="px-4 py-2 font-medium">Flight No</th>
									<th class="px-4 py-2 text-center font-medium">Seats</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-gray-100">
								{#each viewingFlight.pnrs as pnr}
									<tr class="hover:bg-gray-50">
										<td class="px-4 py-2 font-medium text-gray-900">{pnr.pnr || '-'}</td>
										<td class="px-4 py-2 text-gray-600">{pnr.class || '-'}</td>
										<td class="px-4 py-2 text-gray-600">{pnr.name || '-'}</td>
										<td class="px-4 py-2 text-gray-600">{pnr.number || '-'}</td>
										<td class="px-4 py-2 text-center font-medium text-gray-900">{pnr.seats || 0}</td
										>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}

				<!-- Sectors -->
				<div class="space-y-3">
					{#each viewingFlight.sectors || [] as sector, sIdx}
						<div class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
							<button
								type="button"
								class="flex w-full cursor-pointer items-center justify-between border-0 bg-transparent p-4 text-left transition-colors hover:bg-gray-50/50"
								onclick={() => toggleSector(sIdx)}
							>
								<div class="flex flex-1 items-center gap-4">
									<div class="flex items-center gap-2">
										<span
											class="flex h-5 w-5 items-center justify-center rounded-full bg-purple-100 text-[10px] font-bold text-[#972395]"
										>
											{sIdx + 1}
										</span>
										{#if sector.type}
											<span
												class="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 uppercase"
											>
												{sector.type}
											</span>
										{/if}
									</div>

									<div class="flex flex-1 items-center gap-4">
										<div class="flex items-center gap-2">
											<span class="text-xs font-bold text-gray-900"
												>{sector.fromCity || sector.origin}</span
											>
											<Plane size={12} class="rotate-90 text-[#972395]" />
											<span class="text-xs font-bold text-gray-900"
												>{sector.toCity || sector.destination}</span
											>
										</div>
									</div>
								</div>

								<div class="flex items-center gap-3">
									{#if sector.carrier && sector.carrierNo}
										<span class="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
											{sector.carrier}
											{sector.carrierNo}
										</span>
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
									<div class="mt-3 mb-3 flex items-center gap-4">
										<div class="flex-1 text-center">
											<div class="text-base font-bold text-gray-900">
												{sector.fromCity || sector.origin}
											</div>
											{#if sector.departureHall}<div class="text-[10px] text-gray-500">
													{sector.departureHall}
												</div>{/if}
										</div>
										<div class="text-gray-300">→</div>
										<div class="flex-1 text-center">
											<div class="text-base font-bold text-gray-900">
												{sector.toCity || sector.destination}
											</div>
										</div>
									</div>

									<div
										class="mx-4 mb-3 grid grid-cols-3 gap-2 rounded bg-gray-50 p-2 text-xs text-gray-600"
									>
										{#if sector.departureDate}
											<div class="flex items-center gap-1.5">
												<Calendar size={12} class="text-gray-400" />
												{formatDate(sector.departureDate)}
											</div>
										{/if}
										{#if sector.departureTime}
											<div class="flex items-center gap-1.5">
												<Clock size={12} class="text-gray-400" />
												Dep: {formatTime(sector.departureTime)}
											</div>
										{/if}
										{#if sector.arrivalTime}
											<div class="flex items-center gap-1.5">
												<Clock size={12} class="text-gray-400" />
												Arr: {formatTime(sector.arrivalTime)}
											</div>
										{/if}
									</div>
								</div>
							{/if}
						</div>
					{/each}
				</div>

				<!-- Cost Breakdown (Booking Level) -->
				{#if viewingFlight.costs || viewingFlight.sectors?.[0]?.costs}
					{@const costs = viewingFlight.costs || viewingFlight.sectors?.[0]?.costs}
					<div class="mt-4 rounded-lg border border-gray-200 bg-white shadow-sm">
						<div class="border-b border-gray-100 bg-green-50/50 px-4 py-3">
							<h3 class="text-sm font-bold text-gray-900">Cost Breakdown</h3>
						</div>
						<div class="overflow-x-auto p-4">
							<table class="w-full min-w-[300px] text-left text-xs">
								<thead class="bg-gray-50 text-gray-500">
									<tr>
										<th class="px-3 py-2 font-medium">Type</th>
										<th class="px-2 py-2 text-center font-medium">Adult(C)</th>
										<th class="px-2 py-2 text-center font-medium">Adult(S)</th>
										<th class="px-2 py-2 text-center font-medium">Child(C)</th>
										<th class="px-2 py-2 text-center font-medium">Child(S)</th>
										<th class="px-2 py-2 text-center font-medium">Inf(C)</th>
										<th class="px-2 py-2 text-center font-medium">Inf(S)</th>
									</tr>
								</thead>
								<tbody class="divide-y divide-gray-100">
									{#each ['airfare', 'tax', 'ur'] as type}
										{#if costs[type]}
											<tr class="hover:bg-gray-50/50">
												<td class="px-3 py-2 font-medium text-gray-700 capitalize">{type}</td>
												<td class="px-2 py-2 text-center text-gray-600"
													>{costs[type].adultCost || 0}</td
												>
												<td class="px-2 py-2 text-center font-medium text-gray-900"
													>{costs[type].adultSell || 0}</td
												>
												<td class="px-2 py-2 text-center text-gray-600"
													>{costs[type].childCost || 0}</td
												>
												<td class="px-2 py-2 text-center font-medium text-gray-900"
													>{costs[type].childSell || 0}</td
												>
												<td class="px-2 py-2 text-center text-gray-600"
													>{costs[type].infantCost || 0}</td
												>
												<td class="px-2 py-2 text-center font-medium text-gray-900"
													>{costs[type].infantSell || 0}</td
												>
											</tr>
										{/if}
									{/each}
									{#if costs.total}
										<tr class="border-t border-gray-200 bg-gray-50 font-bold">
											<td class="px-3 py-2 text-gray-900">Total</td>
											<td class="px-2 py-2 text-center text-gray-900"
												>{costs.total.adultCost || 0}</td
											>
											<td class="px-2 py-2 text-center text-[#972395]"
												>{costs.total.adultSell || 0}</td
											>
											<td class="px-2 py-2 text-center text-gray-900"
												>{costs.total.childCost || 0}</td
											>
											<td class="px-2 py-2 text-center text-[#972395]"
												>{costs.total.childSell || 0}</td
											>
											<td class="px-2 py-2 text-center text-gray-900"
												>{costs.total.infantCost || 0}</td
											>
											<td class="px-2 py-2 text-center text-[#972395]"
												>{costs.total.infantSell || 0}</td
											>
										</tr>
									{/if}
								</tbody>
							</table>
						</div>
					</div>
				{/if}

				{#if viewingFlight.notes}
					<div class="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
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
