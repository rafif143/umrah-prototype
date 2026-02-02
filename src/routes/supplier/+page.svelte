<script>
	import {
		Plus,
		Search,
		Filter,
		Eye,
		Edit,
		Trash2,
		X,
		ArrowLeft,
		Save,
		MapPin,
		Package,
		Info
	} from 'lucide-svelte';
	import { fade, slide } from 'svelte/transition';
	import Sidebar from '$lib/components/Sidebar.svelte';

	// Supplying item types
	const supplyingItemTypes = ['Hotel', 'Food', 'Service', 'Transport'];

	// Form state
	let formData = $state({
		name: '',
		email: '',
		phoneNumber: '',
		fax: '',
		type: '',
		openingBalance: '',
		country: '',
		state: '',
		city: '',
		district: '',
		address: '',
		isAgent: false,
		isSupplier: true,
		agentType: '',
		supplyingItems: []
	});

	// Add supplying item
	function addSupplyingItem() {
		formData.supplyingItems = [...formData.supplyingItems, { itemType: '', itemName: '' }];
	}

	// Remove supplying item
	function removeSupplyingItem(index) {
		formData.supplyingItems = formData.supplyingItems.filter((_, i) => i !== index);
	}

	// Simulated supplier data
	const suppliers = [
		{
			id: 1,
			name: 'Al-Haram Hotels Group',
			email: 'contact@alharamhotels.com',
			phone: '+966 12 345 6789',
			type: 'Supplier',
			country: 'Saudi Arabia',
			city: 'Makkah',
			status: 'Active'
		},
		{
			id: 2,
			name: 'Zamzam Catering Services',
			email: 'info@zamzamcatering.com',
			phone: '+966 55 123 4567',
			type: 'Agent Supplier',
			country: 'Saudi Arabia',
			city: 'Makkah',
			status: 'Active'
		},
		{
			id: 3,
			name: 'VIP Transport Co.',
			email: 'bookings@viptransport.sa',
			phone: '+966 50 987 6543',
			type: 'Supplier',
			country: 'Saudi Arabia',
			city: 'Jeddah',
			status: 'Active'
		},
		{
			id: 4,
			name: 'Madinah Local Guides',
			email: 'tours@madinahguides.com',
			phone: '+966 54 555 1212',
			type: 'Agent Supplier',
			country: 'Saudi Arabia',
			city: 'Madinah',
			status: 'Pending'
		}
	];

	let showForm = $state(false);
	let activeTab = $state('basic');
</script>

