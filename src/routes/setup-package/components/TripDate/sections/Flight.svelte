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
		ChevronUp,
		Save
	} from 'lucide-svelte';
	import { fly, fade, slide } from 'svelte/transition';
	import { flightStorageStore } from '$lib/stores/flightStorageStore.svelte.js';
	import { airlineStore } from '$lib/stores/airlineStore.svelte.js';
	import { createEmptySector as createEmptySectorUtil } from '../../../../storage/flight/flightUtils.js';

	/** @type {{ state: import('../packageState.svelte').PackageState }} */
	let { state: pkgState } = $props();

	// Modal state
	let showPickerModal = $state(false);
	let showDetailModal = $state(false);

	// Sync flight from activeTrip
	$effect(() => {
		if (pkgState.flightList.length === 0 && pkgState.activeTrip?.flightId) {
			const flightId = pkgState.activeTrip.flightId.toString();
			const storedFlight =
				flightStorageStore.confirmBookings.find((b) => b.id?.toString() === flightId) ||
				flightStorageStore.tentativeBookings.find((b) => b.id?.toString() === flightId);

			if (storedFlight) {
				const isConfirm = !!storedFlight.travelAgent; // Heuristic for confirm booking
				const flightData = {
					id: Date.now().toString(),
					storageId: storedFlight.id,
					name: isConfirm ? storedFlight.travelAgent : storedFlight.name,
					type: isConfirm ? 'confirm' : 'tentative',
					airline: storedFlight.airline || null,
					totalSeats: storedFlight.totalSeats || 0,
					pnrs: storedFlight.pnrs || [],
					sectors: storedFlight.sectors || [],
					pnrGroups: storedFlight.pnrGroups,
					notes: storedFlight.notes
				};
				// Use untracked to avoid infinite loops if we were reading flightList (though we check length === 0)
				pkgState.flightList = [flightData];
			}
		}
	});

	// NEW: Tentative Form state
	let showTentativeForm = $state(false);
	let tentativeFormData = $state({
		name: '',
		sectors: [createEmptySectorUtil()],
		notes: ''
	});

	let searchQuery = $state('');
	let viewingFlight = $state(null);
	let expandedSectors = $state(new Set());
	let bookingType = $state('confirm'); // 'confirm' | 'tentative'

	// Get flights filtered by search & booking type
	let filteredFlights = $derived.by(() => {
		const source =
			bookingType === 'confirm'
				? flightStorageStore.confirmBookings
				: flightStorageStore.tentativeBookings;

		return source.filter((b) => {
			const query = searchQuery.toLowerCase();
			if (bookingType === 'confirm') {
				return (
					b.travelAgent?.toLowerCase().includes(query) ||
					b.pnrGroups?.some(
						(g) =>
							g.pnr?.toLowerCase().includes(query) ||
							g.sectors?.some((s) => (s.carrier + s.carrierNo)?.toLowerCase().includes(query))
					) ||
					b.pnrs?.some((p) => p.pnr?.toLowerCase().includes(query))
				);
			} else {
				// Tentative filtering
				return (
					b.name?.toLowerCase().includes(query) ||
					b.sectors?.some((s) => (s.origin + s.destination)?.toLowerCase().includes(query))
				);
			}
		});
	});

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
		if (!code) return '';
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

	// NEW: Tentative Form Functions
	function openTentativeForm() {
		tentativeFormData = {
			name: '',
			sectors: [createEmptySectorUtil()],
			notes: ''
		};
		showTentativeForm = true;
	}

	function closeTentativeForm() {
		showTentativeForm = false;
	}

	function addTentativeSector() {
		tentativeFormData.sectors = [...tentativeFormData.sectors, createEmptySectorUtil()];
	}

	function removeTentativeSector(index) {
		if (tentativeFormData.sectors.length > 1) {
			tentativeFormData.sectors = tentativeFormData.sectors.filter((_, i) => i !== index);
		}
	}

	function saveTentativeFlight() {
		// Validate
		const validSectors = tentativeFormData.sectors.filter((s) => s.origin && s.destination);
		if (!tentativeFormData.name || validSectors.length === 0) {
			return; // Add validation UI if needed
		}

		const bookingData = {
			name: tentativeFormData.name,
			sectors: validSectors,
			notes: tentativeFormData.notes
		};

		// Save to storage
		const newBooking = flightStorageStore.addTentativeBooking(bookingData);

		// Auto-select and add to package
		selectFlight(newBooking); // selectFlight checks bookingType, so we need to ensure it handles the new object correctly.
		// Since we just added it as tentative, selectFlight might rely on bookingType state.
		// Let's make sure selectFlight handles it or we call a specific version.
		// Actually selectFlight uses `bookingType` state to layout the object.
		// We should ensure bookingType is 'tentative' OR override it.
		// Since we are in the tentative flow, bookingType IS 'tentative'.

		// Reset and close
		showTentativeForm = false;
		showPickerModal = false; // Close picker too as per "add directly" flow? usually yes.
	}

	// Select a flight from storage
	function selectFlight(booking) {
		// Add to package's flight list
		const flightData = {
			id: Date.now().toString(),
			storageId: booking.id, // Reference to original
			name: bookingType === 'confirm' ? booking.travelAgent : booking.name,
			type: bookingType, // Track where it came from
			// Fields common or specific
			airline: booking.airline || null,
			totalSeats: booking.totalSeats || 0,
			pnrs: booking.pnrs || [],
			sectors: booking.sectors || [],
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
			<p class="mt-0.5 text-xs text-gray-500">Select flights from confirm or tentative flights.</p>
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
			<p class="mt-1 text-xs text-gray-500">Click "Add Flight" to select from flights.</p>
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
								class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full {flight.type ===
								'tentative'
									? 'bg-orange-100 text-orange-600'
									: 'bg-purple-100 text-[#972395]'}"
							>
								<Plane size={18} />
							</div>
							<div>
								<div class="flex items-center gap-2">
									<h4 class="text-sm font-semibold text-gray-900">{flight.name}</h4>
									{#if flight.type === 'tentative'}
										<span class="rounded bg-orange-100 px-1.5 py-0.5 text-[10px] text-orange-700">
											Tentative
										</span>
									{:else if airlineCode}
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
					<p class="text-sm text-gray-500">Choose from available flights</p>
				</div>
				<button
					class="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
					onclick={() => (showPickerModal = false)}
				>
					<X size={20} />
				</button>
			</div>

			<!-- Booking Type Toggle -->
			<div class="border-b border-gray-100 px-6 py-3">
				<div class="flex rounded-lg bg-gray-100 p-1">
					<button
						class="flex-1 rounded-md py-1.5 text-sm font-medium transition-all {bookingType ===
						'confirm'
							? 'bg-white text-[#972395] shadow-sm'
							: 'text-gray-500 hover:text-gray-900'}"
						onclick={() => (bookingType = 'confirm')}
					>
						Confirm Flight
					</button>
					<button
						class="flex-1 rounded-md py-1.5 text-sm font-medium transition-all {bookingType ===
						'tentative'
							? 'bg-white text-[#972395] shadow-sm'
							: 'text-gray-500 hover:text-gray-900'}"
						onclick={() => (bookingType = 'tentative')}
					>
						Tentative Flight
					</button>
				</div>
			</div>

			<!-- Search & Add Direct -->
			<div class="flex items-center gap-3 border-b border-gray-100 px-6 py-3">
				<div class="relative flex-1">
					<Search size={16} class="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
					<input
						type="text"
						placeholder={bookingType === 'confirm'
							? 'Search by name, PNR, or flight number...'
							: 'Search by package name or sector...'}
						class="w-full rounded-lg border border-gray-200 py-2.5 pr-4 pl-10 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
						bind:value={searchQuery}
					/>
				</div>
				{#if bookingType === 'tentative'}
					<button
						class="flex shrink-0 items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-orange-600"
						onclick={openTentativeForm}
					>
						<Plus size={16} />
						Add Direct
					</button>
				{/if}
			</div>

			<!-- Flight List -->
			<div class="min-h-0 flex-1 overflow-y-auto p-4">
				{#if filteredFlights.length === 0}
					<div class="flex flex-col items-center justify-center py-12 text-center text-gray-400">
						<Plane size={40} strokeWidth={1} />
						<p class="mt-3 text-sm">No {bookingType} flights found</p>
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
									class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full {bookingType ===
									'tentative'
										? 'bg-orange-100 text-orange-600'
										: 'bg-purple-100 text-[#972395]'}"
								>
									<Plane size={18} />
								</div>
								<div class="flex-1">
									<div class="flex items-center gap-2">
										<h4 class="text-sm font-semibold text-gray-900">
											{bookingType === 'confirm' ? booking.travelAgent : booking.name}
										</h4>
										{#if bookingType === 'tentative'}
											<span class="rounded bg-orange-100 px-1.5 py-0.5 text-[10px] text-orange-700">
												Tentative
											</span>
										{:else if airlineCode}
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

<!-- NEW: Tentative Flight Form Modal (Nested) -->
{#if showTentativeForm}
	<div
		class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
		transition:fade={{ duration: 200 }}
		onclick={closeTentativeForm}
		role="dialog"
		aria-modal="true"
		onkeydown={(e) => e.key === 'Escape' && closeTentativeForm()}
	>
		<div
			class="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
			transition:fly={{ y: 20, duration: 250 }}
			onclick={(e) => e.stopPropagation()}
			role="document"
		>
			<!-- Header -->
			<div
				class="flex shrink-0 items-center justify-between border-b border-gray-100 bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4"
			>
				<div>
					<h2 class="text-xl font-bold text-white">Add Tentative Flight</h2>
					<p class="text-sm text-orange-100">Create new tentative flight directly</p>
				</div>
				<button
					class="rounded-lg p-2 text-white/70 hover:bg-white/20 hover:text-white"
					onclick={closeTentativeForm}
				>
					<X size={24} />
				</button>
			</div>

			<!-- Form Body -->
			<div class="min-h-0 flex-1 overflow-y-auto p-6">
				<div class="flex flex-col gap-5">
					<!-- Package Name -->
					<div class="flex flex-col gap-1.5">
						<label for="pName" class="text-[13px] font-medium text-gray-700">
							Package Name <span class="text-red-500">*</span>
						</label>
						<input
							type="text"
							id="pName"
							placeholder="Enter package name"
							class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
							bind:value={tentativeFormData.name}
						/>
					</div>

					<!-- Sectors -->
					<div class="flex flex-col gap-3">
						<span class="text-[13px] font-medium text-gray-700">Flight Sectors</span>

						{#each tentativeFormData.sectors as sector, sIdx}
							<div class="rounded-xl border border-orange-200 bg-orange-50/30 p-4">
								<!-- Sector Header -->
								<div class="mb-3 flex items-center justify-between">
									<div class="flex items-center gap-2">
										<span
											class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600"
											>{sIdx + 1}</span
										>
										<span class="text-sm font-medium text-orange-700">Sector {sIdx + 1}</span>
									</div>
									{#if tentativeFormData.sectors.length > 1}
										<button
											type="button"
											class="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
											onclick={() => removeTentativeSector(sIdx)}
										>
											<X size={14} />
										</button>
									{/if}
								</div>

								<!-- Origin & Destination -->
								<div class="mb-3 grid grid-cols-2 gap-3">
									<div class="flex flex-col gap-1">
										<label class="text-xs font-medium text-gray-500">Origin *</label>
										<select
											class="rounded-lg border border-gray-200 px-3 py-2 text-sm transition-shadow outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
											bind:value={tentativeFormData.sectors[sIdx].origin}
										>
											<option value="">Select</option>
											{#each airlineStore.airports as airport}
												<option value={airport.code}>{airport.city} ({airport.code})</option>
											{/each}
										</select>
									</div>
									<div class="flex flex-col gap-1">
										<label class="text-xs font-medium text-gray-500">Destination *</label>
										<select
											class="rounded-lg border border-gray-200 px-3 py-2 text-sm transition-shadow outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
											bind:value={tentativeFormData.sectors[sIdx].destination}
										>
											<option value="">Select</option>
											{#each airlineStore.airports as airport}
												<option value={airport.code}>{airport.city} ({airport.code})</option>
											{/each}
										</select>
									</div>
								</div>

								<!-- Date, Time, Seat -->
								<div class="grid grid-cols-3 gap-2">
									<div class="flex flex-col gap-1">
										<label class="text-xs font-medium text-gray-500">Date</label>
										<input
											type="date"
											class="rounded-lg border border-gray-200 px-2.5 py-2 text-sm transition-shadow outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
											bind:value={tentativeFormData.sectors[sIdx].departureDate}
										/>
									</div>
									<div class="flex flex-col gap-1">
										<label class="text-xs font-medium text-gray-500">Time</label>
										<input
											type="time"
											class="rounded-lg border border-gray-200 px-2.5 py-2 text-sm transition-shadow outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
											bind:value={tentativeFormData.sectors[sIdx].departureTime}
										/>
									</div>
									<div class="flex flex-col gap-1">
										<label class="text-xs font-medium text-gray-500">Seat</label>
										<input
											type="text"
											placeholder="45"
											class="rounded-lg border border-gray-200 px-2.5 py-2 text-sm transition-shadow outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
											bind:value={tentativeFormData.sectors[sIdx].seat}
										/>
									</div>
								</div>
							</div>
						{/each}

						<button
							type="button"
							class="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-orange-300 py-3 text-sm font-medium text-orange-600 transition-colors hover:bg-orange-50"
							onclick={addTentativeSector}
						>
							<Plus size={16} />
							Add Sector
						</button>
					</div>

					<!-- Notes -->
					<div class="flex flex-col gap-1.5">
						<label for="tNotes" class="text-[13px] font-medium text-gray-700">Notes / Remarks</label
						>
						<textarea
							id="tNotes"
							rows="2"
							placeholder="Optional notes..."
							class="resize-none rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
							bind:value={tentativeFormData.notes}
						></textarea>
					</div>
				</div>
			</div>

			<!-- Footer -->
			<div class="flex shrink-0 items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
				<button
					class="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
					onclick={closeTentativeForm}
				>
					Cancel
				</button>
				<button
					class="flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-orange-600 hover:shadow-md"
					onclick={saveTentativeFlight}
				>
					<Check size={16} />
					Save & Add
				</button>
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
