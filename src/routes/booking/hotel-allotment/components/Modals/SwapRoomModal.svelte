<script>
	import { fade, scale } from 'svelte/transition';
	import {
		ArrowRightLeft,
		Users,
		AlertTriangle,
		CheckCircle,
		BedDouble,
		UserMinus
	} from 'lucide-svelte';
	import { getRoomTypeForWave } from '../GridView/parts/roomTypeHelpers.js';

	let {
		show = false,
		sourceRoom,
		targetRoom,
		sourceBooking,
		targetBooking,
		typeColors,
		mode = 'swap', // 'swap' | 'move'
		waveId = null,
		activeWave = null,
		contract = null,
		onConfirm,
		onCancel
	} = $props();

	// Get effective room types for the wave
	let sourceRoomType = $derived.by(() => {
		if (!sourceRoom || !activeWave) return sourceRoom?.originalType || 'double';
		return getRoomTypeForWave(sourceRoom, activeWave);
	});
	
	let targetRoomType = $derived.by(() => {
		if (!targetRoom || !activeWave) return targetRoom?.originalType || 'double';
		return getRoomTypeForWave(targetRoom, activeWave);
	});

	// Current state
	let sourceCap = $derived(typeColors[sourceRoomType]?.cap || 0);
	let targetCap = $derived(typeColors[targetRoomType]?.cap || 0);
	let sourceCount = $derived(sourceBooking?.pilgrims?.length || 0);
	let targetCount = $derived(targetBooking?.pilgrims?.length || 0);

	// After swap: source gets target's people, target gets source's people
	let sourceAfterCount = $derived(targetCount); // target people move to source room
	let targetAfterCount = $derived(sourceCount); // source people move to target room

	let sourceEmptyBeds = $derived(Math.max(0, sourceCap - sourceAfterCount));
	let sourceOverflow = $derived(Math.max(0, sourceAfterCount - sourceCap));
	let targetEmptyBeds = $derived(Math.max(0, targetCap - targetAfterCount));
	let targetOverflow = $derived(Math.max(0, targetAfterCount - targetCap));

	let hasIssues = $derived(sourceOverflow > 0 || targetOverflow > 0);

	let confirmStep = $state(false);

	$effect(() => {
		if (show) confirmStep = false;
	});
</script>

