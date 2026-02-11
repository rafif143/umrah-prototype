<script>
	import {
		FolderClosed,
		ChevronRight,
		Package,
		Plane,
		Building2,
		UtensilsCrossed,
		Truck,
		Wrench,
		Contact,
		DollarSign,
		UserCheck,
		CalendarRange,
		FileQuestion,
		BookOpen,
		Database,
		Sparkles,
		Menu,
		ArrowRightToLine,
		ArrowLeftToLine
	} from 'lucide-svelte';
	import { slide } from 'svelte/transition';
	import { sidebarState, toggleMenu, toggleSidebar } from '$lib/runes/sidebarState.svelte.js';

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
	class="sidebar transition-all duration-300"
	style="width: {sidebarState.isCollapsed ? '72px' : '230px'}"
>
	<!-- Header -->
	<div class="sidebar-header flex items-center justify-between">
		<div
			class="logo-container overflow-hidden transition-all duration-300"
			style="width: {sidebarState.isCollapsed ? '40px' : '100%'}"
		>
			<div class="logo-icon shrink-0">
				<Sparkles size={20} class="sparkle-icon" />
			</div>
			<div
				class="logo-text whitespace-nowrap transition-opacity duration-200 {sidebarState.isCollapsed
					? 'w-0 opacity-0'
					: 'flex-1 opacity-100'}"
			>
				<div class="brand-name">Umrah</div>
				<div class="brand-subtitle">Management System</div>
			</div>
		</div>
		<button
			class="absolute top-6 -right-3 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-sm transition-colors hover:text-gray-600 {sidebarState.isCollapsed
				? 'rotate-180'
				: ''}"
			onclick={toggleSidebar}
			title={sidebarState.isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
		>
			<ArrowLeftToLine size={14} />
		</button>
	</div>

	<!-- Navigation -->
	<nav class="sidebar-nav">
		<!-- Package Management -->
		<a
			href="/package-management"
			class="nav-link"
			class:active={activePage === 'package-management'}
		>
			<div class="nav-icon">
				<Package size={18} />
			</div>
			<span class="nav-label {sidebarState.isCollapsed ? 'hidden' : 'block'}"
				>Package Management</span
			>
		</a>

		<!-- Booking Management -->
		<div class="nav-group">
			<button
				class="nav-link nav-toggle"
				class:active={sidebarState.bookingManagement}
				onclick={() => toggleMenu('bookingManagement')}
			>
				<div class="nav-icon">
					<CalendarRange size={18} />
				</div>
				<span class="nav-label {sidebarState.isCollapsed ? 'hidden' : 'block'}"
					>Booking Management</span
				>
				<ChevronRight
					size={16}
					class="chevron {sidebarState.bookingManagement
						? 'expanded'
						: ''} {sidebarState.isCollapsed ? 'hidden' : 'block'}"
				/>
			</button>

			{#if sidebarState.bookingManagement && !sidebarState.isCollapsed}
				<div class="submenu" transition:slide={{ duration: 200 }}>
					{#each bookingManagementSubItems as item}
						<a href={item.href} class="submenu-link" class:active={activePage === item.id}>
							<div class="submenu-icon">
								<item.icon size={16} />
							</div>
							<span class="submenu-label">{item.label}</span>
						</a>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Master Data -->
		<div class="nav-group">
			<button
				class="nav-link nav-toggle"
				class:active={sidebarState.masterData}
				onclick={() => toggleMenu('masterData')}
			>
				<div class="nav-icon">
					<FolderClosed size={18} />
				</div>
				<span class="nav-label {sidebarState.isCollapsed ? 'hidden' : 'block'}">Master Data</span>
				<ChevronRight
					size={16}
					class="chevron {sidebarState.masterData ? 'expanded' : ''} {sidebarState.isCollapsed
						? 'hidden'
						: 'block'}"
				/>
			</button>

			{#if sidebarState.masterData && !sidebarState.isCollapsed}
				<div class="submenu" transition:slide={{ duration: 200 }}>
					{#each masterDataSubItems as item}
						<a href={item.href} class="submenu-link" class:active={activePage === item.id}>
							<div class="submenu-icon">
								<item.icon size={16} />
							</div>
							<span class="submenu-label">{item.label}</span>
						</a>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Storage -->
		<div class="nav-group">
			<button
				class="nav-link nav-toggle"
				class:active={sidebarState.storage}
				onclick={() => toggleMenu('storage')}
			>
				<div class="nav-icon">
					<Database size={18} />
				</div>
				<span class="nav-label {sidebarState.isCollapsed ? 'hidden' : 'block'}">Storage</span>
				<ChevronRight
					size={16}
					class="chevron {sidebarState.storage ? 'expanded' : ''} {sidebarState.isCollapsed
						? 'hidden'
						: 'block'}"
				/>
			</button>

			{#if sidebarState.storage && !sidebarState.isCollapsed}
				<div class="submenu" transition:slide={{ duration: 200 }}>
					{#each storageSubItems as item}
						<a href={item.href} class="submenu-link" class:active={activePage === item.id}>
							<div class="submenu-icon">
								<item.icon size={16} />
							</div>
							<span class="submenu-label">{item.label}</span>
						</a>
					{/each}
				</div>
			{/if}
		</div>
	</nav>
</aside>
```

<style>
	.sidebar {
		position: fixed;
		height: 100vh;
		width: 230px;
		background: white;
		border-right: 1px solid #e5e7eb;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		z-index: 50;
	}

	/* Header */
	.sidebar-header {
		padding: 24px 20px;
		border-bottom: 1px solid #f3f4f6;
	}

	.logo-container {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.logo-icon {
		width: 40px;
		height: 40px;
		background: linear-gradient(135deg, #972395 0%, #7a1c78 100%);
		border-radius: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 12px rgba(151, 35, 149, 0.2);
	}

	.logo-icon :global(.sparkle-icon) {
		color: white;
	}

	.logo-text {
		flex: 1;
	}

	.brand-name {
		font-size: 18px;
		font-weight: 700;
		color: #111827;
		letter-spacing: -0.5px;
		line-height: 1.2;
	}

	.brand-subtitle {
		font-size: 11px;
		font-weight: 500;
		color: #6b7280;
		margin-top: 2px;
	}

	/* Navigation */
	.sidebar-nav {
		flex: 1;
		padding: 16px 12px;
		overflow-y: auto;
		overflow-x: hidden;
	}

	.sidebar-nav::-webkit-scrollbar {
		width: 6px;
	}

	.sidebar-nav::-webkit-scrollbar-track {
		background: transparent;
	}

	.sidebar-nav::-webkit-scrollbar-thumb {
		background: #e5e7eb;
		border-radius: 3px;
	}

	.sidebar-nav::-webkit-scrollbar-thumb:hover {
		background: #d1d5db;
	}

	/* Navigation Links */
	.nav-link {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 14px;
		margin-bottom: 4px;
		color: #4b5563;
		text-decoration: none;
		border-radius: 8px;
		transition: all 0.2s ease;
		cursor: pointer;
		border: none;
		background: transparent;
		width: 100%;
		font-family: inherit;
		position: relative;
	}

	.nav-link:hover {
		background: #f3f4f6;
		color: #111827;
	}

	/* Active State - cleaner, no floating strip */
	.nav-link.active {
		background: #fdf2f8;
		color: #972395;
		font-weight: 600;
	}

	.nav-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.nav-label {
		flex: 1;
		text-align: left; /* Ensure text aligns left */
		font-size: 14px;
		font-weight: 500;
		white-space: nowrap;
	}

	.nav-toggle {
		text-align: left;
		justify-content: space-between; /* Explicitly space out content */
	}

	.nav-toggle :global(.chevron) {
		transition: transform 0.2s ease;
		flex-shrink: 0;
		opacity: 0.5;
		margin-left: auto; /* Push chevron to the far right */
	}

	.nav-toggle :global(.chevron.expanded) {
		transform: rotate(90deg);
	}

	/* Navigation Groups */
	.nav-group {
		margin-bottom: 8px;
	}

	/* Submenu - simpler indentation, removed vertical line if conflicting */
	.submenu {
		padding: 2px 0 8px 0;
		margin-left: 20px; /* Aligned with icon center */
		border-left: 1px solid #e5e7eb; /* Keep subtle guide line */
	}

	.submenu-link {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 12px 8px 16px; /* Adjusted padding */
		margin-left: 4px; /* Offset from border */
		margin-bottom: 1px;
		color: #6b7280;
		text-decoration: none;
		border-radius: 6px;
		transition: all 0.2s ease;
		position: relative;
		font-size: 13px;
	}

	.submenu-link:hover {
		background: #f3f4f6;
		color: #111827;
	}

	.submenu-link.active {
		background: #fdf2f8;
		color: #972395;
		font-weight: 500;
	}

	.submenu-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0.8;
		flex-shrink: 0;
	}

	.submenu-label {
		font-size: 13px;
		font-weight: 500;
		white-space: nowrap;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.sidebar {
			transform: translateX(-100%);
			transition: transform 0.3s ease-in-out;
		}
	}
</style>
