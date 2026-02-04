<script>
	import {
		Plus,
		Search,
		Filter,
		MoreHorizontal,
		FileText,
		User,
		Calendar,
		CreditCard,
		MapPin,
		Building2,
		Briefcase,
		ChevronDown
	} from 'lucide-svelte';
	import { slide } from 'svelte/transition';
	import BookingDrawer from './components/BookingDrawer.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { bookingStore } from '$lib/stores/bookingStore.svelte.js';

	let showDrawer = $state(false);
	let searchQuery = $state('');
	let selectedBooking = $state(null);
	let openDropdownId = $state(null);

	// Use store data
	let bookings = $derived(
		bookingStore.bookings.filter(
			(b) =>
				b.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
				b.ic.includes(searchQuery) ||
				b.packageName.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	function handleEdit(booking) {
		selectedBooking = booking;
		showDrawer = true;
	}

	function closeDrawer() {
		showDrawer = false;
		selectedBooking = null;
	}

	const STATUS_OPTIONS = ['Process', 'Pending', 'Paid', 'Cancelled'];

	function handleStatusChange(bookingId, newStatus) {
		bookingStore.updateBooking(bookingId, { status: newStatus });
	}
</script>

<div class="flex min-h-screen bg-gray-50 font-sans">
	<Sidebar activePage="/booking-management" />

	<main class="ml-[200px] min-h-screen flex-1 bg-gray-50/50">
		<div class="flex h-full flex-col p-6">
			<!-- Page Header -->
			<div class="mb-6 flex items-center justify-between">
				<div>
					<h1 class="text-2xl font-bold text-gray-900">Booking Management</h1>
					<p class="mt-1 text-sm text-gray-500">Manage customer bookings and registrations.</p>
				</div>
			</div>

			<!-- Filters & Search -->
			<div
				class="mb-6 flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-2 shadow-sm"
			>
				<div class="relative flex-1">
					<Search class="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" size={18} />
					<input
						type="text"
						placeholder="Search bookings by name, IC, or package..."
						class="w-full rounded-lg border-none bg-transparent py-2 pr-4 pl-10 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:ring-0"
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

			<!-- Booking List -->
			<div class="flex-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
				<div class="h-full overflow-auto">
					<table class="w-full text-left text-xs">
						<thead class="sticky top-0 z-10 border-b border-gray-100 bg-gray-50/50 shadow-sm">
							<tr>
								<th class="px-4 py-3 font-semibold whitespace-nowrap text-gray-900">Nama Jemaah</th>
								<th class="px-4 py-3 font-semibold whitespace-nowrap text-gray-900">No K/P</th>
								<th class="px-4 py-3 font-semibold whitespace-nowrap text-gray-900">Pakej</th>
								<th class="px-4 py-3 font-semibold whitespace-nowrap text-gray-900">Tarikh</th>
								<th class="px-4 py-3 font-semibold whitespace-nowrap text-gray-900"
									>Status Tempahan</th
								>
								<th
									class="sticky right-0 bg-gray-50 px-4 py-3 text-right font-semibold text-gray-900"
									>Actions</th
								>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-100">
							{#each bookings as booking}
								<tr class="group transition-colors hover:bg-gray-50/50">
									<td class="px-4 py-3">
										<div class="flex items-center gap-2">
											<div
												class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-100 text-[#972395]"
											>
												<User size={12} />
											</div>
											<span class="font-medium whitespace-nowrap text-gray-900"
												>{booking.applicantName}</span
											>
										</div>
									</td>
									<td class="px-4 py-3 font-mono whitespace-nowrap text-gray-600">{booking.ic}</td>
									<td class="max-w-[300px] min-w-[200px] px-4 py-3">
										<div
											class="flex items-center gap-1.5 truncate text-gray-600"
											title={booking.packageName}
										>
											<span class="truncate">{booking.packageName}</span>
										</div>
									</td>
									<td class="px-4 py-3 whitespace-nowrap text-gray-600">
										<div class="flex items-center gap-1.5">
											<Calendar size={12} class="text-gray-400" />
											{booking.date}
										</div>
									</td>
									<td class="relative px-4 py-3 whitespace-nowrap">
										<div class="relative">
											<button
												class={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium transition-all hover:bg-gray-100 ${
													booking.status === 'Paid'
														? 'bg-green-50 text-green-700'
														: booking.status === 'Pending'
															? 'bg-yellow-50 text-yellow-700'
															: booking.status === 'Process'
																? 'bg-blue-50 text-blue-700'
																: 'bg-gray-100 text-gray-600'
												}`}
												onclick={() =>
													(openDropdownId = openDropdownId === booking.id ? null : booking.id)}
											>
												<span
													class={`h-1.5 w-1.5 rounded-full ${
														booking.status === 'Paid'
															? 'bg-green-500'
															: booking.status === 'Pending'
																? 'bg-yellow-500'
																: booking.status === 'Process'
																	? 'bg-blue-500'
																	: 'bg-gray-500'
													}`}
												></span>
												{booking.status}
												<ChevronDown size={10} class="ml-0.5 opacity-50" />
											</button>

											{#if openDropdownId === booking.id}
												<!-- Backdrop to close when clicking outside -->
												<div
													class="fixed inset-0 z-10 cursor-default"
													onclick={() => (openDropdownId = null)}
												></div>

												<!-- Dropdown Menu -->
												<div
													class="absolute top-full left-0 z-20 mt-1 w-32 overflow-hidden rounded-lg border border-gray-100 bg-white p-1 shadow-lg ring-1 ring-black/5"
													transition:slide={{ duration: 150 }}
												>
													{#each STATUS_OPTIONS as status}
														<button
															class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[10px] font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
															onclick={() => {
																handleStatusChange(booking.id, status);
																openDropdownId = null;
															}}
														>
															<span
																class={`h-1.5 w-1.5 rounded-full ${
																	status === 'Paid'
																		? 'bg-green-500'
																		: status === 'Pending'
																			? 'bg-yellow-500'
																			: status === 'Process'
																				? 'bg-blue-500'
																				: 'bg-gray-500'
																}`}
															></span>
															{status}
														</button>
													{/each}
												</div>
											{/if}
										</div>
									</td>
									<td
										class="sticky right-0 w-[50px] bg-white px-4 py-3 text-right text-gray-900 group-hover:bg-gray-50/50"
									>
										<button
											class="rounded-lg p-1.5 text-gray-400 hover:bg-white hover:text-[#972395] hover:shadow-sm"
											onclick={() => handleEdit(booking)}
										>
											<MoreHorizontal size={16} />
										</button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</main>
</div>

<BookingDrawer {showDrawer} {closeDrawer} existingData={selectedBooking} />
