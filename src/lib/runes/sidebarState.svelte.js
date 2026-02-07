export const sidebarState = $state({
    masterData: true,
    bookingManagement: false,
    pricingManagement: false,
    storage: false
});

export function toggleMenu(menu) {
    sidebarState[menu] = !sidebarState[menu];
}
