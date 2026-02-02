<script>
	import {
		FolderClosed,
		ChevronRight,
		ChevronDown,
		Package,
		Plane,
		Building2,
		Plus,
		Search,
		Filter,
		Eye,
		Edit,
		Trash2,
		X,
		Save,
		ArrowLeft,
		Star,
		Check,
		ChevronsUpDown,
		Info,
		Contact
	} from 'lucide-svelte';
	import { fade, slide } from 'svelte/transition';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { hotelStore } from '$lib/stores/hotelStore.svelte.js';

	// --- Configurable Lists Data ---
	let roomTypes = $derived(hotelStore.roomTypes);
	let basisTypes = $derived(hotelStore.basisTypes);
	let foodTypes = $derived(hotelStore.foodTypes);
	let hotelViews = $derived(hotelStore.hotelViews);

	// --- Form State ---
	let formData = $state({
		// General Information
		name: '',
		shortName: '',
		country: '',
		state: '',
		city: '',
		district: '',

		// Selected items (stored as full objects)
		roomTypes: [],
		basis: [],
		foodTypes: [],
		hotelViews: [],

		distanceFromCity: '',

		// Information Hotel
		email: '',
		phoneNumber: '',
		fax: '',
		openingBalance: '',
		type: 'credit', // credit or debit
		address: '',
		starRating: 0,
		isAllotment: false,

		// CP Hotel
		cpName: '',
		cpDesignation: '',
		cpPhone: '',
		cpMobile: '',
		cpEmail: '',
		cpFax: ''
	});

	// --- UI State for Dropdowns ---
	let activeDropdown = $state(null); // 'room', 'basis', 'food', 'view'

	// --- New Item Inputs ---
	let newRoomType = $state({ name: '', capacity: '' });
	let newFoodType = $state('');
	let newHotelView = $state('');

	// --- Actions ---

	function toggleDropdown(name) {
		activeDropdown = activeDropdown === name ? null : name;
	}

	function closeDropdown() {
		activeDropdown = null;
	}

	// Generic Selection Toggle
	function toggleSelection(listName, item) {
		const list = formData[listName];
		const exists = list.find((i) => i.id === item.id);

		if (exists) {
			formData[listName] = list.filter((i) => i.id !== item.id);
		} else {
			formData[listName] = [...list, item];
		}
	}

	// Remove tag
	function removeTag(listName, itemId) {
		formData[listName] = formData[listName].filter((i) => i.id !== itemId);
	}

	// Add New Room Type
	function addRoomType() {
		if (!newRoomType.name || !newRoomType.capacity) return;

		const newItem = {
			id: Date.now().toString(),
			name: newRoomType.name,
			capacity: parseInt(newRoomType.capacity)
		};

		hotelStore.addRoomType(newItem);
		formData.roomTypes = [...formData.roomTypes, newItem]; // Auto select
		newRoomType = { name: '', capacity: '' }; // Reset
	}

	// Add New Food Type
	function addFoodType() {
		if (!newFoodType) return;

		const newItem = {
			id: Date.now().toString(),
			name: newFoodType
		};

		hotelStore.addFoodType(newItem);
		formData.foodTypes = [...formData.foodTypes, newItem]; // Auto select
		newFoodType = ''; // Reset
	}

	// Add New Hotel View
	function addHotelView() {
		if (!newHotelView) return;

		const newItem = {
			id: Date.now().toString(),
			name: newHotelView
		};

		hotelStore.addHotelView(newItem);
		formData.hotelViews = [...formData.hotelViews, newItem]; // Auto select
		newHotelView = ''; // Reset
	}

	// Edit Hotel
	function loadHotel(hotel) {
		formData = {
			...hotel,
			roomTypes: hotel.roomTypes || [],
			basis: hotel.basis || [],
			foodTypes: hotel.foodTypes || [],
			hotelViews: hotel.hotelViews || []
		};
		showForm = true;
	}

	// Hotel List
	let hotels = $derived((hotelStore.hotels || []).filter((h) => h));

	// --- Suppliers Data (Mock) ---
	let suppliers = $state([
		{ id: 1, name: 'Hotel Provider A' },
		{ id: 2, name: 'Hotel Provider B' },
		{ id: 3, name: 'Direct Booking' }
	]);

	let showForm = $state(false);
	let activeTab = $state('general');

	// Click outside to close dropdowns
	function handleClickOutside(event) {
		const dropdowns = document.querySelectorAll('.dropdown-container');
		let clickedInside = false;
		dropdowns.forEach((d) => {
			if (d.contains(event.target)) clickedInside = true;
		});

		if (!clickedInside) closeDropdown();
	}
