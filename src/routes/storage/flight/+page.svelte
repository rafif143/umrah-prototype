<script>
	import { Plus, Search, Filter, Plane } from 'lucide-svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { flightStorageStore } from '$lib/stores/flightStorageStore.svelte.js';

	// Import Confirm components
	import ConfirmTable from './ConfirmTable.svelte';
	import BookingFormModal from './BookingFormModal.svelte';
	import BookingDetailModal from './BookingDetailModal.svelte';

	// Import Tentative components
	import TentativeTable from './TentativeTable.svelte';
	import TentativeFormModal from './TentativeFormModal.svelte';
	import TentativeDetailModal from './TentativeDetailModal.svelte';
	import ComingSoonModal from './ComingSoonModal.svelte';

	// UI State
	let activeTab = $state('confirm');
	let searchQuery = $state('');

	// Coming Soon Modal State
	let showComingSoonModal = $state(false);

	// Confirm modal state
	let showConfirmFormModal = $state(false);
	let showConfirmDetailModal = $state(false);
	let editingConfirmBooking = $state(null);
	let viewingConfirmBooking = $state(null);

	// Tentative modal state
	let showTentativeFormModal = $state(false);
	let showTentativeDetailModal = $state(false);
	let editingTentativeBooking = $state(null);
	let viewingTentativeBooking = $state(null);

	// Derived data - Confirm
	let confirmBookings = $derived(
		flightStorageStore.confirmBookings.filter(
			(b) =>
				b.travelAgent?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				b.pnrGroups?.some(
					(g) =>
						g.pnr?.toLowerCase().includes(searchQuery.toLowerCase()) ||
						g.sectors?.some((s) =>
							s.flightNumber?.toLowerCase().includes(searchQuery.toLowerCase())
						)
				)
		)
	);

	// Derived data - Tentative
	let tentativeBookings = $derived(
		flightStorageStore.tentativeBookings.filter(
			(b) =>
				b.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				b.sectors?.some((s) => s.flightNumber?.toLowerCase().includes(searchQuery.toLowerCase()))
		)
	);

	// === CONFIRM HANDLERS ===
	function openConfirmFormModal(booking = null) {
		editingConfirmBooking = booking;
		showConfirmFormModal = true;
	}

	function closeConfirmFormModal() {
		showConfirmFormModal = false;
		editingConfirmBooking = null;
	}

	function openConfirmDetailModal(booking) {
		viewingConfirmBooking = booking;
		showConfirmDetailModal = true;
	}

	function closeConfirmDetailModal() {
		showConfirmDetailModal = false;
		viewingConfirmBooking = null;
	}

	function handleSaveConfirmBooking(bookingData, existingId) {
		if (existingId) {
			flightStorageStore.updateConfirmBooking(existingId, bookingData);
		} else {
			flightStorageStore.addConfirmBooking(bookingData);
		}
	}

	function handleDeleteConfirmBooking(id) {
		if (confirm('Are you sure you want to delete this booking?')) {
			flightStorageStore.deleteConfirmBooking(id);
		}
	}

	// === TENTATIVE HANDLERS ===
	function openTentativeFormModal(booking = null) {
		editingTentativeBooking = booking;
		showTentativeFormModal = true;
	}

	function closeTentativeFormModal() {
		showTentativeFormModal = false;
		editingTentativeBooking = null;
	}

	function openTentativeDetailModal(booking) {
		viewingTentativeBooking = booking;
		showTentativeDetailModal = true;
	}

	function closeTentativeDetailModal() {
		showTentativeDetailModal = false;
		viewingTentativeBooking = null;
	}

	function handleConvertTentative(booking) {
		showComingSoonModal = true;
	}

	function handleSaveTentativeBooking(bookingData, existingId) {
		if (existingId) {
			flightStorageStore.updateTentativeBooking(existingId, bookingData);
		} else {
			flightStorageStore.addTentativeBooking(bookingData);
		}
	}

	function handleDeleteTentativeBooking(id) {
		if (confirm('Are you sure you want to delete this tentative?')) {
			flightStorageStore.deleteTentativeBooking(id);
		}
	}
</script>

