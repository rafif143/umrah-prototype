<script>
	import { Plus, Edit, X, Save, Bus, MapPin, Navigation } from 'lucide-svelte';
	import { fade, slide } from 'svelte/transition';

	/** @type {{ state: any }} */
	let { state: pkgState } = $props();

	// Use state from PackageState
	let transportList = $derived(pkgState.activeVariant?.transport || []);
	let showModal = $derived(pkgState.showTransportModal);
	let form = $derived(pkgState.transportForm);
</script>

<div class="rounded-xl border border-gray-200 bg-white shadow-sm">
	<div class="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
		<div class="flex items-center justify-between">
			<div>
				<h3 class="text-base font-semibold text-gray-900">Transport List</h3>
				<p class="mt-0.5 text-xs text-gray-500">Manage vehicle and route assignments.</p>
			</div>
			<button
				class="flex items-center gap-2 rounded-lg bg-[#972395] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7a1c78]"
				onclick={() => {
					pkgState.resetTransportForm();
					pkgState.showTransportModal = true;
				}}
			>
				<Plus size={16} />
				Add Transport
			</button>
		</div>
	</div>

	<div class="p-6">
		<div class="overflow-hidden rounded-lg border border-gray-200">
			<table class="w-full text-left text-sm">
				<thead class="bg-gray-50 text-gray-600">
					<tr>
						<th class="px-4 py-3 font-medium">Vehicle / Supplier</th>
						<th class="px-4 py-3 font-medium">Route</th>
						<th class="px-4 py-3 text-right font-medium">Adult Cost/Sell</th>
						<th class="px-4 py-3 text-right font-medium">Child Cost/Sell</th>
						<th class="px-4 py-3 text-right font-medium">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200">
					{#each transportList as item, index}
						<tr class="transition-colors hover:bg-gray-50">
							<td class="px-4 py-3">
								<div class="flex flex-col">
									<span class="font-medium text-gray-900">{item.vehicle}</span>
									<span class="text-xs text-gray-500">{item.supplier}</span>
								</div>
							</td>
							<td class="px-4 py-3">
								<div class="flex items-center gap-2 text-gray-600">
									<MapPin size={12} class="text-[#972395]" />
									<span class="text-xs font-semibold">{item.route}</span>
								</div>
							</td>
							<td class="px-4 py-3 text-right">
								<div class="flex flex-col">
									<span class="text-gray-900">RM {item.adultCost}</span>
									<span class="text-xs text-[#972395]">Sell: RM {item.adultSell}</span>
								</div>
							</td>
							<td class="px-4 py-3 text-right">
								<div class="flex flex-col">
									<span class="text-gray-900">RM {item.childCost}</span>
									<span class="text-xs text-[#972395]">Sell: RM {item.childSell}</span>
								</div>
							</td>
							<td class="px-4 py-3 text-right">
								<div class="flex justify-end gap-2">
									<button
										class="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#972395]"
										onclick={() => pkgState.editTransport(item, index)}
									>
										<Edit size={14} />
									</button>
									<button
										class="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
										onclick={() => pkgState.removeTransport(index)}
									>
										<X size={14} />
									</button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>

{#if showModal}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
		transition:fade={{ duration: 200 }}
	>
		<div
			class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
			transition:slide={{ axis: 'y', duration: 300 }}
		>
			<div class="flex items-center justify-between border-b border-gray-100 p-6">
				<h2 class="text-xl font-semibold text-gray-900">
					{pkgState.editingTransportIndex !== null ? 'Edit' : 'Add'} Transport
				</h2>
				<button
					onclick={() => {
						pkgState.showTransportModal = false;
						pkgState.resetTransportForm();
					}}
					class="text-gray-400 hover:text-gray-600"
				>
					<X size={20} />
				</button>
			</div>
			<div class="space-y-6 p-6">
				<div class="grid grid-cols-2 gap-4">
					<div class="flex flex-col gap-1.5">
						<label for="vehicleType" class="text-xs font-medium text-gray-700">Vehicle Type</label>
						<select
							id="vehicleType"
							class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
							bind:value={pkgState.transportForm.vehicle}
						>
							<option value="">Select vehicle</option>
							{#each pkgState.transportVehicles as vehicle}
								<option value={vehicle}>{vehicle}</option>
							{/each}
						</select>
					</div>
					<div class="flex flex-col gap-1.5">
						<label for="transportSupplier" class="text-xs font-medium text-gray-700">Supplier</label
						>
						<select
							id="transportSupplier"
							class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
							bind:value={pkgState.transportForm.supplier}
						>
							<option value="">Select supplier</option>
							{#each pkgState.transportSuppliers as supplier}
								<option value={supplier}>{supplier}</option>
							{/each}
						</select>
					</div>
					<div class="col-span-2 flex flex-col gap-1.5">
						<label for="transportRoute" class="text-xs font-medium text-gray-700">Route</label>
						<select
							id="transportRoute"
							class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
							bind:value={pkgState.transportForm.route}
						>
							<option value="">Select route</option>
							{#each pkgState.transportRoutes as route}
								<option value={route}>{route}</option>
							{/each}
						</select>
					</div>
				</div>
				<div class="rounded-xl border border-gray-100 bg-gray-50 p-4">
					<h4 class="mb-3 text-xs font-bold tracking-wider text-gray-500 uppercase">Pricing</h4>
					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-2">
							<label for="adultCost" class="text-xs font-medium text-gray-600">Adult Cost</label>
							<input
								id="adultCost"
								type="number"
								class="w-full rounded border border-gray-200 px-3 py-2 text-sm"
								placeholder="0"
								bind:value={pkgState.transportForm.adultCost}
							/>
						</div>
						<div class="space-y-2">
							<label for="adultSell" class="text-xs font-medium text-gray-600">Adult Sell</label>
							<input
								id="adultSell"
								type="number"
								class="w-full rounded border border-gray-200 px-3 py-2 text-sm"
								placeholder="0"
								bind:value={pkgState.transportForm.adultSell}
							/>
						</div>
						<div class="space-y-2">
							<label for="childCost" class="text-xs font-medium text-gray-600">Child Cost</label>
							<input
								id="childCost"
								type="number"
								class="w-full rounded border border-gray-200 px-3 py-2 text-sm"
								placeholder="0"
								bind:value={pkgState.transportForm.childCost}
							/>
						</div>
						<div class="space-y-2">
							<label for="childSell" class="text-xs font-medium text-gray-600">Child Sell</label>
							<input
								id="childSell"
								type="number"
								class="w-full rounded border border-gray-200 px-3 py-2 text-sm"
								placeholder="0"
								bind:value={pkgState.transportForm.childSell}
							/>
						</div>
					</div>
				</div>
			</div>
			<div class="flex justify-end gap-3 border-t border-gray-100 p-6">
				<button
					onclick={() => {
						pkgState.showTransportModal = false;
						pkgState.resetTransportForm();
					}}
					class="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700"
					>Cancel</button
				>
				<button
					class="flex items-center gap-2 rounded-lg bg-[#972395] px-5 py-2.5 text-sm font-medium text-white"
					onclick={pkgState.saveTransport}
					><Save size={18} />{pkgState.editingTransportIndex !== null ? 'Update' : 'Save'} Transport</button
				>
			</div>
		</div>
	</div>
{/if}
