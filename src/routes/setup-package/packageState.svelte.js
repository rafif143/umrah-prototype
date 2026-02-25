import { Info, FileText, CheckCircle, HelpCircle, Image, Map, Plane, Hotel, Users, CreditCard, Package } from 'lucide-svelte';
import { flightStorageStore } from '$lib/stores/flightStorageStore.svelte.js';
import { hotelStorageStore } from '$lib/stores/hotelStorageStore.svelte.js';
import { hotelStore } from '$lib/stores/hotelStore.svelte.js';
import { mealStore } from '$lib/stores/mealStore.svelte.js';
import { transportStore } from '$lib/stores/transportStore.svelte.js';
import { serviceStore } from '$lib/stores/serviceStore.svelte.js';
import { packageStore } from '$lib/stores/packageStore.svelte.js';

export class PackageState {
    // Top Level Tabs
    activeSection = $state('flight'); // flight, packages, variant-info, variant-ground
    batchId = $state(null); // ID of the flight batch (package) being edited

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

    // Available Hotel Waves (Unused)
    get availableHotelWaves() {
        const waves = [];
        for (const hotel of hotelStorageStore.hotels) {
            for (const contract of hotel.contracts) {
                for (const wave of contract.waves) {
                    if (!wave.tripName) {
                        waves.push({
                            ...wave,
                            hotelName: hotel.hotelName,
                            contractName: contract.name,
                            fullLabel: `${hotel.hotelName} - ${contract.name} - ${wave.name} (${wave.checkIn} to ${wave.checkOut})`
                        });
                    }
                }
            }
        }
        return waves;
    }

    // Selected Hotel Wave for this Package
    selectedHotelWaveId = $state('');

    get selectedHotelWave() {
        return this.availableHotelWaves.find(w => w.id === this.selectedHotelWaveId) || null;
    }

    // --- Master Data Getters (Non-Hardcoded) ---
    get cities() {
        const fromHotels = hotelStorageStore.hotels.map(h => h.city);
        return [...new Set(fromHotels)].filter(Boolean).sort();
    }

    get hotelSuppliers() {
        return hotelStore.hotels.map(h => h.name);
    }

    get mealSuppliers() {
        // Source if exists in master data, otherwise unique from existing meals as fallback
        return ["Ibtisam Catering", "Dallah Groups", "Al Baik Catering"]; // Centralized for now if no store
    }

    get foodTypes() {
        return mealStore.foodTypes.map(ft => ft.name);
    }

    get transportVehicles() {
        return transportStore.vehicleTypes.map(v => v.name);
    }

    get transportSuppliers() {
        return transportStore.suppliers.map(s => s.name);
    }

    get transportRoutes() {
        return transportStore.routes.map(r => r.name);
    }

    get serviceCategories() {
        return ["Visa", "Mutawif", "Insurance", "Other"];
    }

    get serviceSuppliers() {
        return serviceStore.suppliers.map(s => s.name);
    }

    get packageCategories() {
        return ["Umrah", "Hajj", "Tour", "Plus"];
    }

    get packageTypes() {
        return ["Economy", "Premium", "VIP", "Group", "Private"];
    }

    get roomTypes() {
        return ["Double", "Triple", "Quad", "Quint"];
    }

    get basisTypes() {
        return mealStore.bases.map(b => b.name);
    }

    get hotelViews() {
        return hotelStore.hotelViews.map(hv => hv.name);
    }

