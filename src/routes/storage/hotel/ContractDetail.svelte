<script>
	let { contract } = $props();

	// Wave switcher — default to first wave
	let defaultWaveId = $derived(contract.waves?.[0]?.id || null);
	let selectedWaveId = $state(null);
	let activeWaveId = $derived(selectedWaveId ?? defaultWaveId);

	// Muted type colors — subtle, not rainbow
	const typeColors = {
		quint: { hex: '#4b5563', light: '#f3f4f6', dark: '#1f2937', label: 'Quint', cap: 5 },
		quad: { hex: '#6b7280', light: '#f3f4f6', dark: '#374151', label: 'Quad', cap: 4 },
		triple: { hex: '#9ca3af', light: '#f9fafb', dark: '#4b5563', label: 'Triple', cap: 3 },
		double: { hex: '#d1d5db', light: '#f9fafb', dark: '#6b7280', label: 'Double', cap: 2 }
	};

	let occupiedRoomIds = $derived(() => {
		const wave = (contract.waves || []).find((w) => w.id === activeWaveId);
		return new Set(wave?.roomIds || []);
	});

	let roomSummary = $derived(() => {
		const ids = occupiedRoomIds();
		const summary = {};
		for (const room of contract.rooms) {
			const t = room.type;
			if (!summary[t]) summary[t] = { total: 0, occupied: 0, empty: 0, manipulated: 0 };
			summary[t].total++;
			if (ids.has(room.id)) summary[t].occupied++;
			else summary[t].empty++;
			if (room.type !== room.originalType) summary[t].manipulated++;
		}
		return summary;
	});

	let totalOccupied = $derived(() => {
		const ids = occupiedRoomIds();
		return contract.rooms.filter((r) => ids.has(r.id)).length;
	});
	let totalEmpty = $derived(() => contract.rooms.length - totalOccupied());
	let totalManipulated = $derived(contract.rooms.filter((r) => r.type !== r.originalType).length);
</script>

<div>
	<!-- Wave tabs -->
	<div class="mb-3 flex items-center gap-1.5">
		<span class="mr-1 text-[10px] font-semibold uppercase" style="color: #9ca3af;">Wave:</span>
		{#each contract.waves || [] as wave}
			<button
				class="rounded-md border px-2.5 py-1 text-[11px] font-medium transition-all"
				style={activeWaveId === wave.id
					? 'background: #972395; color: white; border-color: #972395;'
					: 'background: white; color: #6b7280; border-color: #e5e7eb;'}
				onclick={() => (selectedWaveId = wave.id)}
			>
				{wave.name} ({wave.roomsUsed})
			</button>
		{/each}
	</div>

	<!-- Type summary -->
	<div class="mb-3 flex flex-wrap items-center gap-2 text-[11px]" style="color: #6b7280;">
		{#each Object.entries(roomSummary()) as [type, counts]}
			{@const tc = typeColors[type]}
			<span
				class="flex items-center gap-1.5 rounded border px-2 py-1"
				style="border-color: #e5e7eb;"
			>
				<span class="h-2.5 w-2.5 rounded-sm" style="background: {tc.hex};"></span>
				<strong style="color: #374151;">{tc.label}</strong>
				{counts.total} ({counts.occupied} terisi)
				{#if counts.manipulated > 0}
					<span style="color: #b91c1c;">· {counts.manipulated} manip.</span>
				{/if}
			</span>
		{/each}
		<span class="ml-auto" style="color: #9ca3af;">
			Terisi: <strong style="color: #374151;">{totalOccupied()}</strong> · Kosong:
			<strong style="color: #374151;">{totalEmpty()}</strong>
			{#if totalManipulated > 0}
				· Manipulasi: <strong style="color: #b91c1c;">{totalManipulated}</strong>
			{/if}
		</span>
	</div>

	<!-- Room grid -->
	<div class="grid gap-1" style="grid-template-columns: repeat(10, 1fr);">
		{#each contract.rooms as room}
			{@const tc = typeColors[room.type]}
			{@const isOccupied = occupiedRoomIds().has(room.id)}
			{@const isManipulated = room.type !== room.originalType}
			{@const origTc = typeColors[room.originalType]}

			<div
				class="group relative flex flex-col items-center justify-center rounded border transition-all"
				style="padding: {isManipulated ? '4px 2px' : '6px 2px'};
                    {isOccupied
					? `background: ${tc.hex}; border-color: ${tc.hex};`
					: 'background: white; border-color: #e5e7eb;'}"
			>
				<span
					class="text-[9px] leading-none font-bold"
					style={isOccupied ? 'color: rgba(255,255,255,0.8);' : 'color: #9ca3af;'}
				>
					{room.id}
				</span>
				<span
					class="mt-0.5 text-[8px] leading-none font-semibold uppercase"
					style={isOccupied ? 'color: white;' : `color: ${tc.dark};`}
				>
					{tc.label}
				</span>
				{#if isManipulated}
					<div
						class="mt-0.5 text-center text-[6px] leading-tight font-medium"
						style="color: {isOccupied ? 'rgba(255,255,255,0.6)' : '#9ca3af'};"
					>
						{origTc.label}→{tc.label}
					</div>
				{/if}

				<!-- Tooltip -->
				<div
					class="pointer-events-none absolute z-30 rounded px-2 py-1 text-[10px] whitespace-nowrap opacity-0 shadow-md transition-opacity group-hover:opacity-100"
					style="background: #1f2937; color: white; bottom: calc(100% + 4px); left: 50%; transform: translateX(-50%);"
				>
					{room.id} · {tc.label} ({tc.cap} pax)
					{#if isManipulated}
						· {origTc.label}→{tc.label}{/if}
					· {isOccupied ? 'Terisi' : 'Kosong'}
					<div
						class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent"
						style="border-top-color: #1f2937;"
					></div>
				</div>
			</div>
		{/each}
	</div>
</div>
