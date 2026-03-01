import { Info, FileText, CheckCircle, HelpCircle, Image, Map, Plane, Hotel, Users, CreditCard, Package } from 'lucide-svelte';
import { flightStorageStore } from '$lib/stores/flightStorageStore.svelte.js';
import { supabase } from '$lib/supabase';

export class PackageState {
    // Top Level Tabs
    activeSection = $state('flight'); // flight, packages, variant-info, variant-ground
    batchId = $state(null); // ID of the flight batch (package) being edited

    // View mode: 'main' = top-level (flight/variant list), 'variant' = inside a variant
    viewMode = $state('main');

    // Supabase Master Data
    masterHotels = $state([]);
    masterHotelContracts = $state([]);
    masterSuppliers = $state([]);

    // New Supabase Master Data for dropdowns
    masterFoodTypes = $state([]);
    masterBasisTypes = $state([]);
    masterVehicles = $state([]);
    masterRoutes = $state([]);
    masterServices = $state([]);
    masterRoomTypes = $state([]);
    masterHotelViews = $state([]);

    async init() {
        try {
            const [
                hotelsRes, contractsRes, suppliersRes,
                foodTypesRes, basisRes, vehiclesRes, routesRes,
                servicesRes, roomTypesRes, viewsRes
            ] = await Promise.all([
                supabase.from('master_hotels').select('*'),
                supabase.from('master_hotel_contracts').select(`
                    id, contract_number, title, start_date, end_date, hotel_id, supplier_id, waves,
                    master_hotel_contract_periods (
                        id, name, start_date, end_date,
                        master_hotel_contract_rates (
                            id, period_id, room_type_id, cost_price, selling_price, ors_margin
                        )
                    )
                `),
                supabase.from('master_suppliers').select('*'),
                supabase.from('master_meal_food_types').select('*'),
                supabase.from('master_meal_basis').select('*'),
                supabase.from('master_transport_vehicles').select('*'),
                supabase.from('master_transport_routes').select('*'),
                supabase.from('master_services').select('*'),
                supabase.from('master_hotel_room_types').select('*'),
                supabase.from('master_hotel_views').select('*')
            ]);

            if (hotelsRes.data) this.masterHotels = hotelsRes.data;
            if (contractsRes.data) this.masterHotelContracts = contractsRes.data;
            if (suppliersRes.data) this.masterSuppliers = suppliersRes.data;

            if (foodTypesRes.data) this.masterFoodTypes = foodTypesRes.data;
            if (basisRes.data) this.masterBasisTypes = basisRes.data;
            if (vehiclesRes.data) this.masterVehicles = vehiclesRes.data;
            if (routesRes.data) this.masterRoutes = routesRes.data;
            if (servicesRes.data) this.masterServices = servicesRes.data;
            if (roomTypesRes.data) this.masterRoomTypes = roomTypesRes.data;
            if (viewsRes.data) this.masterHotelViews = viewsRes.data;

        } catch (err) {
            console.error('Failed to fetch master data', err);
        }
    }

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
        for (const contract of this.masterHotelContracts) {
            const hotel = this.masterHotels.find(h => h.id === contract.hotel_id);
            if (!hotel || !contract.waves) continue;
            for (const wave of contract.waves) {
                if (!wave.tripName) {
                    waves.push({
                        ...wave,
                        hotelName: hotel.name,
                        contractName: contract.title,
                        fullLabel: `${hotel.name} - ${contract.title} - ${wave.name} (${wave.checkIn} to ${wave.checkOut})`
                    });
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
        const fromHotels = this.masterHotels.map(h => h.city);
        return [...new Set(fromHotels)].filter(Boolean).sort();
    }

    get hotelSuppliers() {
        return this.masterSuppliers.filter(s => s.is_supplier).map(s => s.name);
    }

    get mealSuppliers() {
        // Source if exists in master data, otherwise unique from existing meals as fallback
        return ["Ibtisam Catering", "Dallah Groups", "Al Baik Catering"]; // Centralized for now if no store
    }

    get foodTypes() {
        return this.masterFoodTypes.map(ft => ft.name);
    }

    get transportVehicles() {
        return this.masterVehicles.map(v => v.name);
    }

    get transportSuppliers() {
        return this.masterSuppliers.filter(s => s.is_supplier).map(s => s.name);
    }

    get transportRoutes() {
        return this.masterRoutes.map(r => r.name);
    }

    get serviceCategories() {
        return this.masterServices.map(s => s.name);
    }

    get serviceSuppliers() {
        return this.masterSuppliers.filter(s => s.is_supplier).map(s => s.name);
    }

    get packageCategories() {
        return ["Umrah", "Hajj", "Tour", "Plus"];
    }

    get packageTypes() {
        return ["Economy", "Premium", "VIP", "Group", "Private"];
    }

    get roomTypes() {
        return this.masterRoomTypes.map(rt => rt.name);
    }

    get basisTypes() {
        return this.masterBasisTypes.map(b => b.name);
    }

    get hotelViews() {
        return this.masterHotelViews.map(hv => hv.name);
    }

    // Select Hotel Wave and Pre-fill Accommodation Form
    selectHotelWaveForAccommodation(waveId) {
        const wave = this.availableHotelWaves.find(w => w.id === waveId);
        if (wave) {
            this.accommodationForm.selectedWaveId = waveId;
            const hotel = this.masterHotels.find(h => h.name === wave.hotelName);
            this.accommodationForm.city = hotel?.city || '';
            this.accommodationForm.hotelId = hotel?.id || '';
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
        return this.masterHotels.filter(h => h.city === city);
    }

    // Get contracts for selected hotel
    get contractsForSelectedHotel() {
        const hotelId = this.accommodationForm.hotelId;
        if (!hotelId) return [];
        return this.masterHotelContracts.filter(c => c.hotel_id === hotelId);
    }

    // Change contract handler
    onContractChange() {
        const contract = this.masterHotelContracts.find(c => c.id === this.accommodationForm.contractId);
        if (contract) {
            // we could preset dates or rates later, right now let's just make sure it's valid 
        }
    }

    // Select hotel from storage and auto-fill details
    selectHotelForAccommodation(hotelId) {
        const hotel = this.masterHotels.find(h => h.id === hotelId);
        if (hotel) {
            this.accommodationForm.hotel = hotel.name;
            this.accommodationForm.hotelId = hotel.id;
            this.accommodationForm.selectedHotelData = {
                hotelName: hotel.name,
                city: hotel.city,
                starRating: hotel.star_rating || 0,
                location: hotel.district || '',
                distanceToHaram: hotel.distance_from_city || '',
                features: []
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
            city: '', hotel: '', hotelId: '', contractId: '', selectedHotelData: null,
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
    async load(id) {
        if (!id) return;
        this.batchId = id;

        const { data: batch, error: batchError } = await supabase
            .from('flight_batches')
            .select('*')
            .eq('id', id)
            .single();

        if (batchError || !batch) return;

        this.flightInfo = {
            airline: batch.airline || '',
            airlineCode: batch.flight_code?.split(' ')[0] || '',
            flightNumber: batch.flight_code?.split(' ')[1] || '',
            departureDate: batch.departure_date || '',
            arrivalDate: batch.arrival_date || '',
            departureCity: '',
            arrivalCity: '',
            batchName: batch.name || '',
            status: batch.status || 'Active',
            seatQuota: 0
        };

        this.itinerary = batch.itinerary || [];

        const { data: dbVariants } = await supabase
            .from('package_variants')
            .select(`
                *,
                variant_hotels (*),
                variant_meals (*),
                variant_transport (*),
                variant_services (*),
                variant_additional (*)
            `)
            .eq('batch_id', id);

        this.packageVariants = (dbVariants || []).map(v => ({
            id: v.id,
            name: v.name,
            categories: v.categories || [],
            types: v.variant_types || [],
            durationDays: v.duration_days || 0,
            durationNights: v.duration_nights || 0,
            pricing: v.pricing || { double: 0, triple: 0, quad: 0, quint: 0 },
            hotels: (v.variant_hotels || []).map(h => ({
                city: h.city || '',
                hotel: h.hotel_name || '',
                hotelId: h.hotel_id || '',
                checkIn: h.check_in || '',
                checkOut: h.check_out || '',
                nights: h.nights || 0,
                roomType: h.room_types || [],
                basis: h.basis || '',
                adultCost: Number(h.cost_per_pax) || 0,
                adultSell: Number(h.selling_price) || 0,
                adultOrs: Number(h.ors_margin) || 0,
                adultTotal: (Number(h.cost_per_pax) || 0) + (Number(h.selling_price) || 0) + (Number(h.ors_margin) || 0),
                supplier: h.supplier || '',
                rateCode: h.rate_code || '',
                packageMeals: h.package_meals || '',
                hotelView: h.hotel_view || '',
                vat: h.vat || '',
                municipalityTax: h.municipality_tax || '',
                vatPercent: h.vat_percent || 15,
                municipalityTaxPercent: h.municipality_tax_percent || 5,
                childCost: Number(h.child_cost) || 0,
                childSell: Number(h.child_sell) || 0,
                childOrs: Number(h.child_ors) || 0,
                contractId: h.contract_id || ''
            })),
            meals: (v.variant_meals || []).map(m => ({
                supplier: m.supplier || '',
                hotel: m.hotel || '',
                foodType: m.food_type || '',
                fromDate: m.from_date || '',
                toDate: m.to_date || '',
                nights: m.nights || 0,
                rateCode: m.rate_code || '',
                vat: m.vat || '',
                vatPercent: m.vat_percent || 15,
                adultCost: Number(m.adult_cost) || 0,
                adultSell: Number(m.adult_sell) || 0,
                adultOrs: Number(m.adult_ors) || 0,
                adultTotal: (Number(m.adult_cost) || 0) + (Number(m.adult_sell) || 0) + (Number(m.adult_ors) || 0),
                childCost: Number(m.child_cost) || 0,
                childSell: Number(m.child_sell) || 0,
                childOrs: Number(m.child_ors) || 0
            })),
            transport: (v.variant_transport || []).map(t => ({
                vehicle: t.vehicle_type || '',
                supplier: t.supplier_name || '',
                route: t.route || '',
                adultCost: Number(t.cost_per_pax) || 0,
                adultSell: Number(t.selling_price) || 0,
                childCost: Number(t.child_cost) || 0,
                childSell: Number(t.child_sell) || 0
            })),
            services: (v.variant_services || []).map(s => ({
                category: s.category || '',
                supplier: s.supplier_name || '',
                description: s.description || '',
                cost: Number(s.cost) || 0,
                sell: Number(s.sell) || 0
            })),
            additional: (v.variant_additional || []).map(a => ({
                name: a.name || '',
                description: a.description || '',
                cost: Number(a.cost) || 0,
                sell: Number(a.sell) || 0
            }))
        }));
    }

    async save() {
        if (!this.flightInfo.batchName) {
            alert('Please specify a batch name.');
            return;
        }

        const isUuid = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
        const finalBatchId = (this.batchId && isUuid(this.batchId)) ? this.batchId : crypto.randomUUID();
        this.batchId = finalBatchId;

        const batchToSave = {
            id: finalBatchId,
            name: this.flightInfo.batchName,
            airline: this.flightInfo.airline,
            flight_code: `${this.flightInfo.airlineCode} ${this.flightInfo.flightNumber}`.trim(),
            departure_date: this.flightInfo.departureDate || null,
            arrival_date: this.flightInfo.arrivalDate || null,
            status: this.flightInfo.status || 'Active',
            image: '✈️',
            itinerary: $state.snapshot(this.itinerary)
        };

        const { error: batchError } = await supabase.from('flight_batches').upsert(batchToSave);
        if (batchError) {
            console.error('Error saving batch:', batchError);
            alert('Failed to save batch data.');
            return;
        }

        const variants = $state.snapshot(this.packageVariants);

        // Delete variants that are no longer in the state
        const { data: existingVariants } = await supabase.from('package_variants').select('id').eq('batch_id', finalBatchId);
        if (existingVariants) {
            const currentVariantIds = variants.map(v => v.id);
            const variantsToDelete = existingVariants.filter(ev => !currentVariantIds.includes(ev.id)).map(v => v.id);
            if (variantsToDelete.length > 0) {
                await supabase.from('package_variants').delete().in('id', variantsToDelete);
            }
        }

        for (const v of variants) {
            const variantId = (v.id && isUuid(v.id)) ? v.id : crypto.randomUUID();
            v.id = variantId;

            const variantToSave = {
                id: variantId,
                batch_id: finalBatchId,
                name: v.name,
                categories: v.categories || [],
                variant_types: v.types || [],
                duration_days: v.durationDays || null,
                duration_nights: v.durationNights || null,
                pricing: v.pricing || { double: 0, triple: 0, quad: 0, quint: 0 }
            };

            const { error: variantError } = await supabase.from('package_variants').upsert(variantToSave);
            if (variantError) {
                console.error('Error saving variant:', variantError);
                continue;
            }

            // Clear nested items to avoid duplicates
            await Promise.all([
                supabase.from('variant_hotels').delete().eq('variant_id', variantId),
                supabase.from('variant_transport').delete().eq('variant_id', variantId),
                supabase.from('variant_services').delete().eq('variant_id', variantId),
                supabase.from('variant_meals').delete().eq('variant_id', variantId),
                supabase.from('variant_additional').delete().eq('variant_id', variantId)
            ]);

            // Insert new nested items
            if (v.hotels?.length) {
                const hotels = v.hotels.map(h => ({
                    variant_id: variantId,
                    city: h.city,
                    hotel_name: h.hotel,
                    hotel_id: h.hotelId || null,
                    check_in: h.checkIn || null,
                    check_out: h.checkOut || null,
                    nights: h.nights || null,
                    room_types: h.roomType || [],
                    basis: h.basis || null,
                    cost_per_pax: h.adultCost || 0,
                    selling_price: h.adultSell || 0,
                    ors_margin: h.adultOrs || 0,
                    supplier: h.supplier || null,
                    rate_code: h.rateCode || null,
                    package_meals: h.packageMeals || null,
                    hotel_view: h.hotelView || null,
                    vat: h.vat || null,
                    municipality_tax: h.municipalityTax || null,
                    vat_percent: h.vatPercent || 15,
                    municipality_tax_percent: h.municipalityTaxPercent || 5,
                    child_cost: h.childCost || 0,
                    child_sell: h.childSell || 0,
                    child_ors: h.childOrs || 0,
                    contract_id: h.contractId || null
                }));
                await supabase.from('variant_hotels').insert(hotels);
            }

            if (v.transport?.length) {
                const tr = v.transport.map(t => ({
                    variant_id: variantId,
                    vehicle_type: t.vehicle || null,
                    supplier_name: t.supplier || null,
                    route: t.route || null,
                    cost_per_pax: t.adultCost || 0,
                    selling_price: t.adultSell || 0,
                    child_cost: t.childCost || 0,
                    child_sell: t.childSell || 0
                }));
                await supabase.from('variant_transport').insert(tr);
            }

            if (v.services?.length) {
                const svc = v.services.map(s => ({
                    variant_id: variantId,
                    category: s.category || null,
                    supplier_name: s.supplier || null,
                    description: s.description || null,
                    cost: s.cost || 0,
                    sell: s.sell || 0
                }));
                await supabase.from('variant_services').insert(svc);
            }

            if (v.meals?.length) {
                const meals = v.meals.map(m => ({
                    variant_id: variantId,
                    supplier: m.supplier || null,
                    hotel: m.hotel || null,
                    food_type: m.foodType || null,
                    from_date: m.fromDate || null,
                    to_date: m.toDate || null,
                    nights: m.nights || 0,
                    rate_code: m.rateCode || null,
                    vat: m.vat || null,
                    vat_percent: m.vatPercent || 15,
                    adult_cost: m.adultCost || 0,
                    adult_sell: m.adultSell || 0,
                    adult_ors: m.adultOrs || 0,
                    child_cost: m.childCost || 0,
                    child_sell: m.childSell || 0,
                    child_ors: m.childOrs || 0
                }));
                await supabase.from('variant_meals').insert(meals);
            }

            if (v.additional?.length) {
                const addl = v.additional.map(a => ({
                    variant_id: variantId,
                    name: a.name || null,
                    description: a.description || null,
                    cost: a.cost || 0,
                    sell: a.sell || 0
                }));
                await supabase.from('variant_additional').insert(addl);
            }
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
