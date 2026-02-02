<script>
	import { X, Camera, Plus } from 'lucide-svelte';

	/** @type {{ state: import('../../packageState.svelte').PackageState }} */
	let { state } = $props();
</script>

<div class="mb-6 flex gap-6 border-b border-gray-200">
	<button
		class="border-b-2 pb-2 text-sm font-medium transition-colors {state.peneranganTab ===
		'description'
			? 'border-[#972395] text-[#972395]'
			: 'border-transparent text-gray-500 hover:text-gray-700'}"
		onclick={() => (state.peneranganTab = 'description')}>Penerangan</button
	>
	<button
		class="border-b-2 pb-2 text-sm font-medium transition-colors {state.peneranganTab === 'audience'
			? 'border-[#972395] text-[#972395]'
			: 'border-transparent text-gray-500 hover:text-gray-700'}"
		onclick={() => (state.peneranganTab = 'audience')}>Target Audience</button
	>
</div>

{#if state.peneranganTab === 'description'}
	<section class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
		<div class="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
			<h3 class="text-base font-semibold text-gray-900">Package Description</h3>
			<p class="mt-0.5 text-xs text-gray-500">Add detailed descriptions with images.</p>
		</div>
		<div class="flex flex-col p-6">
			<div class="mb-6 rounded-lg border border-gray-200 bg-gray-50/50 p-4">
				<div class="mb-4 flex items-center justify-between">
					<span
						class="flex h-6 w-6 items-center justify-center rounded-full bg-[#972395] text-xs font-bold text-white"
						>1</span
					>
					<button class="text-gray-400 hover:text-red-500"><X size={16} /></button>
				</div>
				<div class="grid grid-cols-[120px_1fr] gap-6">
					<div class="flex flex-col gap-1.5">
						<label class="text-[13px] font-medium text-gray-700">Image</label>
						<div
							class="flex h-24 w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-gray-300 bg-white text-gray-400 hover:border-[#972395] hover:text-[#972395]"
						>
							<Camera size={20} />
							<span class="text-xs">Upload</span>
						</div>
					</div>
					<div class="flex flex-col gap-1.5">
						<label class="text-[13px] font-medium text-gray-700">Description</label>
						<textarea
							rows="3"
							placeholder="Description..."
							class="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
						></textarea>
					</div>
				</div>
			</div>
			<button
				class="flex w-fit items-center gap-2.5 rounded-lg border border-dashed border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-[#972395] hover:text-[#972395]"
			>
				<Plus size={16} /> Add Description
			</button>
		</div>
	</section>
{/if}

{#if state.peneranganTab === 'audience'}
	<section class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
		<div class="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
			<h3 class="text-base font-semibold text-gray-900">Target Audience</h3>
			<p class="mt-0.5 text-xs text-gray-500">Define who this package is for.</p>
		</div>
		<div class="flex flex-col gap-3 p-6">
			<div class="flex items-center gap-3">
				<input
					type="text"
					placeholder="e.g., First-time Umrah pilgrims"
					class="flex-1 rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
				/>
				<button class="text-gray-400 hover:text-red-500"><X size={18} /></button>
			</div>
			<button
				class="mt-2 mr-auto flex items-center gap-2 text-sm font-medium text-[#972395] hover:text-[#7a1c78]"
			>
				<Plus size={16} /> Add Audience
			</button>
		</div>
	</section>
{/if}
