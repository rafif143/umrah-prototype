<script>
	import { X, Calendar } from 'lucide-svelte';
	import { fade, slide } from 'svelte/transition';
	import { gregorianToHijri, hijriToGregorian, hijriMonths } from '$lib/utils/hijri.js';
	import HijriDatePicker from '$lib/components/HijriDatePicker.svelte';

	let {
		show = false,
		wave = null,
		allWaves = [],
		roomSummary = {},
		typeColors = {},
		totalEmpty = 0,
		totalOccupied = 0,
		totalManipulated = 0,
		onClose,
		onSave
	} = $props();

	let waveName = $state('');
	let checkIn = $state('');
	let checkOut = $state('');
	let color = $state('');
	let flatRate = $state('');
	let dateMode = $state('gregorian'); // 'gregorian' | 'hijri'
	let hijriIn = $state({ day: 1, month: 0, year: 1446 });
	let hijriOut = $state({ day: 1, month: 0, year: 1446 });

	$effect(() => {
		if (show && wave) {
			waveName = wave.name || '';
			checkIn = wave.checkIn || '';
			checkOut = wave.checkOut || '';
			if (checkOut) hijriOut = gregorianToHijri(checkOut);
			color = wave.color || '#972395';
			flatRate = wave.flatRate || '';
		}
	});

	function checkOverlap(start, end, waves, currentId) {
		// Use string comparison for YYYY-MM-DD to avoid timezone issues
		// Conflict if: NewStart < ExistingEnd AND NewEnd > ExistingStart
		for (const w of waves) {
			if (w.id === currentId) continue; // Skip self

			// Ensure valid dates
			if (!w.checkIn || !w.checkOut) continue;

			if (start < w.checkOut && end > w.checkIn) {
				return w;
			}
		}
		return null;
	}

	function handleSave() {
		// Validation
		if (checkIn && checkOut) {
			const conflict = checkOverlap(checkIn, checkOut, allWaves, wave?.id);
			if (conflict) {
				alert(
					`Tanggal bentrok dengan gelombang "${conflict.name}" (${conflict.checkIn} - ${conflict.checkOut}).\nSilakan pilih tanggal lain.`
				);
				return;
			}
		}

		if (onSave) {
			onSave({
				name: waveName,
				checkIn,
				checkOut,
				color,
				flatRate: parseFloat(flatRate) || 0
			});
		}
		onClose();
	}

	function handleClose() {
		onClose();
	}
</script>

