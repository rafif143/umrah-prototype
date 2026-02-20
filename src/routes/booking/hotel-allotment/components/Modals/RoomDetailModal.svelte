<script>
	import {
		X,
		ChevronDown,
		User,
		FileText,
		Globe,
		Palette,
		Briefcase,
		AlertTriangle
	} from 'lucide-svelte';
	import { fade, scale, slide } from 'svelte/transition';
	import { getRoomTypeForWave } from '../GridView/parts/roomTypeHelpers.js';

	let {
		show = false,
		room = null,
		isOccupied = false,
		activeWave = null,
		onClose,
		onSave
	} = $props();

	let selectedColor = $state(''); // For Room Color in this wave
	let customColorInput = $state('');
	let showCustomColorPicker = $state(false);
	
	// Color picker state
	let hue = $state(0);
	let saturation = $state(100);
	let lightness = $state(50);
	let pickerCanvas;
	let pickerCtx;
	let isDraggingPicker = $state(false);
	let isDraggingHue = $state(false);

	// Get effective type for this wave (derived, not state)
	let selectedType = $derived.by(() => {
		if (!show || !room || !activeWave) return 'double';
		return getRoomTypeForWave(room, activeWave);
	});

	// Mutable selected type for editing
	let editedType = $state('');

	const typeOptions = [
		{ value: 'quint', label: 'Quint', cap: 5 },
		{ value: 'quad', label: 'Quad', cap: 4 },
		{ value: 'triple', label: 'Triple', cap: 3 },
		{ value: 'double', label: 'Double', cap: 2 }
	];

	const colorOptions = [
		'#ef4444', // Red
		'#f97316', // Orange
		'#eab308', // Yellow
		'#22c55e', // Green
		'#06b6d4', // Cyan
		'#3b82f6', // Blue
		'#a855f7', // Purple
		'#ec4899', // Pink
		'#64748b' // Slate
	];

	let openGuestIndex = $state(0);
	let isInitializing = $state(false);

	function toggleGuest(index) {
		openGuestIndex = openGuestIndex === index ? -1 : index;
	}

	// Get Real Guests from activeWave
	let guests = $derived.by(() => {
		if (!show || !room || !activeWave || !activeWave.jamaah) return [];
		return activeWave.jamaah.filter((j) => j.roomId === room.id);
	});

	// Track when modal opens (show changes from false to true)
	let prevShow = $state(false);
	$effect(() => {
		if (show && !prevShow) {
			// Modal just opened - initialize
			isInitializing = true;
		}
		prevShow = show;
	});

	$effect(() => {
		if (show && room && activeWave && isInitializing) {
			// Initialize edited type from effective type
			editedType = getRoomTypeForWave(room, activeWave);
			openGuestIndex = 0;
			
			// Get room color for this wave (from roomColors map)
			const roomColors = activeWave.roomColors || {};
			let defaultColor = '#3b82f6';
			
			// Extract color from wave.color (could be string or object)
			if (activeWave.color) {
				if (typeof activeWave.color === 'string') {
					defaultColor = activeWave.color;
				} else if (activeWave.color.bg) {
					defaultColor = activeWave.color.bg;
				}
			}
			
			selectedColor = roomColors[room.id] || defaultColor;
			customColorInput = selectedColor;
			
			// Parse color to HSL
			const hsl = hexToHSL(selectedColor);
			hue = hsl.h;
			saturation = hsl.s;
			lightness = hsl.l;
			
			showCustomColorPicker = false;
			
			// Initialize canvas
			if (pickerCanvas) {
				drawColorPicker();
			}
			
			// Done initializing
			isInitializing = false;
		}
	});
	
	function hexToHSL(hex) {
		// Convert hex to RGB
		const r = parseInt(hex.slice(1, 3), 16) / 255;
		const g = parseInt(hex.slice(3, 5), 16) / 255;
		const b = parseInt(hex.slice(5, 7), 16) / 255;
		
		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		let h, s, l = (max + min) / 2;
		
		if (max === min) {
			h = s = 0;
		} else {
			const d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			
			switch (max) {
				case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
				case g: h = ((b - r) / d + 2) / 6; break;
				case b: h = ((r - g) / d + 4) / 6; break;
			}
		}
		
		return { h: h * 360, s: s * 100, l: l * 100 };
	}
	
	function hslToHex(h, s, l) {
		s /= 100;
		l /= 100;
		
		const c = (1 - Math.abs(2 * l - 1)) * s;
		const x = c * (1 - Math.abs((h / 60) % 2 - 1));
		const m = l - c / 2;
		let r = 0, g = 0, b = 0;
		
		if (0 <= h && h < 60) {
			r = c; g = x; b = 0;
		} else if (60 <= h && h < 120) {
			r = x; g = c; b = 0;
		} else if (120 <= h && h < 180) {
			r = 0; g = c; b = x;
		} else if (180 <= h && h < 240) {
			r = 0; g = x; b = c;
		} else if (240 <= h && h < 300) {
			r = x; g = 0; b = c;
		} else if (300 <= h && h < 360) {
			r = c; g = 0; b = x;
		}
		
		const toHex = (n) => {
			const hex = Math.round((n + m) * 255).toString(16);
			return hex.length === 1 ? '0' + hex : hex;
		};
		
		return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
	}
	
	function drawColorPicker() {
		if (!pickerCanvas) return;
		pickerCtx = pickerCanvas.getContext('2d');
		const width = pickerCanvas.width;
		const height = pickerCanvas.height;
		
		// Draw saturation-lightness gradient
		// Base color from hue
		pickerCtx.fillStyle = `hsl(${hue}, 100%, 50%)`;
		pickerCtx.fillRect(0, 0, width, height);
		
		// White gradient (left to right)
		const whiteGrad = pickerCtx.createLinearGradient(0, 0, width, 0);
		whiteGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
		whiteGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
		pickerCtx.fillStyle = whiteGrad;
		pickerCtx.fillRect(0, 0, width, height);
		
		// Black gradient (top to bottom)
		const blackGrad = pickerCtx.createLinearGradient(0, 0, 0, height);
		blackGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
		blackGrad.addColorStop(1, 'rgba(0, 0, 0, 1)');
		pickerCtx.fillStyle = blackGrad;
		pickerCtx.fillRect(0, 0, width, height);
	}
	
	function handlePickerMouseDown(e) {
		isDraggingPicker = true;
		updatePickerColor(e);
	}
	
	function handlePickerMouseMove(e) {
		if (!isDraggingPicker) return;
		updatePickerColor(e);
	}
	
	function handlePickerMouseUp() {
		isDraggingPicker = false;
	}
	
	function updatePickerColor(e) {
		const rect = pickerCanvas.getBoundingClientRect();
		const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
		const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
		
		// Calculate saturation and lightness from position
		saturation = (x / rect.width) * 100;
		lightness = 100 - (y / rect.height) * 100;
		
		updateColor();
	}
	
	function handleHueMouseDown(e) {
		isDraggingHue = true;
		updateHue(e);
	}
	
	function handleHueMouseMove(e) {
		if (!isDraggingHue) return;
		updateHue(e);
	}
	
	function handleHueMouseUp() {
		isDraggingHue = false;
	}
	
	function updateHue(e) {
		const rect = e.currentTarget.getBoundingClientRect();
		const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
		hue = (x / rect.width) * 360;
		
		drawColorPicker();
		updateColor();
	}
	
	function updateColor() {
		selectedColor = hslToHex(hue, saturation, lightness);
		customColorInput = selectedColor;
		console.log('updateColor called:', { hue, saturation, lightness, selectedColor });
	}
	
	$effect(() => {
		if (showCustomColorPicker && pickerCanvas) {
			drawColorPicker();
		}
	});

	function applyCustomColor() {
		if (customColorInput && /^#[0-9A-F]{6}$/i.test(customColorInput)) {
			selectedColor = customColorInput;
			showCustomColorPicker = false;
		}
	}

	let capacityWarning = $derived.by(() => {
		if (!editedType) return null;
		const newTypeConfig = typeOptions.find((t) => t.value === editedType);
		const newCap = newTypeConfig ? newTypeConfig.cap : 0;
		const currentCount = guests.length;

		if (currentCount > newCap) {
			return {
				title: 'Kapasitas Melampaui Batas',
				message: `Kamar ini memiliki ${currentCount} jamaah, tapi tipe ${newTypeConfig.label} hanya muat ${newCap} orang.`,
				type: 'error'
			};
		}
		return null;
	});

	// Bed analysis - use selectedType (effective type) for display
	let currentCap = $derived(typeOptions.find((t) => t.value === selectedType)?.cap || 0);
	let emptyBeds = $derived(Math.max(0, currentCap - guests.length));
	let overflowBeds = $derived(Math.max(0, guests.length - currentCap));

	function handleSave() {
		if (onSave && room) {
			// Ensure color is a string hex, not object
			let colorToSave = selectedColor;
			if (typeof selectedColor === 'object' && selectedColor?.bg) {
				colorToSave = selectedColor.bg;
			}
			
			console.log('RoomDetailModal handleSave:', {
				selectedColor,
				colorToSave,
				customColorInput,
				roomId: room.id,
				type: editedType
			});
			
			onSave({
				id: room.id,
				type: editedType,
				roomColor: colorToSave
			});
		}
	}

	function handleClose() {
		if (onClose) onClose();
	}
