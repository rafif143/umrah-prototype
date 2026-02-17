/**
 * Get effective room type for a specific wave
 * Checks wave-specific overrides first, then falls back to room's base type
 */
export function getRoomTypeForWave(room, wave) {
    if (!room) return 'double'; // fallback
    
    // Check if this wave has a type override for this room
    if (wave?.roomTypeOverrides && wave.roomTypeOverrides[room.id]) {
        return wave.roomTypeOverrides[room.id];
    }
    
    // Fall back to room's original type
    return room.originalType || room.type;
}

/**
 * Check if a room has been manipulated (type overridden) in a specific wave
 */
export function isRoomManipulatedInWave(room, wave) {
    if (!room || !wave) return false;
    return wave.roomTypeOverrides && wave.roomTypeOverrides[room.id] !== undefined;
}

/**
 * Get the original type of a room (before any manipulation)
 */
export function getRoomOriginalType(room) {
    return room?.originalType || room?.type || 'double';
}
