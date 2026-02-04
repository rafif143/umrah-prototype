<script>
	import {
		FolderClosed,
		ChevronRight,
		ChevronDown,
		Package,
		Plane,
		Building2,
		UtensilsCrossed,
		Truck,
		Wrench,
		Contact,
		DollarSign,
		Menu,
		UserCheck,
		CalendarRange,
		FileQuestion,
		BookOpen
	} from 'lucide-svelte';
	import { slide, fly, fade, scale } from 'svelte/transition';
	import { cubicOut, elasticOut, quintOut } from 'svelte/easing';
	import { sidebarState, toggleMenu } from '$lib/runes/sidebarState.svelte.js';

	let { activePage } = $props();

	const masterDataSubItems = [
		{ id: 'hotels', label: 'Hotel', icon: Building2, href: '/master-data/hotel' },
		{ id: 'meals', label: 'Meals', icon: UtensilsCrossed, href: '/master-data/meals' },
		{ id: 'transports', label: 'Transports', icon: Truck, href: '/master-data/transports' },
		{ id: 'services', label: 'Services', icon: Wrench, href: '/master-data/services' },
		{ id: 'mutawif', label: 'Mutawif', icon: UserCheck, href: '/master-data/mutawif' },
		{ id: 'supplier', label: 'Supplier', icon: Contact, href: '/supplier' },
		{
			id: 'operational-cost',
			label: 'Operational Cost',
			icon: DollarSign,
			href: '/master-data/operational-cost'
		}
	];

	const bookingManagementSubItems = [
		{ id: 'inquiry', label: 'Inquiry', icon: FileQuestion, href: '/booking/inquiry' },
		{ id: 'booking-data', label: 'Booking Data', icon: BookOpen, href: '/booking-management' },
		{
			id: 'hotel-allotment',
			label: 'Hotel Allotment',
			icon: Building2,
			href: '/booking/hotel-allotment'
		},
		{
			id: 'transfer-passenger',
			label: 'Transfer Passenger',
			icon: Truck,
			href: '/booking/transfer-passenger'
		}
	];
</script>

<aside
	class="fixed flex h-full w-[200px] flex-col bg-gradient-to-b from-[#972395] via-[#8a2089] to-[#7d1d7d] text-white shadow-2xl"
