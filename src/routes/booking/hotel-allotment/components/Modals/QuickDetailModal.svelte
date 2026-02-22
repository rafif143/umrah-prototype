<script>
	let {
		show = $bindable(),
		quickDetailData,
		quickAddingStaff,
		quickAddStaffInput = $bindable(),
		onUpdateStatus,
		onUpdatePrice,
		onRemoveStaff,
		onToggleAddStaff,
		onAddStaff
	} = $props();
</script>

{#if show && quickDetailData}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		class="fixed inset-0 z-[10100] flex h-screen w-screen items-center justify-center bg-black/50 backdrop-blur-[2px]"
		onclick={() => (show = false)}
	>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div
			class="flex max-h-[80vh] w-[90%] max-w-[500px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
			onclick={(e) => e.stopPropagation()}
		>
			<div
				class="flex items-center justify-between border-b border-gray-200 bg-gradient-to-br from-gray-50 to-white px-5 py-4"
			>
				<h3 class="m-0 text-base font-bold text-gray-900">
					{quickDetailData.details[0]?.type === 'sold' ? '💰 Detail Dijual' : '👨‍✈️ Detail Staff'}
				</h3>
				<button
					class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border-none bg-gray-100 text-base text-gray-500 transition-all hover:bg-gray-200 hover:text-gray-900"
					onclick={() => (show = false)}
				>
					✕
				</button>
			</div>
			<div class="flex-1 overflow-y-auto px-5 py-4">
				<div
					class="mb-4 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5"
				>
					<span class="text-xs font-semibold text-gray-500">Gelombang:</span>
					<span class="text-sm font-bold text-gray-800">{quickDetailData.wave.name}</span>
				</div>

				<div class="flex flex-col gap-3">
					{#each quickDetailData.details as detail}
						<div
							class="rounded-xl border p-3 {detail.type === 'sold'
								? 'border-green-200 bg-green-50/30'
								: 'border-blue-200 bg-blue-50/30'}"
						>
							<div class="mb-3 flex items-center justify-between border-b border-gray-100 pb-3">
								<span class="text-sm font-bold text-gray-900">Kamar {detail.roomId}</span>
								<span
									class="rounded-md px-2 py-[3px] text-[11px] font-semibold {detail.type === 'sold'
										? 'bg-green-100 text-green-700'
										: 'bg-blue-100 text-blue-800'}"
								>
									{detail.type === 'sold' ? '💰 Dijual' : '👨‍✈️ Staff'}
								</span>
							</div>

							<div class="flex flex-col gap-2">
								<div class="flex items-start justify-between gap-3">
									<span class="min-w-[70px] text-xs font-semibold text-gray-500">Check-In:</span>
									<span class="text-right text-xs font-medium text-gray-800"
										>{new Date(detail.checkIn).toLocaleDateString('id-ID', {
											day: 'numeric',
											month: 'short',
											year: 'numeric'
										})}</span
									>
								</div>
								<div class="flex items-start justify-between gap-3">
									<span class="min-w-[70px] text-xs font-semibold text-gray-500">Check-Out:</span>
									<span class="text-right text-xs font-medium text-gray-800"
										>{new Date(detail.checkOut).toLocaleDateString('id-ID', {
											day: 'numeric',
											month: 'short',
											year: 'numeric'
										})}</span
									>
								</div>
								<div class="flex items-start justify-between gap-3">
									<span class="min-w-[70px] text-xs font-semibold text-gray-500">Durasi:</span>
									<span class="text-right text-xs font-medium text-gray-800"
										>{detail.dates.length} malam</span
									>
								</div>

								{#if detail.type === 'sold'}
									<div class="flex items-start justify-between gap-3">
										<span class="min-w-[70px] text-xs font-semibold text-gray-500">Status:</span>
										<select
											class="w-[120px] cursor-pointer rounded border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
											value={detail.data.status || 'available'}
											onchange={(e) => onUpdateStatus(detail.roomId, detail.type, e.target.value)}
										>
											<option value="available">○ Available</option>
											<option value="sold">✓ Sold</option>
										</select>
									</div>
									<div class="flex items-start justify-between gap-3">
										<span class="min-w-[70px] text-xs font-semibold text-gray-500">Harga:</span>
										<input
											type="number"
											class="w-[120px] rounded border border-gray-300 px-2 py-1 text-right text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
											value={detail.data.price || 0}
											placeholder="0"
											oninput={(e) => onUpdatePrice(detail.roomId, detail.type, e.target.value)}
										/>
									</div>
								{:else}
									<div class="flex items-start justify-between gap-3">
										<span class="min-w-[70px] text-xs font-semibold text-gray-500">Staff:</span>
										<div class="flex max-w-[200px] flex-col items-end gap-1.5 break-all">
											{#if detail.data.staffList && detail.data.staffList.length > 0}
												<div class="flex flex-wrap justify-end gap-1.5">
													{#each detail.data.staffList as staff}
														<div
															class="flex items-center gap-1 rounded-md border border-blue-200 bg-blue-100 px-2 py-1"
														>
															<span class="text-xs font-semibold text-blue-800">{staff}</span>
															<button
																class="flex h-4 w-4 cursor-pointer items-center justify-center rounded-full border-none bg-red-500 text-[10px] font-bold text-white transition-all hover:scale-110 hover:bg-red-600"
																onclick={() => onRemoveStaff(detail.roomId, staff)}
																title="Hapus"
															>
																×
															</button>
														</div>
													{/each}
												</div>
											{:else}
												<span class="text-xs text-gray-400 italic">Belum ada staff</span>
											{/if}

											{#if quickAddingStaff === detail.roomId}
												<div class="mt-1 flex gap-1">
													<input
														type="text"
														class="w-[120px] rounded border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
														bind:value={quickAddStaffInput[detail.roomId]}
														placeholder="Nama staff..."
														onkeydown={(e) => e.key === 'Enter' && onAddStaff(detail.roomId)}
													/>
													<button
														class="flex h-6 w-6 cursor-pointer items-center justify-center rounded border-none bg-green-600 text-sm font-bold text-white transition-all hover:scale-110 hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
														onclick={() => onAddStaff(detail.roomId)}
														disabled={!quickAddStaffInput[detail.roomId]?.trim()}
													>
														✓
													</button>
													<button
														class="flex h-6 w-6 cursor-pointer items-center justify-center rounded border-none bg-red-500 text-sm font-bold text-white transition-all hover:scale-110 hover:bg-red-600"
														onclick={() => onToggleAddStaff(detail.roomId)}
													>
														×
													</button>
												</div>
											{:else}
												<button
													class="mt-1 cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-1 text-[11px] font-semibold text-gray-700 shadow-sm transition-colors hover:border-gray-400 hover:bg-gray-50"
													onclick={() => onToggleAddStaff(detail.roomId)}
												>
													+ Add Staff
												</button>
											{/if}
										</div>
									</div>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</div>
			<div class="flex items-center justify-end border-t border-gray-200 bg-gray-50 px-5 py-3">
				<button
					class="cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-100"
					onclick={() => (show = false)}>Tutup</button
				>
			</div>
		</div>
	</div>
{/if}
