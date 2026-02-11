<script>
	import { fade, scale } from 'svelte/transition';
	import { AlertTriangle, Info } from 'lucide-svelte';

	let { show = false, title = '', message = '', type = 'warning', onConfirm, onCancel } = $props();
</script>

{#if show}
	<div
		class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
		transition:fade={{ duration: 200 }}
	>
		<div
			class="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl"
			transition:scale={{ duration: 200, start: 0.95 }}
		>
			<div class="p-6">
				<div class="flex items-start gap-4">
					<div class="shrink-0">
						{#if type === 'warning'}
							<div class="rounded-full bg-amber-100 p-3 text-amber-600">
								<AlertTriangle class="h-6 w-6" />
							</div>
						{:else}
							<div class="rounded-full bg-blue-100 p-3 text-blue-600">
								<Info class="h-6 w-6" />
							</div>
						{/if}
					</div>
					<div>
						<h3 class="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
						<p class="text-sm leading-relaxed whitespace-pre-line text-gray-600">{message}</p>
					</div>
				</div>
			</div>

			<div class="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
				<button
					class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
					onclick={onCancel}
				>
					Batal
				</button>
				<button
					class="focus:ring-opacity-50 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors focus:ring-4 {type ===
					'warning'
						? 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-200'
						: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-200'}"
					onclick={onConfirm}
				>
					Lanjutkan
				</button>
			</div>
		</div>
	</div>
{/if}
