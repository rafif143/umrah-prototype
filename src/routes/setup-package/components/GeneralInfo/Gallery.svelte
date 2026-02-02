<script>
	import { Camera } from 'lucide-svelte';

	/** @type {{ state: import('../../packageState.svelte').PackageState }} */
	let { state } = $props();
</script>

<section class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
	<div class="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
		<h3 class="text-base font-semibold text-gray-900">Package Gallery</h3>
		<p class="mt-0.5 text-xs text-gray-500">Upload images for this package.</p>
	</div>
	<div class="p-6">
		<div class="mb-6 grid grid-cols-4 gap-4">
			{#each state.galleryImages as img, i}
				<div
					class="relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100"
				>
					{#if img.url}
						<img src={img.url} alt="Gallery" class="h-full w-full object-cover" />
					{:else}
						<div class="flex h-full w-full items-center justify-center text-gray-400">No Image</div>
					{/if}
					<div
						class="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100"
					>
						<button
							class="rounded-full bg-white p-1 text-red-500 hover:bg-red-50"
							onclick={() =>
								(state.galleryImages = state.galleryImages.filter((_, idx) => idx !== i))}
						>
							<span class="sr-only">Remove</span>
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg
							>
						</button>
					</div>
					<div class="absolute right-0 bottom-0 left-0 bg-black/60 p-1">
						<input
							type="text"
							bind:value={img.caption}
							placeholder="Caption"
							class="w-full bg-transparent text-xs text-white outline-none placeholder:text-gray-300"
						/>
					</div>
				</div>
			{/each}
			<button
				class="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-gray-400 transition-colors hover:border-[#972395] hover:text-[#972395]"
				onclick={() => (state.galleryImages = [...state.galleryImages, { url: '', caption: '' }])}
			>
				<Camera size={24} />
				<span class="text-xs font-medium">Add Photo</span>
			</button>
		</div>

		<div
			class="flex h-32 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-gray-400 transition-colors hover:border-[#972395] hover:text-[#972395]"
		>
			<Camera size={32} strokeWidth={1.5} />
			<p class="text-sm font-medium text-gray-600">Drag photos here</p>
			<span class="text-xs text-gray-400">Supported files: jpg, png, svg</span>
		</div>
	</div>
</section>
