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
		<div
			class="flex h-64 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-gray-400 transition-colors hover:border-[#972395] hover:text-[#972395]"
		>
			<Camera size={32} strokeWidth={1.5} />
			<p class="text-sm font-medium text-gray-600">Drag photos here</p>
			<span class="text-xs text-gray-400">Supported files: jpg, png, svg</span>
		</div>
	</div>
</section>