{#if show}
	<!-- Backdrop -->
	<div
		class="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
		transition:fade={{ duration: 200 }}
		onclick={handleClose}
		role="dialog"
		tabindex="-1"
		onkeydown={() => {}}
	></div>

	<!-- Drawer -->
	<div
		class="fixed top-0 right-0 z-50 h-full w-full max-w-sm border-l border-gray-200 bg-white shadow-xl transition-transform duration-300 ease-in-out"
		transition:slide={{ axis: 'x', duration: 300 }}
	>
		<div class="flex h-full flex-col">
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-gray-100 p-5">
				<h2 class="text-lg font-semibold text-gray-900">Wave Detail</h2>
				<button
					class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
					onclick={handleClose}
				>
					<X size={20} />
				</button>
			</div>

			<!-- Content -->
			<div class="flex-1 overflow-y-auto p-5">
				<!-- Stats Section -->
				<div class="mb-6 space-y-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
					<h3 class="text-xs font-semibold tracking-wider text-gray-500 uppercase">
						Occupancy Summary
					</h3>

					<div class="space-y-2">
						{#each Object.entries(roomSummary) as [type, counts]}
							{@const tc = typeColors[type]}
							{#if tc}
								<div class="grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-4 text-xs">
									<div class="flex items-center gap-2">
										<span class="h-2 w-2 rounded-full" style="background: {tc.hex};"></span>
										<span class="font-medium text-gray-700">{tc.label}</span>
									</div>
									<div class="w-[60px] text-right text-gray-500 tabular-nums">
										<span class="font-semibold text-gray-900">{counts.total}</span> Total
									</div>
									<div class="w-[80px] text-right text-gray-500 tabular-nums">
										<span class={counts.occupied > 0 ? 'font-medium text-green-600' : ''}
											>{counts.occupied} Occupied</span
										>
									</div>
									<div class="flex w-[60px] justify-end">
										{#if counts.manipulated > 0}
											<span
												class="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-500 tabular-nums"
												>+{counts.manipulated} manip</span
											>
										{/if}
									</div>
								</div>
							{/if}
						{/each}
					</div>

					<div class="mt-3 flex items-center justify-between border-t border-gray-200 pt-3 text-xs">
						<div class="text-center">
							<div class="mb-0.5 text-[10px] font-medium text-gray-400 uppercase">Occupied</div>
							<div class="text-sm font-bold text-gray-900">{totalOccupied}</div>
						</div>
						<div class="text-center">
							<div class="mb-0.5 text-[10px] font-medium text-gray-400 uppercase">Empty</div>
							<div class="text-sm font-bold text-gray-400">{totalEmpty}</div>
						</div>
						{#if totalManipulated > 0}
							<div class="text-center">
								<div class="mb-0.5 text-[10px] font-medium text-red-400 uppercase">Manipulated</div>
								<div class="text-sm font-bold text-red-600">{totalManipulated}</div>
							</div>
						{/if}
					</div>
				</div>

				<div class="space-y-4">
					<h3 class="mb-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">
						Edit Configuration
					</h3>

					<!-- Name -->
					<div>
						<label for="waveName" class="mb-1.5 block text-xs font-medium text-gray-600"
							>Wave Name</label
						>
						<input
							type="text"
							id="waveName"
							class="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
							bind:value={waveName}
						/>
					</div>

					<!-- Dates -->
					<div class="space-y-3">
						<!-- Date System Switcher -->
						<div class="flex items-center gap-2">
							<span class="text-xs font-medium text-gray-600">Sistem Tanggal:</span>
							<div class="flex rounded-lg border border-gray-200 bg-gray-50 p-1">
								<button
									class="rounded px-3 py-1 text-xs font-medium transition-colors {dateMode ===
									'gregorian'
										? 'bg-white text-[#972395] shadow-sm'
										: 'text-gray-500 hover:text-gray-700'}"
									onclick={() => (dateMode = 'gregorian')}
								>
									Masehi
								</button>
								<button
									class="rounded px-3 py-1 text-xs font-medium transition-colors {dateMode ===
									'hijri'
										? 'bg-white text-[#972395] shadow-sm'
										: 'text-gray-500 hover:text-gray-700'}"
									onclick={() => (dateMode = 'hijri')}
								>
									Hijriyah
								</button>
							</div>
						</div>

						<div class="grid grid-cols-2 gap-3">
							<!-- Check In -->
							<div class="space-y-2">
								<div>
									<label for="checkIn" class="mb-1.5 block text-xs font-medium text-gray-600"
										>Check In</label
									>
									<div class="relative">
										<Calendar
											size={14}
											class="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
										/>
										<input
											type="date"
											id="checkIn"
											class="w-full rounded-lg border border-gray-200 bg-white py-2.5 pr-3 pl-9 text-xs outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395] disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
											bind:value={checkIn}
											disabled={dateMode === 'hijri'}
											oninput={() => {
												if (checkIn) hijriIn = gregorianToHijri(checkIn);
											}}
										/>
									</div>
								</div>
								<!-- Hijri In -->
								<div class="rounded-lg {dateMode === 'hijri' ? '' : ''}">
									<label class="mb-1 block text-[10px] font-medium text-gray-500">Hijriyah</label>
									<HijriDatePicker
										value={hijriIn}
										disabled={dateMode === 'gregorian'}
										onChange={(val) => {
											hijriIn = val;
											checkIn = hijriToGregorian(val.day, val.month, val.year);
										}}
									/>
								</div>
							</div>

							<!-- Check Out -->
							<div class="space-y-2">
								<div>
									<label for="checkOut" class="mb-1.5 block text-xs font-medium text-gray-600"
										>Check Out</label
									>
									<div class="relative">
										<Calendar
											size={14}
											class="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
										/>
										<input
											type="date"
											id="checkOut"
											class="w-full rounded-lg border border-gray-200 bg-white py-2.5 pr-3 pl-9 text-xs outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395] disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
											bind:value={checkOut}
											disabled={dateMode === 'hijri'}
											oninput={() => {
												if (checkOut) hijriOut = gregorianToHijri(checkOut);
											}}
										/>
									</div>
								</div>
								<!-- Hijri Out -->
								<div class="rounded-lg {dateMode === 'hijri' ? '' : ''}">
									<label class="mb-1 block text-[10px] font-medium text-gray-500">Hijriyah</label>
									<HijriDatePicker
										value={hijriOut}
										disabled={dateMode === 'gregorian'}
										onChange={(val) => {
											hijriOut = val;
											checkOut = hijriToGregorian(val.day, val.month, val.year);
										}}
									/>
								</div>
							</div>
						</div>
					</div>

					<!-- Cost & Color -->
					<div class="grid grid-cols-[1fr_auto] gap-3">
						<div>
							<label for="flatRate" class="mb-1.5 block text-xs font-medium text-gray-600"
								>Flat Rate</label
							>
							<input
								type="number"
								id="flatRate"
								class="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								placeholder="0"
								bind:value={flatRate}
							/>
						</div>
						<div>
							<label for="color" class="mb-1.5 block text-xs font-medium text-gray-600">Color</label
							>
							<div
								class="flex h-[42px] items-center rounded-lg border border-gray-200 bg-white px-2"
							>
								<input
									type="color"
									id="color"
									class="h-6 w-6 cursor-pointer border-none bg-transparent p-0"
									bind:value={color}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Footer -->
			<div
				class="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50 px-5 py-4"
			>
				<button
					class="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
					onclick={handleClose}
				>
					Cancel
				</button>
				<button
					class="rounded-lg bg-[#972395] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7a1c78]"
					onclick={handleSave}
				>
					Save Changes
				</button>
			</div>
		</div>
	</div>
{/if}
