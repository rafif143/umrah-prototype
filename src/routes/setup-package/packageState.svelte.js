import { Info, FileText, CheckCircle, HelpCircle, Image, Map, Plane, Hotel, Users, CreditCard, Package } from 'lucide-svelte';
import { flightStorageStore } from '$lib/stores/flightStorageStore.svelte.js';
import { hotelStorageStore } from '$lib/stores/hotelStorageStore.svelte.js';

export class PackageState {
    // Top Level Tabs
    activeSection = $state('flight'); // flight, packages, variant-info, variant-ground

    // View mode: 'main' = top-level (flight/variant list), 'variant' = inside a variant
    viewMode = $state('main');

    // Flight Info (Root Entity)
    flightInfo = $state({
        airline: '', // e.g. Malaysia Airlines
        airlineCode: '', // e.g. MH
        flightNumber: '', // e.g. 804
        departureDate: '',
        arrivalDate: '',
        departureCity: '',
        arrivalCity: '',
        seatQuota: 0,
        batchName: '', // e.g. MH 804 17 Aug
        status: 'Draft'
    });

    // Itinerary (Shared across all packages in this flight)
    itinerary = $state([]);

    // Package Variants (The "Children")
    // Each variant has its own hotel, meals, price, etc.
    packageVariants = $state([]);

    // UI States
    activeVariantId = $state(null); // ID of the package variant currently being edited
    activeVariantTab = $state('hotel'); // hotel, meal, transport, services, pricing
    showVariantModal = $state(false);

    // Enter variant detail view
    enterVariant(variantId) {
        this.activeVariantId = variantId;
        this.viewMode = 'variant';
        this.activeSection = 'variant-info';
    }

    // Go back to main view
    exitVariant() {
        this.activeVariantId = null;
        this.viewMode = 'main';
        this.activeSection = 'packages';
    }

    // Get active variant
    get activeVariant() {
        return this.packageVariants.find(v => v.id === this.activeVariantId) || null;
    }

    // List of available flights from storage
    get availableFlights() {
        return flightStorageStore.confirmBookings;
    }

    // Selected Flight ID
    selectedFlightId = $state('');

    // --- Actions ---

