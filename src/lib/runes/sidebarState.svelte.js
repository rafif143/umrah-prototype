export const sidebarState = $state({
    masterData: true,
    bookingManagement: false,
    pricingManagement: false
});

export function toggleMenu(menu) {
    sidebarState[menu] = !sidebarState[menu];
}
