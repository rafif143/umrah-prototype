<script>
	import {
		Plus,
		Search,
		Filter,
		Eye,
		Edit,
		Trash2,
		X,
		Save,
		ArrowLeft,
		Tags,
		Calculator
	} from 'lucide-svelte';
	import { fade, slide } from 'svelte/transition';
	import Sidebar from '$lib/components/Sidebar.svelte';

	// Ensure activePage matches the new ID in Sidebar
	// Sidebar ID is 'operational-cost', so we pass that.
	// Previously it was likely just matching by route or ID.
	let activePage = $state('operational-cost');

	// Current active tab
	let activeTab = $state('category');

	// ===== CATEGORY =====
	let showCategoryForm = $state(false);
	let categoryFormData = $state({
		name: '',
		type: '',
		vatOption: ''
	});

	const vatOptions = ['0%', '5%', '10%', '15%', '20%'];

	// Simulated category data
	let categories = $state([
		{ id: 1, name: 'Transportation Fee', type: 'local', vatOption: '10%' },
		{ id: 2, name: 'Guide Services', type: 'local', vatOption: '5%' },
		{ id: 3, name: 'Visa Processing', type: 'other', vatOption: '0%' },
		{ id: 4, name: 'Insurance', type: 'other', vatOption: '15%' }
	]);

	// ===== COSTING =====
	let showCostingForm = $state(false);
	let costingFormData = $state({
		name: '',
		costItems: []
	});

	let totals = $derived.by(() => {
		const result = {
			adultCostVat: 0,
			adultSellVat: 0,
			childCostVat: 0,
			childSellVat: 0,
			infantCostVat: 0,
			infantSellVat: 0,
			adultCostTotal: 0,
			adultSellTotal: 0,
			childCostTotal: 0,
			childSellTotal: 0,
			infantCostTotal: 0,
			infantSellTotal: 0
		};

		// Calculate sums
		let adultCostSum = 0;
		let adultSellSum = 0;
		let childCostSum = 0;
		let childSellSum = 0;
		let infantCostSum = 0;
		let infantSellSum = 0;

		costingFormData.costItems.forEach((item) => {
			adultCostSum += Number(item.adultCost) || 0;
			adultSellSum += Number(item.adultSell) || 0;
			childCostSum += Number(item.childCost) || 0;
			childSellSum += Number(item.childSell) || 0;
			infantCostSum += Number(item.infantCost) || 0;
			infantSellSum += Number(item.infantSell) || 0;
		});

		// Calculate VAT (assuming 0 for now as logic wasn't specified, or we can add a global VAT setting later)
		// For now just placeholders or 0 if no VAT logic is defined in the requirement

		result.adultCostTotal = adultCostSum;
		result.adultSellTotal = adultSellSum;
		result.childCostTotal = childCostSum;
		result.childSellTotal = childSellSum;
		result.infantCostTotal = infantCostSum;
		result.infantSellTotal = infantSellSum;

		return result;
	});

	// Add cost item
	function addCostItem() {
		costingFormData.costItems = [
			...costingFormData.costItems,
			{
				categoryId: '',
				supplier: "Don't use supplier",
				adultCost: '',
				adultSell: '',
				childCost: '',
				childSell: '',
				infantCost: '',
				infantSell: ''
			}
		];
	}

	// Remove cost item
	function removeCostItem(index) {
		costingFormData.costItems = costingFormData.costItems.filter((_, i) => i !== index);
	}

	// Get category type for item
	function getCategoryType(categoryId) {
		if (!categoryId) return null;
		const cat = categories.find((c) => c.id === parseInt(categoryId));
		return cat ? cat.type : null;
	}

	// Simulated suppliers
	const suppliers = [
		{ id: 'none', name: "Don't use supplier" },
		{ id: 1, name: 'Al-Haram Hotels Group' },
		{ id: 2, name: 'Zamzam Catering Services' },
		{ id: 3, name: 'Makkah Transport Co.' }
	];

	// Simulated costing data
	let costings = $state([
		{
			id: 1,
			name: 'Standard Umrah Package Costs',
			costItems: [
				{
					categoryId: 1,
					categoryName: 'Transportation Fee',
					categoryType: 'local',
					supplier: 'Makkah Transport Co.',
					adultCost: 150,
					adultSell: 200,
					childCost: 100,
					childSell: 150,
					infantCost: 0,
					infantSell: 0
				},
				{
					categoryId: 2,
					categoryName: 'Guide Services',
					categoryType: 'local',
					supplier: "Don't use supplier",
					adultCost: 80,
					adultSell: 120,
					childCost: 40,
					childSell: 60,
					infantCost: 0,
					infantSell: 0
				}
			]
		},
		{
			id: 2,
			name: 'Premium Package Costs',
			costItems: [
				{
					categoryId: 3,
					categoryName: 'Visa Processing',
					categoryType: 'other',
					supplier: "Don't use supplier",
					adultCost: 300,
					adultSell: 350,
					childCost: 300,
					childSell: 350,
					infantCost: 150,
					infantSell: 175
				}
			]
		},
		{
			id: 3,
			name: 'Full Service Package',
			costItems: [
				{
					categoryId: 1,
					categoryName: 'Transportation Fee',
					categoryType: 'local',
					supplier: 'Makkah Transport Co.',
					adultCost: 200,
					adultSell: 280,
					childCost: 150,
					childSell: 200,
					infantCost: 0,
					infantSell: 0
				},
				{
					categoryId: 3,
					categoryName: 'Visa Processing',
					categoryType: 'other',
					supplier: "Don't use supplier",
					adultCost: 350,
					adultSell: 400,
					childCost: 350,
					childSell: 400,
					infantCost: 175,
					infantSell: 200
				},
				{
					categoryId: 4,
					categoryName: 'Insurance',
					categoryType: 'other',
					supplier: 'Al-Haram Hotels Group',
					adultCost: 50,
					adultSell: 80,
					childCost: 50,
					childSell: 80,
					infantCost: 50,
					infantSell: 80
				}
			]
		}
	]);
