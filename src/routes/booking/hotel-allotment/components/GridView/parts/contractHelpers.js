import { gregorianToHijri } from '$lib/utils/hijri.js';

export function getAllDates(contract) {
    if (!contract?.contractPeriod?.from || !contract?.contractPeriod?.to) return [];
    const from = new Date(contract.contractPeriod.from);
    const to = new Date(contract.contractPeriod.to);
    const days = [];
    const current = new Date(from);
    while (current <= to) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }
    return days;
}

import { getRoomTypeForWave } from './roomTypeHelpers.js';

// Get unique floors from contract rooms
export function getFloors(contract) {
    console.log('getFloors called:', { contract: contract?.id, rooms: contract?.rooms?.length });
    if (!contract?.rooms) {
        console.log('No rooms found');
        return [];
    }
    const floors = new Set();
    contract.rooms.forEach(room => {
        const floor = room.floor ?? Math.floor(parseInt(room.id.replace(/\D/g, '')) / 100);
        console.log('Room:', room.id, 'Floor:', floor);
        floors.add(floor);
    });
    const result = Array.from(floors).sort((a, b) => a - b);
    console.log('getFloors result:', result);
    return result;
}

// Get rooms for a specific floor, sorted by room number
export function getRoomsByFloor(contract, floor) {
    if (!contract?.rooms) return [];
    return contract.rooms
        .filter(room => {
            const roomFloor = room.floor ?? Math.floor(parseInt(room.id.replace(/\D/g, '')) / 100);
            return roomFloor === floor;
        })
        .sort((a, b) => {
            const numA = parseInt(a.id.replace(/\D/g, ''));
            const numB = parseInt(b.id.replace(/\D/g, ''));
            return numA - numB;
        });
}

export function getRoomsByType(contract, wave = null) {
    if (!contract?.rooms) return [];
    const groups = {};
    const typeOrder = ['quint', 'quad', 'triple', 'double'];

    // Group by effective type in the context of the wave
    for (const room of contract.rooms) {
        const groupType = wave ? getRoomTypeForWave(room, wave) : (room.originalType || room.type);
        if (!groups[groupType]) groups[groupType] = [];
        groups[groupType].push(room);
    }

    const ordered = [];
    for (const t of typeOrder) {
        if (groups[t]) ordered.push({ type: t, rooms: groups[t] });
    }
    for (const t of Object.keys(groups)) {
        if (!typeOrder.includes(t)) ordered.push({ type: t, rooms: groups[t] });
    }
    return ordered;
}

export function getOrderedRooms(contract, wave = null) {
    const result = [];
    for (const group of getRoomsByType(contract, wave)) {
        for (const room of group.rooms) result.push(room);
    }
    return result;
}

export function getJamaahInRoom(contract, waveIndex, roomId) {
    const wave = (contract.waves || [])[waveIndex];
    if (!wave || !wave.jamaah) return [];
    return wave.jamaah.filter((j) => j.roomId === roomId);
}

export function getAssignedJamaah(contract, waveIndex) {
    const wave = (contract.waves || [])[waveIndex];
    if (!wave || !wave.jamaah) return [];
    return wave.jamaah.filter((j) => j.roomId && j.roomId !== '');
}

export function getUnassignedJamaah(contract, waveIndex) {
    const wave = (contract.waves || [])[waveIndex];
    if (!wave || !wave.jamaah) return [];
    return wave.jamaah.filter((j) => !j.roomId || j.roomId === '');
}

export function checkWaveOverlap(contract, idx) {
    const waves = contract.waves || [];
    const current = waves[idx];
    if (!current?.start || !current?.end) return false;

    const start = new Date(current.start);
    const end = new Date(current.end);

    return waves.some((w, i) => {
        if (i === idx) return false;
        if (!w.start || !w.end) return false;
        const wStart = new Date(w.start);
        const wEnd = new Date(w.end);
        return start < wEnd && end > wStart;
    });
}