</script>

{#if show}
	<!-- Backdrop -->
	<div
		class="fixed inset-0 z-[10100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
		transition:fade={{ duration: 200 }}
		onclick={handleClose}
		role="dialog"
		tabindex="-1"
		onkeydown={() => {}}
	>
		<!-- Modal -->
		<div
			class="relative flex max-h-[85vh] w-full max-w-sm flex-col rounded-xl bg-white shadow-2xl"
			transition:scale={{ duration: 200, start: 0.95 }}
			onclick={(e) => e.stopPropagation()}
			role="document"
			tabindex="-1"
			onkeydown={() => {}}
		>
			<!-- Header -->
			<div
				class="flex flex-shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4"
			>
				<div>
					<h3 class="font-semibold text-gray-900">Room {room?.id}</h3>
					<p class="mt-0.5 text-xs text-gray-500">
						{isOccupied ? 'Occupied' : 'Empty'} · {room?.originalType?.toUpperCase()}
						{#if room?.originalType !== editedType}
							<span class="font-medium text-orange-500">→ {editedType?.toUpperCase()}</span>
						{/if}
					</p>
				</div>
				<button
					class="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
					onclick={handleClose}
				>
					<X size={18} />
				</button>
			</div>

			<!-- Content -->
			<div class="custom-scrollbar flex-1 overflow-y-auto p-0">
				<!-- Package Info (Wave Level) -->
				{#if activeWave}
					<div class="border-b border-blue-100 bg-blue-50/50 px-5 py-3">
						<div class="flex items-start gap-3">
							<div class="mt-0.5 text-blue-500">
								<Briefcase size={14} />
							</div>
							<div>
								<h4 class="text-xs font-semibold tracking-wide text-blue-900 uppercase">
									Package Info
								</h4>
								<p class="mt-0.5 text-sm font-medium text-blue-800">
									{activeWave.tripName || 'No Package Name'}
								</p>
								<p class="mt-0.5 text-[10px] text-blue-600">Wave: {activeWave.name}</p>
							</div>
						</div>
					</div>
				{/if}

				{#if capacityWarning}
					<div
						class="mx-5 mt-4 rounded-lg border border-red-200 bg-red-50 p-3 shadow-sm"
						transition:slide
					>
						<h4 class="mb-1 flex items-center gap-1.5 text-xs font-bold text-red-800">
							<AlertTriangle size={14} />
							{capacityWarning.title}
						</h4>
						<p class="text-[11px] leading-relaxed text-red-600">
							{capacityWarning.message}
						</p>
						<p class="mt-2 text-[10px] font-semibold tracking-wider text-red-700 uppercase">
							⚠️ Tetap simpan? Perubahan akan berdampak pada manifest.
						</p>
					</div>
				{/if}

				{#if isOccupied && guests.length > 0}
					<!-- Guest List -->
					<div class="p-5 pb-2">
						<h4 class="mb-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">
							Guest Information ({guests.length})
						</h4>

						<!-- Bed Status Summary -->
						<div
							class="mb-3 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5"
						>
							<div class="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
								<span>{guests.length} / {currentCap}</span>
								<span class="text-gray-400">terisi</span>
							</div>
							<div class="h-3 w-px bg-gray-200"></div>
							{#if emptyBeds > 0}
								<div class="flex items-center gap-1 text-xs font-semibold text-green-600">
									🛏️ {emptyBeds} bed kosong
								</div>
							{/if}
							{#if overflowBeds > 0}
								<div class="flex items-center gap-1 text-xs font-bold text-red-600">
									⚠️ {overflowBeds} not allocated bed
								</div>
							{/if}
							{#if emptyBeds === 0 && overflowBeds === 0}
								<div class="flex items-center gap-1 text-xs font-semibold text-blue-600">
									✅ Full
								</div>
							{/if}
						</div>
						<div class="space-y-2">
							{#each guests as guest, i}
								<div
									class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all {openGuestIndex ===
									i
										? 'border-[#972395] ring-1 ring-[#972395]'
										: ''}"
								>
									<button
										class="flex w-full items-center justify-between bg-gray-50 px-4 py-3 text-left transition-colors hover:bg-gray-100"
										onclick={() => toggleGuest(i)}
									>
										<div class="flex items-center gap-3">
											<div
												class="flex h-8 w-8 items-center justify-center rounded-full bg-[#972395]/10 text-[#972395]"
											>
												<User size={14} />
											</div>
											<div>
												<div class="text-sm font-medium text-gray-900">{guest.name}</div>
												<div class="text-[10px] text-gray-500">Gender: {guest.gender}</div>
											</div>
										</div>
										<ChevronDown
											size={16}
											class="text-gray-400 transition-transform duration-200 {openGuestIndex === i
												? 'rotate-180'
												: ''}"
										/>
									</button>

									{#if openGuestIndex === i}
										<div
											transition:slide={{ duration: 200 }}
											class="border-t border-gray-100 bg-white px-4 py-3"
										>
											<div class="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
												<div class="col-span-2">
													<span class="mb-0.5 block text-gray-400">ID / Passport</span>
													<span class="font-medium text-gray-700">{guest.id}</span>
												</div>
											</div>
										</div>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				{:else}
					<div class="p-8 text-center">
						<div
							class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400"
						>
							<User size={20} />
						</div>
						<h3 class="text-sm font-medium text-gray-900">Room Empty</h3>
						<p class="mt-1 text-xs text-gray-500">No guests assigned to this room yet.</p>
					</div>
				{/if}

				<!-- Room Configuration -->
				<div class="border-t border-gray-100 bg-gray-50/50 p-5 pt-4">
					<!-- Room Color Settings -->
					<div class="mb-5">
						<div
							class="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-gray-500 uppercase"
						>
							<Palette size={12} />
							Room Color Setting
						</div>
						<div class="flex flex-wrap gap-2">
							{#each colorOptions as color}
								<button
									class="h-8 w-8 rounded-full border-2 transition-transform hover:scale-110"
									style="background-color: {color}; border-color: {selectedColor === color
										? '#000'
										: 'transparent'}"
									onclick={() => {
										selectedColor = color;
										customColorInput = color;
									}}
									title={color}
								></button>
							{/each}
							<!-- Custom Color Button -->
							<button
								class="h-8 w-8 rounded-full border-2 border-dashed border-gray-300 bg-white flex items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-all"
								onclick={() => (showCustomColorPicker = !showCustomColorPicker)}
								title="Custom Color"
							>
								<Palette size={14} />
							</button>
						</div>
						
						{#if showCustomColorPicker}
							<div class="mt-3 rounded-lg border border-gray-200 bg-white p-4" transition:slide={{ duration: 200 }}>
								<!-- Color Picker Canvas -->
								<div class="mb-3">
									<div class="relative">
										<canvas
											bind:this={pickerCanvas}
											width="280"
											height="200"
											class="w-full rounded-lg cursor-crosshair border border-gray-200"
											onpointerdown={handlePickerMouseDown}
											onpointermove={handlePickerMouseMove}
											onpointerup={handlePickerMouseUp}
											onpointerleave={handlePickerMouseUp}
										></canvas>
										<!-- Picker indicator -->
										<div
											class="absolute w-5 h-5 border-2 border-white rounded-full pointer-events-none shadow-lg"
											style="
												left: {(saturation / 100) * 100}%;
												top: {(1 - lightness / 100) * 100}%;
												transform: translate(-50%, -50%);
												background: {selectedColor};
											"
										></div>
									</div>
								</div>
								
								<!-- Hue Slider -->
								<div class="mb-3">
									<div
										class="relative h-8 rounded-lg cursor-pointer"
										style="background: linear-gradient(to right, 
											#ff0000 0%, 
											#ffff00 17%, 
											#00ff00 33%, 
											#00ffff 50%, 
											#0000ff 67%, 
											#ff00ff 83%, 
											#ff0000 100%
										);"
										onpointerdown={handleHueMouseDown}
										onpointermove={handleHueMouseMove}
										onpointerup={handleHueMouseUp}
										onpointerleave={handleHueMouseUp}
										role="slider"
										tabindex="0"
										aria-label="Hue slider"
									>
										<!-- Hue indicator -->
										<div
											class="absolute top-1/2 w-4 h-4 bg-white border-2 border-gray-800 rounded-full pointer-events-none shadow-lg"
											style="
												left: {(hue / 360) * 100}%;
												transform: translate(-50%, -50%);
											"
										></div>
									</div>
								</div>
								
								<!-- Color Preview & Hex Input -->
								<div class="flex gap-3 items-center">
									<div
										class="w-16 h-16 rounded-lg border-2 border-gray-200 shadow-sm flex-shrink-0"
										style="background: {selectedColor};"
									></div>
									<div class="flex-1">
										<label class="block text-xs font-medium text-gray-700 mb-1.5">Hex Color</label>
										<input
											type="text"
											bind:value={customColorInput}
											placeholder="#3b82f6"
											class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#972395] focus:border-transparent font-mono"
											maxlength="7"
											oninput={(e) => {
												const val = e.target.value;
												if (/^#[0-9A-F]{6}$/i.test(val)) {
													selectedColor = val;
													const hsl = hexToHSL(val);
													hue = hsl.h;
													saturation = hsl.s;
													lightness = hsl.l;
													drawColorPicker();
												}
											}}
										/>
									</div>
								</div>
							</div>
						{/if}
						
						<p class="mt-2 text-[10px] text-gray-400">
							Warna ini hanya berlaku untuk kamar <strong>{room?.id}</strong> di <strong>{activeWave?.name || 'Wave'}</strong>.
						</p>
					</div>

					<!-- Room Type Settings -->
					<div class="mb-3 flex items-center justify-between">
						<label
							class="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-gray-500 uppercase"
						>
							<FileText size={12} />
							Room Type Configuration
						</label>
						{#if room?.originalType !== editedType}
							<span
								class="rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-medium text-orange-700"
								>Modified</span
							>
						{/if}
					</div>

					<div class="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
						<div class="mb-2 flex items-center justify-between">
							<span class="text-xs text-gray-500">Effective Type</span>
							<span class="text-xs font-medium text-gray-900 capitalize">{editedType}</span>
						</div>

						<div class="grid grid-cols-4 gap-1.5">
							{#each typeOptions as option}
								<button
									class="flex flex-col items-center justify-center rounded border py-1.5 text-[10px] font-medium transition-all
									{editedType === option.value
										? 'border-[#972395] bg-[#972395] text-white shadow-sm'
										: 'border-gray-100 bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700'}"
									onclick={() => (editedType = option.value)}
								>
									<span>{option.label}</span>
									<span class="text-[9px] font-normal opacity-80">({option.cap})</span>
								</button>
							{/each}
						</div>
						<p class="mt-2 text-center text-[10px] text-gray-400">
							Safety check enabled for capacity changes.
						</p>
					</div>
				</div>
			</div>

			<div
				class="flex flex-shrink-0 justify-end gap-3 rounded-b-xl border-t border-gray-100 bg-white p-4"
			>
				<button
					class="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
					onclick={handleClose}
				>
					Close
				</button>
				<button
					class="rounded-lg px-4 py-2 text-sm font-medium text-white transition-all {capacityWarning
						? 'bg-orange-600 shadow-lg shadow-orange-100 hover:bg-orange-700'
						: 'bg-[#972395] hover:bg-[#7a1c78]'}"
					onclick={handleSave}
				>
					{capacityWarning ? 'Simpan & Paksa' : 'Simpan Perubahan'}
				</button>
			</div>
		</div>
	</div>
{/if}
