<script>
	import { CreditCard, Hotel } from 'lucide-svelte';

	/** @type {{ state: import('../../../packageState.svelte').PackageState }} */
	let { state } = $props();

	// Helper to calculate room total for simulation
	function calculateRoomTotal() {
		let total = 0;
		const prices = state.roomPricing;
		const counts = state.roomCalculator;

		// Calculate for each room type
		for (const type of ['ber2', 'ber3', 'ber4', 'ber5']) {
			if (prices[type] && counts[type]) {
				total += (prices[type].dewasa || 0) * (counts[type].dewasa || 0);
				total += (prices[type].kanak || 0) * (counts[type].kanak || 0);
				total += (prices[type].bayi || 0) * (counts[type].bayi || 0);
			}
		}
		return total;
	}

	function calculateTotalCosts() {
		const accommodation = state.accommodationList.reduce(
			(sum, item) => sum + (parseFloat(item.total) || 0),
			0
		);
		// Note: other lists might need similar logic if they had 'total' calculation in item.
		// For now using the logic from original file which seemed to be placeholder or based on specific fields
		// But here we will call state methods if available or just sum up
		// The original code used calculateTotalCosts() function but it was doing full recalc.
		// We can reuse state.calculateTotalCosts() if it returns object.
		// Actually state.calculateTotalCosts refers to function on state.

		return state.calculateTotalCosts();
	}

	function updateRoomCount(type, paxType, change) {
		state.updateRoomCount(type, paxType, change);
	}

	function resetRoomCalculator() {
		state.resetRoomCalculator();
	}
</script>

