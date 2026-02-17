// ============================================================
// Hotel Allotment Shared Helpers
// Shared constants and utilities for Grid View & Card View
// ============================================================

// Room type config — used by Grid View headers (colorful)
export const typeConfig = {
    quint: { label: 'QUINT', short: 'QNT', color: '#0d47a1', bg: '#e3f2fd', headerBg: '#1565c0', capacity: 5 },
    quad: { label: 'QUAD', short: 'QD', color: '#1b5e20', bg: '#e8f5e9', headerBg: '#2e7d32', capacity: 4 },
    triple: { label: 'TRIPLE', short: 'TPL', color: '#e65100', bg: '#fff3e0', headerBg: '#ef6c00', capacity: 3 },
    double: { label: 'DOUBLE', short: 'DBL', color: '#6a1b9a', bg: '#f3e5f5', headerBg: '#7b1fa2', capacity: 2 }
};

// Room type colors — used by Card View & Modals (muted grays)
export const typeColors = {
    quint: { hex: '#4b5563', light: '#f3f4f6', dark: '#1f2937', label: 'Quint', cap: 5 },
    quad: { hex: '#6b7280', light: '#f3f4f6', dark: '#374151', label: 'Quad', cap: 4 },
    triple: { hex: '#9ca3af', light: '#f9fafb', dark: '#4b5563', label: 'Triple', cap: 3 },
    double: { hex: '#d1d5db', light: '#f9fafb', dark: '#6b7280', label: 'Double', cap: 2 }
};

// Room capacity by type
export const roomCapacity = { double: 2, triple: 3, quad: 4, quint: 5 };

// Wave color palette for visual distinction
export const waveColors = [
    { bg: '#1e3a5f', text: '#fff', light: '#dbeafe', mid: '#3b6998' },
    { bg: '#6a1b9a', text: '#fff', light: '#f3e5f5', mid: '#9c4dcc' },
    { bg: '#1b5e20', text: '#fff', light: '#dcfce7', mid: '#4caf50' },
    { bg: '#b71c1c', text: '#fff', light: '#fee2e2', mid: '#ef5350' },
    { bg: '#e65100', text: '#fff', light: '#fff7ed', mid: '#ff9800' },
    { bg: '#006064', text: '#fff', light: '#e0f7fa', mid: '#00acc1' }
];

// Get wave color by index (cycles through palette)
export function getWaveColor(waveIndex) {
    return waveColors[waveIndex % waveColors.length];
}

// Generate fallback/mock booking data for a room
export function getBookingForRoom(allocations, room) {
    const booking = allocations?.[room.id];
    if (booking) return booking;

    const cap = roomCapacity[room.type] || 2;
    return {
        applicantName: `Jamaah ${room.type.charAt(0).toUpperCase() + room.type.slice(1)}`,
        pilgrims: Array.from({ length: cap }, (_, i) => ({ name: `Jamaah ${i + 1} (${room.id})` }))
    };
}
