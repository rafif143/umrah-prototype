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
	import { slide, fly } from 'svelte/transition';
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
	class="sidebar-container fixed flex h-full w-[220px] flex-col overflow-hidden bg-gradient-to-br from-[#5a2c5a] via-[#7a2b7a] to-[#4d1d4d] text-white shadow-lg"
>
	<div class="header px-4 py-5">
		<div class="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-md">
			<Sparkles size={16} class="text-purple-600" />
			<div>
				<div class="text-lg font-bold">Umrah</div>
				<div class="text-xs font-medium text-white/60">Prototype</div>
			</div>
		</div>
	</div>

	<nav class="flex flex-1 flex-col gap-1.5 overflow-y-auto px-3 pb-6">
		<!-- Package Management -->
		<a href="/package-management" class="nav-item">
			<Package size={16} />
			<span>Package Management</span>
		</a>

		<!-- Booking Management -->
		<div class="menu-group">
			<button class="nav-item" onclick={() => toggleMenu('bookingManagement')}>
				<CalendarRange size={16} />
				<span>Booking Management</span>
				<ChevronDown size={16} class={sidebarState.bookingManagement ? 'rotate-180' : ''} />
			</button>

			{#if sidebarState.bookingManagement}
				<div class="submenu" in:slide>
					{#each bookingManagementSubItems as item}
						<a href={item.href} class="sub-item">
							<item.icon size={13} />
							<span>{item.label}</span>
						</a>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Master Data -->
		<div class="menu-group">
			<button class="nav-item" onclick={() => toggleMenu('masterData')}>
				<FolderClosed size={16} />
				<span>Master Data</span>
				<ChevronDown size={16} class={sidebarState.masterData ? 'rotate-180' : ''} />
			</button>

			{#if sidebarState.masterData}
				<div class="submenu" in:slide>
					{#each masterDataSubItems as item}
						<a href={item.href} class="sub-item">
							<item.icon size={13} />
							<span>{item.label}</span>
						</a>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Storage -->
		<div class="menu-group">
			<button class="nav-item" onclick={() => toggleMenu('storage')}>
				<Database size={16} />
				<span>Storage</span>
				<ChevronDown size={16} class={sidebarState.storage ? 'rotate-180' : ''} />
			</button>

			{#if sidebarState.storage}
				<div class="submenu" in:slide>
					{#each storageSubItems as item}
						<a href={item.href} class="sub-item">
							<item.icon size={13} />
							<span>{item.label}</span>
						</a>
					{/each}
				</div>
			{/if}
		</div>
	</nav>
</aside>

<style>
	.sidebar-container {
		background: linear-gradient(to bottom right, rgba(90, 44, 90, 0.9), rgba(125, 29, 125, 0.9));
	}

	.nav-item,
	.sub-item {
		display: flex;
		align-items: center;
		padding: 10px 15px;
		color: rgba(255, 255, 255, 0.9);
		text-decoration: none;
		border-radius: 5px;
		transition: background-color 0.3s ease;
	}

	.nav-item:hover,
	.sub-item:hover {
		background-color: rgba(255, 255, 255, 0.1);
	}

	.menu-group {
		margin: 10px 0;
	}

	.submenu {
		padding-left: 20px;
		background-color: rgba(255, 255, 255, 0.05);
		border-radius: 5px;
	}

	.sub-item {
		font-size: 12px;
	}

	.icon {
		margin-right: 10px;
	}

	.rotate-180 {
		transform: rotate(180deg);
		transition: transform 0.3s ease;
	}
</style>
