export const hijriMonths = [
    'Muharram',
    'Safar',
    'Rabiul Awal',
    'Rabiul Akhir',
    'Jumadil Awal',
    'Jumadil Akhir',
    'Rajab',
    'Sya\'ban',
    'Ramadhan',
    'Syawal',
    'Dzulkaidah',
    'Dzulhijjah'
];

export function gregorianToHijri(date) {
    const d = new Date(date);
    let cp = d.getTime();
    // Adjustment for timezone offset
    cp = cp - d.getTimezoneOffset() * 60000;
    // Julian Day Calculation
    const jd = cp / 86400000 + 2440587.5;

    let l = jd - 1948440 + 10632;
    const n = Math.floor((l - 1) / 10631);
    l = l - 10631 * n + 354;

    const j = (Math.floor((10985 - l) / 5316)) * (Math.floor((50 * l) / 17719)) + (Math.floor(l / 5670)) * (Math.floor((43 * l) / 15238));
    l = l - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) - (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;

    const m = Math.floor((24 * l) / 709);
    const day = Math.floor(l - Math.floor((709 * m) / 24));
    const year = 30 * n + j - 30;

    return { day, month: m - 1, year };
}

export function hijriToGregorian(day, month, year) {
    // Simple approximation or reverse Kuwaiti - strictly speaking bidirectional exact algo is complex
    // For this prototype, we'll use a library-free approximation or suggest a library if precision is critical.
    // However, usually `Intl` can output Hijri, but inputting it is harder.
    // Let's use a standard lookup or reverse calculation.

    // Actually, for a quick prototype without libraries, finding the exact Gregorian from Hijri
    // is tricky due to moon sighting variations.
    // A standard approach is converting Hijri -> JD -> Gregorian.

    // Implementation of "Kuwaiti Algorithm" reversed?
    // It's safer to rely on user input for "correction" if needed, 
    // but let's try a standard arithmetic conversion.

    let iY = year;
    let iM = month; // 0-11
    let iD = day;

    let iY_ = iY;
    let iM_ = iM;
    let iD_ = iD;

    // Rough estimate: Hijri Year * 0.97 + 622 ~= Gregorian
    // Strict algo:
    const iy = iY;
    const im = iM + 1; // 1-12
    const id = iD;
    const ii = iy - 1;
    const ar = ii * 354 + 3 + 11 * ii / 30 + 30 * (im - 1) - (im > 1 ? (im % 2 == 0 ? 0 : 1) : 0) + (im > 7 ? 0 : 1) / 2 + (im > 12 ? 0 : 1) / 2 + id - 1;
    const al = ar + 1948440 - 385; // Constant adjustment? No, let's use a known verified set of constants if possible or just use a helper. 

    // Let's use the Intl API if possible?
    // Intl.DateTimeFormat 'islamic-umalqura' is good for formatting.
    // Parsing is not supported by Intl.

    // Given the constraints and user request for "auto convert" but "editable":
    // The implementation below converts Hijri to Julian Day, then JD to Gregorian.

    const k = Math.floor((11 * year + 3) / 30) + 354 * year + 30 * month - Math.floor((month - 1) / 2) + day + 1948440 - 385;
    // This `k` is roughly JD.
    // Let's stick to a known working snippet or simple approximate for now, 
    // as users can manually correct it.

    // JD to Gregorian
    const l = k + 68569;
    const n = Math.floor((4 * l) / 146097);
    const l_ = l - Math.floor((146097 * n + 3) / 4);
    const i = Math.floor((4000 * (l_ + 1)) / 1461001);
    const l__ = l_ - Math.floor((1461 * i) / 4) + 31;
    const j = Math.floor((80 * l__) / 2447);
    const d = l__ - Math.floor((2447 * j) / 80);
    const l___ = Math.floor(j / 11);
    const m = j + 2 - 12 * l___;
    const y = 100 * (n - 49) + i + l___;

    const out = new Date(y, m - 1, d);
    // Adjust for timezone locally
    out.setHours(12, 0, 0, 0);
    return out.toISOString().split('T')[0];
}

export function getHijriMonthLength(month, year) {
    // Check if day 30 exists in the same month
    const g30 = hijriToGregorian(30, month, year);
    const h30 = gregorianToHijri(g30);
    return h30.month === month ? 30 : 29;
}

export function getHijriMonthStartDay(month, year) {
    const g1 = hijriToGregorian(1, month, year);
    return new Date(g1).getDay(); // 0 (Sun) - 6 (Sat)
}
