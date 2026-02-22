/**
 * Get effective room type for a specific wave
 * Checks wave-specific overrides first, then falls back to room's base type
 */
export function getRoomTypeForWave(room, wave) {
    if (!room) return 'unset'; // fallback

    // Check if this wave has a type override for this room
    if (wave?.roomTypeOverrides && wave.roomTypeOverrides[room.id]) {
        return wave.roomTypeOverrides[room.id];
    }

    // Fall back to room's current type (no more originalType)
    return room.type || 'unset';
}

/**
 * Check if a room has been manipulated (type changed from base type in this wave)
 * This checks if current effective type differs from the base room type
 */
export function isRoomManipulatedInWave(room, wave) {
    if (!room) return false;

    const baseType = room.originalType || room.type || 'unset';
    const effectiveType = getRoomTypeForWave(room, wave);

    return baseType !== effectiveType;
}

/**
 * Get the base type of a room (before any wave manipulation)
 */
export function getRoomBaseType(room) {
    return room?.type || 'unset';
}