    selectFlightBooking(bookingId) {
        const booking = this.availableFlights.find(b => b.id === bookingId);
        if (!booking) return;

        this.selectedFlightId = bookingId;

        // Auto-fill Flight Info
        // Assuming the first sector is the departure flight
        const firstSector = booking.sectors && booking.sectors.length > 0 ? booking.sectors[0] : null;

        if (firstSector) {
            this.flightInfo.airline = firstSector.supplier || booking.airline; // Use supplier or code
            this.flightInfo.airlineCode = firstSector.carrier; // e.g. SV
            this.flightInfo.flightNumber = firstSector.carrierNo; // e.g. 828
            this.flightInfo.departureDate = firstSector.departureDate;
            this.flightInfo.departureCity = firstSector.fromCity;
            this.flightInfo.arrivalCity = firstSector.toCity;

            // Auto-generate Batch Name
            const dateStr = firstSector.departureDate
                ? new Date(firstSector.departureDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long' })
                : '';
            this.flightInfo.batchName = `${firstSector.carrier} ${dateStr}`.trim();
        }

        // Use total seats from booking as default quota
        this.flightInfo.seatQuota = booking.totalSeats || 0;
    }

    addVariant() {
        const newVariant = {
            id: crypto.randomUUID(),
            name: 'New Package', // e.g. Gold, Silver
            type: 'Quad', // Default (Legacy Type? Keep for now or use types array?)
            // Information Fields (Moved from Global)
            categories: [], // Multi: e.g. ['Umrah', 'Hajj']
            types: [], // Multi: e.g. ['Economy', 'VIP']
            durationDays: 0,
            durationNights: 0,
            paxCapacity: 0,
            validityStartDate: '',
            validityEndDate: '',

            hotels: [],
            meals: [],
            transport: [],
            services: [],
            pricing: {
                quad: 0,
                triple: 0,
                double: 0
            }
        };
        this.packageVariants.push(newVariant);
        this.enterVariant(newVariant.id);
    }

    removeVariant(id) {
        this.packageVariants = this.packageVariants.filter(v => v.id !== id);
        if (this.activeVariantId === id) {
            this.activeVariantId = this.packageVariants.length ? this.packageVariants[0].id : null;
        }
    }

    // --- Accommodation Logic ---
    showAccommodationModal = $state(false);
    editingAccommodationIndex = $state(null);
    accommodationForm = $state({
        city: '',
        hotel: '',
        hotelId: '',
        selectedHotelData: null, // { hotelName, city, starRating, location, distanceToHaram, features }
        supplier: '',
        roomType: [],
        checkIn: '',
        checkOut: '',
        nights: 0,
        basis: '',
        rateCode: '',
        packageMeals: '',
        hotelView: '',
        vat: '',
        municipalityTax: '',
        vatPercent: 15,
        municipalityTaxPercent: 5,
        adultCost: 0, adultSell: 0, adultOrs: 0, adultTotal: 0,
        childCost: 0, childSell: 0, childOrs: 0, childTotal: 0
    });

    // Get hotels filtered by selected city
    get hotelsForSelectedCity() {
        const city = this.accommodationForm.city;
        if (!city) return [];
        return hotelStorageStore.hotels.filter(h => h.city === city);
    }

    // Select hotel from storage and auto-fill details
    selectHotelForAccommodation(hotelId) {
        const hotel = hotelStorageStore.hotels.find(h => h.hotelId === hotelId);
        if (hotel) {
            this.accommodationForm.hotel = hotel.hotelName;
            this.accommodationForm.hotelId = hotel.hotelId;
            this.accommodationForm.selectedHotelData = {
                hotelName: hotel.hotelName,
                city: hotel.city,
                starRating: hotel.starRating || 0,
                location: hotel.location || '',
                distanceToHaram: hotel.distanceToHaram || '',
                features: hotel.features || []
            };
        } else {
            this.accommodationForm.hotel = '';
            this.accommodationForm.hotelId = '';
            this.accommodationForm.selectedHotelData = null;
        }
    }

    // When city changes, reset hotel selection
    onAccommodationCityChange() {
        this.accommodationForm.hotel = '';
        this.accommodationForm.hotelId = '';
        this.accommodationForm.selectedHotelData = null;
    }

    resetAccommodationForm() {
        this.editingAccommodationIndex = null;
        this.accommodationForm = {
            city: '', hotel: '', hotelId: '', selectedHotelData: null,
            supplier: '', roomType: [], checkIn: '', checkOut: '', nights: 0,
            basis: '', rateCode: '', packageMeals: '', hotelView: '',
            vat: '', municipalityTax: '', vatPercent: 15, municipalityTaxPercent: 5,
            adultCost: 0, adultSell: 0, adultOrs: 0, adultTotal: 0,
            childCost: 0, childSell: 0, childOrs: 0, childTotal: 0
        };
    }

    calculateNights() {
        if (this.accommodationForm.checkIn && this.accommodationForm.checkOut) {
            const start = new Date(this.accommodationForm.checkIn);
            const end = new Date(this.accommodationForm.checkOut);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            this.accommodationForm.nights = diffDays;
        }
    }

    calculateTotals() {
        const f = this.accommodationForm;
        f.adultTotal = (Number(f.adultCost) || 0) + (Number(f.adultSell) || 0) + (Number(f.adultOrs) || 0);
        f.childTotal = (Number(f.childCost) || 0) + (Number(f.childSell) || 0) + (Number(f.childOrs) || 0);
    }

    saveAccommodation = () => {
        const activeVariant = this.packageVariants.find(v => v.id === this.activeVariantId);
        if (!activeVariant) return;

        const newItem = $state.snapshot(this.accommodationForm);

        if (this.editingAccommodationIndex !== null) {
            activeVariant.hotels[this.editingAccommodationIndex] = newItem;
        } else {
            activeVariant.hotels.push(newItem);
        }

        this.showAccommodationModal = false;
        this.resetAccommodationForm();
    };

    editAccommodation(item, index) {
        this.accommodationForm = $state.snapshot(item);
        this.editingAccommodationIndex = index;
        this.showAccommodationModal = true;
    }

    removeAccommodation(index) {
        const activeVariant = this.packageVariants.find(v => v.id === this.activeVariantId);
        if (activeVariant) {
            activeVariant.hotels = activeVariant.hotels.filter((_, i) => i !== index);
        }
    }

    // --- Meals Logic ---
    showMealsModal = $state(false);
    editingMealsIndex = $state(null);
    mealsForm = $state({
        supplier: '',
        hotel: '',
        foodType: '',
        fromDate: '',
        toDate: '',
        nights: 0,
        rateCode: '',
        vat: '',
        vatPercent: 15,
        adultCost: 0, adultSell: 0, adultOrs: 0, adultTotal: 0,
        childCost: 0, childSell: 0, childOrs: 0, childTotal: 0
    });

    resetMealsForm() {
        this.editingMealsIndex = null;
        this.mealsForm = {
            supplier: '', hotel: '', foodType: '', fromDate: '', toDate: '', nights: 0,
            rateCode: '', vat: '', vatPercent: 15,
            adultCost: 0, adultSell: 0, adultOrs: 0, adultTotal: 0,
            childCost: 0, childSell: 0, childOrs: 0, childTotal: 0
        };
    }

    calculateMealsTotals() {
        const f = this.mealsForm;
        f.adultTotal = (Number(f.adultCost) || 0) + (Number(f.adultSell) || 0) + (Number(f.adultOrs) || 0);
        f.childTotal = (Number(f.childCost) || 0) + (Number(f.childSell) || 0) + (Number(f.childOrs) || 0);
    }

    saveMeals = () => {
        const activeVariant = this.packageVariants.find(v => v.id === this.activeVariantId);
        if (!activeVariant) return;

        const newItem = $state.snapshot(this.mealsForm);

        if (this.editingMealsIndex !== null) {
            activeVariant.meals[this.editingMealsIndex] = newItem;
        } else {
            activeVariant.meals.push(newItem);
        }

        this.showMealsModal = false;
        this.resetMealsForm();
    };

    editMeals(item, index) {
        this.mealsForm = $state.snapshot(item);
        this.editingMealsIndex = index;
        this.showMealsModal = true;
    }

    removeMeals(index) {
        const activeVariant = this.packageVariants.find(v => v.id === this.activeVariantId);
        if (activeVariant) {
            activeVariant.meals = activeVariant.meals.filter((_, i) => i !== index);
        }
    }

    // Export for DB
    exportData() {
        return $state.snapshot({
            flight: this.flightInfo,
            itinerary: this.itinerary,
            packages: this.packageVariants
        });
    }
}
