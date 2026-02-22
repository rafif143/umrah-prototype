<script>
	import { CalendarDays, ChevronDown, Pencil, Trash2 } from 'lucide-svelte';

	let { contract, index = 1, isExpanded = false, onToggle, onEdit, onDelete } = $props();

	function formatDate(d) {
		return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
	}

	let occupiedCount = $derived(() => {
		const ids = new Set();
		for (const w of contract.waves || []) for (const id of w.roomIds || []) ids.add(id);
		return ids.size;
	});

	let occupancyPct = $derived(
		contract.totalRooms > 0 ? Math.round((occupiedCount() / contract.totalRooms) * 100) : 0
	);

	function handleDelete(e) {
		e.stopPropagation();
		
		const waveCount = contract.waves?.length || 0;
		const jamaahCount = (contract.waves || []).reduce((total, wave) => total + (wave.jamaah?.length || 0), 0);
		
		let confirmMessage = `Hapus kontrak "${contract.name}"?`;
		if (waveCount > 0 || jamaahCount > 0) {
			confirmMessage += `\n\nKontrak ini memiliki:\n- ${waveCount} gelombang\n- ${jamaahCount} jamaah\n\nSemua data akan dihapus!`;
		}

		if (confirm(confirmMessage)) {
			onDelete?.(contract);
		}
	}
</script>

<div
	class="flex w-full items-center justify-between px-4 py-3 transition-colors hover:bg-gray-50"
>
	<div class="flex min-w-0 flex-1 items-center gap-3">
		<button
			class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold transition-colors
            {isExpanded ? 'bg-[#972395] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}"
			onclick={() => onToggle(contract.id)}
		>
			{index}
		</button>
		<div class="min-w-0 flex-1">
			<div class="flex flex-wrap items-center gap-2">
				<button
					class="text-sm font-medium text-gray-900 hover:text-[#972395] transition-colors text-left"
					onclick={() => onToggle(contract.id)}
				>
					{contract.name}
				</button>
				
				<!-- Simple Edit Button -->
				<button
					class="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#972395]"
					onclick={(e) => {
						e.stopPropagation();
						onEdit?.(contract);
					}}
					title="Edit Kontrak"
				>
					<Pencil size={12} />
				</button>
				
				<!-- Simple Delete Button -->
				<button
					class="rounded p-1 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
					onclick={(e) => {
						e.stopPropagation();
						handleDelete(e);
					}}
					title="Hapus Kontrak"
				>
					<Trash2 size={12} />
				</button>
				
				{#if contract.isOverflow}
					<span
						class="rounded-md bg-orange-50 px-1.5 py-0.5 text-[10px] font-medium text-orange-600 ring-1 ring-orange-500/20 ring-inset"
						>Overflow</span
					>
				{/if}
			</div>
			<button
				class="mt-0.5 flex items-center gap-3 text-xs text-gray-500 text-left hover:text-gray-700 transition-colors"
				onclick={() => onToggle(contract.id)}
			>
				<span class="flex items-center gap-1">
					<CalendarDays size={11} />
					{formatDate(contract.contractPeriod.from)} — {formatDate(contract.contractPeriod.to)}
				</span>
				<span class="text-gray-300">·</span>
				<span>{contract.totalRooms} kamar</span>
				<span class="text-gray-300">·</span>
				<span>{contract.waves?.length || 0} wave</span>
				<span class="text-gray-300">·</span>
				<span>{occupiedCount()}/{contract.totalRooms} terisi ({occupancyPct}%)</span>
			</button>
		</div>
	</div>

	<!-- Large clickable area for expand/collapse -->
	<button
		class="flex items-center gap-3 px-6 py-4 -mx-4 -my-3 ml-4 rounded-r-xl transition-colors hover:bg-gray-100"
		onclick={() => onToggle(contract.id)}
	>
		<div class="h-1.5 w-20 overflow-hidden rounded-full bg-gray-100">
			<div
				class="h-full rounded-full bg-[#972395] transition-all duration-300"
				style="width: {occupancyPct}%;"
			></div>
		</div>
		<ChevronDown
			size={14}
			class="text-gray-400 transition-transform duration-200 {isExpanded ? 'rotate-180' : ''}"
		/>
	</button>
</div>
