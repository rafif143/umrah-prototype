<script>
	/** @type {{ state: import('../../packageState.svelte').PackageState }} */
	let { state } = $props();
</script>

<section class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
	<div class="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
		<h3 class="text-base font-semibold text-gray-900">Basic Information</h3>
		<p class="mt-0.5 text-xs text-gray-500">Enter the basic details for this package.</p>
	</div>
	<div class="grid grid-cols-2 gap-6 p-6">
		<div class="flex flex-col gap-1.5">
			<label class="text-[13px] font-medium text-gray-700">Package Name</label>
			<input
				type="text"
				placeholder="Enter package name"
				class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
			/>
		</div>
		<div class="flex flex-col gap-1.5">
			<label class="text-[13px] font-medium text-gray-700">Category</label>
			<select
				class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
			>
				<option value="">Select category</option>
				<option>Umrah Regular</option>
				<option>Umrah Plus</option>
				<option>Umrah VIP</option>
			</select>
		</div>
		<div class="flex flex-col gap-1.5">
			<label class="text-[13px] font-medium text-gray-700">Sub Category</label>
			<select
				class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
			>
				<option value="">Select sub category</option>
				<option>Economy</option>
				<option>Standard</option>
				<option>Premium</option>
			</select>
		</div>
		<div class="flex flex-col gap-1.5">
			<label class="text-[13px] font-medium text-gray-700">Duration (Days)</label>
			<input
				type="number"
				placeholder="e.g., 9"
				class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
			/>
		</div>
	</div>
</section>
