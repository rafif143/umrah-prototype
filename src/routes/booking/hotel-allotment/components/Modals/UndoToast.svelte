<script>
	let { show } = $props();
</script>

{#if show}
	<div
		class="animate-slide-up-fade pointer-events-none fixed bottom-6 left-1/2 z-[9999] flex -translate-x-1/2 items-center gap-2 rounded-full bg-slate-800 px-5 py-2.5 text-[13px] font-medium text-white shadow-lg"
	>
		<span>↩️</span>
		Undo berhasil
	</div>
{/if}

<style>
	@keyframes slide-up-fade {
		from {
			opacity: 0;
			transform: translateX(-50%) translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateX(-50%) translateY(0);
		}
	}
	.animate-slide-up-fade {
		animation: slide-up-fade 0.3s cubic-bezier(0.16, 1, 0.3, 1);
	}
</style>
