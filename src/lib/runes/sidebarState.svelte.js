export const sidebarState = $state({
    masterData: true,
    bookingManagement: false,
    pricingManagement: false,
    storage: false,
    isCollapsed: false // Add collapsed state
});

export function toggleMenu(menu) {
    sidebarState[menu] = !sidebarState[menu];
}

export function toggleSidebar() {
    sidebarState.isCollapsed = !sidebarState.isCollapsed;
}