</script>

<svelte:window onclick={handleClickOutside} />

<svelte:head>
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="flex min-h-screen bg-gray-50 font-sans">
	<!-- Sidebar -->
	<Sidebar activePage="hotels" />

	<!-- Main Content -->
	<main class="ml-[200px] min-h-screen flex-1 bg-gray-50/50">
		<div class="p-6">
			{#if showForm}
				<!-- Add/Edit Hotel Form -->
				<div class="mb-6 flex items-start justify-between">
					<div class="flex items-start gap-3">
						<button
							class="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-all hover:border-[#972395] hover:bg-gray-50 hover:text-[#972395]"
							onclick={() => (showForm = false)}
						>
							<ArrowLeft size={18} />
						</button>
						<div>
							<h1 class="mb-1 text-2xl font-semibold text-gray-900">Add New Hotel</h1>
							<p class="text-sm text-gray-500">Fill in hotel information</p>
						</div>
					</div>
					<div class="flex gap-3">
						<button
							class="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
							onclick={() => (showForm = false)}
						>
							Cancel
						</button>
						<button
							class="flex items-center gap-2 rounded-lg bg-[#972395] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#7a1c78]"
						>
							<Save size={18} />
							Save Hotel
						</button>
					</div>
				</div>

				<!-- Tabs -->
				<!-- Tabs -->
				<div class="mb-6 rounded-xl bg-gray-100 p-1">
					<div class="flex">
						<button
							class="flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all duration-200 {activeTab ===
							'general'
								? 'bg-white text-[#972395] shadow-sm ring-1 ring-gray-200'
								: 'text-gray-500 hover:bg-gray-200/50 hover:text-gray-900'}"
							onclick={() => (activeTab = 'general')}
						>
							<Info size={16} />
							General Information
						</button>
						<button
							class="flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all duration-200 {activeTab ===
							'info'
								? 'bg-white text-[#972395] shadow-sm ring-1 ring-gray-200'
								: 'text-gray-500 hover:bg-gray-200/50 hover:text-gray-900'}"
							onclick={() => (activeTab = 'info')}
						>
							<Building2 size={16} />
							Information Hotel
						</button>
						<button
							class="flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all duration-200 {activeTab ===
							'cp'
								? 'bg-white text-[#972395] shadow-sm ring-1 ring-gray-200'
								: 'text-gray-500 hover:bg-gray-200/50 hover:text-gray-900'}"
							onclick={() => (activeTab = 'cp')}
						>
							<Contact size={16} />
							CP Hotel
						</button>
					</div>
				</div>

				<div class="flex flex-col gap-6">
					{#if activeTab === 'general'}
						<!-- General Information Hotel -->
						<div class="rounded-xl border border-gray-200 bg-white p-6">
							<h2 class="mb-5 text-base font-semibold text-gray-900">General Information Hotel</h2>
							<div class="grid grid-cols-2 gap-5">
								<div class="flex flex-col gap-1.5">
									<label for="name" class="text-[13px] font-medium text-gray-700"
										>Name <span class="text-red-500">*</span></label
									>
									<input
										type="text"
										id="name"
										placeholder="Enter hotel name"
										class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={formData.name}
									/>
								</div>
								<div class="flex flex-col gap-1.5">
									<label for="shortName" class="text-[13px] font-medium text-gray-700"
										>Short Name</label
									>
									<input
										type="text"
										id="shortName"
										placeholder="Enter short name"
										class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={formData.shortName}
									/>
								</div>
								<div class="flex flex-col gap-1.5">
									<label for="country" class="text-[13px] font-medium text-gray-700"
										>Country <span class="text-red-500">*</span></label
									>
									<select
										id="country"
										class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={formData.country}
									>
										<option value="">Select country</option>
										<option value="saudi-arabia">Saudi Arabia</option>
										<option value="other">Other</option>
									</select>
								</div>
								<div class="flex flex-col gap-1.5">
									<label for="state" class="text-[13px] font-medium text-gray-700">State</label>
									<input
										type="text"
										id="state"
										placeholder="Enter state"
										class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={formData.state}
									/>
								</div>
								<div class="flex flex-col gap-1.5">
									<label for="city" class="text-[13px] font-medium text-gray-700"
										>City <span class="text-red-500">*</span></label
									>
									<input
										type="text"
										id="city"
										placeholder="Enter city"
										class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={formData.city}
									/>
								</div>
								<div class="flex flex-col gap-1.5">
									<label for="district" class="text-[13px] font-medium text-gray-700"
										>District</label
									>
									<input
										type="text"
										id="district"
										placeholder="Enter district"
										class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={formData.district}
									/>
								</div>

								<!-- Interactive Lists Section -->
								<div class="col-span-2 grid grid-cols-2 gap-5">
									<!-- Room Type -->
									<div class="dropdown-container relative flex flex-col gap-1.5">
										<label class="text-[13px] font-medium text-gray-700">Room Type</label>

										<!-- Selected Tags -->
										<div class="mb-1 flex flex-wrap gap-2">
											{#each formData.roomTypes as item}
												<div
													class="inline-flex items-center gap-1 rounded-full border border-[#972395] bg-[#972395]/5 px-2.5 py-0.5 text-xs font-medium text-[#972395]"
												>
													<span>{item.name} | {item.capacity}</span>
													<button
														onclick={() => removeTag('roomTypes', item.id)}
														class="hover:text-red-500"><X size={12} /></button
													>
												</div>
											{/each}
										</div>

										<button
											class="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
											onclick={(e) => {
												e.stopPropagation();
												toggleDropdown('room');
											}}
										>
											<span class="text-gray-500">Select room types...</span>
											<ChevronsUpDown size={16} class="text-gray-400" />
										</button>

										{#if activeDropdown === 'room'}
											<div
												transition:slide={{ duration: 200 }}
												class="absolute top-full left-0 z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white p-2 shadow-lg"
											>
												<!-- Add New -->
												<div class="mb-2 flex gap-2 border-b border-gray-100 pb-2">
													<input
														type="text"
														placeholder="Type name"
														class="flex-1 rounded border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-[#972395]"
														bind:value={newRoomType.name}
													/>
													<input
														type="number"
														placeholder="Cap"
														class="w-14 rounded border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-[#972395]"
														bind:value={newRoomType.capacity}
													/>
													<button
														class="rounded bg-[#972395] px-2 py-1 text-xs font-medium text-white hover:bg-[#7a1c78]"
														onclick={(e) => {
															e.stopPropagation();
															addRoomType();
														}}
													>
														Add
													</button>
												</div>
												<!-- List -->
												<div class="flex max-h-40 flex-col gap-1 overflow-y-auto">
													{#each roomTypes as type}
														<button
															class="flex items-center justify-between rounded px-2 py-1.5 text-left text-sm hover:bg-gray-50 {formData.roomTypes.find(
																(i) => i.id === type.id
															)
																? 'bg-[#972395]/5 font-medium text-[#972395]'
																: 'text-gray-700'}"
															onclick={(e) => {
																e.stopPropagation();
																toggleSelection('roomTypes', type);
															}}
														>
															<span>{type.name} | {type.capacity}</span>
															{#if formData.roomTypes.find((i) => i.id === type.id)}
																<Check size={14} />
															{/if}
														</button>
													{/each}
												</div>
											</div>
										{/if}
									</div>

									<!-- Basis (No Inline Add) -->
									<div class="dropdown-container relative flex flex-col gap-1.5">
										<label class="text-[13px] font-medium text-gray-700">Basis</label>

										<div class="mb-1 flex flex-wrap gap-2">
											{#each formData.basis as item}
												<div
													class="inline-flex items-center gap-1 rounded-full border border-[#972395] bg-[#972395]/5 px-2.5 py-0.5 text-xs font-medium text-[#972395]"
												>
													<span>{item.name}</span>
													<button
														onclick={() => removeTag('basis', item.id)}
														class="hover:text-red-500"><X size={12} /></button
													>
												</div>
											{/each}
										</div>

										<button
											class="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
											onclick={(e) => {
												e.stopPropagation();
												toggleDropdown('basis');
											}}
										>
											<span class="text-gray-500">Select basis...</span>
											<ChevronsUpDown size={16} class="text-gray-400" />
										</button>

										{#if activeDropdown === 'basis'}
											<div
												transition:slide={{ duration: 200 }}
												class="absolute top-full left-0 z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white p-2 shadow-lg"
											>
												<div class="flex max-h-40 flex-col gap-1 overflow-y-auto">
													{#each basisTypes as type}
														<button
															class="flex items-center justify-between rounded px-2 py-1.5 text-left text-sm hover:bg-gray-50 {formData.basis.find(
																(i) => i.id === type.id
															)
																? 'bg-[#972395]/5 font-medium text-[#972395]'
																: 'text-gray-700'}"
															onclick={(e) => {
																e.stopPropagation();
																toggleSelection('basis', type);
															}}
														>
															<span>{type.name}</span>
															{#if formData.basis.find((i) => i.id === type.id)}
																<Check size={14} />
															{/if}
														</button>
													{/each}
												</div>
											</div>
										{/if}
									</div>

									<!-- Food Type -->
									<div class="dropdown-container relative flex flex-col gap-1.5">
										<label class="text-[13px] font-medium text-gray-700">Food Type</label>

										<div class="mb-1 flex flex-wrap gap-2">
											{#each formData.foodTypes as item}
												<div
													class="inline-flex items-center gap-1 rounded-full border border-[#972395] bg-[#972395]/5 px-2.5 py-0.5 text-xs font-medium text-[#972395]"
												>
													<span>{item.name}</span>
													<button
														onclick={() => removeTag('foodTypes', item.id)}
														class="hover:text-red-500"><X size={12} /></button
													>
												</div>
											{/each}
										</div>

										<button
											class="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
											onclick={(e) => {
												e.stopPropagation();
												toggleDropdown('food');
											}}
										>
											<span class="text-gray-500">Select food types...</span>
											<ChevronsUpDown size={16} class="text-gray-400" />
										</button>

										{#if activeDropdown === 'food'}
											<div
												transition:slide={{ duration: 200 }}
												class="absolute top-full left-0 z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white p-2 shadow-lg"
											>
												<div class="mb-2 flex gap-2 border-b border-gray-100 pb-2">
													<input
														type="text"
														placeholder="Type name"
														class="flex-1 rounded border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-[#972395]"
														bind:value={newFoodType}
													/>
													<button
														class="rounded bg-[#972395] px-2 py-1 text-xs font-medium text-white hover:bg-[#7a1c78]"
														onclick={(e) => {
															e.stopPropagation();
															addFoodType();
														}}
													>
														Add
													</button>
												</div>
												<div class="flex max-h-40 flex-col gap-1 overflow-y-auto">
													{#each foodTypes as type}
														<button
															class="flex items-center justify-between rounded px-2 py-1.5 text-left text-sm hover:bg-gray-50 {formData.foodTypes.find(
																(i) => i.id === type.id
															)
																? 'bg-[#972395]/5 font-medium text-[#972395]'
																: 'text-gray-700'}"
															onclick={(e) => {
																e.stopPropagation();
																toggleSelection('foodTypes', type);
															}}
														>
															<span>{type.name}</span>
															{#if formData.foodTypes.find((i) => i.id === type.id)}
																<Check size={14} />
															{/if}
														</button>
													{/each}
												</div>
											</div>
										{/if}
									</div>

									<!-- Hotel View -->
									<div class="dropdown-container relative flex flex-col gap-1.5">
										<label class="text-[13px] font-medium text-gray-700">Hotel View</label>

										<div class="mb-1 flex flex-wrap gap-2">
											{#each formData.hotelViews as item}
												<div
													class="inline-flex items-center gap-1 rounded-full border border-[#972395] bg-[#972395]/5 px-2.5 py-0.5 text-xs font-medium text-[#972395]"
												>
													<span>{item.name}</span>
													<button
														onclick={() => removeTag('hotelViews', item.id)}
														class="hover:text-red-500"><X size={12} /></button
													>
												</div>
											{/each}
										</div>

										<button
											class="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
											onclick={(e) => {
												e.stopPropagation();
												toggleDropdown('view');
											}}
										>
											<span class="text-gray-500">Select hotel views...</span>
											<ChevronsUpDown size={16} class="text-gray-400" />
										</button>

										{#if activeDropdown === 'view'}
											<div
												transition:slide={{ duration: 200 }}
												class="absolute top-full left-0 z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white p-2 shadow-lg"
											>
												<div class="mb-2 flex gap-2 border-b border-gray-100 pb-2">
													<input
														type="text"
														placeholder="Type name"
														class="flex-1 rounded border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-[#972395]"
														bind:value={newHotelView}
													/>
													<button
														class="rounded bg-[#972395] px-2 py-1 text-xs font-medium text-white hover:bg-[#7a1c78]"
														onclick={(e) => {
															e.stopPropagation();
															addHotelView();
														}}
													>
														Add
													</button>
												</div>
												<div class="flex max-h-40 flex-col gap-1 overflow-y-auto">
													{#each hotelViews as type}
														<button
															class="flex items-center justify-between rounded px-2 py-1.5 text-left text-sm hover:bg-gray-50 {formData.hotelViews.find(
																(i) => i.id === type.id
															)
																? 'bg-[#972395]/5 font-medium text-[#972395]'
																: 'text-gray-700'}"
															onclick={(e) => {
																e.stopPropagation();
																toggleSelection('hotelViews', type);
															}}
														>
															<span>{type.name}</span>
															{#if formData.hotelViews.find((i) => i.id === type.id)}
																<Check size={14} />
															{/if}
														</button>
													{/each}
												</div>
											</div>
										{/if}
									</div>
								</div>

								<div class="flex flex-col gap-1.5">
									<label for="distance" class="text-[13px] font-medium text-gray-700"
										>Distance from City</label
									>
									<input
										type="text"
										id="distance"
										placeholder="e.g. 500m"
										class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={formData.distanceFromCity}
									/>
								</div>
							</div>
						</div>
					{/if}

					{#if activeTab === 'info'}
						<!-- Information Hotel -->
						<div class="rounded-xl border border-gray-200 bg-white p-6">
							<h2 class="mb-5 text-base font-semibold text-gray-900">Information Hotel</h2>
							<div class="grid grid-cols-2 gap-5">
								<div class="flex flex-col gap-1.5">
									<label for="email" class="text-[13px] font-medium text-gray-700">Email</label>
									<input
										type="email"
										id="email"
										placeholder="Enter email address"
										class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={formData.email}
									/>
								</div>
								<div class="flex flex-col gap-1.5">
									<label for="phone" class="text-[13px] font-medium text-gray-700"
										>Phone Number</label
									>
									<input
										type="tel"
										id="phone"
										placeholder="Enter phone number"
										class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={formData.phoneNumber}
									/>
								</div>
								<div class="flex flex-col gap-1.5">
									<label for="fax" class="text-[13px] font-medium text-gray-700">Fax</label>
									<input
										type="text"
										id="fax"
										placeholder="Enter fax number"
										class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={formData.fax}
									/>
								</div>
								<div class="flex flex-col gap-1.5">
									<label for="balance" class="text-[13px] font-medium text-gray-700"
										>Opening Balance</label
									>
									<div class="flex gap-2">
										<input
											type="number"
											id="balance"
											placeholder="0.00"
											class="flex-1 rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
											bind:value={formData.openingBalance}
										/>
										<select
											class="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
											bind:value={formData.type}
										>
											<option value="credit">Credit</option>
											<option value="debit">Debit</option>
										</select>
									</div>
								</div>
								<div class="col-span-2 flex flex-col gap-1.5">
									<label for="address" class="text-[13px] font-medium text-gray-700">Address</label>
									<textarea
										id="address"
										rows="2"
										placeholder="Enter full address"
										class="resize-y rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={formData.address}
									></textarea>
								</div>
								<div class="flex flex-col gap-1.5">
									<label class="text-[13px] font-medium text-gray-700">Class Star</label>
									<div class="flex gap-1">
										{#each [1, 2, 3, 4, 5] as star}
											<button
												class="transition-transform hover:scale-110"
												onclick={() => (formData.starRating = star)}
											>
												<Star
													size={24}
													class={star <= formData.starRating
														? 'fill-yellow-400 text-yellow-400'
														: 'text-gray-300'}
												/>
											</button>
										{/each}
									</div>
								</div>
								<div class="flex items-center gap-2 pt-6">
									<input
										type="checkbox"
										id="allotment"
										class="h-4 w-4 rounded border-gray-300 text-[#972395] focus:ring-[#972395]"
										bind:checked={formData.isAllotment}
									/>
									<label for="allotment" class="text-sm font-medium text-gray-700"
										>Is Allotment</label
									>
								</div>
							</div>
						</div>
					{/if}

					{#if activeTab === 'cp'}
						<!-- CP Hotel -->
						<div class="rounded-xl border border-gray-200 bg-white p-6">
							<h2 class="mb-5 text-base font-semibold text-gray-900">CP Hotel</h2>
							<div class="grid grid-cols-2 gap-5">
								<div class="flex flex-col gap-1.5">
									<label for="cpName" class="text-[13px] font-medium text-gray-700">Name</label>
									<input
										type="text"
										id="cpName"
										placeholder="Enter contact person name"
										class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={formData.cpName}
									/>
								</div>
								<div class="flex flex-col gap-1.5">
									<label for="designation" class="text-[13px] font-medium text-gray-700"
										>Designation</label
									>
									<input
										type="text"
										id="designation"
										placeholder="e.g. Manager"
										class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={formData.cpDesignation}
									/>
								</div>
								<div class="flex flex-col gap-1.5">
									<label for="cpPhone" class="text-[13px] font-medium text-gray-700"
										>Phone Number</label
									>
									<input
										type="tel"
										id="cpPhone"
										placeholder="Enter phone number"
										class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={formData.cpPhone}
									/>
								</div>
								<div class="flex flex-col gap-1.5">
									<label for="cpMobile" class="text-[13px] font-medium text-gray-700">Mobile</label>
									<input
										type="tel"
										id="cpMobile"
										placeholder="Enter mobile number"
										class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={formData.cpMobile}
									/>
								</div>
								<div class="flex flex-col gap-1.5">
									<label for="cpEmail" class="text-[13px] font-medium text-gray-700">Email</label>
									<input
										type="email"
										id="cpEmail"
										placeholder="Enter email"
										class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={formData.cpEmail}
									/>
								</div>
								<div class="flex flex-col gap-1.5">
									<label for="cpFax" class="text-[13px] font-medium text-gray-700">Fax</label>
									<input
										type="text"
										id="cpFax"
										placeholder="Enter fax"
										class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={formData.cpFax}
									/>
								</div>
							</div>
						</div>
					{/if}
				</div>
			{:else}
				<!-- Hotel List -->
				<div class="mb-6 flex items-start justify-between">
					<div class="flex flex-col gap-1">
						<h1 class="text-2xl font-semibold text-gray-900">Hotel Master Data</h1>
						<p class="text-sm text-gray-500">Manage hotel information</p>
					</div>
					<button
						class="flex items-center gap-2 rounded-lg bg-[#972395] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#7a1c78]"
						onclick={() => (showForm = true)}
					>
						<Plus size={18} />
						Add Hotel
					</button>
				</div>

				<!-- Search & Filter -->
				<div class="mb-6 flex items-center justify-between">
					<div
						class="flex w-80 items-center gap-2.5 rounded-lg border border-gray-200 bg-white px-4 py-2.5"
					>
						<Search size={18} class="text-gray-400" />
						<input
							type="text"
							placeholder="Search hotels..."
							class="flex-1 border-none bg-transparent text-sm outline-none placeholder:text-gray-400"
						/>
					</div>
					<button
						class="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
					>
						<Filter size={16} />
						Filter
					</button>
				</div>

				<!-- Hotel Table -->
				<div class="overflow-hidden rounded-xl border border-gray-200 bg-white">
					<table class="w-full border-collapse">
						<thead>
							<tr>
								<th
									class="border-b border-gray-200 bg-gray-50 px-4 py-3.5 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase"
									>Name</th
								>
								<th
									class="border-b border-gray-200 bg-gray-50 px-4 py-3.5 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase"
									>Location</th
								>
								<th
									class="border-b border-gray-200 bg-gray-50 px-4 py-3.5 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase"
									>Rating</th
								>
								<th
									class="border-b border-gray-200 bg-gray-50 px-4 py-3.5 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase"
									>Status</th
								>
								<th
									class="border-b border-gray-200 bg-gray-50 px-4 py-3.5 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase"
									>Actions</th
								>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200">
							{#each hotels as hotel}
								<tr class="hover:bg-gray-50">
									<td class="px-4 py-3.5 text-sm font-medium whitespace-nowrap text-gray-900"
										>{hotel.name}</td
									>
									<td class="px-4 py-3.5 text-sm text-gray-700">{hotel.city}, {hotel.country}</td>
									<td class="px-4 py-3.5">
										<div class="flex items-center text-yellow-400">
											{#each Array(hotel.starRating) as _}
												<Star size={14} class="fill-current" />
											{/each}
										</div>
									</td>
									<td class="px-4 py-3.5">
										<span
											class="inline-block rounded-full px-2.5 py-1 text-xs font-medium {hotel.status ===
											'Active'
												? 'bg-green-100 text-green-800'
												: 'bg-red-100 text-red-800'}"
										>
											{hotel.status}
										</span>
									</td>
									<td class="px-4 py-3.5">
										<div class="flex items-center gap-1.5">
											<button
												class="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 transition-colors hover:border-[#972395] hover:text-[#972395]"
												><Eye size={16} /></button
											>
											<button
												class="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 transition-colors hover:border-[#972395] hover:text-[#972395]"
												onclick={() => loadHotel(hotel)}><Edit size={16} /></button
											>
											<button
												class="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 transition-colors hover:border-red-500 hover:text-red-500"
												><Trash2 size={16} /></button
											>
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	</main>
</div>