<div class="flex flex-col gap-6">
	<div>
		<h3 class="text-base font-semibold text-gray-900">Calculation & Simulation</h3>
		<p class="mt-0.5 text-xs text-gray-500">Manage pricing calculations and room simulations.</p>
	</div>

	<!-- Calculation Tabs -->
	<div class="mb-6 flex gap-2 border-b border-gray-200 pb-2">
		<button
			class="px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors {state.calculationTab ===
			'room-simulation'
				? 'rounded-md border-b-2 border-[#972395] bg-[#972395]/10 text-[#972395]'
				: 'text-gray-600 hover:text-gray-900'}"
			onclick={() => (state.calculationTab = 'room-simulation')}>Room Simulation</button
		>
		<button
			class="px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors {state.calculationTab ===
			'calculation-price'
				? 'rounded-md border-b-2 border-[#972395] bg-[#972395]/10 text-[#972395]'
				: 'text-gray-600 hover:text-gray-900'}"
			onclick={() => (state.calculationTab = 'calculation-price')}>Calculation Price</button
		>
	</div>

	<!-- Room Simulation Tab -->
	{#if state.calculationTab === 'room-simulation'}
		<div class="flex flex-col gap-6">
			<div class="flex items-center justify-between">
				<div>
					<h4 class="text-base font-semibold text-gray-900">Room Simulation</h4>
					<p class="mt-0.5 text-xs text-gray-500">Configure pricing and simulate room bookings.</p>
				</div>
				<button
					class="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
					onclick={resetRoomCalculator}
				>
					Reset All
				</button>
			</div>

			<!-- Pricing Configuration -->
			<div class="rounded-xl border border-gray-200 bg-white shadow-sm">
				<div class="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
					<h3 class="text-base font-semibold text-gray-900">Pricing Configuration</h3>
					<p class="mt-0.5 text-xs text-gray-500">
						Set prices for each room type and passenger category.
					</p>
				</div>
				<div class="p-6">
					<div class="overflow-hidden rounded-lg border border-gray-200">
						<div class="bg-[#972395] text-white">
							<div class="grid grid-cols-4 text-center text-sm font-semibold">
								<div class="border-r border-white/20 p-3">ROOM TYPE</div>
								<div class="border-r border-white/20 p-3">DEWASA (RM)</div>
								<div class="border-r border-white/20 p-3">KANAK² (RM)</div>
								<div class="p-3">BAYI (RM)</div>
							</div>
						</div>

						<div class="divide-y divide-gray-200">
							<!-- Loop for room types -->
							{#each ['ber2', 'ber3', 'ber4', 'ber5'] as type}
								<div class="grid grid-cols-4 items-center">
									<div class="bg-gray-50 p-3 text-center font-medium text-gray-700 uppercase">
										BILIK {type.replace('ber', 'BER-')}
									</div>
									<div class="p-3">
										<input
											type="number"
											placeholder="0"
											class="w-full rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
											bind:value={state.roomPricing[type].dewasa}
										/>
									</div>
									<div class="p-3">
										<input
											type="number"
											placeholder="0"
											class="w-full rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
											bind:value={state.roomPricing[type].kanak}
										/>
									</div>
									<div class="p-3">
										<input
											type="number"
											placeholder="0"
											class="w-full rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
											bind:value={state.roomPricing[type].bayi}
										/>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>

			<!-- Room Calculator Section -->
			<div class="rounded-xl border border-gray-200 bg-white shadow-sm">
				<div class="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
					<h3 class="text-base font-semibold text-gray-900">Room Calculator Simulator</h3>
					<p class="mt-0.5 text-xs text-gray-500">
						Use the calculator below to simulate pricing. Click (+) to add or (-) to reduce
						passengers.
					</p>
				</div>
				<div class="p-6">
					<!-- Room Calculator Table -->
					<div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
						<div class="bg-[#972395] text-white">
							<div class="grid grid-cols-4 text-center text-sm font-semibold">
								<div class="border-r border-white/20 p-4">BILIK</div>
								<div class="border-r border-white/20 p-4">DEWASA</div>
								<div class="border-r border-white/20 p-4">KANAK²</div>
								<div class="p-4">BAYI</div>
							</div>
						</div>

						<div class="divide-y divide-gray-200">
							{#each ['ber2', 'ber3', 'ber4', 'ber5'] as type}
								<div class="grid grid-cols-4 items-center">
									<div class="bg-gray-50 p-4 text-center font-medium text-gray-700 uppercase">
										BILIK {type.replace('ber', 'BER-')}
									</div>
									{#each ['dewasa', 'kanak', 'bayi'] as pax}
										<div class="flex items-center justify-center gap-3 p-4">
											<button
												class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-600 transition-colors hover:bg-gray-300"
												onclick={() => updateRoomCount(type, pax, -1)}
											>
												<span class="text-lg">−</span>
											</button>
											<span class="w-8 text-center font-semibold text-[#972395]"
												>{state.roomCalculator[type][pax]}</span
											>
											<button
												class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-600 transition-colors hover:bg-gray-300"
												onclick={() => updateRoomCount(type, pax, 1)}
											>
												<span class="text-lg">+</span>
											</button>
										</div>
									{/each}
								</div>
							{/each}
						</div>

						<!-- Total Section -->
						<div class="border-t border-gray-200 bg-gray-50">
							<div class="grid grid-cols-4 items-center">
								<div class="p-4 text-center font-bold text-gray-700">JUMLAH</div>
								<div class="col-span-3 p-4">
									<div class="rounded-lg border-2 border-[#972395] bg-white p-4 text-center">
										<span class="text-2xl font-bold text-[#972395]"
											>RM {calculateRoomTotal().toFixed(2)}</span
										>
									</div>
								</div>
							</div>
						</div>
					</div>

					<!-- Pricing Summary -->
					<div class="mt-6 grid grid-cols-3 gap-4">
						<div class="rounded-lg border border-gray-200 bg-white p-4 text-center">
							<h4 class="mb-2 text-sm font-semibold text-gray-700">Total Dewasa</h4>
							<div class="text-xl font-bold text-blue-600">
								{state.getTotalPax().dewasa}
							</div>
							<p class="mt-1 text-xs text-gray-500">orang</p>
						</div>
						<div class="rounded-lg border border-gray-200 bg-white p-4 text-center">
							<h4 class="mb-2 text-sm font-semibold text-gray-700">Total Kanak²</h4>
							<div class="text-xl font-bold text-green-600">
								{state.getTotalPax().kanak}
							</div>
							<p class="mt-1 text-xs text-gray-500">orang</p>
						</div>
						<div class="rounded-lg border border-gray-200 bg-white p-4 text-center">
							<h4 class="mb-2 text-sm font-semibold text-gray-700">Total Bayi</h4>
							<div class="text-xl font-bold text-purple-600">
								{state.getTotalPax().bayi}
							</div>
							<p class="mt-1 text-xs text-gray-500">orang</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Calculation Price Tab -->
	{#if state.calculationTab === 'calculation-price'}
		<div class="flex flex-col gap-6">
			<div>
				<h4 class="text-base font-semibold text-gray-900">Calculation Price Summary</h4>
				<p class="mt-0.5 text-xs text-gray-500">
					Summary of all costs from accommodation to operational expenses.
				</p>
			</div>

			<!-- Cost Summary Cards -->
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				<!-- Accommodation Cost -->
				<div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
					<div class="mb-3 flex items-center gap-3">
						<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
							<Hotel size={20} class="text-blue-600" />
						</div>
						<div>
							<h4 class="text-sm font-semibold text-gray-900">Accommodation</h4>
							<p class="text-xs text-gray-500">{state.accommodationList.length} items</p>
						</div>
					</div>
					<div class="text-2xl font-bold text-blue-600">
						RM {state.calculateTotalCosts().accommodation}
					</div>
				</div>

				<!-- Meals Cost -->
				<div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
					<div class="mb-3 flex items-center gap-3">
						<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
							<svg class="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
								<path
									d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
								/>
							</svg>
						</div>
						<div>
							<h4 class="text-sm font-semibold text-gray-900">Meals</h4>
							<p class="text-xs text-gray-500">{state.mealsList.length} items</p>
						</div>
					</div>
					<div class="text-2xl font-bold text-green-600">
						RM {state.calculateTotalCosts().meals}
					</div>
				</div>

				<!-- Transport Cost -->
				<div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
					<div class="mb-3 flex items-center gap-3">
						<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
							<svg class="h-5 w-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
								<path
									d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
								/>
								<path
									d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z"
								/>
							</svg>
						</div>
						<div>
							<h4 class="text-sm font-semibold text-gray-900">Transport</h4>
							<p class="text-xs text-gray-500">{state.transportList.length} items</p>
						</div>
					</div>
					<div class="text-2xl font-bold text-purple-600">
						RM {state.calculateTotalCosts().transport}
					</div>
				</div>

				<!-- Service Cost -->
				<div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
					<div class="mb-3 flex items-center gap-3">
						<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
							<svg class="h-5 w-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
								<path
									fill-rule="evenodd"
									d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
									clip-rule="evenodd"
								/>
							</svg>
						</div>
						<div>
							<h4 class="text-sm font-semibold text-gray-900">Services</h4>
							<p class="text-xs text-gray-500">{state.serviceList.length} items</p>
						</div>
					</div>
					<div class="text-2xl font-bold text-orange-600">
						RM {state.calculateTotalCosts().service}
					</div>
				</div>

				<!-- Operational Cost -->
				<div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
					<div class="mb-3 flex items-center gap-3">
						<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
							<CreditCard size={20} class="text-gray-600" />
						</div>
						<div>
							<h4 class="text-sm font-semibold text-gray-900">Operational</h4>
							<p class="text-xs text-gray-500">
								{state.operationalCostList.length} items
							</p>
						</div>
					</div>
					<div class="text-2xl font-bold text-gray-600">RM 0.00</div>
					<p class="mt-1 text-xs text-gray-400">No pricing data</p>
				</div>
			</div>

			<!-- Grand Total -->
			<div
				class="rounded-xl border-2 border-[#972395] bg-gradient-to-r from-[#972395]/5 to-[#972395]/10 p-6"
			>
				<div class="flex items-center justify-between">
					<div>
						<h3 class="text-lg font-semibold text-gray-900">Grand Total</h3>
						<p class="text-sm text-gray-600">Total cost for this trip package</p>
					</div>
					<div class="text-right">
						<div class="text-3xl font-bold text-[#972395]">
							RM {state.calculateTotalCosts().grandTotal}
						</div>
						<p class="text-sm text-gray-500">All components included</p>
					</div>
				</div>
			</div>

			<!-- Detailed Breakdown -->
			<div class="rounded-xl border border-gray-200 bg-white shadow-sm">
				<div class="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
					<h3 class="text-base font-semibold text-gray-900">Detailed Breakdown</h3>
					<p class="mt-0.5 text-xs text-gray-500">Cost breakdown by category and items.</p>
				</div>
				<div class="p-6">
					<div class="space-y-4">
						<div class="flex items-center justify-between border-b border-gray-100 py-2">
							<span class="text-sm font-medium text-gray-700"
								>Accommodation ({state.accommodationList.length} items)</span
							>
							<span class="text-sm font-semibold text-gray-900"
								>RM {state.calculateTotalCosts().accommodation}</span
							>
						</div>
						<div class="flex items-center justify-between border-b border-gray-100 py-2">
							<span class="text-sm font-medium text-gray-700"
								>Meals ({state.mealsList.length} items)</span
							>
							<span class="text-sm font-semibold text-gray-900"
								>RM {state.calculateTotalCosts().meals}</span
							>
						</div>
						<div class="flex items-center justify-between border-b border-gray-100 py-2">
							<span class="text-sm font-medium text-gray-700"
								>Transport ({state.transportList.length} items)</span
							>
							<span class="text-sm font-semibold text-gray-900"
								>RM {state.calculateTotalCosts().transport}</span
							>
						</div>
						<div class="flex items-center justify-between border-b border-gray-100 py-2">
							<span class="text-sm font-medium text-gray-700"
								>Services ({state.serviceList.length} items)</span
							>
							<span class="text-sm font-semibold text-gray-900"
								>RM {state.calculateTotalCosts().service}</span
							>
						</div>
						<div class="flex items-center justify-between border-b border-gray-100 py-2">
							<span class="text-sm font-medium text-gray-700"
								>Operational ({state.operationalCostList.length} items)</span
							>
							<span class="text-sm font-semibold text-gray-900">RM 0.00</span>
						</div>
						<div class="flex items-center justify-between border-t-2 border-[#972395] py-3 pt-4">
							<span class="text-base font-bold text-gray-900">Total Package Cost</span>
							<span class="text-lg font-bold text-[#972395]"
								>RM {state.calculateTotalCosts().grandTotal}</span
							>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