<div class="flex min-h-screen bg-gray-50 font-sans">
	<Sidebar activePage="/storage/flight" />

	<main class="ml-[230px] flex flex-1 flex-col overflow-hidden px-6 py-6">
		<!-- Header Section -->
		<div class="mb-4 flex items-center justify-between">
			<div class="flex items-center gap-3">
				<div
					class="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-[#972395]"
				>
					<Plane size={20} />
				</div>
				<div>
					<h1 class="text-xl font-bold text-gray-900">Flight Storage</h1>
					<p class="text-sm text-gray-500">Manage your flight bookings</p>
				</div>
			</div>

			<!-- Dynamic Add Button -->
			{#if activeTab === 'confirm'}
				<button
					class="flex items-center gap-2 rounded-lg bg-[#972395] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#7a1c78] hover:shadow-md"
					onclick={() => openConfirmFormModal()}
				>
					<Plus size={18} />
					Add Flight Confirm
				</button>
			{:else}
				<button
					class="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-orange-600 hover:shadow-md"
					onclick={() => openTentativeFormModal()}
				>
					<Plus size={18} />
					Add Tentative
				</button>
			{/if}
		</div>

		<!-- Tabs -->
		<div class="mb-4 flex w-fit items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">
			<button
				class="rounded-md px-4 py-2 text-sm font-medium transition-colors {activeTab === 'confirm'
					? 'bg-[#972395] text-white'
					: 'text-gray-600 hover:bg-gray-50'}"
				onclick={() => (activeTab = 'confirm')}
			>
				Confirm
			</button>
			<button
				class="rounded-md px-4 py-2 text-sm font-medium transition-colors {activeTab === 'tentative'
					? 'bg-orange-500 text-white'
					: 'text-gray-600 hover:bg-gray-50'}"
				onclick={() => (activeTab = 'tentative')}
			>
				Tentative
			</button>
		</div>

		<!-- Search & Filter -->
		<div class="mb-4 flex items-center gap-3">
			<div class="relative max-w-md flex-1">
				<Search size={16} class="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
				<input
					type="text"
					placeholder="Search by name or flight number..."
					class="w-full rounded-lg border border-gray-200 bg-white py-2.5 pr-4 pl-10 text-sm text-gray-900 transition-shadow outline-none focus:border-{activeTab ===
					'confirm'
						? '[#972395]'
						: 'orange-500'} focus:ring-1 focus:ring-{activeTab === 'confirm'
						? '[#972395]'
						: 'orange-500'}"
					bind:value={searchQuery}
				/>
			</div>
			<div class="h-6 w-px bg-gray-200"></div>
			<button
				class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
			>
				<Filter size={16} />
				Filters
			</button>
		</div>

		<!-- Content Area -->
		{#if activeTab === 'confirm'}
			<ConfirmTable
				bookings={confirmBookings}
				onView={openConfirmDetailModal}
				onEdit={openConfirmFormModal}
				onDelete={handleDeleteConfirmBooking}
			/>
		{:else}
			<TentativeTable
				bookings={tentativeBookings}
				onView={openTentativeDetailModal}
				onEdit={openTentativeFormModal}
				onDelete={handleDeleteTentativeBooking}
				onConvert={handleConvertTentative}
			/>
		{/if}
	</main>
</div>

<!-- Confirm Modals -->
<BookingFormModal
	show={showConfirmFormModal}
	booking={editingConfirmBooking}
	onClose={closeConfirmFormModal}
	onSave={handleSaveConfirmBooking}
/>

<BookingDetailModal
	show={showConfirmDetailModal}
	booking={viewingConfirmBooking}
	onClose={closeConfirmDetailModal}
	onEdit={openConfirmFormModal}
/>

<!-- Tentative Modals -->
<TentativeFormModal
	show={showTentativeFormModal}
	booking={editingTentativeBooking}
	onClose={closeTentativeFormModal}
	onSave={handleSaveTentativeBooking}
/>

<TentativeDetailModal
	show={showTentativeDetailModal}
	booking={viewingTentativeBooking}
	onClose={closeTentativeDetailModal}
	onEdit={openTentativeFormModal}
/>

<!-- Helper Modals -->
<ComingSoonModal show={showComingSoonModal} onClose={() => (showComingSoonModal = false)} />
