<script>
	import { X, ChevronDown } from 'lucide-svelte';

	/** @type {{ label: string, options: string[], selected: string[], onchange: (val: string[]) => void }} */
	let { label, options, selected = [], onchange } = $props();

	let open = $state(false);
	let dropdownRef = $state(null);

	function toggle(val) {
		if (selected.includes(val)) {
			onchange(selected.filter((v) => v !== val));
		} else {
			onchange([...selected, val]);
		}
	}

	function remove(val) {
		onchange(selected.filter((v) => v !== val));
	}

	function handleClickOutside(e) {
		if (dropdownRef && !dropdownRef.contains(e.target)) {
			open = false;
		}
	}
</script>

<svelte:window onclick={handleClickOutside} />

<div class="flex flex-col gap-1.5">
	<label class="text-sm font-medium text-gray-700">{label}</label>
	<div class="relative" bind:this={dropdownRef}>
		<!-- Trigger -->
		<button
			type="button"
			onclick={(e) => {
				e.stopPropagation();
				open = !open;
			}}
			class="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-left text-sm shadow-sm transition-colors focus:border-[#972395] focus:ring-1 focus:ring-[#972395] {open
				? 'border-[#972395] ring-1 ring-[#972395]'
				: ''}"
		>
			{#if selected.length === 0}
				<span class="text-gray-400">Select {label.toLowerCase()}...</span>
			{:else}
				<span class="text-gray-700">{selected.length} selected</span>
			{/if}
			<ChevronDown
				size={16}
				class="text-gray-400 transition-transform {open ? 'rotate-180' : ''}"
			/>
		</button>

		<!-- Dropdown -->
		{#if open}
			<div
				class="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
			>
				{#each options as opt}
					<button
						type="button"
						onclick={(e) => {
							e.stopPropagation();
							toggle(opt);
						}}
						class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50 {selected.includes(
							opt
						)
							? 'font-medium text-[#972395]'
							: 'text-gray-700'}"
					>
						<div
							class="flex h-4 w-4 items-center justify-center rounded border {selected.includes(opt)
								? 'border-[#972395] bg-[#972395]'
								: 'border-gray-300'}"
						>
							{#if selected.includes(opt)}
								<svg
									class="h-3 w-3 text-white"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="3"
										d="M5 13l4 4L19 7"
									/>
								</svg>
							{/if}
						</div>
						{opt}
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Selected Chips -->
	{#if selected.length > 0}
		<div class="flex flex-wrap gap-1.5">
			{#each selected as val}
				<span
					class="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-[#972395]"
				>
					{val}
					<button
						type="button"
						onclick={() => remove(val)}
						class="rounded-full p-0.5 text-[#972395]/60 transition-colors hover:bg-purple-100 hover:text-[#972395]"
					>
						<X size={12} />
					</button>
				</span>
			{/each}
		</div>
	{/if}
</div>