<svelte:head>
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="flex min-h-screen bg-gray-50 font-sans">
	<!-- Sidebar -->
	<Sidebar activePage="supplier" />

	<!-- Main Content -->
	<main class="ml-[200px] min-h-screen flex-1 bg-gray-50/50">
		<div class="p-6">
			<div class="mb-6 flex items-start justify-between">
				<div class="flex flex-col gap-1">
					<h1 class="text-2xl font-semibold text-gray-900">Agent & Supplier</h1>
					<p class="text-sm text-gray-500">Manage your agents and suppliers</p>
				</div>
				<button
					class="flex items-center gap-2 rounded-lg bg-[#972395] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#7a1c78]"
					onclick={() => (showForm = true)}
				>
					<Plus size={18} />
					Add Agent / Supplier
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
						placeholder="Search suppliers..."
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

			<!-- Supplier Table -->
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
								>Email</th
							>
							<th
								class="border-b border-gray-200 bg-gray-50 px-4 py-3.5 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase"
								>Phone</th
							>
							<th
								class="border-b border-gray-200 bg-gray-50 px-4 py-3.5 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase"
								>Type</th
							>
							<th
								class="border-b border-gray-200 bg-gray-50 px-4 py-3.5 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase"
								>Location</th
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
						{#each suppliers as supplier}
							<tr class="hover:bg-gray-50">
								<td class="px-4 py-3.5 text-sm font-medium whitespace-nowrap text-gray-900"
									>{supplier.name}</td
								>
								<td class="px-4 py-3.5 text-sm text-gray-700">{supplier.email}</td>
								<td class="px-4 py-3.5 text-sm text-gray-700">{supplier.phone}</td>
								<td class="px-4 py-3.5"
									><span
										class="inline-block rounded-full bg-[#972395]/10 px-2.5 py-1 text-xs font-medium text-[#972395]"
										>{supplier.type}</span
									></td
								>
								<td class="px-4 py-3.5 text-sm text-gray-700"
									>{supplier.city}, {supplier.country}</td
								>
								<td class="px-4 py-3.5">
									<span
										class="inline-block rounded-full px-2.5 py-1 text-xs font-medium {supplier.status ===
										'Active'
											? 'bg-green-100 text-green-800'
											: 'bg-red-100 text-red-800'}"
									>
										{supplier.status}
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
											><Edit size={16} /></button
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
		</div>
	</main>

	{#if showForm}
		<!-- Modal Overlay -->
		<div
			class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
			role="dialog"
			aria-modal="true"
		>
			<div
				class="absolute inset-0 bg-black/50 backdrop-blur-sm"
				transition:fade={{ duration: 200 }}
				onclick={() => (showForm = false)}
			></div>

			<!-- Modal Content -->
			<div
				class="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
				transition:slide={{ axis: 'y', duration: 300 }}
			>
				<!-- Header -->
				<div class="flex items-center justify-between border-b border-gray-100 px-6 py-4">
					<div>
						<h2 class="text-lg font-semibold text-gray-900">Add Agent / Supplier</h2>
						<p class="text-xs text-gray-500">Enter agent or supplier details below</p>
					</div>
					<button
						class="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
						onclick={() => (showForm = false)}
					>
						<X size={20} />
					</button>
				</div>

				<!-- Tabs -->
				<div class="flex border-b border-gray-100 bg-gray-50/50 px-6 pt-2">
					<button
						class="group relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors {activeTab ===
						'basic'
							? 'text-[#972395]'
							: 'text-gray-500 hover:text-gray-700'}"
						onclick={() => (activeTab = 'basic')}
					>
						<Info size={16} />
						Basic Info
						{#if activeTab === 'basic'}
							<div
								class="absolute -bottom-[1px] left-0 h-0.5 w-full bg-[#972395]"
								transition:fade
							></div>
						{/if}
					</button>
					<button
						class="group relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors {activeTab ===
						'address'
							? 'text-[#972395]'
							: 'text-gray-500 hover:text-gray-700'}"
						onclick={() => (activeTab = 'address')}
					>
						<MapPin size={16} />
						Address
						{#if activeTab === 'address'}
							<div
								class="absolute -bottom-[1px] left-0 h-0.5 w-full bg-[#972395]"
								transition:fade
							></div>
						{/if}
					</button>
					{#if formData.isSupplier}
						<button
							class="group relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors {activeTab ===
							'items'
								? 'text-[#972395]'
								: 'text-gray-500 hover:text-gray-700'}"
							onclick={() => (activeTab = 'items')}
						>
							<Package size={16} />
							Supplying Items
							{#if activeTab === 'items'}
								<div
									class="absolute -bottom-[1px] left-0 h-0.5 w-full bg-[#972395]"
									transition:fade
								></div>
							{/if}
						</button>
					{/if}
				</div>

				<!-- Body -->
				<div class="flex-1 overflow-y-auto p-6">
					{#if activeTab === 'basic'}
						<div class="flex flex-col gap-5" in:fade={{ duration: 150 }}>
							<!-- Role Selection -->
							<div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
								<p class="mb-3 text-[13px] font-medium text-gray-700">
									Role <span class="text-red-500">*</span>
								</p>
								<div class="flex items-center gap-6">
									<label class="flex cursor-pointer items-center gap-2">
										<input
											type="checkbox"
											class="h-4 w-4 rounded border-gray-300 text-[#972395] focus:ring-[#972395]"
											bind:checked={formData.isAgent}
										/>
										<span class="text-sm text-gray-700">Agent</span>
									</label>
									<label class="flex cursor-pointer items-center gap-2">
										<input
											type="checkbox"
											class="h-4 w-4 rounded border-gray-300 text-[#972395] focus:ring-[#972395]"
											bind:checked={formData.isSupplier}
											onchange={() => {
												if (!formData.isSupplier && activeTab === 'items') activeTab = 'basic';
											}}
										/>
										<span class="text-sm text-gray-700">Supplier</span>
									</label>
								</div>
								{#if formData.isAgent}
									<div class="mt-3 flex flex-col gap-1.5">
										<label for="agentType" class="text-[13px] font-medium text-gray-700"
											>Agent Type <span class="text-red-500">*</span></label
										>
										<select
											id="agentType"
											class="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
											bind:value={formData.agentType}
										>
											<option value="">Select agent type</option>
											<option value="travel-agent">Travel Agent</option>
											<option value="corporate-agent">Corporate Agent</option>
											<option value="booking-agent">Booking Agent</option>
											<option value="sub-agent">Sub Agent</option>
										</select>
									</div>
								{/if}
							</div>

							<!-- Form Fields -->
							<div class="grid grid-cols-2 gap-5">
								<div class="flex flex-col gap-1.5">
									<label for="name" class="text-[13px] font-medium text-gray-700"
										>Name <span class="text-red-500">*</span></label
									>
									<input
										type="text"
										id="name"
										placeholder="Enter supplier name"
										class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={formData.name}
									/>
								</div>
								<div class="flex flex-col gap-1.5">
									<label for="email" class="text-[13px] font-medium text-gray-700"
										>Email <span class="text-red-500">*</span></label
									>
									<input
										type="email"
										id="email"
										placeholder="Enter email address"
										class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={formData.email}
									/>
								</div>
								<div class="flex flex-col gap-1.5">
									<label for="phoneNumber" class="text-[13px] font-medium text-gray-700"
										>Phone Number <span class="text-red-500">*</span></label
									>
									<input
										type="tel"
										id="phoneNumber"
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
									<label for="type" class="text-[13px] font-medium text-gray-700"
										>Type <span class="text-red-500">*</span></label
									>
									<select
										id="type"
										class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={formData.type}
									>
										<option value="">Select type</option>
										<option value="credit">Credit</option>
										<option value="debit">Debit</option>
									</select>
								</div>
								<div class="flex flex-col gap-1.5">
									<label for="openingBalance" class="text-[13px] font-medium text-gray-700"
										>Opening Balance</label
									>
									<input
										type="number"
										id="openingBalance"
										placeholder="Enter opening balance"
										class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={formData.openingBalance}
									/>
								</div>
							</div>
						</div>
					{/if}

					{#if activeTab === 'address'}
						<div class="grid grid-cols-2 gap-5" in:fade={{ duration: 150 }}>
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
									<option value="malaysia">Malaysia</option>
									<option value="indonesia">Indonesia</option>
									<option value="uae">United Arab Emirates</option>
									<option value="turkey">Turkey</option>
								</select>
							</div>
							<div class="flex flex-col gap-1.5">
								<label for="state" class="text-[13px] font-medium text-gray-700"
									>State <span class="text-red-500">*</span></label
								>
								<input
									type="text"
									id="state"
									placeholder="Enter state/province"
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
								<label for="district" class="text-[13px] font-medium text-gray-700">District</label>
								<input
									type="text"
									id="district"
									placeholder="Enter district"
									class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
									bind:value={formData.district}
								/>
							</div>
							<div class="col-span-2 flex flex-col gap-1.5">
								<label for="address" class="text-[13px] font-medium text-gray-700"
									>Full Address</label
								>
								<textarea
									id="address"
									rows="3"
									placeholder="Enter complete address"
									class="resize-y rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
									bind:value={formData.address}
								></textarea>
							</div>
						</div>
					{/if}

					{#if activeTab === 'items'}
						<div class="flex flex-col gap-4" in:fade={{ duration: 150 }}>
							<div class="flex items-center justify-between">
								<p class="text-sm text-gray-500">Define what items this supplier provides</p>
								<button
									class="flex items-center gap-1.5 rounded-lg border border-dashed border-[#972395] px-3.5 py-2 text-[13px] font-medium text-[#972395] transition-colors hover:bg-[#972395]/5"
									onclick={addSupplyingItem}
								>
									<Plus size={16} />
									Add Item
								</button>
							</div>

							{#if formData.supplyingItems.length === 0}
								<div
									class="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 py-12 text-center"
								>
									<Package size={32} class="mb-2 text-gray-300" />
									<p class="text-sm font-medium text-gray-900">No items added</p>
									<p class="text-xs text-gray-500">
										Click "Add Item" to start adding supplying items.
									</p>
								</div>
							{:else}
								<div class="flex flex-col gap-3">
									{#each formData.supplyingItems as item, index}
										<div
											class="flex items-end gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4"
											transition:slide={{ duration: 200 }}
										>
											<div class="grid flex-1 grid-cols-[1fr_2fr] gap-4">
												<div class="flex flex-col gap-1.5">
													<label class="text-[13px] font-medium text-gray-700">Item Type</label>
													<select
														class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
														bind:value={item.itemType}
													>
														<option value="">Select item type</option>
														{#each supplyingItemTypes as type}
															<option value={type.toLowerCase()}>{type}</option>
														{/each}
													</select>
												</div>
												<div class="flex flex-col gap-1.5">
													<label class="text-[13px] font-medium text-gray-700">Item Name</label>
													<input
														type="text"
														placeholder="Enter item name"
														class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
														bind:value={item.itemName}
													/>
												</div>
											</div>
											<button
												class="mb-1.5 flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-500 transition-colors hover:border-red-500 hover:bg-red-50"
												onclick={() => removeSupplyingItem(index)}
											>
												<X size={18} />
											</button>
										</div>
									{/each}
								</div>
							{/if}
						</div>
					{/if}
				</div>

				<!-- Footer -->
				<div class="border-t border-gray-100 bg-gray-50 p-4">
					<div class="flex justify-end gap-3">
						<button
							class="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
							onclick={() => (showForm = false)}
						>
							Cancel
						</button>
						<button
							class="flex items-center gap-2 rounded-lg bg-[#972395] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#7a1c78]"
							onclick={() => {
								// Handle save logic
								showForm = false;
							}}
						>
							<Save size={16} />
							Save Supplier
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	/* Hide scrollbar for clean UI */
	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}
	.no-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
