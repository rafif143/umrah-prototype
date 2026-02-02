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
		{ id: 'booking-data', label: 'Booking Data', icon: BookOpen, href: '/booking/data' },
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

<aside class="fixed flex h-full w-[200px] flex-col bg-[#972395] text-white">
	<div class="px-3.5 py-4 text-[15px] font-semibold">Umrah</div>

	<nav class="flex flex-col">
		<!-- Package Management -->
		<a
			href="/package-management"
			class="flex w-full items-center gap-2 px-3.5 py-2.5 text-[13px] transition-colors hover:bg-white/10 {activePage ===
			'package-management'
				? 'bg-white/15 font-medium'
				: 'font-normal text-white/90'}"
		>
			<Package size={15} strokeWidth={1.5} />
			<span class="flex-1">Package Management</span>
		</a>

		<!-- Booking Management -->
		<button
			class="flex w-full cursor-pointer items-center gap-2 bg-transparent px-3.5 py-2.5 text-left text-[13px] font-normal text-white/90 hover:bg-white/10"
			onclick={() => toggleMenu('bookingManagement')}
		>
			<CalendarRange size={15} strokeWidth={1.5} />
			<span class="flex-1">Booking Management</span>
			{#if sidebarState.bookingManagement}
				<ChevronDown size={15} strokeWidth={1.5} />
			{:else}
				<ChevronRight size={15} strokeWidth={1.5} />
			{/if}
		</button>

		{#if sidebarState.bookingManagement}
			{#each bookingManagementSubItems as item}
				{@const Icon = item.icon}
				<a
					href={item.href || `#${item.id}`}
					class="flex items-center gap-2 py-2 pr-3.5 pl-[38px] text-xs transition-colors hover:bg-white/10 {activePage ===
						item.id ||
					(item.href && activePage === item.href)
						? 'bg-white/15 font-medium'
						: 'font-normal text-white/85'}"
				>
					<Icon size={14} strokeWidth={1.5} />
					<span>{item.label}</span>
				</a>
			{/each}
		{/if}

		<!-- Master Data -->
		<button
			class="flex w-full cursor-pointer items-center gap-2 bg-transparent px-3.5 py-2.5 text-left text-[13px] font-normal text-white/90 hover:bg-white/10"
			onclick={() => toggleMenu('masterData')}
		>
			<FolderClosed size={15} strokeWidth={1.5} />
			<span class="flex-1">Master Data</span>
			{#if sidebarState.masterData}
				<ChevronDown size={15} strokeWidth={1.5} />
			{:else}
				<ChevronRight size={15} strokeWidth={1.5} />
			{/if}
		</button>

		{#if sidebarState.masterData}
			{#each masterDataSubItems as item}
				{@const Icon = item.icon}
				<a
					href={item.href || `#${item.id}`}
					class="flex items-center gap-2 py-2 pr-3.5 pl-[38px] text-xs transition-colors hover:bg-white/10 {activePage ===
						item.id ||
					(item.href && activePage === item.href) ||
					(activePage === 'hotel' && item.id === 'hotels') // Check specifically for hotel page
						? 'bg-white/15 font-medium'
						: 'font-normal text-white/85'}"
				>
					<Icon size={14} strokeWidth={1.5} />
					<span>{item.label}</span>
				</a>
			{/each}
		{/if}
	</nav>
</aside>