</script>

<svelte:head>
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="flex min-h-screen bg-gray-50 font-sans">
	<!-- Sidebar -->
	<Sidebar activePage="operational-cost" />

	<!-- Main Content -->
	<main class="ml-[200px] min-h-screen flex-1 bg-gray-50/50">
		<div class="p-6">
			<!-- Page Header -->
			<div class="mb-6 flex items-start justify-between">
				<div>
					<h1 class="text-2xl font-semibold text-gray-900">Operational Cost</h1>
					<p class="text-sm text-gray-500">Manage operational categories and costings</p>
				</div>
				<button
					class="flex items-center gap-2 rounded-lg bg-[#972395] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#7a1c78]"
					onclick={() => {
						if (activeTab === 'category') {
							showCategoryForm = true;
						} else {
							showCostingForm = true;
						}
					}}
				>
					<Plus size={18} />
					Add {activeTab === 'category' ? 'Category' : 'Costing'}
				</button>
			</div>

			<!-- Tabs -->
			<div class="mb-6 rounded-xl bg-gray-100 p-1">
				<div class="flex">
					<button
						class="flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all duration-200 {activeTab ===
						'category'
							? 'bg-white text-[#972395] shadow-sm'
							: 'text-gray-500 hover:bg-gray-200/50 hover:text-gray-700'}"
						onclick={() => (activeTab = 'category')}
					>
						<Tags size={16} />
						Operational Category
					</button>
					<button
						class="flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all duration-200 {activeTab ===
						'costing'
							? 'bg-white text-[#972395] shadow-sm'
							: 'text-gray-500 hover:bg-gray-200/50 hover:text-gray-700'}"
						onclick={() => (activeTab = 'costing')}
					>
						<Calculator size={16} />
						Operational Costing
					</button>
				</div>
			</div>

			<!-- Tab Content -->
			{#if activeTab === 'category'}
				<!-- CATEGORY TAB -->
				<!-- Category List -->
				<div class="mb-5 flex items-center justify-between">
					<div
						class="flex w-80 items-center gap-2.5 rounded-lg border border-gray-200 bg-white px-4 py-2.5"
					>
						<Search size={18} class="text-gray-400" />
						<input
							type="text"
							placeholder="Search categories..."
							class="flex-1 border-none bg-transparent text-sm outline-none placeholder:text-gray-400"
						/>
					</div>
				</div>

				<div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
					<table class="w-full text-left text-sm text-gray-500">
						<thead class="bg-[#972395] text-xs text-white uppercase">
							<tr>
								<th class="px-6 py-3 font-medium">Name</th>
								<th class="px-6 py-3 font-medium">Type</th>
								<th class="px-6 py-3 font-medium">VAT Option</th>
								<th class="px-6 py-3 font-medium">Actions</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200 bg-white">
							{#each categories as category}
								<tr class="hover:bg-gray-50">
									<td class="px-6 py-4 font-medium whitespace-nowrap text-gray-900"
										>{category.name}</td
									>
									<td class="px-6 py-4">
										<span
											class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {category.type ===
											'local'
												? 'bg-green-100 text-green-800'
												: 'bg-blue-100 text-blue-800'}"
										>
											{category.type === 'local' ? 'Local' : 'Other'}
										</span>
									</td>
									<td class="px-6 py-4">{category.vatOption}</td>
									<td class="px-6 py-4">
										<div class="flex items-center gap-2">
											<button
												class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
												><Edit size={16} /></button
											>
											<button class="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600"
												><Trash2 size={16} /></button
											>
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				<!-- Category Modal -->
				{#if showCategoryForm}
					<div
						class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
						onclick={() => (showCategoryForm = false)}
						transition:fade={{ duration: 200 }}
					>
						<div
							class="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
							onclick={(e) => e.stopPropagation()}
							transition:slide={{ axis: 'y', duration: 300 }}
						>
							<div class="flex items-center justify-between border-b border-gray-200 px-6 py-5">
								<h3 class="text-lg font-semibold text-gray-900">Add New Category</h3>
								<button
									class="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-900"
									onclick={() => (showCategoryForm = false)}
								>
									<X size={20} />
								</button>
							</div>
							<div class="flex flex-col gap-5 p-6">
								<div class="flex flex-col gap-1.5">
									<label for="catName" class="text-[13px] font-medium text-gray-700"
										>Name <span class="text-red-500">*</span></label
									>
									<input
										type="text"
										id="catName"
										placeholder="Enter category name"
										class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={categoryFormData.name}
									/>
								</div>
								<div class="flex flex-col gap-1.5">
									<label for="catType" class="text-[13px] font-medium text-gray-700"
										>Type <span class="text-red-500">*</span></label
									>
									<select
										id="catType"
										class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={categoryFormData.type}
									>
										<option value="">Select type</option>
										<option value="local">Local</option>
										<option value="other">Other</option>
									</select>
								</div>
								<div class="flex flex-col gap-1.5">
									<label for="vatOption" class="text-[13px] font-medium text-gray-700"
										>VAT Option <span class="text-red-500">*</span></label
									>
									<select
										id="vatOption"
										bind:value={categoryFormData.vatOption}
										class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
									>
										<option value="">Select VAT</option>
										{#each vatOptions as vat}
											<option value={vat}>{vat}</option>
										{/each}
									</select>
								</div>
							</div>
							<div class="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
								<button
									class="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
									onclick={() => (showCategoryForm = false)}
								>
									Cancel
								</button>
								<button
									class="flex items-center gap-2 rounded-lg bg-[#972395] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#7a1c78]"
								>
									<Save size={18} />
									Save Category
								</button>
							</div>
						</div>
					</div>
				{/if}
			{:else}
				<!-- COSTING TAB -->
				<!-- Costing List -->
				<div class="mb-5 flex items-center justify-between">
					<div
						class="flex w-80 items-center gap-2.5 rounded-lg border border-gray-200 bg-white px-4 py-2.5"
					>
						<Search size={18} class="text-gray-400" />
						<input
							type="text"
							placeholder="Search costings..."
							class="flex-1 border-none bg-transparent text-sm outline-none placeholder:text-gray-400"
						/>
					</div>
				</div>

				<div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
					<table class="w-full text-left text-sm text-gray-500">
						<thead class="bg-[#972395] text-xs text-white uppercase">
							<tr>
								<th class="px-6 py-3 font-medium">Name</th>
								<th class="px-6 py-3 font-medium">Items</th>
								<th class="px-6 py-3 font-medium">Actions</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200 bg-white">
							{#each costings as costing}
								<tr class="hover:bg-gray-50">
									<td class="px-6 py-4 font-medium whitespace-nowrap text-gray-900"
										>{costing.name}</td
									>
									<td class="px-6 py-4">{costing.costItems.length} item(s)</td>
									<td class="px-6 py-4">
										<div class="flex items-center gap-2">
											<button
												class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
												><Edit size={16} /></button
											>
											<button class="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600"
												><Trash2 size={16} /></button
											>
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				{#if showCostingForm}
					<!-- Costing Modal Overlay -->
					<div
						class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
						transition:fade={{ duration: 200 }}
					>
						<div
							class="no-scrollbar max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
							transition:slide={{ axis: 'y', duration: 300 }}
						>
							<!-- Modal Header -->
							<div
								class="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-gray-200 bg-white px-6 py-5"
							>
								<div>
									<h2 class="text-lg font-semibold text-gray-900">Add New Costing</h2>
									<p class="text-[13px] text-gray-500">Fill in costing information</p>
								</div>
								<button
									class="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-900"
									onclick={() => (showCostingForm = false)}
								>
									<X size={20} />
								</button>
							</div>

							<!-- Modal Body -->
							<div class="flex flex-col gap-5 p-6">
								<!-- Basic Info -->
								<div class="rounded-xl border border-gray-200 bg-white p-6">
									<h3 class="mb-4 text-[15px] font-semibold text-gray-900">Basic Information</h3>
									<div class="flex max-w-[400px] flex-col gap-1.5">
										<label for="costName" class="text-[13px] font-medium text-gray-700"
											>Costing Name <span class="text-red-500">*</span></label
										>
										<input
											type="text"
											id="costName"
											placeholder="Enter costing name"
											class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
											bind:value={costingFormData.name}
										/>
									</div>
								</div>

								<!-- Operational Cost Items -->
								<div class="rounded-xl border border-gray-200 bg-white p-6">
									<div class="mb-4 flex items-center justify-between">
										<h3 class="text-[15px] font-semibold text-gray-900">Operational Cost Items</h3>
										<button
											class="flex items-center gap-2 text-sm font-medium text-[#972395] hover:text-[#7a1c78]"
											onclick={addCostItem}
										>
											<Plus size={16} />
											Add Cost Item
										</button>
									</div>

									{#if costingFormData.costItems.length === 0}
										<div
											class="mt-4 rounded-lg border border-dashed border-gray-300 py-8 text-center"
										>
											<p class="text-sm text-gray-500">
												No cost items added yet. Click "Add Cost Item" to add one.
											</p>
										</div>
									{:else}
										<div class="mt-4 overflow-hidden rounded-lg border border-gray-200">
											<table class="w-full table-fixed text-left text-sm text-gray-500">
												<thead class="bg-[#972395] text-xs font-semibold text-white uppercase">
													<tr>
														<th class="w-[20%] px-4 py-3">Category</th>
														<th class="w-[20%] px-4 py-3">Supplier</th>
														<th class="w-[9%] px-2 py-3">Adult Cost</th>
														<th class="w-[9%] px-2 py-3">Adult Sell</th>
														<th class="w-[9%] px-2 py-3">Child Cost</th>
														<th class="w-[9%] px-2 py-3">Child Sell</th>
														<th class="w-[9%] px-2 py-3">Infant Cost</th>
														<th class="w-[9%] px-2 py-3">Infant Sell</th>
														<th class="w-[6%] px-2 py-3"></th>
													</tr>
												</thead>
												<tbody class="divide-y divide-gray-200 bg-white">
													{#each costingFormData.costItems as item, index}
														<tr>
															<td class="px-4 py-3">
																<select
																	class="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
																	bind:value={item.categoryId}
																>
																	<option value="">Select category</option>
																	{#each categories as cat}
																		<option value={cat.id}>{cat.name}</option>
																	{/each}
																</select>
															</td>
															<td class="px-4 py-3">
																<select
																	class="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
																	bind:value={item.supplier}
																>
																	{#each suppliers as sup}
																		<option value={sup.name}>{sup.name}</option>
																	{/each}
																</select>
															</td>
															<td class="px-2 py-3">
																<input
																	type="number"
																	placeholder="0"
																	class="w-full rounded-md border border-gray-200 px-3 py-2 text-right text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
																	bind:value={item.adultCost}
																/>
															</td>
															<td class="px-2 py-3">
																<input
																	type="number"
																	placeholder="0"
																	class="w-full rounded-md border border-gray-200 px-3 py-2 text-right text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
																	bind:value={item.adultSell}
																/>
															</td>
															<td class="px-2 py-3">
																<input
																	type="number"
																	placeholder="0"
																	class="w-full rounded-md border border-gray-200 px-3 py-2 text-right text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
																	bind:value={item.childCost}
																/>
															</td>
															<td class="px-2 py-3">
																<input
																	type="number"
																	placeholder="0"
																	class="w-full rounded-md border border-gray-200 px-3 py-2 text-right text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
																	bind:value={item.childSell}
																/>
															</td>
															<td class="px-2 py-3">
																<input
																	type="number"
																	placeholder="0"
																	class="w-full rounded-md border border-gray-200 px-3 py-2 text-right text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
																	bind:value={item.infantCost}
																/>
															</td>
															<td class="px-2 py-3">
																<input
																	type="number"
																	placeholder="0"
																	class="w-full rounded-md border border-gray-200 px-3 py-2 text-right text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
																	bind:value={item.infantSell}
																/>
															</td>
															<td class="px-2 py-3 text-center">
																<button
																	class="text-gray-400 hover:text-red-500"
																	onclick={() => removeCostItem(index)}
																>
																	<Trash2 size={16} />
																</button>
															</td>
														</tr>
													{/each}
												</tbody>
												<tfoot class="bg-[#972395]/10 font-medium">
													<tr>
														<td colspan="2" class="px-4 py-3 text-right font-semibold text-gray-700"
															>VAT</td
														>
														<td class="px-2 py-3">
															<input
																type="number"
																value={totals.adultCostVat}
																readonly
																class="w-full rounded-md border border-gray-200 bg-white/50 px-3 py-2 text-right text-sm text-gray-700 outline-none"
															/>
														</td>
														<td class="px-2 py-3">
															<input
																type="number"
																value={totals.adultSellVat}
																readonly
																class="w-full rounded-md border border-gray-200 bg-white/50 px-3 py-2 text-right text-sm text-gray-700 outline-none"
															/>
														</td>
														<td class="px-2 py-3">
															<input
																type="number"
																value={totals.childCostVat}
																readonly
																class="w-full rounded-md border border-gray-200 bg-white/50 px-3 py-2 text-right text-sm text-gray-700 outline-none"
															/>
														</td>
														<td class="px-2 py-3">
															<input
																type="number"
																value={totals.childSellVat}
																readonly
																class="w-full rounded-md border border-gray-200 bg-white/50 px-3 py-2 text-right text-sm text-gray-700 outline-none"
															/>
														</td>
														<td class="px-2 py-3">
															<input
																type="number"
																value={totals.infantCostVat}
																readonly
																class="w-full rounded-md border border-gray-200 bg-white/50 px-3 py-2 text-right text-sm text-gray-700 outline-none"
															/>
														</td>
														<td class="px-2 py-3">
															<input
																type="number"
																value={totals.infantSellVat}
																readonly
																class="w-full rounded-md border border-gray-200 bg-white/50 px-3 py-2 text-right text-sm text-gray-700 outline-none"
															/>
														</td>
														<td class="px-2 py-3"></td>
													</tr>
													<tr>
														<td colspan="2" class="px-4 py-3 text-right font-semibold text-gray-700"
															>Total Cost</td
														>
														<td class="px-2 py-3">
															<input
																type="number"
																value={totals.adultCostTotal}
																readonly
																class="w-full rounded-md border border-gray-200 bg-white/50 px-3 py-2 text-right text-sm text-gray-700 outline-none"
															/>
														</td>
														<td class="px-2 py-3">
															<input
																type="number"
																value={totals.adultSellTotal}
																readonly
																class="w-full rounded-md border border-gray-200 bg-white/50 px-3 py-2 text-right text-sm text-gray-700 outline-none"
															/>
														</td>
														<td class="px-2 py-3">
															<input
																type="number"
																value={totals.childCostTotal}
																readonly
																class="w-full rounded-md border border-gray-200 bg-white/50 px-3 py-2 text-right text-sm text-gray-700 outline-none"
															/>
														</td>
														<td class="px-2 py-3">
															<input
																type="number"
																value={totals.childSellTotal}
																readonly
																class="w-full rounded-md border border-gray-200 bg-white/50 px-3 py-2 text-right text-sm text-gray-700 outline-none"
															/>
														</td>
														<td class="px-2 py-3">
															<input
																type="number"
																value={totals.infantCostTotal}
																readonly
																class="w-full rounded-md border border-gray-200 bg-white/50 px-3 py-2 text-right text-sm text-gray-700 outline-none"
															/>
														</td>
														<td class="px-2 py-3">
															<input
																type="number"
																value={totals.infantSellTotal}
																readonly
																class="w-full rounded-md border border-gray-200 bg-white/50 px-3 py-2 text-right text-sm text-gray-700 outline-none"
															/>
														</td>
														<td class="px-2 py-3"></td>
													</tr>
												</tfoot>
											</table>
										</div>
									{/if}
								</div>
							</div>

							<!-- Modal Footer -->
							<div
								class="flex justify-end gap-3 rounded-b-2xl border-t border-gray-200 bg-gray-50 px-6 py-4"
							>
								<button
									class="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
									onclick={() => (showCostingForm = false)}
								>
									Cancel
								</button>
								<button
									class="flex items-center gap-2 rounded-lg bg-[#972395] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#7a1c78]"
								>
									<Save size={18} />
									Save Costing
								</button>
							</div>
						</div>
					</div>
				{/if}
			{/if}
		</div>
	</main>
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
