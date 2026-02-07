// Flight Storage Utility Functions

/**
 * Creates an empty sector object with all required fields
 */
export const createEmptySector = () => ({
    type: 'Departure', // Departure, Arrival, Transit
    supplier: '',
    departureHall: '',
    carrier: '',
    carrierNo: '',
    fromCity: '',
    toCity: '',
    departureDate: '',
    departureTime: { hour: '00', minute: '00' },
    arrivalTime: { hour: '00', minute: '00' },
    registrationTime: '',
    reportingTime: '',
    notes: '',
    totalUmrahDay: ''
});

/**
 * Creates an empty PNR group object
 */
export const createEmptyPnrGroup = () => ({
    airline: '',
    pnr: '',
    pnrPending: false,
    sectors: [createEmptySector()]
});

/**
 * Formats a date string to readable format
 */
export const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

/**
 * Formats time object to string
 */
export const formatTime = (timeObj) => {
    if (!timeObj) return '';
    if (typeof timeObj === 'string') return timeObj;
    return `${timeObj.hour || '00'}:${timeObj.minute || '00'}`;
};

/**
 * Gets airline name from code using the airline store
 */
export const getAirlineName = (airlineCode, airlines) => {
    const airline = airlines?.find((a) => a.code === airlineCode);
    return airline ? airline.name : airlineCode;
};

/**
 * Gets airport/city name from code using the airport store
 */
export const getAirportName = (airportCode, airports) => {
    const airport = airports?.find((a) => a.code === airportCode);
    return airport ? airport.city : airportCode;
};