{#if show}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="swap-overlay"
		transition:fade={{ duration: 200 }}
		onclick={onCancel}
		onkeydown={() => {}}
	>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="swap-modal"
			transition:scale={{ duration: 200, start: 0.95 }}
			onclick={(e) => e.stopPropagation()}
			onkeydown={() => {}}
		>
			<!-- Header -->
			<div class="swap-header">
				<h3 class="swap-title">
					<ArrowRightLeft size={18} />
					{mode === 'move' ? 'Pindah Alokasi Kamar' : 'Tukar Alokasi Kamar'}
				</h3>
				<button class="swap-close" onclick={onCancel}>✕</button>
			</div>

			<div class="swap-body">
				{#if !confirmStep}
					<!-- Comparison Grid -->
					<div class="swap-grid">
						<!-- Source Card -->
						<div class="room-card source">
							<div class="room-card-label">Kamar Asal</div>
							<div class="room-card-id">{sourceRoom?.id}</div>
							<div class="room-card-type">
								{typeColors[sourceRoomType]?.label || sourceRoomType} · Kap: {sourceCap}
							</div>

							<!-- Current occupants -->
							<div class="occupant-box">
								<div class="occupant-header">
									<Users size={13} />
									<span>{sourceCount} Jamaah Saat Ini</span>
								</div>
								<ul class="occupant-list">
									{#each sourceBooking?.pilgrims || [] as p, i}
										{#if i < 5}
											<li>• {p.name}</li>
										{/if}
									{/each}
									{#if sourceCount > 5}
										<li class="more">...dan {sourceCount - 5} lainnya</li>
									{/if}
									{#if sourceCount === 0}
										<li class="empty-note">Tidak ada penghuni</li>
									{/if}
								</ul>
							</div>

							<!-- After swap analysis -->
							<div class="after-swap">
								<div class="after-swap-title">Setelah Swap</div>
								<div class="after-swap-detail">
									<span class="after-count">{sourceAfterCount} / {sourceCap}</span>
									<span class="after-label">jamaah</span>
								</div>
								{#if sourceEmptyBeds > 0}
									<div class="bed-status ok">
										<BedDouble size={12} />
										{sourceEmptyBeds} bed kosong
									</div>
								{/if}
								{#if sourceOverflow > 0}
									<div class="bed-status overflow">
										<UserMinus size={12} />
										{sourceOverflow} tidak dapat bed (overflow)
									</div>
								{/if}
								{#if sourceEmptyBeds === 0 && sourceOverflow === 0}
									<div class="bed-status ok">
										<CheckCircle size={12} />
										Pas penuh
									</div>
								{/if}
							</div>

							<!-- Fit check -->
							<div class="fit-check {sourceOverflow > 0 ? 'bad' : 'good'}">
								{#if sourceOverflow > 0}
									<AlertTriangle size={13} />
									Overflow {sourceOverflow} orang
								{:else}
									<CheckCircle size={13} />
									Aman
								{/if}
							</div>
						</div>

						<!-- Arrow -->
						<div class="swap-arrow">
							<ArrowRightLeft size={28} />
						</div>

						<!-- Target Card -->
						<div class="room-card target">
							<div class="room-card-label">Kamar Tujuan</div>
							<div class="room-card-id">{targetRoom?.id}</div>
							<div class="room-card-type">
								{typeColors[targetRoomType]?.label || targetRoomType} · Kap: {targetCap}
							</div>

							<!-- Current occupants -->
							<div class="occupant-box">
								<div class="occupant-header">
									<Users size={13} />
									<span>{targetCount} Jamaah Saat Ini</span>
								</div>
								<ul class="occupant-list">
									{#each targetBooking?.pilgrims || [] as p, i}
										{#if i < 5}
											<li>• {p.name}</li>
										{/if}
									{/each}
									{#if targetCount > 5}
										<li class="more">...dan {targetCount - 5} lainnya</li>
									{/if}
									{#if targetCount === 0}
										<li class="empty-note">Tidak ada penghuni</li>
									{/if}
								</ul>
							</div>

							<!-- After swap analysis -->
							<div class="after-swap">
								<div class="after-swap-title">Setelah Swap</div>
								<div class="after-swap-detail">
									<span class="after-count">{targetAfterCount} / {targetCap}</span>
									<span class="after-label">jamaah</span>
								</div>
								{#if targetEmptyBeds > 0}
									<div class="bed-status ok">
										<BedDouble size={12} />
										{targetEmptyBeds} bed kosong
									</div>
								{/if}
								{#if targetOverflow > 0}
									<div class="bed-status overflow">
										<UserMinus size={12} />
										{targetOverflow} tidak dapat bed (overflow)
									</div>
								{/if}
								{#if targetEmptyBeds === 0 && targetOverflow === 0}
									<div class="bed-status ok">
										<CheckCircle size={12} />
										Pas penuh
									</div>
								{/if}
							</div>

							<!-- Fit check -->
							<div class="fit-check {targetOverflow > 0 ? 'bad' : 'good'}">
								{#if targetOverflow > 0}
									<AlertTriangle size={13} />
									Overflow {targetOverflow} orang
								{:else}
									<CheckCircle size={13} />
									Aman
								{/if}
							</div>
						</div>
					</div>

					<!-- Warning banner -->
					{#if hasIssues}
						<div class="warning-banner">
							<AlertTriangle size={16} />
							<div>
								<strong>Peringatan Kapasitas!</strong>
								Pertukaran ini menyebabkan overflow di salah satu kamar. Jamaah yang melebihi kapasitas
								akan berstatus <strong>not allocated bed</strong>.
							</div>
						</div>
					{/if}
				{:else}
					<!-- Final Confirmation -->
					<div class="confirm-step">
						<div class="confirm-icon">
							<ArrowRightLeft size={28} />
						</div>
						<h3 class="confirm-title">
							Konfirmasi {mode === 'move' ? 'Perpindahan' : 'Pertukaran'}
						</h3>
						<p class="confirm-text">
							{mode === 'move' ? 'Pindahkan' : 'Tukar'} <strong>{sourceRoom?.id}</strong>
							({sourceCount} jamaah)
							{mode === 'move' ? 'ke' : '↔'}
							<strong>{targetRoom?.id}</strong> ({targetCount} jamaah)?
						</p>
						{#if hasIssues}
							<p class="confirm-warning">
								⚠️ Ada {sourceOverflow + targetOverflow} jamaah yang akan overflow (tidak mendapat bed).
							</p>
						{/if}
					</div>
				{/if}
			</div>

			<!-- Footer -->
			<div class="swap-footer">
				<button class="btn-cancel" onclick={onCancel}>Batal</button>
				{#if !confirmStep}
					<button
						class="btn-proceed {hasIssues ? 'danger' : ''}"
						onclick={() => (confirmStep = true)}
					>
						{hasIssues ? '⚠️ Lanjutkan Tetap Swap' : 'Lanjutkan'}
					</button>
				{:else}
					<button class="btn-proceed" onclick={onConfirm}>
						Ya, {mode === 'move' ? 'Pindah' : 'Tukar'} Sekarang
					</button>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.swap-overlay {
		position: fixed;
		inset: 0;
		z-index: 60;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(4px);
		padding: 16px;
	}
	.swap-modal {
		width: 100%;
		max-width: 680px;
		background: white;
		border-radius: 14px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
		overflow: hidden;
		font-family:
			'Inter',
			-apple-system,
			system-ui,
			sans-serif;
	}
	.swap-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px 20px;
		background: linear-gradient(135deg, #0f172a, #1e293b);
		color: white;
	}
	.swap-title {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 15px;
		font-weight: 700;
		margin: 0;
	}
	.swap-close {
		background: rgba(255, 255, 255, 0.1);
		border: none;
		color: white;
		width: 28px;
		height: 28px;
		border-radius: 6px;
		cursor: pointer;
		font-size: 14px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.swap-close:hover {
		background: rgba(255, 255, 255, 0.2);
	}
	.swap-body {
		padding: 20px;
	}
	.swap-grid {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		gap: 16px;
		align-items: stretch;
	}
	.swap-arrow {
		display: flex;
		align-items: center;
		justify-content: center;
		color: #94a3b8;
	}
	.room-card {
		border-radius: 10px;
		padding: 14px;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.room-card.source {
		background: #eff6ff;
		border: 1px solid #bfdbfe;
	}
	.room-card.target {
		background: #fff7ed;
		border: 1px solid #fed7aa;
	}
	.room-card-label {
		font-size: 10px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}
	.source .room-card-label {
		color: #2563eb;
	}
	.target .room-card-label {
		color: #ea580c;
	}
	.room-card-id {
		font-size: 22px;
		font-weight: 800;
		color: #0f172a;
	}
	.room-card-type {
		font-size: 11px;
		color: #64748b;
		margin-bottom: 6px;
	}
	.occupant-box {
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		padding: 10px;
	}
	.occupant-header {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 11px;
		font-weight: 600;
		color: #334155;
		margin-bottom: 6px;
	}
	.occupant-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	.occupant-list li {
		font-size: 11px;
		color: #475569;
		padding: 1px 0;
	}
	.occupant-list li.more {
		color: #94a3b8;
		font-style: italic;
		font-size: 10px;
	}
	.occupant-list li.empty-note {
		color: #94a3b8;
		font-style: italic;
		font-size: 10px;
	}

	/* After swap analysis */
	.after-swap {
		background: #f8fafc;
		border: 1px dashed #cbd5e1;
		border-radius: 8px;
		padding: 10px;
		margin-top: 4px;
	}
	.after-swap-title {
		font-size: 9px;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: #94a3b8;
		margin-bottom: 6px;
	}
	.after-swap-detail {
		display: flex;
		align-items: baseline;
		gap: 4px;
		margin-bottom: 6px;
	}
	.after-count {
		font-size: 16px;
		font-weight: 800;
		color: #0f172a;
	}
	.after-label {
		font-size: 10px;
		color: #94a3b8;
	}
	.bed-status {
		display: flex;
		align-items: center;
		gap: 5px;
		font-size: 11px;
		font-weight: 600;
		padding: 3px 0;
	}
	.bed-status.ok {
		color: #16a34a;
	}
	.bed-status.overflow {
		color: #dc2626;
	}

	.fit-check {
		display: flex;
		align-items: center;
		gap: 5px;
		font-size: 11px;
		font-weight: 700;
		padding: 6px 10px;
		border-radius: 6px;
		margin-top: 4px;
	}
	.fit-check.good {
		background: #f0fdf4;
		color: #16a34a;
		border: 1px solid #bbf7d0;
	}
	.fit-check.bad {
		background: #fef2f2;
		color: #dc2626;
		border: 1px solid #fecaca;
	}

	/* Warning banner */
	.warning-banner {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		margin-top: 16px;
		padding: 12px 14px;
		background: #fef2f2;
		border: 1px solid #fecaca;
		border-radius: 10px;
		font-size: 12px;
		color: #991b1b;
		line-height: 1.5;
	}
	.warning-banner strong {
		font-weight: 700;
		display: block;
		margin-bottom: 2px;
	}

	/* Confirm step */
	.confirm-step {
		text-align: center;
		padding: 28px 0;
	}
	.confirm-icon {
		width: 56px;
		height: 56px;
		border-radius: 50%;
		background: #eff6ff;
		color: #2563eb;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 14px;
	}
	.confirm-title {
		font-size: 18px;
		font-weight: 700;
		color: #0f172a;
		margin: 0 0 8px;
	}
	.confirm-text {
		font-size: 13px;
		color: #64748b;
		margin: 0;
	}
	.confirm-warning {
		font-size: 12px;
		color: #dc2626;
		margin-top: 10px;
		font-weight: 600;
	}

	/* Footer */
	.swap-footer {
		display: flex;
		justify-content: flex-end;
		gap: 10px;
		padding: 14px 20px;
		border-top: 1px solid #f1f5f9;
		background: #f8fafc;
	}
	.btn-cancel {
		padding: 8px 16px;
		border-radius: 8px;
		border: 1px solid #d1d5db;
		background: white;
		font-size: 13px;
		font-weight: 500;
		color: #374151;
		cursor: pointer;
	}
	.btn-cancel:hover {
		background: #f9fafb;
	}
	.btn-proceed {
		padding: 8px 16px;
		border-radius: 8px;
		border: none;
		background: #2563eb;
		font-size: 13px;
		font-weight: 600;
		color: white;
		cursor: pointer;
		transition: background 0.15s;
	}
	.btn-proceed:hover {
		background: #1d4ed8;
	}
	.btn-proceed.danger {
		background: #dc2626;
	}
	.btn-proceed.danger:hover {
		background: #b91c1c;
	}
</style>
