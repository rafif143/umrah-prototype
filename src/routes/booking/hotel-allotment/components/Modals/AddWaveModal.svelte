<script>
	import { X } from 'lucide-svelte';

	let { isOpen = $bindable(false), contract, initialData = null, onSave } = $props();

	let waveName = $state('');
	let startDate = $state('');
	let endDate = $state('');
	let rate = $state('');
	let currency = $state('SAR'); // Default SAR

	let contractStartStr = $derived(contract?.contractPeriod?.from || contract?.start || '');
	let contractEndStr = $derived(contract?.contractPeriod?.to || contract?.end || '');

	// Reset form when modal opens
	$effect(() => {
		if (isOpen) {
			if (initialData) {
				waveName = initialData.name;
				startDate = initialData.start;
				endDate = initialData.end;
				rate = initialData.rate || '';
				currency = initialData.currency || 'SAR';
			} else {
				waveName = `Gelombang ${(contract.waves?.length || 0) + 1}`;
				startDate = '';
				endDate = '';
				rate = '';
				currency = 'SAR';
			}
		}
	});

	function handleSubmit() {
		if (!startDate || !endDate) {
			alert('Mohon isi tanggal mulai dan selesai');
			return;
		}

		if (new Date(startDate) > new Date(endDate)) {
			alert('Tanggal selesai harus setelah tanggal mulai');
			return;
		}

		// Validate against contract range
		const cStart = new Date(contractStartStr);
		const cEnd = new Date(contractEndStr);
		const waveStart = new Date(startDate);
		const waveEnd = new Date(endDate);

		if (waveStart < cStart || waveEnd > cEnd) {
			alert(`Tanggal harus berada dalam durasi kontrak: ${contractStartStr} s/d ${contractEndStr}`);
			return;
		}

		onSave({
			id: initialData?.id,
			name: waveName,
			start: startDate,
			end: endDate,
			rate: rate ? parseFloat(rate) : 0,
			currency: currency
		});
		isOpen = false;
	}
</script>

{#if isOpen}
	<div class="modal-backdrop" onclick={() => (isOpen = false)} role="button" tabindex="0">
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div class="modal-content" onclick={(e) => e.stopPropagation()} role="button" tabindex="0">
			<div class="modal-header">
				<h3>{initialData ? 'Edit Gelombang' : 'Tambah Gelombang Baru'}</h3>
				<button class="close-btn" onclick={() => (isOpen = false)}>
					<X size={18} />
				</button>
			</div>

			<div class="modal-body">
				<div class="form-group">
					<label for="wave-name">Nama Gelombang</label>
					<input
						id="wave-name"
						type="text"
						bind:value={waveName}
						placeholder="Contoh: Gelombang 1"
					/>
				</div>

				<div class="form-group">
					<label for="wave-start">Tanggal Mulai (Check-In)</label>
					<input
						id="wave-start"
						type="date"
						bind:value={startDate}
						min={contractStartStr}
						max={contractEndStr}
					/>
				</div>

				<div class="form-group">
					<label for="wave-end">Tanggal Selesai (Check-Out)</label>
					<input
						id="wave-end"
						type="date"
						bind:value={endDate}
						min={startDate || contractStartStr}
						max={contractEndStr}
					/>
				</div>

				<div class="form-group">
					<label for="wave-rate">Rate (Harga per Kamar per Malam)</label>
					<div class="rate-input-wrapper">
						<input
							id="wave-rate"
							type="number"
							bind:value={rate}
							placeholder="0"
							min="0"
							step="0.01"
							class="rate-input"
						/>
						<select bind:value={currency} class="currency-select">
							<option value="USD">USD</option>
							<option value="SAR">SAR</option>
							<option value="MYR">MYR</option>
							<option value="IDR">IDR</option>
						</select>
					</div>
				</div>

				<div class="modal-info">
					<small>Duration Contract: {contractStartStr} s/d {contractEndStr}</small>
				</div>
			</div>

			<div class="modal-footer">
				<button class="btn-cancel" onclick={() => (isOpen = false)}>Batal</button>
				<button class="btn-save" onclick={handleSubmit}>Simpan</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}
	.modal-content {
		background: white;
		width: 400px;
		border-radius: 12px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}
	.modal-header {
		padding: 16px 20px;
		border-bottom: 1px solid #e2e8f0;
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: #f8fafc;
	}
	.modal-header h3 {
		margin: 0;
		font-size: 15px;
		font-weight: 600;
		color: #1e293b;
	}
	.close-btn {
		background: none;
		border: none;
		cursor: pointer;
		color: #64748b;
		padding: 4px;
		border-radius: 4px;
	}
	.close-btn:hover {
		background: #e2e8f0;
		color: #ef4444;
	}
	.modal-body {
		padding: 20px;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.form-group {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.form-group label {
		font-size: 13px;
		font-weight: 500;
		color: #475569;
	}
	.form-group input[type='text'],
	.form-group input[type='date'] {
		padding: 8px 12px;
		border: 1px solid #e2e8f0;
		border-radius: 6px;
		font-size: 13px;
		color: #1e293b;
	}
	.form-group input:focus {
		border-color: #3b82f6;
		outline: none;
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
	}
	.color-picker-wrapper {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 4px;
		border: 1px solid #e2e8f0;
		border-radius: 6px;
		width: fit-content;
	}
	.color-input {
		width: 32px;
		height: 32px;
		padding: 0;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		background: none;
	}
	.color-value {
		font-family: monospace;
		font-size: 13px;
		color: #64748b;
		padding-right: 8px;
	}
	.rate-input-wrapper {
		display: flex;
		gap: 8px;
		align-items: stretch;
	}
	.rate-input {
		flex: 1;
		padding: 8px 12px;
		border: 1px solid #e2e8f0;
		border-radius: 6px;
		font-size: 13px;
		color: #1e293b;
	}
	.rate-input:focus {
		border-color: #3b82f6;
		outline: none;
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
	}
	.currency-select {
		padding: 8px 12px;
		border: 1px solid #e2e8f0;
		border-radius: 6px;
		font-size: 13px;
		color: #1e293b;
		background: white;
		cursor: pointer;
		min-width: 80px;
		font-weight: 600;
	}
	.currency-select:focus {
		border-color: #3b82f6;
		outline: none;
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
	}
	.modal-info {
		padding: 10px;
		background: #f1f5f9;
		border-radius: 6px;
		color: #64748b;
		text-align: center;
		font-size: 12px;
		border: 1px dashed #cbd5e1;
	}
	.modal-footer {
		padding: 16px 20px;
		border-top: 1px solid #e2e8f0;
		display: flex;
		justify-content: flex-end;
		gap: 10px;
		background: #f8fafc;
	}
	.btn-cancel {
		padding: 8px 16px;
		border: 1px solid #e2e8f0;
		background: white;
		border-radius: 6px;
		cursor: pointer;
		font-weight: 500;
		font-size: 13px;
		color: #64748b;
	}
	.btn-cancel:hover {
		background: #f1f5f9;
		color: #1e293b;
	}
	.btn-save {
		padding: 8px 16px;
		background: #3b82f6;
		color: white;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-weight: 500;
		font-size: 13px;
	}
	.btn-save:hover {
		background: #2563eb;
	}
</style>
