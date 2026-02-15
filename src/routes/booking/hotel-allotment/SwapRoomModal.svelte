<script>
	import { fade, scale } from 'svelte/transition';
	import { ArrowRightLeft, Users, AlertTriangle, CheckCircle } from 'lucide-svelte';

	let {
		show = false,
		sourceRoom,
		targetRoom,
		sourceBooking,
		targetBooking,
		typeColors,
		onConfirm,
		onCancel
	} = $props();

	let sourceCap = $derived(typeColors[sourceRoom.type]?.cap || 0);
	let targetCap = $derived(typeColors[targetRoom.type]?.cap || 0);

	let sourceCount = $derived(sourceBooking?.pilgrims?.length || 1); // Default 1 if missing
	let targetCount = $derived(targetBooking?.pilgrims?.length || 1);

	// Validation
	let sourceFitsInTarget = $derived(sourceCount <= targetCap);
	let targetFitsInSource = $derived(targetCount <= sourceCap);
	let hasIssues = $derived(!sourceFitsInTarget || !targetFitsInSource);

	let confirmStep = $state(false); // Two-step confirmation
</script>

{#if show}
	<div
		class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
		transition:fade={{ duration: 200 }}
	>
		<div
			class="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl"
			transition:scale={{ duration: 200, start: 0.95 }}
		>
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-6 py-4">
				<h3 class="flex items-center gap-2 text-lg font-semibold text-gray-900">
					<ArrowRightLeft class="h-5 w-5 text-blue-600" />
					Tukar Alokasi Kamar
				</h3>
				<button class="text-gray-400 hover:text-gray-600" onclick={onCancel}>✕</button>
			</div>

			<div class="p-6">
				{#if !confirmStep}
					<!-- Swap Comparison -->
					<div class="mb-6 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
						<!-- Source Card -->
						<div class="rounded-lg border border-blue-100 bg-blue-50/50 p-4">
							<div class="mb-1 text-xs font-medium tracking-wide text-blue-600 uppercase">
								Kamar Asal
							</div>
							<div class="mb-1 text-2xl font-bold text-gray-900">{sourceRoom.id}</div>
							<div class="mb-4 text-sm text-gray-500">
								{typeColors[sourceRoom.type]?.label} (Kap: {sourceCap})
							</div>

							<div class="rounded border border-gray-200 bg-white p-3 shadow-sm">
								<div class="mb-2 flex items-center gap-2">
									<Users class="h-4 w-4 text-gray-400" />
									<span class="font-medium text-gray-900"
										>{sourceBooking?.applicantName || 'Booking Tanpa Nama'}</span
									>
								</div>
								<div class="mb-2 text-xs text-gray-500">{sourceCount} Jamaah</div>
								<ul class="space-y-1">
									{#each (sourceBooking?.pilgrims || []).slice(0, 3) as p}
										<li class="text-xs text-gray-600">• {p.name}</li>
									{/each}
									{#if (sourceBooking?.pilgrims?.length || 0) > 3}
										<li class="text-xs text-gray-400 italic">
											...dan {(sourceBooking?.pilgrims?.length || 0) - 3} lainnya
										</li>
									{/if}
								</ul>
							</div>

							<!-- Validation for Target Destination -->
							<div
								class="mt-3 flex items-center gap-1.5 text-xs {sourceFitsInTarget
									? 'text-green-600'
									: 'font-bold text-red-600'}"
							>
								{#if sourceFitsInTarget}
									<CheckCircle class="h-3.5 w-3.5" /> Muat di {targetRoom.id}
								{:else}
									<AlertTriangle class="h-3.5 w-3.5" /> Tidak Muat di {targetRoom.id}!
								{/if}
							</div>
						</div>

						<!-- Arrow -->
						<div class="flex flex-col items-center justify-center text-gray-400">
							<ArrowRightLeft class="h-8 w-8" />
						</div>

						<!-- Target Card -->
						<div class="rounded-lg border border-orange-100 bg-orange-50/50 p-4">
							<div class="mb-1 text-xs font-medium tracking-wide text-orange-600 uppercase">
								Kamar Tujuan
							</div>
							<div class="mb-1 text-2xl font-bold text-gray-900">{targetRoom.id}</div>
							<div class="mb-4 text-sm text-gray-500">
								{typeColors[targetRoom.type]?.label} (Kap: {targetCap})
							</div>

							<div class="rounded border border-gray-200 bg-white p-3 shadow-sm">
								<div class="mb-2 flex items-center gap-2">
									<Users class="h-4 w-4 text-gray-400" />
									<span class="font-medium text-gray-900"
										>{targetBooking?.applicantName || 'Booking Tanpa Nama'}</span
									>
								</div>
								<div class="mb-2 text-xs text-gray-500">{targetCount} Jamaah</div>
								<ul class="space-y-1">
									{#each (targetBooking?.pilgrims || []).slice(0, 3) as p}
										<li class="text-xs text-gray-600">• {p.name}</li>
									{/each}
									{#if (targetBooking?.pilgrims?.length || 0) > 3}
										<li class="text-xs text-gray-400 italic">
											...dan {(targetBooking?.pilgrims?.length || 0) - 3} lainnya
										</li>
									{/if}
								</ul>
							</div>

							<!-- Validation for Source Destination -->
							<div
								class="mt-3 flex items-center gap-1.5 text-xs {targetFitsInSource
									? 'text-green-600'
									: 'font-bold text-red-600'}"
							>
								{#if targetFitsInSource}
									<CheckCircle class="h-3.5 w-3.5" /> Muat di {sourceRoom.id}
								{:else}
									<AlertTriangle class="h-3.5 w-3.5" /> Tidak Muat di {sourceRoom.id}!
								{/if}
							</div>
						</div>
					</div>

					{#if hasIssues}
						<div class="mb-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
							<AlertTriangle class="mt-0.5 h-5 w-5 shrink-0" />
							<div>
								<span class="block font-bold">Peringatan Kapasitas!</span>
								Pertukaran ini menyebabkan kapasitas berlebih di salah satu kamar. Apakah Anda yakin ingin
								melanjutkan?
							</div>
						</div>
					{/if}
				{:else}
					<!-- Final Confirmation Step -->
					<div class="py-8 text-center">
						<div
							class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600"
						>
							<ArrowRightLeft class="h-8 w-8" />
						</div>
						<h3 class="mb-2 text-xl font-bold text-gray-900">Konfirmasi Pertukaran</h3>
						<p class="mx-auto max-w-sm text-gray-600">
							Anda akan menukar posisi booking antara kamar <strong>{sourceRoom.id}</strong> dan
							<strong>{targetRoom.id}</strong>.
						</p>
					</div>
				{/if}
			</div>

			<div class="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
				<button
					class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
					onclick={onCancel}
				>
					Batal
				</button>

				{#if !confirmStep}
					<button
						class="focus:ring-opacity-50 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors focus:ring-4 {hasIssues
							? 'bg-red-600 hover:bg-red-700 focus:ring-red-200'
							: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-200'}"
						onclick={() => (confirmStep = true)}
					>
						Lanjutkan
					</button>
				{:else}
					<button
						class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:ring-4 focus:ring-blue-200"
						onclick={onConfirm}
					>
						Ya, Tukar Sekarang
					</button>
				{/if}
			</div>
		</div>
	</div>
{/if}