export function getCellLookup(contract) {
    const lookup = {};
    const waves = contract.waves || [];
    waves.forEach((wave, waveIndex) => {
        const ciDate = wave.start || wave.checkIn;
        const coDate = wave.end || wave.checkOut;
        const roomIds = wave.roomIds || [];
        for (const roomId of roomIds) {
            const ciKey = `${roomId}_${ciDate}`;
            if (!lookup[ciKey]) lookup[ciKey] = { left: null, right: null };
            lookup[ciKey].right = { waveIndex, wave, type: 'checkin' };

            const coKey = `${roomId}_${coDate}`;
            if (!lookup[coKey]) lookup[coKey] = { left: null, right: null };
            lookup[coKey].left = { waveIndex, wave, type: 'checkout' };

            const current = new Date(ciDate);
            current.setDate(current.getDate() + 1);
            const coTime = new Date(coDate).getTime();
            while (current.getTime() < coTime) {
                const dateKey = current.toISOString().split('T')[0];
                const key = `${roomId}_${dateKey}`;
                if (!lookup[key]) lookup[key] = { left: null, right: null };
                if (!lookup[key].left) lookup[key].left = { waveIndex, wave, type: 'occupied' };
                if (!lookup[key].right) lookup[key].right = { waveIndex, wave, type: 'occupied' };
                current.setDate(current.getDate() + 1);
            }
        }
    });
    return lookup;
}

export function getCellTooltip(contract, roomId, waveIndex) {
    const jamaah = getJamaahInRoom(contract, waveIndex, roomId);
    if (jamaah.length === 0) return '';
    return jamaah.map((j) => j.name).join('\n');
}

export function getHijriDate(date) {
    try {
        return gregorianToHijri(date.toISOString().split('T')[0]);
    } catch (e) {
        return null;
    }
}

/**
 * Check if a wave can move to a target room without date conflicts.
 * Same-day CI/CO is allowed (wave A CO + wave B CI on same date).
 * Returns { canMove: boolean, conflict: wave|null, conflictType: string|null }
 */
export function canWaveMoveToRoom(contract, waveId, targetRoomId) {
    const waves = contract.waves || [];
    const sourceWave = waves.find((w) => w.id === waveId);
    if (!sourceWave) return { canMove: false, conflict: null, conflictType: 'no-wave' };

    const srcStart = sourceWave.start || sourceWave.checkIn;
    const srcEnd = sourceWave.end || sourceWave.checkOut;
    if (!srcStart || !srcEnd) return { canMove: false, conflict: null, conflictType: 'no-dates' };

    // Check each OTHER wave that uses the target room
    for (const otherWave of waves) {
        if (otherWave.id === waveId) continue;
        if (!(otherWave.roomIds || []).includes(targetRoomId)) continue;

        const otherStart = otherWave.start || otherWave.checkIn;
        const otherEnd = otherWave.end || otherWave.checkOut;
        if (!otherStart || !otherEnd) continue;

        // Same-day CI/CO is OK: srcEnd === otherStart OR otherEnd === srcStart
        // Overlap = srcStart < otherEnd && srcEnd > otherStart
        // But we allow touching boundaries (same-day transition)
        const sStart = new Date(srcStart).getTime();
        const sEnd = new Date(srcEnd).getTime();
        const oStart = new Date(otherStart).getTime();
        const oEnd = new Date(otherEnd).getTime();

        // Strict overlap (excluding touching edges = same-day CI/CO)
        if (sStart < oEnd && sEnd > oStart) {
            // Check if it's just touching (same-day CI/CO)
            if (sEnd === oStart || oEnd === sStart) {
                // This is a same-day transition — allowed
                continue;
            }
            return { canMove: false, conflict: otherWave, conflictType: 'overlap' };
        }
    }

    return { canMove: true, conflict: null, conflictType: null };
}

export function isContractFullyAllocated(contract) {
    if (!contract?.contractPeriod?.from || !contract?.contractPeriod?.to) return false;

    const cFrom = new Date(contract.contractPeriod.from);
    const cTo = new Date(contract.contractPeriod.to);

    // Normalize to YYYY-MM-DD strings. 
    // Contract nights = From (inclusive) to To (exclusive)
    const contractNights = new Set();
    const curr = new Date(cFrom);
    while (curr < cTo) {
        contractNights.add(curr.toISOString().split('T')[0]);
        curr.setDate(curr.getDate() + 1);
    }

    if (contractNights.size === 0) return false;

    // Calculate covered nights
    const coveredNights = new Set();
    const waves = contract.waves || [];
    for (const w of waves) {
        if (!w.start || !w.end) continue;
        const wStart = new Date(w.start);
        const wEnd = new Date(w.end);
        const wCurr = new Date(wStart);
        while (wCurr < wEnd) {
            coveredNights.add(wCurr.toISOString().split('T')[0]);
            wCurr.setDate(wCurr.getDate() + 1);
        }
    }

    // Check if contractNights is a subset of coveredNights
    for (const night of contractNights) {
        if (!coveredNights.has(night)) return false;
    }
    return true;
}
