<script>
	import MultiSelect from '$lib/components/MultiSelect.svelte';

	/** @type {{ state: import('../../packageState.svelte.js').PackageState }} */
	let { state } = $props();

	let activeVariant = $derived(state.activeVariant);

	function generateName() {
		const batch = state.flightInfo.batchName || '';
		const firstType = activeVariant.types.length > 0 ? activeVariant.types[0] : '';
		return [batch, firstType].filter(Boolean).join(' - ') || 'New Package';
	}
</script>

<div class="grid grid-cols-2 gap-6">
	<div class="col-span-2">
		<label for="package-name" class="mb-1 block text-sm font-medium text-gray-700">
			Package Name
			<span class="text-xs font-normal text-gray-400">(auto-generated, editable)</span>
		</label>
		<input
			id="package-name"
			type="text"
			bind:value={activeVariant.name}
			class="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#972395] focus:ring-[#972395]"
			placeholder="e.g. MH 1 Agustus - Premium"
		/>
	</div>

	<!-- Category -->
	<div>
		<MultiSelect
			label="Category"
			options={state.packageCategories}
			selected={activeVariant.categories}
			onchange={(val) => (activeVariant.categories = val)}
		/>
	</div>

	<!-- Type -->
	<div>
		<MultiSelect
			label="Type"
			options={state.packageTypes}
			selected={activeVariant.types}
			onchange={(val) => {
				activeVariant.types = val;
				activeVariant.name = generateName();
			}}
		/>
	</div>

	<!-- Pax Capacity -->
	<div>
		<label for="pax-capacity" class="mb-1 block text-sm font-medium text-gray-700"
			>Pax Capacity</label
		>
		<input
			id="pax-capacity"
			type="number"
			bind:value={activeVariant.paxCapacity}
			class="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#972395] focus:ring-[#972395]"
		/>
	</div>

	<!-- Duration -->
	<div>
		<label for="duration-days" class="mb-1 block text-sm font-medium text-gray-700"
			>Duration (Days)</label
		>
		<input
			id="duration-days"
			type="number"
			bind:value={activeVariant.durationDays}
			class="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#972395] focus:ring-[#972395]"
		/>
	</div>
	<div>
		<label for="duration-nights" class="mb-1 block text-sm font-medium text-gray-700"
			>Duration (Nights)</label
		>
		<input
			id="duration-nights"
			type="number"
			bind:value={activeVariant.durationNights}
			class="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#972395] focus:ring-[#972395]"
		/>
	</div>

	<!-- Validity -->
	<div>
		<label for="validity-start" class="mb-1 block text-sm font-medium text-gray-700"
			>Validity Start</label
		>
		<input
			id="validity-start"
			type="date"
			bind:value={activeVariant.validityStartDate}
			class="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#972395] focus:ring-[#972395]"
		/>
	</div>
	<div>
		<label class="mb-1 block text-sm font-medium text-gray-700">Validity End</label>
		<input
			type="date"
			bind:value={activeVariant.validityEndDate}
			class="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#972395] focus:ring-[#972395]"
		/>
	</div>
	<!-- Description -->
	<div class="col-span-2">
		<label for="description" class="mb-1 block text-sm font-medium text-gray-700">Description</label
		>
		<textarea
			id="description"
			bind:value={activeVariant.description}
			rows="4"
			class="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#972395] focus:ring-[#972395]"
			placeholder="Enter package description..."
		></textarea>
	</div>
</div>
