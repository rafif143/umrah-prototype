<script>
	import { CalendarDays, ChevronDown } from 'lucide-svelte';

	let { contract, index = 1, isExpanded = false, onToggle } = $props();

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
</script>

<button
	class="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-gray-50"
	onclick={() => onToggle(contract.id)}
>
	<div class="flex min-w-0 flex-1 items-center gap-3">
		<span
			class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold
            {isExpanded ? 'bg-[#972395] text-white' : 'bg-gray-100 text-gray-500'}"
		>
			{index}
		</span>
		<div class="min-w-0 flex-1">
			<div class="flex flex-wrap items-center gap-2">
				<span class="text-sm font-medium text-gray-900">{contract.name}</span>
				{#if contract.isOverflow}
					<span
						class="rounded-md bg-orange-50 px-1.5 py-0.5 text-[10px] font-medium text-orange-600 ring-1 ring-orange-500/20 ring-inset"
						>Overflow</span
					>
				{/if}
			</div>
			<div class="mt-0.5 flex items-center gap-3 text-xs text-gray-500">
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
			</div>
		</div>
	</div>

	<div class="flex items-center gap-3">
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
	</div>
</button>
