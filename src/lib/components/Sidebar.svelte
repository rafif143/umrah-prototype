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
		BookOpen,
		Database,
		Sparkles
	} from 'lucide-svelte';
	import { slide, fly, fade, scale } from 'svelte/transition';
	import { cubicOut, elasticOut, quintOut, backOut } from 'svelte/easing';
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

	const storageSubItems = [
		{ id: 'storage-flight', label: 'Flight', icon: Plane, href: '/storage/flight' },
		{ id: 'storage-hotel', label: 'Hotel', icon: Building2, href: '/storage/hotel' }
	];
</script>

<aside
	class="sidebar-container fixed flex h-full w-[220px] flex-col overflow-hidden bg-gradient-to-br from-[#a82ca6] via-[#972395] to-[#7d1d7d] text-white shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
>
	<!-- Animated background gradient -->
	<div class="animated-bg pointer-events-none absolute inset-0"></div>

	<!-- Glass overlay -->
	<div
		class="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-3xl"
	></div>

	<!-- Floating particles effect -->
	<div class="particles pointer-events-none absolute inset-0">
		<div class="particle"></div>
		<div class="particle"></div>
		<div class="particle"></div>
		<div class="particle"></div>
		<div class="particle"></div>
	</div>

	<!-- Header with premium glow -->
	<div class="relative z-10 px-4 py-5">
		<div
			class="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-md transition-all duration-500 hover:bg-white/15 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
		>
			<div class="relative">
				<div
					class="absolute inset-0 animate-ping rounded-full bg-white/50 opacity-75 duration-1000"
				></div>
				<div
					class="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-white to-white/80 shadow-lg shadow-white/50"
				>
					<Sparkles size={16} class="text-purple-600" strokeWidth={2.5} />
				</div>
			</div>
			<div>
				<div
					class="bg-gradient-to-r from-white via-white to-purple-100 bg-clip-text text-lg font-bold tracking-wide text-transparent"
				>
					Umrah Pro
				</div>
				<div class="text-[10px] font-medium text-white/60">Management System</div>
			</div>
		</div>
	</div>

	<!-- Divider with glow -->
	<div class="relative z-10 mx-4 my-2">
		<div class="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
		<div
			class="absolute top-1/2 left-1/2 h-1 w-1/3 -translate-x-1/2 -translate-y-1/2 bg-white/50 blur-md"
		></div>
	</div>

	<!-- Navigation -->
	<nav
		class="scrollbar-custom relative z-10 flex flex-1 flex-col gap-1.5 overflow-y-auto px-3 pb-6"
	>
		<!-- Package Management -->
		<a
			href="/package-management"
			class="nav-item group relative flex w-full items-center gap-3 overflow-hidden rounded-xl px-3.5 py-3 text-[13px] transition-all duration-300 {activePage ===
			'package-management'
				? 'active bg-white/20 font-semibold shadow-[0_4px_20px_rgba(255,255,255,0.15)] backdrop-blur-sm'
				: 'font-medium text-white/90 hover:bg-white/10 hover:shadow-[0_4px_15px_rgba(255,255,255,0.1)]'}"
		>
			<!-- Active glow bar -->
			{#if activePage === 'package-management'}
				<div
					class="absolute top-0 left-0 h-full w-1 rounded-r-full bg-gradient-to-b from-white via-white to-white/50 shadow-[0_0_10px_rgba(255,255,255,0.8)]"
					in:scale={{ duration: 400, easing: backOut }}
				></div>
			{/if}

			<!-- Icon container with rotation on hover -->
			<div
				class="icon-container relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 {activePage ===
				'package-management'
					? 'bg-gradient-to-br from-white/30 to-white/20 shadow-lg shadow-white/30'
					: 'bg-white/10 group-hover:bg-white/20'}"
			>
				<Package size={16} strokeWidth={2.5} />
				{#if activePage === 'package-management'}
					<div class="absolute inset-0 animate-ping rounded-lg bg-white/30 opacity-50"></div>
				{/if}
			</div>

			<span class="flex-1 tracking-wide">Package Management</span>

			<!-- Shine effect on hover -->
			<div
				class="shine pointer-events-none absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]"
			></div>

			<!-- Hover glow -->
			<div
				class="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
			>
				<div class="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5"></div>
			</div>
		</a>

		<!-- Booking Management -->
		<div class="menu-group">
			<button
				class="nav-item group relative flex w-full cursor-pointer items-center gap-3 overflow-hidden rounded-xl bg-transparent px-3.5 py-3 text-left text-[13px] font-medium text-white/90 transition-all duration-300 hover:bg-white/10 hover:shadow-[0_4px_15px_rgba(255,255,255,0.1)]"
				onclick={() => toggleMenu('bookingManagement')}
			>
				<div
					class="icon-container relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-white/20"
				>
					<CalendarRange size={16} strokeWidth={2.5} />
				</div>
				<span class="flex-1 tracking-wide">Booking Management</span>
				<div
					class="flex h-6 w-6 items-center justify-center rounded-lg transition-all duration-300 group-hover:bg-white/15 {sidebarState.bookingManagement
						? 'rotate-180 bg-white/20'
						: 'bg-white/5'}"
				>
					<ChevronDown size={16} strokeWidth={2.5} />
				</div>

				<!-- Shine effect -->
				<div
					class="shine pointer-events-none absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]"
				></div>
			</button>

			{#if sidebarState.bookingManagement}
				<div
					class="submenu mt-1.5 overflow-hidden rounded-xl bg-black/20 backdrop-blur-sm"
					in:slide={{ duration: 400, easing: cubicOut }}
					out:slide={{ duration: 300, easing: cubicOut }}
				>
					<div class="space-y-0.5 p-1.5">
						{#each bookingManagementSubItems as item, i}
							{@const Icon = item.icon}
							<a
								href={item.href || `#${item.id}`}
								class="sub-item group relative flex items-center gap-2.5 overflow-hidden rounded-lg py-2.5 pr-3 pl-2.5 text-xs transition-all duration-300 {activePage ===
									item.id ||
								(item.href && activePage === item.href)
									? 'bg-white/20 font-semibold shadow-md'
									: 'font-medium text-white/85 hover:bg-white/15 hover:pl-3'}"
								style="transition-delay: {i * 30}ms"
								in:fly={{ x: -20, duration: 300, delay: i * 50, easing: quintOut }}
							>
								<!-- Active indicator -->
								{#if activePage === item.id || (item.href && activePage === item.href)}
									<div
										class="absolute top-1/2 left-0 h-3 w-1 -translate-y-1/2 rounded-r-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
										in:scale={{ duration: 300, start: 0, easing: backOut }}
									></div>
								{/if}

								<div
									class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-white/10 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-white/20"
								>
									<Icon size={13} strokeWidth={2.5} />
								</div>
								<span class="tracking-wide">{item.label}</span>

								<!-- Hover shine -->
								<div
									class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
								>
									<div class="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
								</div>
							</a>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<!-- Master Data -->
		<div class="menu-group">
			<button
				class="nav-item group relative flex w-full cursor-pointer items-center gap-3 overflow-hidden rounded-xl bg-transparent px-3.5 py-3 text-left text-[13px] font-medium text-white/90 transition-all duration-300 hover:bg-white/10 hover:shadow-[0_4px_15px_rgba(255,255,255,0.1)]"
				onclick={() => toggleMenu('masterData')}
			>
				<div
					class="icon-container relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-white/20"
				>
					<FolderClosed size={16} strokeWidth={2.5} />
				</div>
				<span class="flex-1 tracking-wide">Master Data</span>
				<div
					class="flex h-6 w-6 items-center justify-center rounded-lg transition-all duration-300 group-hover:bg-white/15 {sidebarState.masterData
						? 'rotate-180 bg-white/20'
						: 'bg-white/5'}"
				>
					<ChevronDown size={16} strokeWidth={2.5} />
				</div>

				<div
					class="shine pointer-events-none absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]"
				></div>
			</button>

			{#if sidebarState.masterData}
				<div
					class="submenu mt-1.5 overflow-hidden rounded-xl bg-black/20 backdrop-blur-sm"
					in:slide={{ duration: 400, easing: cubicOut }}
					out:slide={{ duration: 300, easing: cubicOut }}
				>
					<div class="space-y-0.5 p-1.5">
						{#each masterDataSubItems as item, i}
							{@const Icon = item.icon}
							<a
								href={item.href || `#${item.id}`}
								class="sub-item group relative flex items-center gap-2.5 overflow-hidden rounded-lg py-2.5 pr-3 pl-2.5 text-xs transition-all duration-300 {activePage ===
									item.id ||
								(item.href && activePage === item.href) ||
								(activePage === 'hotel' && item.id === 'hotels')
									? 'bg-white/20 font-semibold shadow-md'
									: 'font-medium text-white/85 hover:bg-white/15 hover:pl-3'}"
								style="transition-delay: {i * 30}ms"
								in:fly={{ x: -20, duration: 300, delay: i * 50, easing: quintOut }}
							>
								{#if activePage === item.id || (item.href && activePage === item.href) || (activePage === 'hotel' && item.id === 'hotels')}
									<div
										class="absolute top-1/2 left-0 h-3 w-1 -translate-y-1/2 rounded-r-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
										in:scale={{ duration: 300, start: 0, easing: backOut }}
									></div>
								{/if}

								<div
									class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-white/10 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-white/20"
								>
									<Icon size={13} strokeWidth={2.5} />
								</div>
								<span class="tracking-wide">{item.label}</span>

								<div
									class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
								>
									<div class="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
								</div>
							</a>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<!-- Storage -->
		<div class="menu-group">
			<button
				class="nav-item group relative flex w-full cursor-pointer items-center gap-3 overflow-hidden rounded-xl bg-transparent px-3.5 py-3 text-left text-[13px] font-medium text-white/90 transition-all duration-300 hover:bg-white/10 hover:shadow-[0_4px_15px_rgba(255,255,255,0.1)]"
				onclick={() => toggleMenu('storage')}
			>
				<div
					class="icon-container relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-white/20"
				>
					<Database size={16} strokeWidth={2.5} />
				</div>
				<span class="flex-1 tracking-wide">Storage</span>
				<div
					class="flex h-6 w-6 items-center justify-center rounded-lg transition-all duration-300 group-hover:bg-white/15 {sidebarState.storage
						? 'rotate-180 bg-white/20'
						: 'bg-white/5'}"
				>
					<ChevronDown size={16} strokeWidth={2.5} />
				</div>

				<div
					class="shine pointer-events-none absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]"
				></div>
			</button>

			{#if sidebarState.storage}
				<div
					class="submenu mt-1.5 overflow-hidden rounded-xl bg-black/20 backdrop-blur-sm"
					in:slide={{ duration: 400, easing: cubicOut }}
					out:slide={{ duration: 300, easing: cubicOut }}
				>
					<div class="space-y-0.5 p-1.5">
						{#each storageSubItems as item, i}
							{@const Icon = item.icon}
							<a
								href={item.href || `#${item.id}`}
								class="sub-item group relative flex items-center gap-2.5 overflow-hidden rounded-lg py-2.5 pr-3 pl-2.5 text-xs transition-all duration-300 {activePage ===
									item.id ||
								(item.href && activePage === item.href)
									? 'bg-white/20 font-semibold shadow-md'
									: 'font-medium text-white/85 hover:bg-white/15 hover:pl-3'}"
								style="transition-delay: {i * 30}ms"
								in:fly={{ x: -20, duration: 300, delay: i * 50, easing: quintOut }}
							>
								{#if activePage === item.id || (item.href && activePage === item.href)}
									<div
										class="absolute top-1/2 left-0 h-3 w-1 -translate-y-1/2 rounded-r-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
										in:scale={{ duration: 300, start: 0, easing: backOut }}
									></div>
								{/if}

								<div
									class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-white/10 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-white/20"
								>
									<Icon size={13} strokeWidth={2.5} />
								</div>
								<span class="tracking-wide">{item.label}</span>

								<div
									class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
								>
									<div class="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
								</div>
							</a>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</nav>

	<!-- Bottom premium gradient -->
	<div
		class="pointer-events-none absolute right-0 bottom-0 left-0 z-10 h-24 bg-gradient-to-t from-black/30 via-black/10 to-transparent"
	></div>
</aside>

<style>
	/* Animated background gradient */
	@keyframes gradientShift {
		0%,
		100% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
	}

	.animated-bg {
		background: linear-gradient(
			135deg,
			rgba(168, 44, 166, 0.3),
			rgba(151, 35, 149, 0.3),
			rgba(125, 29, 125, 0.3),
			rgba(168, 44, 166, 0.3)
		);
		background-size: 300% 300%;
		animation: gradientShift 15s ease infinite;
	}

	/* Floating particles */
	.particles {
		overflow: hidden;
	}

	.particle {
		position: absolute;
		width: 4px;
		height: 4px;
		background: radial-gradient(circle, rgba(255, 255, 255, 0.8), transparent);
		border-radius: 50%;
		opacity: 0;
		animation: float 15s infinite ease-in-out;
	}

	.particle:nth-child(1) {
		top: 20%;
		left: 20%;
		animation-delay: 0s;
		animation-duration: 12s;
	}

	.particle:nth-child(2) {
		top: 60%;
		left: 80%;
		animation-delay: 3s;
		animation-duration: 15s;
	}

	.particle:nth-child(3) {
		top: 40%;
		left: 40%;
		animation-delay: 6s;
		animation-duration: 18s;
	}

	.particle:nth-child(4) {
		top: 80%;
		left: 60%;
		animation-delay: 9s;
		animation-duration: 14s;
	}

	.particle:nth-child(5) {
		top: 30%;
		left: 70%;
		animation-delay: 12s;
		animation-duration: 16s;
	}

	@keyframes float {
		0%,
		100% {
			transform: translate(0, 0) scale(1);
			opacity: 0;
		}
		25% {
			opacity: 0.6;
		}
		50% {
			transform: translate(50px, -50px) scale(1.2);
			opacity: 0.8;
		}
		75% {
			opacity: 0.4;
		}
	}

	/* Custom scrollbar */
	.scrollbar-custom::-webkit-scrollbar {
		width: 6px;
	}

	.scrollbar-custom::-webkit-scrollbar-track {
		background: rgba(0, 0, 0, 0.2);
		border-radius: 10px;
		margin: 8px 0;
	}

	.scrollbar-custom::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.3);
		border-radius: 10px;
		transition: background 0.3s ease;
	}

	.scrollbar-custom::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 0.5);
	}

	/* Smooth transitions for all interactive elements */
	.nav-item,
	.sub-item {
		transform-origin: left center;
	}

	.icon-container {
		will-change: transform;
	}

	/* Add slight scale on active items */
	.nav-item.active {
		transform: scale(1.02);
	}

	/* Enhance shine effect */
	.shine {
		opacity: 0.7;
	}

	/* Stagger animation for menu items */
	.menu-group {
		animation: fadeInUp 0.4s ease-out;
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
