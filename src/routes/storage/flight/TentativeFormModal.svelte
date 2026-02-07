<script>
	import { Plus, Plane, X, Check } from 'lucide-svelte';
	import { fly, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { airlineStore } from '$lib/stores/airlineStore.svelte.js';
	import { createEmptySector } from './flightUtils.js';

	let { show = false, booking = null, onClose, onSave } = $props();

	// Internal form state
	let formData = $state({
		name: '',
		sectors: [createEmptySector()],
		notes: ''
	});
	let isEditing = $derived(!!booking);

	// Watch booking prop changes
	$effect(() => {
		if (show) {
			if (booking) {
				formData = {
					name: booking.name || '',
					sectors: booking.sectors?.length
						? booking.sectors.map((s) => ({ ...s }))
						: [createEmptySector()],
					notes: booking.notes || ''
				};
			} else {
				formData = {
					name: '',
					sectors: [createEmptySector()],
					notes: ''
				};
			}
		}
	});

	// Sector functions
	function addSector() {
		formData.sectors = [...formData.sectors, createEmptySector()];
	}

	function removeSector(index) {
		if (formData.sectors.length > 1) {
			formData.sectors = formData.sectors.filter((_, i) => i !== index);
		}
	}

	function handleSubmit() {
		// Validate
		const validSectors = formData.sectors.filter((s) => s.origin && s.destination);

		if (!formData.name || validSectors.length === 0) {
			return;
		}

		const bookingData = {
			name: formData.name,
			sectors: validSectors,
			notes: formData.notes
		};

		onSave(bookingData, booking?.id);
		onClose();
	}
</script>

{#if show}
	<div
		class="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
		transition:fade={{ duration: 200 }}
		onclick={onClose}
		role="dialog"
		aria-modal="true"
		onkeydown={(e) => e.key === 'Escape' && onClose()}
	>
		<!-- Modal -->
		<div
			class="relative z-50 flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
			transition:fly={{ y: 20, duration: 250, easing: cubicOut }}
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
			role="document"
		>
			<!-- Header -->
			<div
				class="flex shrink-0 items-center justify-between border-b border-gray-100 bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4"
			>
				<div>
					<h2 class="text-xl font-bold text-white">
						{isEditing ? 'Edit Tentative' : 'Add Tentative Flight'}
					</h2>
					<p class="text-sm text-orange-100">Create flight sectors for package</p>
				</div>
				<button
					class="rounded-lg p-2 text-white/70 hover:bg-white/20 hover:text-white"
					onclick={onClose}
				>
					<X size={24} />
				</button>
			</div>

			<!-- Form Body -->
			<div class="min-h-0 flex-1 overflow-y-auto p-6">
				<div class="flex flex-col gap-5">
					<!-- Package Name -->
					<div class="flex flex-col gap-1.5">
						<label for="packageName" class="text-[13px] font-medium text-gray-700">
							Package Name <span class="text-red-500">*</span>
						</label>
						<input
							type="text"
							id="packageName"
							placeholder="Enter package name"
							class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
							bind:value={formData.name}
						/>
					</div>

					<!-- Sectors -->
					<div class="flex flex-col gap-3">
						<span class="text-[13px] font-medium text-gray-700">Flight Sectors</span>

						{#each formData.sectors as sector, sIdx}
							<div class="rounded-xl border border-orange-200 bg-orange-50/30 p-4">
								<!-- Sector Header -->
								<div class="mb-3 flex items-center justify-between">
									<div class="flex items-center gap-2">
										<span
											class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600"
											>{sIdx + 1}</span
										>
										<span class="text-sm font-medium text-orange-700">Sector {sIdx + 1}</span>
									</div>
									{#if formData.sectors.length > 1}
										<button
											type="button"
											class="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
											onclick={() => removeSector(sIdx)}
										>
											<X size={14} />
										</button>
									{/if}
								</div>

								<!-- Origin & Destination -->
								<div class="mb-3 grid grid-cols-2 gap-3">
									<div class="flex flex-col gap-1">
										<label class="text-xs font-medium text-gray-500">Origin *</label>
										<select
											class="rounded-lg border border-gray-200 px-3 py-2 text-sm transition-shadow outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
											bind:value={formData.sectors[sIdx].origin}
										>
											<option value="">Select</option>
											{#each airlineStore.airports as airport}
												<option value={airport.code}>{airport.city} ({airport.code})</option>
											{/each}
										</select>
									</div>
									<div class="flex flex-col gap-1">
										<label class="text-xs font-medium text-gray-500">Destination *</label>
										<select
											class="rounded-lg border border-gray-200 px-3 py-2 text-sm transition-shadow outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
											bind:value={formData.sectors[sIdx].destination}
										>
											<option value="">Select</option>
											{#each airlineStore.airports as airport}
												<option value={airport.code}>{airport.city} ({airport.code})</option>
											{/each}
										</select>
									</div>
								</div>

								<!-- Date, Time, Seat -->
								<div class="grid grid-cols-3 gap-2">
									<div class="flex flex-col gap-1">
										<label class="text-xs font-medium text-gray-500">Date</label>
										<input
											type="date"
											class="rounded-lg border border-gray-200 px-2.5 py-2 text-sm transition-shadow outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
											bind:value={formData.sectors[sIdx].departureDate}
										/>
									</div>
									<div class="flex flex-col gap-1">
										<label class="text-xs font-medium text-gray-500">Time</label>
										<input
											type="time"
											class="rounded-lg border border-gray-200 px-2.5 py-2 text-sm transition-shadow outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
											bind:value={formData.sectors[sIdx].departureTime}
										/>
									</div>
									<div class="flex flex-col gap-1">
										<label class="text-xs font-medium text-gray-500">Seat</label>
										<input
											type="text"
											placeholder="45"
											class="rounded-lg border border-gray-200 px-2.5 py-2 text-sm transition-shadow outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
											bind:value={formData.sectors[sIdx].seat}
										/>
									</div>
								</div>
							</div>
						{/each}

						<!-- Add Sector Button -->
						<button
							type="button"
							class="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-orange-300 py-3 text-sm font-medium text-orange-600 transition-colors hover:bg-orange-50"
							onclick={addSector}
						>
							<Plus size={16} />
							Add Sector
						</button>
					</div>

					<!-- Notes -->
					<div class="flex flex-col gap-1.5">
						<label for="notes" class="text-[13px] font-medium text-gray-700">Notes / Remarks</label>
						<textarea
							id="notes"
							rows="2"
							placeholder="Optional notes..."
							class="resize-none rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
							bind:value={formData.notes}
						></textarea>
					</div>
				</div>
			</div>

			<!-- Footer -->
			<div class="flex shrink-0 items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
				<button
					class="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
					onclick={onClose}
				>
					Cancel
				</button>
				<button
					class="flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-orange-600 hover:shadow-md"
					onclick={handleSubmit}
				>
					<Check size={16} />
					{isEditing ? 'Update' : 'Save Tentative'}
				</button>
			</div>
		</div>
	</div>
{/if}
