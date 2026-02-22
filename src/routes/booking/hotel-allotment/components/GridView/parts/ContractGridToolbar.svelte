<script>
	import { Maximize2, Minimize2 } from 'lucide-svelte';

	let {
		contract,
		isFullscreen,
		availableFloors,
		selectedFloor = $bindable(),
		hasUnsavedChanges,
		toggleFullscreen,
		saveRoomTypes
	} = $props();

	// Function to calculate contract duration
	function getContractDuration(contract) {
		if (!contract?.contractPeriod?.from || !contract?.contractPeriod?.to) return '';

		const cFrom = new Date(contract.contractPeriod.from);
		const cTo = new Date(contract.contractPeriod.to);

		const diffTime = Math.abs(cTo - cFrom);
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return `${diffDays} hari`;
	}

	function formatDate(dateStr) {
		if (!dateStr) return '';
		return new Date(dateStr).toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}
</script>

<div
	class="flex items-center justify-between bg-gradient-to-br from-slate-900 to-slate-800 px-4 py-2.5 text-white"
>
	<div class="flex items-center gap-3">
		<div class="flex flex-col">
			<span class="text-[13px] font-bold">Matrix Alokasi Hotel</span>
			<span class="text-[11px] text-white/50"
				>{formatDate(contract.contractPeriod.from)} - {formatDate(contract.contractPeriod.to)}</span
			>
		</div>
		<div
			class="ml-2 rounded border border-slate-700 bg-slate-800/80 px-2 py-[3px] text-[10px] font-semibold text-slate-300"
		>
			{getContractDuration(contract)} Contract
		</div>
	</div>
	<div class="flex items-center gap-3">
		<!-- Floor Selector -->
		{#if availableFloors.length > 0}
			<div class="flex rounded-lg border border-slate-700/50 bg-slate-800/80 p-1">
				{#each availableFloors as floor}
					<button
						class="relative cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold transition-all
							{selectedFloor === floor
							? 'bg-blue-500 text-white shadow shadow-blue-500/30'
							: 'text-slate-400 hover:bg-slate-700 hover:text-white'}"
						onclick={() => (selectedFloor = floor)}
					>
						{floor}
					</button>
				{/each}
			</div>
		{/if}

		{#if hasUnsavedChanges}
			<button
				class="flex items-center gap-1.5 rounded-md border border-emerald-500 bg-emerald-500/10 px-3 py-1.5 text-xs
					font-semibold text-emerald-400 transition-all hover:bg-emerald-500 hover:text-white"
				onclick={saveRoomTypes}
				title="Simpan tipe kamar dari wave yang sedang aktif ini ke default layout"
			>
				<span>💾</span>
				<span>Save Room Types</span>
			</button>
		{:else}
			<button
				class="flex cursor-not-allowed items-center gap-1.5 rounded-md border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-400 opacity-50"
				disabled
				title="Pilih wave dan ubah tipe suatu kamar untuk memunculkan tombol simpan"
			>
				<span>💾</span>
				<span>Save Room Types</span>
			</button>
		{/if}

		<button
			class="flex cursor-pointer items-center justify-center rounded-md border border-slate-700 bg-slate-800/80 p-1.5 text-slate-400 transition-colors hover:border-slate-600 hover:bg-slate-700 hover:text-white"
			onclick={toggleFullscreen}
			title={isFullscreen ? 'Keluar Fullscreen' : 'Fullscreen'}
		>
			{#if isFullscreen}
				<Minimize2 size={16} />
			{:else}
				<Maximize2 size={16} />
			{/if}
		</button>
	</div>
</div>
