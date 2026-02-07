<script>
	import { X, Clock } from 'lucide-svelte';

	let { show = false, onClose } = $props();
</script>

{#if show}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
		<div class="w-full max-w-sm overflow-hidden rounded-xl bg-white shadow-2xl">
			<div class="relative p-6 text-center">
				<button class="absolute top-4 right-4 text-gray-400 hover:text-gray-600" onclick={onClose}>
					<X size={20} />
				</button>

				<div
					class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-orange-600"
				>
					<Clock size={32} />
				</div>

				<h3 class="mb-2 text-xl font-bold text-gray-900">Coming Soon!</h3>
				<p class="text-gray-600">
					This feature is currently under development. Stay tuned for future updates!
				</p>

				<div class="mt-6">
					<button
						class="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
						onclick={onClose}
					>
						Close
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
