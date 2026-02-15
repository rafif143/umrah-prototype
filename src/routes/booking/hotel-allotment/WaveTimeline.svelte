<script>
	let { contract } = $props();

	let dateRange = $derived(() => {
		const from = new Date(contract.contractPeriod.from);
		const to = new Date(contract.contractPeriod.to);
		const days = [];
		const current = new Date(from);
		while (current <= to) {
			days.push(new Date(current));
			current.setDate(current.getDate() + 1);
		}
		return days;
	});

	let totalDays = $derived(dateRange().length);

	let wavePositions = $derived(() => {
		const days = dateRange();
		if (days.length === 0) return [];
		const contractStart = days[0];
		return (contract.waves || []).map((wave, i) => {
			const checkIn = new Date(wave.checkIn);
			const checkOut = new Date(wave.checkOut);
			const duration = Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24));
			const isOverload = wave.roomsUsed > contract.totalRooms;
			return { ...wave, duration, isOverload };
		});
	});

	function formatDay(date) {
		return date.getDate();
	}
	function formatDateShort(d) {
		return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
	}

	function getDayWaveIndex(date) {
		const d = date.getTime();
		for (let i = 0; i < (contract.waves || []).length; i++) {
			const w = contract.waves[i];
			// Standard day check: usually favors STARTING wave (inclusive start, exclusive end)
			// But for visual timeline, we might want to prioritize transition logic in the template
			if (d >= new Date(w.checkIn).getTime() && d < new Date(w.checkOut).getTime()) return i;
		}
		return -1;
	}

	function getTransitionWaves(date) {
		const dQuery = date.toISOString().slice(0, 10); // Standardize to YYYY-MM-DD
		const waves = contract.waves || [];

		// Find wave where CheckOut == date
		const ending = waves.find((w) => w.checkOut === dQuery);
		// Find wave where CheckIn == date
		const starting = waves.find((w) => w.checkIn === dQuery);

		if (ending && starting && ending.id !== starting.id) {
			return { ending, starting };
		}
		return null;
	}

	// Grayscale shades per wave - REMOVED in favor of custom colors
	// const waveShades = ['#374151', '#6b7280', '#9ca3af', '#d1d5db'];
</script>

<div class="rounded-lg border" style="border-color: #e5e7eb; background: white;">
	<div class="flex items-center justify-between border-b px-4 py-2" style="border-color: #f3f4f6;">
		<span class="text-xs font-semibold" style="color: #374151;">Wave Timeline</span>
		<span class="text-[10px]" style="color: #9ca3af;">
			{formatDateShort(contract.contractPeriod.from)} → {formatDateShort(
				contract.contractPeriod.to
			)} · {totalDays} hari
		</span>
	</div>

	<div class="px-4 py-3">
		<!-- Date bar -->
		<div class="relative mb-2 flex gap-px">
			{#each dateRange() as date}
				{@const wIdx = getDayWaveIndex(date)}
				{@const transition = getTransitionWaves(date)}

				<div class="group flex flex-1 flex-col items-center gap-0.5" style="min-width: 0;">
					<span class="text-[8px] font-medium" style="color: #9ca3af;">{formatDay(date)}</span>
					{#if transition}
						<div class="flex h-5 w-full gap-px overflow-visible rounded-sm bg-white">
							<div
								class="group/end relative h-full flex-1 rounded-l-sm"
								style="background: {transition.ending.color || '#374151'};"
							>
								<!-- Tooltip End -->
								<div
									class="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 rounded bg-gray-800 px-1.5 py-0.5 text-[10px] whitespace-nowrap text-white opacity-0 transition-opacity group-hover/end:block group-hover/end:opacity-100"
								>
									Out: {transition.ending.name}
									<div
										class="absolute top-full left-1/2 -ml-1 border-4 border-transparent border-t-gray-800"
									></div>
								</div>
							</div>
							<div
								class="group/start relative h-full flex-1 rounded-r-sm"
								style="background: {transition.starting.color || '#374151'};"
							>
								<!-- Tooltip Start -->
								<div
									class="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 rounded bg-gray-800 px-1.5 py-0.5 text-[10px] whitespace-nowrap text-white opacity-0 transition-opacity group-hover/start:block group-hover/start:opacity-100"
								>
									In: {transition.starting.name}
									<div
										class="absolute top-full left-1/2 -ml-1 border-4 border-transparent border-t-gray-800"
									></div>
								</div>
							</div>
						</div>
					{:else}
						<div
							class="group/item relative h-5 w-full rounded-sm"
							style="background: {wIdx >= 0
								? contract.waves[wIdx]?.color || '#374151'
								: '#f3f4f6'};"
						>
							{#if wIdx >= 0}
								<!-- Normal Tooltip -->
								<div
									class="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 rounded bg-gray-800 px-1.5 py-0.5 text-[10px] whitespace-nowrap text-white opacity-0 transition-opacity group-hover/item:block group-hover/item:opacity-100"
								>
									{contract.waves[wIdx].name}
									<div
										class="absolute top-full left-1/2 -ml-1 border-4 border-transparent border-t-gray-800"
									></div>
								</div>
							{/if}
						</div>
					{/if}
				</div>
			{/each}
		</div>

		<!-- Wave list -->
		<div class="mt-3 space-y-1.5">
			{#each wavePositions() as wave, i}
				<div
					class="flex items-center gap-2.5 rounded border px-3 py-1.5 text-[11px]"
					style="border-color: #e5e7eb;"
				>
					<span
						class="h-2.5 w-2.5 shrink-0 rounded-sm"
						style="background: {wave.color || '#374151'};"
					></span>
					<span class="font-semibold" style="color: #374151;">{wave.name}</span>
					<span style="color: #9ca3af;">
						{formatDateShort(wave.checkIn)} → {formatDateShort(wave.checkOut)} · {wave.duration} malam
					</span>
					<span class="ml-auto font-medium" style="color: #6b7280;"
						>{wave.roomsUsed}/{contract.totalRooms}</span
					>
					{#if wave.isOverload}
						<span
							class="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase"
							style="background: #fee2e2; color: #b91c1c;">Overload</span
						>
					{/if}
				</div>
			{/each}
		</div>

		<!-- Gap indicators -->
		{#if wavePositions().length > 1}
			<div class="mt-2 flex flex-wrap gap-1.5">
				{#each wavePositions() as wave, i}
					{#if i > 0}
						{@const prevOut = new Date(wavePositions()[i - 1].checkOut)}
						{@const currIn = new Date(wave.checkIn)}
						{@const gapDays = Math.round((currIn - prevOut) / (1000 * 60 * 60 * 24))}
						{#if gapDays > 0}
							<span
								class="rounded border border-dashed px-2 py-1 text-[10px]"
								style="border-color: #d1d5db; color: #9ca3af;"
							>
								{gapDays} hari kosong antara {wavePositions()[i - 1].name} & {wave.name}
							</span>
						{/if}
					{/if}
				{/each}
			</div>
		{/if}
	</div>
</div>
