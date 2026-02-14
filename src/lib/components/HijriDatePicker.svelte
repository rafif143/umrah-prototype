<script>
	import { ChevronLeft, ChevronRight, Calendar } from 'lucide-svelte';
	import { slide } from 'svelte/transition';
	import { hijriMonths, getHijriMonthLength, getHijriMonthStartDay } from '$lib/utils/hijri.js';

	let { value = { day: 1, month: 0, year: 1446 }, disabled = false, onChange } = $props();

	let open = $state(false);
	let currentMonth = $state(value.month);
	let currentYear = $state(value.year);

	// Sync internal state when value changes externally
	$effect(() => {
		currentMonth = value.month;
		currentYear = value.year;
	});

	function toggle() {
		if (!disabled) open = !open;
	}

	function close() {
		open = false;
	}

	function prevMonth() {
		if (currentMonth === 0) {
			currentMonth = 11;
			currentYear--;
		} else {
			currentMonth--;
		}
	}

	function nextMonth() {
		if (currentMonth === 11) {
			currentMonth = 0;
			currentYear++;
		} else {
			currentMonth++;
		}
	}

	function selectDate(d) {
		const newVal = { day: d, month: currentMonth, year: currentYear };
		if (onChange) onChange(newVal);
		close();
	}

	function getDays() {
		const length = getHijriMonthLength(currentMonth, currentYear);
		// 0 = Sunday, 1 = Monday, ... 6 = Saturday
		// Let's create a grid starting Sunday
		const startDay = getHijriMonthStartDay(currentMonth, currentYear); // 0-6

		const days = [];
		// Padding
		for (let i = 0; i < startDay; i++) {
			days.push(null);
		}
		// Days
		for (let i = 1; i <= length; i++) {
			days.push(i);
		}
		return days;
	}

	const weekDays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
</script>

<div class="relative">
	<!-- Trigger Input -->
	<button
		class="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-left text-sm ring-offset-1 transition-all outline-none focus:ring-2 disabled:bg-gray-100 disabled:text-gray-500 {open
			? 'border-[#972395] ring-[#972395]'
			: 'hover:border-gray-300'}"
		onclick={toggle}
		{disabled}
	>
		<span class="truncate">
			{value.day}
			{hijriMonths[value.month]}
			{value.year}
		</span>
		<Calendar size={14} class="text-gray-400" />
	</button>

	<!-- Dropdown -->
	{#if open}
		<div
			class="absolute top-full left-0 z-50 mt-1 w-64 rounded-lg border border-gray-200 bg-white p-3 shadow-xl"
			transition:slide={{ duration: 150 }}
		>
			<!-- Header -->
			<div class="mb-3 flex items-center justify-between">
				<button class="rounded p-1 hover:bg-gray-100" onclick={prevMonth}>
					<ChevronLeft size={16} />
				</button>
				<div class="text-sm font-semibold text-gray-800">
					{hijriMonths[currentMonth]}
					{currentYear}
				</div>
				<button class="rounded p-1 hover:bg-gray-100" onclick={nextMonth}>
					<ChevronRight size={16} />
				</button>
			</div>

			<!-- Grid -->
			<div class="mb-1 grid grid-cols-7 text-center">
				{#each weekDays as d}
					<div class="text-[10px] font-medium text-gray-400">{d}</div>
				{/each}
			</div>
			<div class="grid grid-cols-7 gap-1">
				{#each getDays() as day}
					{#if day}
						<button
							class="rounded py-1.5 text-xs transition-colors hover:bg-gray-100
                                {day === value.day &&
							currentMonth === value.month &&
							currentYear === value.year
								? 'bg-[#972395] font-bold text-white hover:bg-[#7a1c78]'
								: 'text-gray-700'}"
							onclick={() => selectDate(day)}
						>
							{day}
						</button>
					{:else}
						<div></div>
					{/if}
				{/each}
			</div>
		</div>

		<!-- Overlay to close -->
		<div class="fixed inset-0 z-40" onclick={close}></div>
	{/if}
</div>
