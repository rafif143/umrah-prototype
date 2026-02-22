const fs = require('fs');

const path = '/Users/rafif/Desktop/Data/Work/Code/umrah-prototype/src/lib/data/bookings.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// Only add if not exist
if (!data.find(b => b.id === 'BK-FAMILY-001')) {
    data.push({
        "id": "BK-FAMILY-001",
        "applicantName": "Keluarga Haji Rahmat (Mixed)",
        "packageName": "Pakej Umrah VIP",
        "pilgrims": [
            { "name": "Haji Rahmat", "gender": "L", "roomType": "Double" },
            { "name": "Hajjah Halimah", "gender": "P", "roomType": "Double" },
            { "name": "Anak Sulung (Aziz)", "gender": "L", "roomType": "Triple" },
            { "name": "Menantu (Aisha)", "gender": "P", "roomType": "Triple" },
            { "name": "Cucu (Ali)", "gender": "L", "roomType": "Triple" }
        ],
        "roomType": "Mixed"
    });
}

if (!data.find(b => b.id === 'BK-GROUP-007')) {
    data.push({
        "id": "BK-GROUP-007",
        "applicantName": "Rombongan Cikgu (Multiple Quad)",
        "packageName": "SV 05 DEC 2026 - UMRAH TEST",
        "pilgrims": [
            { "name": "Cikgu Ali", "gender": "L", "roomType": "Quad" },
            { "name": "Cikgu Abu", "gender": "L", "roomType": "Quad" },
            { "name": "Cikgu Ahmad", "gender": "L", "roomType": "Quad" },
            { "name": "Cikgu Azman", "gender": "L", "roomType": "Quad" },
            { "name": "Cikgu Siti", "gender": "P", "roomType": "Quad" },
            { "name": "Cikgu Maimun", "gender": "P", "roomType": "Quad" },
            { "name": "Cikgu Zainab", "gender": "P", "roomType": "Quad" },
            { "name": "Cikgu Faridah", "gender": "P", "roomType": "Quad" },
            { "name": "Guru Besar (Osman)", "gender": "L", "roomType": "Double" },
            { "name": "Isteri Guru Besar", "gender": "P", "roomType": "Double" }
        ],
        "roomType": "Mixed"
    });
}

fs.writeFileSync(path, JSON.stringify(data, null, 4));
console.log('Bookings modified successfully');