>
	<!-- Decorative gradient overlay -->
	<div
		class="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"
	></div>

	<!-- Header with glow effect -->
	<div class="relative px-3.5 py-4 text-[15px] font-bold tracking-wide">
		<div class="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
		<div class="relative flex items-center gap-2">
			<div class="h-2 w-2 animate-pulse rounded-full bg-white shadow-lg shadow-white/50"></div>
			<span class="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent"
				>Umrah</span
			>
		</div>
	</div>

	<!-- Divider with gradient -->
	<div class="mx-3 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

	<nav class="relative mt-2 flex flex-col gap-1 px-2">
		<!-- Package Management -->
		<a
			href="/package-management"
			class="group relative flex w-full items-center gap-2.5 overflow-hidden rounded-lg px-2.5 py-2.5 text-[13px] transition-all duration-300 {activePage ===
			'package-management'
				? 'bg-white/20 font-semibold shadow-lg shadow-black/10'
				: 'font-normal text-white/90 hover:bg-white/10'}"
		>
			<!-- Active indicator -->
			{#if activePage === 'package-management'}
				<div
					class="absolute top-0 left-0 h-full w-1 bg-white shadow-lg shadow-white/50"
					in:scale={{ duration: 300, easing: elasticOut }}
				></div>
			{/if}

			<!-- Icon with background -->
			<div
				class="flex h-6 w-6 items-center justify-center rounded-md bg-white/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-white/20 {activePage ===
				'package-management'
					? 'bg-white/25 shadow-md'
					: ''}"
			>
				<Package size={14} strokeWidth={2} />
			</div>
			<span class="flex-1">Package Management</span>

			<!-- Hover glow effect -->
			<div
				class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
			>
				<div
					class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
				></div>
			</div>
		</a>

		<!-- Booking Management -->
		<div>
			<button
				class="group relative flex w-full cursor-pointer items-center gap-2.5 overflow-hidden rounded-lg bg-transparent px-2.5 py-2.5 text-left text-[13px] font-normal text-white/90 transition-all duration-300 hover:bg-white/10"
				onclick={() => toggleMenu('bookingManagement')}
			>
				<!-- Icon with background -->
				<div
					class="flex h-6 w-6 items-center justify-center rounded-md bg-white/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-white/20"
				>
					<CalendarRange size={14} strokeWidth={2} />
				</div>
				<span class="flex-1">Booking Management</span>
				<div
					class="flex h-5 w-5 items-center justify-center rounded transition-all duration-300 group-hover:bg-white/10 {sidebarState.bookingManagement
						? 'rotate-180 bg-white/15'
						: ''}"
				>
					<ChevronDown size={14} strokeWidth={2} />
				</div>

				<!-- Hover glow effect -->
				<div
					class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
				>
					<div
						class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
					></div>
				</div>
			</button>

			{#if sidebarState.bookingManagement}
				<div
					class="mt-1 overflow-hidden rounded-lg bg-black/10"
					in:slide={{ duration: 400, easing: cubicOut }}
					out:slide={{ duration: 300, easing: cubicOut }}
				>
					<div class="space-y-0.5 p-1">
						{#each bookingManagementSubItems as item, i}
							{@const Icon = item.icon}

							<a
								href={item.href || `#${item.id}`}
								class="group relative flex items-center gap-2 overflow-hidden rounded-md py-2 pr-2.5 pl-2 text-xs transition-all duration-200 {activePage ===
									item.id ||
								(item.href && activePage === item.href)
									? 'bg-white/15 font-semibold shadow-md'
									: 'font-normal text-white/85 hover:bg-white/10'}"
							>
								<!-- Active dot indicator -->
								{#if activePage === item.id || (item.href && activePage === item.href)}
									<div
										class="absolute top-1/2 left-0 h-1 w-1 -translate-y-1/2 rounded-full bg-white shadow-lg shadow-white/50"
										in:scale={{ duration: 300, start: 0, easing: elasticOut }}
									></div>
								{/if}

								<div
									class="flex h-5 w-5 items-center justify-center rounded bg-white/5 transition-all duration-200 group-hover:scale-110 group-hover:bg-white/15"
								>
									<Icon size={12} strokeWidth={2} />
								</div>
								<span>{item.label}</span>

								<!-- Hover effect -->
								<div
									class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
								>
									<div class="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"></div>
								</div>
							</a>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<!-- Master Data -->
		<div>
			<button
				class="group relative flex w-full cursor-pointer items-center gap-2.5 overflow-hidden rounded-lg bg-transparent px-2.5 py-2.5 text-left text-[13px] font-normal text-white/90 transition-all duration-300 hover:bg-white/10"
				onclick={() => toggleMenu('masterData')}
			>
				<!-- Icon with background -->
				<div
					class="flex h-6 w-6 items-center justify-center rounded-md bg-white/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-white/20"
				>
					<FolderClosed size={14} strokeWidth={2} />
				</div>
				<span class="flex-1">Master Data</span>
				<div
					class="flex h-5 w-5 items-center justify-center rounded transition-all duration-300 group-hover:bg-white/10 {sidebarState.masterData
						? 'rotate-180 bg-white/15'
						: ''}"
				>
					<ChevronDown size={14} strokeWidth={2} />
				</div>

				<!-- Hover glow effect -->
				<div
					class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
				>
					<div
						class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
					></div>
				</div>
			</button>

			{#if sidebarState.masterData}
				<div
					class="mt-1 overflow-hidden rounded-lg bg-black/10"
					in:slide={{ duration: 400, easing: cubicOut }}
					out:slide={{ duration: 300, easing: cubicOut }}
				>
					<div class="space-y-0.5 p-1">
						{#each masterDataSubItems as item, i}
							{@const Icon = item.icon}
							<a
								href={item.href || `#${item.id}`}
								class="group relative flex items-center gap-2 overflow-hidden rounded-md py-2 pr-2.5 pl-2 text-xs transition-all duration-200 {activePage ===
									item.id ||
								(item.href && activePage === item.href) ||
								(activePage === 'hotel' && item.id === 'hotels')
									? 'bg-white/15 font-semibold shadow-md'
									: 'font-normal text-white/85 hover:bg-white/10'}"
							>
								<!-- Active dot indicator -->
								{#if activePage === item.id || (item.href && activePage === item.href) || (activePage === 'hotel' && item.id === 'hotels')}
									<div
										class="absolute top-1/2 left-0 h-1 w-1 -translate-y-1/2 rounded-full bg-white shadow-lg shadow-white/50"
										in:scale={{ duration: 300, start: 0, easing: elasticOut }}
									></div>
								{/if}

								<div
									class="flex h-5 w-5 items-center justify-center rounded bg-white/5 transition-all duration-200 group-hover:scale-110 group-hover:bg-white/15"
								>
									<Icon size={12} strokeWidth={2} />
								</div>
								<span>{item.label}</span>

								<!-- Hover effect -->
								<div
									class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
								>
									<div class="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"></div>
								</div>
							</a>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</nav>

	<!-- Bottom decorative element -->
	<div
		class="pointer-events-none absolute right-0 bottom-0 left-0 h-32 bg-gradient-to-t from-black/20 to-transparent"
	></div>
</aside>