    // Select Hotel Wave and Pre-fill Accommodation Form
    selectHotelWaveForAccommodation(waveId) {
        const wave = this.availableHotelWaves.find(w => w.id === waveId);
        if (wave) {
            this.accommodationForm.selectedWaveId = waveId;
            this.accommodationForm.city = hotelStorageStore.hotels.find(h => h.hotelName === wave.hotelName)?.city || '';
            this.accommodationForm.hotelId = hotelStorageStore.hotels.find(h => h.hotelName === wave.hotelName)?.hotelId || '';
            // Trigger hotel selection logic to fill details
            this.selectHotelForAccommodation(this.accommodationForm.hotelId);

            this.accommodationForm.checkIn = wave.checkIn;
            this.accommodationForm.checkOut = wave.checkOut;
            this.calculateNights();
        }
    }

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
            additional: [],
            pricing: {
                double: 0,
                triple: 0,
                quad: 0,
                quint: 0
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

    // --- Transport Logic ---
    showTransportModal = $state(false);
    editingTransportIndex = $state(null);
    transportForm = $state({
        vehicle: '',
        supplier: '',
        route: '',
        adultCost: 0, adultSell: 0,
        childCost: 0, childSell: 0
    });

    resetTransportForm() {
        this.editingTransportIndex = null;
        this.transportForm = {
            vehicle: '', supplier: '', route: '',
            adultCost: 0, adultSell: 0,
            childCost: 0, childSell: 0
        };
    }

    saveTransport = () => {
        const activeVariant = this.activeVariant;
        if (!activeVariant) return;
        const newItem = $state.snapshot(this.transportForm);
        if (this.editingTransportIndex !== null) {
            activeVariant.transport[this.editingTransportIndex] = newItem;
        } else {
            activeVariant.transport.push(newItem);
        }
        this.showTransportModal = false;
        this.resetTransportForm();
    };

    editTransport(item, index) {
        this.transportForm = $state.snapshot(item);
        this.editingTransportIndex = index;
        this.showTransportModal = true;
    }

    removeTransport(index) {
        if (this.activeVariant) {
            this.activeVariant.transport = this.activeVariant.transport.filter((_, i) => i !== index);
        }
    }

    // --- Services Logic ---
    showServiceModal = $state(false);
    editingServiceIndex = $state(null);
    serviceForm = $state({
        category: '',
        supplier: '',
        description: '',
        cost: 0, sell: 0
    });

    resetServiceForm() {
        this.editingServiceIndex = null;
        this.serviceForm = {
            category: '', supplier: '', description: '',
            cost: 0, sell: 0
        };
    }

    saveService = () => {
        const activeVariant = this.activeVariant;
        if (!activeVariant) return;
        const newItem = $state.snapshot(this.serviceForm);
        if (this.editingServiceIndex !== null) {
            activeVariant.services[this.editingServiceIndex] = newItem;
        } else {
            activeVariant.services.push(newItem);
        }
        this.showServiceModal = false;
        this.resetServiceForm();
    };

    editService(item, index) {
        this.serviceForm = $state.snapshot(item);
        this.editingServiceIndex = index;
        this.showServiceModal = true;
    }

    removeService(index) {
        if (this.activeVariant) {
            this.activeVariant.services = this.activeVariant.services.filter((_, i) => i !== index);
        }
    }

    // --- Additional Costs Logic ---
    showAdditionalModal = $state(false);
    editingAdditionalIndex = $state(null);
    additionalForm = $state({
        name: '',
        description: '',
        cost: 0, sell: 0
    });

    resetAdditionalForm() {
        this.editingAdditionalIndex = null;
        this.additionalForm = {
            name: '', description: '',
            cost: 0, sell: 0
        };
    }

    saveAdditional = () => {
        const activeVariant = this.activeVariant;
        if (!activeVariant) return;
        const newItem = $state.snapshot(this.additionalForm);
        if (this.editingAdditionalIndex !== null) {
            activeVariant.additional[this.editingAdditionalIndex] = newItem;
        } else {
            // Ensure additional transition is initialized
            if (!activeVariant.additional) activeVariant.additional = [];
            activeVariant.additional.push(newItem);
        }
        this.showAdditionalModal = false;
        this.resetAdditionalForm();
    };

    editAdditional(item, index) {
        this.additionalForm = $state.snapshot(item);
        this.editingAdditionalIndex = index;
        this.showAdditionalModal = true;
    }

    removeAdditional(index) {
        if (this.activeVariant) {
            this.activeVariant.additional = this.activeVariant.additional.filter((_, i) => i !== index);
        }
    }

    // --- Persistence ---
    load(id) {
        const batch = packageStore.packages.find(p => p.id === id);
        if (!batch) return;

        this.batchId = batch.id;
        this.flightInfo = {
            airline: batch.airline || '',
            airlineCode: batch.flightCode?.split(' ')[0] || '',
            flightNumber: batch.flightCode?.split(' ')[1] || '',
            departureDate: batch.departureDate || '',
            arrivalDate: batch.arrivalDate || '',
            departureCity: '',
            arrivalCity: '',
            batchName: batch.name || '',
            status: batch.status || 'Active',
            seatQuota: 0
        };

        this.itinerary = batch.itinerary || [];
        this.packageVariants = $state.snapshot(batch.variants || []).map(v => ({
            ...v,
            categories: v.categories || [],
            types: v.types || [],
            hotels: (v.hotels || []).map(h => ({
                ...h,
                adultCost: h.adultCost || 0,
                adultSell: h.adultSell || 0,
                adultOrs: h.adultOrs || h.ors_margin || 0,
                adultTotal: (h.adultCost || 0) + (h.adultSell || 0) + (h.adultOrs || h.ors_margin || 0)
            })),
            meals: (v.meals || []).map(m => ({
                ...m,
                adultCost: m.adultCost || 0,
                adultSell: m.adultSell || 0,
                adultOrs: m.adultOrs || 0,
                adultTotal: (m.adultCost || 0) + (m.adultSell || 0) + (m.adultOrs || 0)
            })),
            transport: (v.transport || []).map(t => ({
                ...t,
                adultCost: t.adultCost || 0,
                adultSell: t.adultSell || t.sell || 0,
                childCost: t.childCost || 0,
                childSell: t.childSell || 0
            })),
            services: (v.services || []).map(s => ({
                ...s,
                cost: s.cost || 0,
                sell: s.sell || 0
            })),
            additional: (v.additional || []).map(a => ({
                ...a,
                cost: a.cost || 0,
                sell: a.sell || 0
            })),
            pricing: v.pricing || { double: 0, triple: 0, quad: 0, quint: 0 }
        }));
    }

    save() {
        const batchToSave = {
            id: this.batchId || `batch-${Date.now()}`,
            name: this.flightInfo.batchName,
            airline: this.flightInfo.airline,
            flightCode: `${this.flightInfo.airlineCode} ${this.flightInfo.flightNumber}`,
            departureDate: this.flightInfo.departureDate,
            arrivalDate: this.flightInfo.arrivalDate,
            status: this.flightInfo.status || 'Active',
            image: '✈️',
            itinerary: $state.snapshot(this.itinerary),
            variants: $state.snapshot(this.packageVariants)
        };

        const existing = packageStore.packages.find(p => p.id === batchToSave.id);
        if (existing) {
            packageStore.updatePackage(batchToSave.id, batchToSave);
        } else {
            packageStore.addPackage(batchToSave);
        }

        window.location.href = '/package-management';
    }

    // Export for DB
    exportData() {
        return $state.snapshot({
            batchId: this.batchId,
            flight: this.flightInfo,
            itinerary: this.itinerary,
            packages: this.packageVariants
        });
    }
}
