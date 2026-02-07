import { Info, FileText, CheckCircle, HelpCircle, Image, Map, Plane, Hotel, Users, CreditCard } from 'lucide-svelte';

export class PackageState {
    // Main tab state
    activeSection = $state('general');
    generalTab = $state('info');

    // Section states
    activeInfoSection = $state('basic');
    activeTripSection = $state('information');
    peneranganTab = $state('description');
    guideTab = $state('guide');
    tripSetupTab = $state('accomodation');
    showTripSetup = $state(false);

    // Basic Info State
    basicInfo = $state({
        name: '',
        category: '',
        subCategory: '',
        duration: ''
    });

    // Detailed Info State
    descriptions = $state([{ image: '', text: '' }]);
    targetAudience = $state([]);
    includedItems = $state([]);
    excludedItems = $state([]);
    faqList = $state([{ question: '', answer: '' }]);
    galleryImages = $state([]);

    loadPackage(pkg) {
        if (!pkg) return;
        // Basic Info
        this.basicInfo.name = pkg.name || '';
        this.basicInfo.category = pkg.category || '';
        this.basicInfo.subCategory = pkg.subCategory || '';
        this.basicInfo.duration = pkg.duration ? pkg.duration.replace(/\D/g, '') : '';

        // Detailed Info
        this.descriptions = pkg.descriptions?.length ? pkg.descriptions : [{ image: '', text: '' }];
        this.targetAudience = pkg.targetAudience || [];
        this.includedItems = pkg.includedItems || [];
        this.excludedItems = pkg.excludedItems || [];
        this.faqList = pkg.faqList?.length ? pkg.faqList : [{ question: '', answer: '' }];
        this.galleryImages = pkg.galleryImages || [];

        // Trip Lists & Resources
        if (pkg.tripDates) this.tripDates = pkg.tripDates;
        if (pkg.itinerary) this.itinerary = pkg.itinerary;
        if (pkg.flightList) this.flightList = pkg.flightList;
        if (pkg.accommodationList) this.accommodationList = pkg.accommodationList;
        if (pkg.mealsList) this.mealsList = pkg.mealsList;
        if (pkg.transportList) this.transportList = pkg.transportList;
        if (pkg.operationalCostList) this.operationalCostList = pkg.operationalCostList;
        if (pkg.serviceList) this.serviceList = pkg.serviceList;
        if (pkg.roomCalculator) this.roomCalculator = pkg.roomCalculator;
    }

    exportData() {
        return $state.snapshot({
            // Flatten basic info into top-level for compatibility
            name: this.basicInfo.name,
            category: this.basicInfo.category,
            subCategory: this.basicInfo.subCategory,
            duration: this.basicInfo.duration ? `${this.basicInfo.duration} Hari` : '',

            // Full State
            descriptions: this.descriptions,
            targetAudience: this.targetAudience,
            includedItems: this.includedItems,
            excludedItems: this.excludedItems,
            faqList: this.faqList,
            galleryImages: this.galleryImages,

            tripDates: this.tripDates,
            itinerary: this.itinerary,
            flightList: this.flightList,
            accommodationList: this.accommodationList,
            mealsList: this.mealsList,
            transportList: this.transportList,
            operationalCostList: this.operationalCostList,
            serviceList: this.serviceList,
            roomCalculator: this.roomCalculator,

            // Computed/Derived values for list view
            price: this.calculateTotalCosts().grandTotal,
            status: 'Active' // Default
        });
    }

    // Sections for General Info tab
    infoSections = [
        { id: 'basic', label: 'Basic Info', icon: Info },
        { id: 'penerangan', label: 'Penerangan', icon: FileText },
        { id: 'include', label: 'Include/Exclude', icon: CheckCircle },
        { id: 'faq', label: 'FAQ', icon: HelpCircle },
        { id: 'gallery', label: 'Gallery', icon: Image }
    ];

    // Sections for Date Trip tab
    tripSections = [
        { id: 'information', label: 'Information', icon: Info },
        { id: 'itinerary', label: 'Itinerary', icon: Map },
        { id: 'flight', label: 'Flight', icon: Plane },
        { id: 'tripsetup', label: 'Trip Setup', icon: Hotel },
        { id: 'guide', label: 'Guide & Leader', icon: Users },
        { id: 'calculation', label: 'Calculation', icon: CreditCard }
    ];

    // Trip Dates List (Dummy Data)
    tripDates = $state([
        {
            id: 1,
            packageName: 'ACEH SABANG 5 HARI 4 MALAM',
            checkIn: '2024-03-20',
            checkOut: '2024-03-24',
            duration: '5',
            durationNights: '4',
            paxCapacity: 40,
            currentPax: 25,
            allowOverload: false,
            validityStart: '2024-01-01',
            validityEnd: '2024-12-31',
            date: '20 Mar 2024',
            flightCode: 'SV 820 / SV 821',
            price: 'RM 4,990',
            status: 'Active',
            guides: [],
            leaders: []
        }
    ]);

    // Active Trip State (for editing)
    activeTrip = $state({
        id: null,
        checkIn: '',
        checkOut: '',
        paxCapacity: '',
        currentPax: 0,
        allowOverload: false,
        duration: '',
        durationNights: '',
        validityStart: '',
        validityEnd: '',
        guides: [], // { name: '', type: 'guide'|'leader', contact: '' }
        leaders: []
    });

    // Itinerary State (Package Level)
    itinerary = $state([
        { day: 1, title: '', location: '', description: '' }
    ]);

    loadTrip(trip) {
        this.activeTrip = structuredClone($state.snapshot(trip));
        this.activeTrip.guides = trip.guides || [];
        this.activeTrip.leaders = trip.leaders || [];
    }

    resetTrip() {
        this.activeTrip = {
            id: null,
            checkIn: '',
            checkOut: '',
            paxCapacity: '',
            currentPax: 0,
            allowOverload: false,
            duration: '',
            durationNights: '',
            validityStart: '',
            validityEnd: '',
            guides: [],
            leaders: []
        };
    }

    saveTrip() {
        const tripData = $state.snapshot(this.activeTrip);

        // Basic derivation of display fields
        tripData.date = tripData.checkIn ? new Date(tripData.checkIn).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
        tripData.durationText = `${tripData.duration} Hari ${tripData.durationNights} Malam`;

        if (tripData.id) {
            const index = this.tripDates.findIndex(t => t.id === tripData.id);
            if (index !== -1) {
                this.tripDates[index] = { ...this.tripDates[index], ...tripData };
            }
        } else {
            tripData.id = Date.now();
            tripData.status = 'Active';
            tripData.price = 'RM 0'; // Placeholder
            this.tripDates.push(tripData);
        }
    }

    // Accommodation State
    showAccommodationModal = $state(false);
    editingAccommodationIndex = $state(null);
    accommodationList = $state([
        {
            city: 'Makkah',
            hotel: 'Al Safwah Royale Orchid',
            supplier: 'Al Safwah Royale Orchid',
            roomType: 'DBL',
            checkIn: '2024-03-10',
            checkOut: '2024-03-15',
            nights: '5',
            basis: 'Bed & Breakfast',
            rateCode: 'Per Room Per Night',
            vat: 'Select',
            municipalityTax: 'Select',
            packageMeals: 'Breakfast Asian',
            hotelView: 'Haram View',
            adultCost: '250',
            adultSell: '300',
            adultOrs: '50',
            childCost: '150',
            childSell: '200',
            childOrs: '30',
            vatPercent: '15',
            municipalityTaxPercent: '5',
            adultTotal: '690.00',
            childTotal: '456.00'
        },
        // ... (keeping initial data for prototype)
        {
            city: 'Madinah',
            hotel: 'Oberoi Madina',
            supplier: 'Medina Oberoi',
            roomType: 'DBL',
            checkIn: '2024-03-15',
            checkOut: '2024-03-18',
            nights: '3',
            basis: 'Half Board',
            rateCode: 'Per Room Per Night',
            vat: 'Select',
            municipalityTax: 'Select',
            packageMeals: 'Lunch Asian',
            hotelView: 'City View',
            adultCost: '200',
            adultSell: '250',
            adultOrs: '40',
            childCost: '120',
            childSell: '150',
            childOrs: '25',
            vatPercent: '15',
            municipalityTaxPercent: '5',
            adultTotal: '588.00',
            childTotal: '354.00'
        }
    ]);

    accommodationForm = $state(this.getInitialAccommodationForm());

    // Meals State
    showMealsModal = $state(false);
    editingMealsIndex = $state(null);
    mealsList = $state([
        {
            supplier: 'Ibtisam Catering',
            hotel: 'Abdul Aziz Husni',
            foodType: 'FullBoard',
            fromDate: '2024-03-10',
            toDate: '2024-03-15',
            nights: '5',
            rateCode: 'Per Pax',
            vat: 'VAT_2018',
            adultCost: '35',
            adultSell: '35',
            adultOrs: '35',
            childCost: '17.5',
            childSell: '17.5',
            childOrs: '17.5',
            vatPercent: '5',
            adultTotal: '36.75',
            childTotal: '18.38'
        },
        {
            supplier: 'Dallah Groups',
            hotel: 'Dallah Taibah',
            foodType: 'Lunch',
            fromDate: '2024-03-15',
            toDate: '2024-03-18',
            nights: '3',
            rateCode: 'Per Pax',
            vat: 'VAT_2018',
            adultCost: '27.5',
            adultSell: '13.75',
            adultOrs: '28.86',
            childCost: '14.44',
            childSell: '0',
            childOrs: '0',
            vatPercent: '5',
            adultTotal: '28.86',
            childTotal: '14.44'
        }
    ]);

    mealsForm = $state(this.getInitialMealsForm());

    // Transport State
    showTransportModal = $state(false);
    editingTransportIndex = $state(null);
    transportList = $state([
        {
            trip: 'Round Trip',
            supplier: 'Hussain',
            travelDate: '2024-03-15',
            vehicle: 'BUS',
            rateCode: 'Per Pax',
            vat: 'VAT_2018',
            adultCost: '100',
            adultSell: '140',
            adultOrs: '140',
            childCost: '0',
            childSell: '0',
            childOrs: '0',
            infantCost: '0',
            infantSell: '0',
            infantOrs: '0',
            vatPercent: '5',
            adultTotal: '147.00',
            childTotal: '0.00',
            infantTotal: '0.00',
            fixedCost: '',
            fixedTotal: ''
        }
    ]);

    transportForm = $state(this.getInitialTransportForm());

    // Operational Cost State
    showOperationalCostModal = $state(false);
    editingOperationalCostIndex = $state(null);
    operationalCostList = $state([
        {
            localCost: 'Transportation Fee',
            otherCost: 'Visa Processing'
        },
        {
            localCost: 'Guide Services',
            otherCost: ''
        },
        {
            localCost: '',
            otherCost: 'Insurance'
        }
    ]);

    operationalCostForm = $state({
        localCost: '',
        otherCost: ''
    });

    // Service State
    showServiceModal = $state(false);
    editingServiceIndex = $state(null);
    serviceList = $state([
        {
            supplier: 'Private',
            service: 'RAIN',
            adultCost: '0.00',
            adultSell: '0.00',
            adultOrs: '0.00',
            childCost: '0.00',
            childSell: '0.00',
            childOrs: '0.00',
            infantCost: '0.00',
            infantSell: '0.00',
            infantOrs: '0.00'
        }
    ]);

    serviceForm = $state(this.getInitialServiceForm());

    // Room Calculator State
    roomCalculator = $state({
        ber2: { dewasa: 0, kanak: 0, bayi: 0 },
        ber3: { dewasa: 0, kanak: 0, bayi: 0 },
        ber4: { dewasa: 0, kanak: 0, bayi: 0 },
        ber5: { dewasa: 0, kanak: 0, bayi: 0 }
    });

    // Room pricing (configurable for each room type)
    roomPricing = $state({
        ber2: { dewasa: 12000, kanak: 8000, bayi: 2000 },
        ber3: { dewasa: 11000, kanak: 7500, bayi: 1800 },
        ber4: { dewasa: 10000, kanak: 7000, bayi: 1600 },
        ber5: { dewasa: 9000, kanak: 6500, bayi: 1500 }
    });

    // Calculation tab state
    calculationTab = $state('room-simulation');

    // Flight State - Now picks from confirmed storage bookings
    flightList = $state([]);

    flightGroupForm = $state(this.getInitialFlightGroupForm());
    flightItemForm = $state(this.getInitialFlightItemForm());
    showFlightModal = $state(false);
    editingFlightGroupIndex = $state(null);
    editingFlightItemIndex = $state(null);

    // Helpers for Initial Forms
    getInitialFlightGroupForm() {
        return {
            id: crypto.randomUUID(),
            name: '',
            type: '',
            airline: '',
            totalSeats: '',
            items: []
        };
    }

    getInitialFlightItemForm() {
        return {
            id: crypto.randomUUID(),
            type: '', // Arrival, Departure, Transit
            supplier: '',
            departureHall: '',
            carrier: '',
            carrierNo: '',
            departureDate: '',
            fromCity: '',
            departureTime: { hour: '', minute: '', ampm: 'AM' },
            toCity: '',
            arrivalTime: { hour: '', minute: '', ampm: 'AM' },
            registrationTime: '',
            reportingTime: '',
            notes: '',
            totalUmrahDay: '',
            skip7DaysRule: false,
            // Cost structure matches the user's table
            costs: {
                airfare: { adultCost: 0, adultSell: 0, childCost: 0, childSell: 0, infantCost: 0, infantSell: 0 },
                tax: { adultCost: 0, adultSell: 0, childCost: 0, childSell: 0, infantCost: 0, infantSell: 0 },
                ur: { adultCost: 0, adultSell: 0, childCost: 0, childSell: 0, infantCost: 0, infantSell: 0 },
                total: { adultCost: 0, adultSell: 0, childCost: 0, childSell: 0, infantCost: 0, infantSell: 0 }
            }
        };
    }

    // Flight Logic
    resetFlightForms() {
        this.flightGroupForm = this.getInitialFlightGroupForm();
        this.flightItemForm = this.getInitialFlightItemForm();
        this.editingFlightGroupIndex = null;
        this.editingFlightItemIndex = null;
        this.showFlightModal = false;
    }

    saveFlightGroup() {
        if (this.editingFlightGroupIndex !== null) {
            this.flightList[this.editingFlightGroupIndex] = $state.snapshot(this.flightGroupForm);
        } else {
            this.flightList.push($state.snapshot(this.flightGroupForm));
        }
        this.resetFlightForms();
    }

    editFlightGroup(group, index) {
        this.flightGroupForm = structuredClone($state.snapshot(group));
        this.editingFlightGroupIndex = index;
        this.showFlightModal = true;
    }

    removeFlightGroup(index) {
        if (confirm('Are you sure you want to remove this flight group?')) {
            this.flightList = this.flightList.filter((_, i) => i !== index);
        }
    }

    addFlightItemToGroup() {
        // Calculate totals for the item before pushing
        this.calculateFlightItemTotal(this.flightItemForm);
        this.flightGroupForm.items.push(structuredClone($state.snapshot(this.flightItemForm)));
        this.flightItemForm = this.getInitialFlightItemForm(); // Reset for next item
    }

    removeFlightItemFromGroup(index) {
        this.flightGroupForm.items = this.flightGroupForm.items.filter((_, i) => i !== index);
    }

    editFlightItemInGroup(item, index) {
        this.flightItemForm = structuredClone($state.snapshot(item));
        this.editingFlightItemIndex = index;
    }

    updateFlightItemInGroup() {
        if (this.editingFlightItemIndex !== null) {
            this.calculateFlightItemTotal(this.flightItemForm);
            this.flightGroupForm.items[this.editingFlightItemIndex] = structuredClone($state.snapshot(this.flightItemForm));
            this.flightItemForm = this.getInitialFlightItemForm();
            this.editingFlightItemIndex = null;
        }
    }

    calculateFlightItemTotal() {
        // Simple summation for the row "Flight Total"
        const specificCosts = ['airfare', 'tax', 'ur'];
        const types = ['adultCost', 'adultSell', 'childCost', 'childSell', 'infantCost', 'infantSell'];
        const item = this.flightItemForm;

        // Reset totals
        types.forEach(t => item.costs.total[t] = 0);

        specificCosts.forEach(costType => {
            types.forEach(paxType => {
                item.costs.total[paxType] += parseFloat(item.costs[costType][paxType] || 0);
            });
        });
    }

    localCostOptions = [
        'Transportation Fee',
        'Guide Services',
        'Local Tours',
        'City Tax',
        'Parking Fee'
    ];

    otherCostOptions = [
        'Visa Processing',
        'Insurance',
        'Documentation Fee',
        'Service Charge',
        'Handling Fee'
    ];

    supplierOptions = [
        'Private',
        'Al Rajhi Services',
        'Saudi Services Co',
        'Makkah Services',
        'Madinah Services'
    ];

    serviceOptions = [
        'RAIN',
        'Zam-zam Water Delivery',
        'Laundry Service',
        'Shopping Tour',
        'City Tour',
        'Airport Assistance',
        'Luggage Handling',
        'Medical Assistance'
    ];

    // --- Helpers for Initial Forms ---
    getInitialAccommodationForm() {
        return {
            city: '', hotel: '', supplier: '', roomType: '', checkIn: '', checkOut: '', nights: '',
            basis: '', rateCode: '', vat: '', municipalityTax: '', packageMeals: '', hotelView: '',
            adultCost: '', adultSell: '', adultOrs: '', childCost: '', childSell: '', childOrs: '',
            vatPercent: '', municipalityTaxPercent: '', adultTotal: '', childTotal: ''
        };
    }

    getInitialMealsForm() {
        return {
            supplier: '', hotel: '', foodType: '', fromDate: '', toDate: '', nights: '',
            rateCode: '', vat: '', adultCost: '', adultSell: '', adultOrs: '',
            childCost: '', childSell: '', childOrs: '', vatPercent: '', adultTotal: '', childTotal: ''
        };
    }

    getInitialTransportForm() {
        return {
            trip: '', supplier: '', travelDate: '', vehicle: '', rateCode: '', vat: '',
            fixedCost: '', adultCost: '', adultSell: '', adultOrs: '',
            childCost: '', childSell: '', childOrs: '',
            infantCost: '', infantSell: '', infantOrs: '',
            vatPercent: '', adultTotal: '', childTotal: '', infantTotal: '', fixedTotal: ''
        };
    }

    getInitialServiceForm() {
        return {
            supplier: '', service: '',
            adultCost: '', adultSell: '', adultOrs: '',
            childCost: '', childSell: '', childOrs: '',
            infantCost: '', infantSell: '', infantOrs: ''
        };
    }

    // --- Accommodation Logic ---
    resetAccommodationForm() {
        this.accommodationForm = this.getInitialAccommodationForm();
        this.editingAccommodationIndex = null;
    }

    editAccommodation(accommodation, index) {
        this.accommodationForm = { ...accommodation };
        this.editingAccommodationIndex = index;
        this.showAccommodationModal = true;
    }

    removeAccommodation(index) {
        if (confirm('Are you sure you want to remove this accommodation?')) {
            this.accommodationList = this.accommodationList.filter((_, i) => i !== index);
        }
    }

    saveAccommodation() {
        if (this.editingAccommodationIndex !== null) {
            this.accommodationList[this.editingAccommodationIndex] = { ...this.accommodationForm };
        } else {
            this.accommodationList = [...this.accommodationList, { ...this.accommodationForm }];
        }
        this.showAccommodationModal = false;
        this.resetAccommodationForm();
    }

    calculateNights() {
        if (this.accommodationForm.checkIn && this.accommodationForm.checkOut) {
            const checkIn = new Date(this.accommodationForm.checkIn);
            const checkOut = new Date(this.accommodationForm.checkOut);
            const timeDiff = checkOut.getTime() - checkIn.getTime();
            const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
            this.accommodationForm.nights = nights > 0 ? nights.toString() : '';
        }
    }

    calculateTotals() {
        const adultCost = parseFloat(this.accommodationForm.adultCost) || 0;
        const adultSell = parseFloat(this.accommodationForm.adultSell) || 0;
        const adultOrs = parseFloat(this.accommodationForm.adultOrs) || 0;
        const vatPercent = parseFloat(this.accommodationForm.vatPercent) || 0;
        const municipalityPercent = parseFloat(this.accommodationForm.municipalityTaxPercent) || 0;

        const childCost = parseFloat(this.accommodationForm.childCost) || 0;
        const childSell = parseFloat(this.accommodationForm.childSell) || 0;
        const childOrs = parseFloat(this.accommodationForm.childOrs) || 0;

        // Calculate adult total
        const adultSubtotal = adultCost + adultSell + adultOrs;
        const adultVat = (adultSubtotal * vatPercent) / 100;
        const adultMunicipalityTax = (adultSubtotal * municipalityPercent) / 100;
        this.accommodationForm.adultTotal = (adultSubtotal + adultVat + adultMunicipalityTax).toFixed(2);

        // Calculate child total
        const childSubtotal = childCost + childSell + childOrs;
        const childVat = (childSubtotal * vatPercent) / 100;
        const childMunicipalityTax = (childSubtotal * municipalityPercent) / 100;
        this.accommodationForm.childTotal = (childSubtotal + childVat + childMunicipalityTax).toFixed(2);
    }

    // --- Meals Logic ---
    resetMealsForm() {
        this.mealsForm = this.getInitialMealsForm();
        this.editingMealsIndex = null;
    }

    editMeals(meals, index) {
        this.mealsForm = { ...meals };
        this.editingMealsIndex = index;
        this.showMealsModal = true;
    }

    removeMeals(index) {
        if (confirm('Are you sure you want to remove this meal plan?')) {
            this.mealsList = this.mealsList.filter((_, i) => i !== index);
        }
    }

    saveMeals() {
        if (this.editingMealsIndex !== null) {
            this.mealsList[this.editingMealsIndex] = { ...this.mealsForm };
        } else {
            this.mealsList = [...this.mealsList, { ...this.mealsForm }];
        }
        this.showMealsModal = false;
        this.resetMealsForm();
    }

    calculateMealsNights() {
        if (this.mealsForm.fromDate && this.mealsForm.toDate) {
            const fromDate = new Date(this.mealsForm.fromDate);
            const toDate = new Date(this.mealsForm.toDate);
            const timeDiff = toDate.getTime() - fromDate.getTime();
            const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
            this.mealsForm.nights = nights > 0 ? nights.toString() : '';
        }
    }

    calculateMealsTotals() {
        const adultCost = parseFloat(this.mealsForm.adultCost) || 0;
        const adultSell = parseFloat(this.mealsForm.adultSell) || 0;
        const adultOrs = parseFloat(this.mealsForm.adultOrs) || 0;
        const vatPercent = parseFloat(this.mealsForm.vatPercent) || 0;

        const childCost = parseFloat(this.mealsForm.childCost) || 0;
        const childSell = parseFloat(this.mealsForm.childSell) || 0;
        const childOrs = parseFloat(this.mealsForm.childOrs) || 0;

        // Calculate adult total
        const adultSubtotal = adultCost + adultSell + adultOrs;
        const adultVat = (adultSubtotal * vatPercent) / 100;
        this.mealsForm.adultTotal = (adultSubtotal + adultVat).toFixed(2);

        // Calculate child total
        const childSubtotal = childCost + childSell + childOrs;
        const childVat = (childSubtotal * vatPercent) / 100;
        this.mealsForm.childTotal = (childSubtotal + childVat).toFixed(2);
    }

    // --- Transport Logic ---
    resetTransportForm() {
        this.transportForm = this.getInitialTransportForm();
        this.editingTransportIndex = null;
    }

    editTransport(transport, index) {
        this.transportForm = { ...transport };
        this.editingTransportIndex = index;
        this.showTransportModal = true;
    }

    removeTransport(index) {
        if (confirm('Are you sure you want to remove this transport?')) {
            this.transportList = this.transportList.filter((_, i) => i !== index);
        }
    }

    saveTransport() {
        if (this.editingTransportIndex !== null) {
            this.transportList[this.editingTransportIndex] = { ...this.transportForm };
        } else {
            this.transportList = [...this.transportList, { ...this.transportForm }];
        }
        this.showTransportModal = false;
        this.resetTransportForm();
    }

    calculateTransportTotals() {
        const vatPercent = parseFloat(this.transportForm.vatPercent) || 0;

        if (this.transportForm.rateCode === 'Fixed Cost') {
            // Calculate fixed cost total
            const fixedCost = parseFloat(this.transportForm.fixedCost) || 0;
            const fixedVat = (fixedCost * vatPercent) / 100;
            this.transportForm.fixedTotal = (fixedCost + fixedVat).toFixed(2);

            // Reset per pax totals
            this.transportForm.adultTotal = '0.00';
            this.transportForm.childTotal = '0.00';
            this.transportForm.infantTotal = '0.00';
        } else {
            // Calculate per pax totals
            const adultCost = parseFloat(this.transportForm.adultCost) || 0;
            const adultSell = parseFloat(this.transportForm.adultSell) || 0;
            const adultOrs = parseFloat(this.transportForm.adultOrs) || 0;

            const childCost = parseFloat(this.transportForm.childCost) || 0;
            const childSell = parseFloat(this.transportForm.childSell) || 0;
            const childOrs = parseFloat(this.transportForm.childOrs) || 0;

            const infantCost = parseFloat(this.transportForm.infantCost) || 0;
            const infantSell = parseFloat(this.transportForm.infantSell) || 0;
            const infantOrs = parseFloat(this.transportForm.infantOrs) || 0;

            // Calculate adult total
            const adultSubtotal = adultCost + adultSell + adultOrs;
            const adultVat = (adultSubtotal * vatPercent) / 100;
            this.transportForm.adultTotal = (adultSubtotal + adultVat).toFixed(2);

            // Calculate child total
            const childSubtotal = childCost + childSell + childOrs;
            const childVat = (childSubtotal * vatPercent) / 100;
            this.transportForm.childTotal = (childSubtotal + childVat).toFixed(2);

            // Calculate infant total
            const infantSubtotal = infantCost + infantSell + infantOrs;
            const infantVat = (infantSubtotal * vatPercent) / 100;
            this.transportForm.infantTotal = (infantSubtotal + infantVat).toFixed(2);

            // Reset fixed total
            this.transportForm.fixedTotal = '0.00';
        }
    }

    // --- Operational Cost Logic ---
    resetOperationalCostForm() {
        this.operationalCostForm = {
            localCost: '',
            otherCost: ''
        };
        this.editingOperationalCostIndex = null;
    }

    editOperationalCost(cost, index) {
        this.operationalCostForm = { ...cost };
        this.editingOperationalCostIndex = index;
        this.showOperationalCostModal = true;
    }

    removeOperationalCost(index) {
        if (confirm('Are you sure you want to remove this operational cost?')) {
            this.operationalCostList = this.operationalCostList.filter((_, i) => i !== index);
        }
    }

    saveOperationalCost() {
        // At least one field must be filled
        if (this.operationalCostForm.localCost || this.operationalCostForm.otherCost) {
            if (this.editingOperationalCostIndex !== null) {
                this.operationalCostList[this.editingOperationalCostIndex] = { ...this.operationalCostForm };
            } else {
                this.operationalCostList = [...this.operationalCostList, { ...this.operationalCostForm }];
            }
            this.showOperationalCostModal = false;
            this.resetOperationalCostForm();
        }
    }

    // --- Service Logic ---
    resetServiceForm() {
        this.serviceForm = this.getInitialServiceForm();
        this.editingServiceIndex = null;
    }

    editService(service, index) {
        this.serviceForm = { ...service };
        this.editingServiceIndex = index;
        this.showServiceModal = true;
    }

    removeService(index) {
        if (confirm('Are you sure you want to remove this service?')) {
            this.serviceList = this.serviceList.filter((_, i) => i !== index);
        }
    }

    saveService() {
        if (this.editingServiceIndex !== null) {
            this.serviceList[this.editingServiceIndex] = { ...this.serviceForm };
        } else {
            this.serviceList = [...this.serviceList, { ...this.serviceForm }];
        }
        this.showServiceModal = false;
        this.resetServiceForm();
    }

    // --- Calculation Logic ---
    calculateTotalCosts() {
        let accommodationTotal = 0;
        let mealsTotal = 0;
        let transportTotal = 0;
        let serviceTotal = 0;

        // Calculate accommodation totals
        this.accommodationList.forEach(item => {
            accommodationTotal += parseFloat(item.adultTotal || 0) + parseFloat(item.childTotal || 0);
        });

        // Calculate meals totals
        this.mealsList.forEach(item => {
            mealsTotal += parseFloat(item.adultTotal || 0) + parseFloat(item.childTotal || 0);
        });

        // Calculate transport totals
        this.transportList.forEach(item => {
            if (item.rateCode === 'Fixed Cost') {
                transportTotal += parseFloat(item.fixedTotal || 0);
            } else {
                transportTotal += parseFloat(item.adultTotal || 0) + parseFloat(item.childTotal || 0) + parseFloat(item.infantTotal || 0);
            }
        });

        // Calculate service totals (using Ors values as final price)
        this.serviceList.forEach(item => {
            serviceTotal += parseFloat(item.adultOrs || 0) + parseFloat(item.childOrs || 0) + parseFloat(item.infantOrs || 0);
        });

        const grandTotal = accommodationTotal + mealsTotal + transportTotal + serviceTotal;

        return {
            accommodation: accommodationTotal.toFixed(2),
            meals: mealsTotal.toFixed(2),
            transport: transportTotal.toFixed(2),
            service: serviceTotal.toFixed(2),
            grandTotal: grandTotal.toFixed(2)
        };
    }

    // --- Room Calculator Logic ---
    updateRoomCount(roomType, passengerType, change) {
        const currentValue = this.roomCalculator[roomType][passengerType];
        const newValue = Math.max(0, currentValue + change);
        this.roomCalculator[roomType][passengerType] = newValue;
    }

    getTotalPax() {
        let totalDewasa = 0;
        let totalKanak = 0;
        let totalBayi = 0;

        Object.values(this.roomCalculator).forEach(room => {
            totalDewasa += room.dewasa;
            totalKanak += room.kanak;
            totalBayi += room.bayi;
        });

        return {
            dewasa: totalDewasa,
            kanak: totalKanak,
            bayi: totalBayi
        };
    }

    calculateRoomTotal() {
        let total = 0;

        // Calculate for each room type
        Object.keys(this.roomCalculator).forEach(roomType => {
            const room = this.roomCalculator[roomType];
            const pricing = this.roomPricing[roomType];

            total += (room.dewasa * (pricing.dewasa || 0)) +
                (room.kanak * (pricing.kanak || 0)) +
                (room.bayi * (pricing.bayi || 0));
        });

        return total;
    }

    resetRoomCalculator() {
        this.roomCalculator = {
            ber2: { dewasa: 0, kanak: 0, bayi: 0 },
            ber3: { dewasa: 0, kanak: 0, bayi: 0 },
            ber4: { dewasa: 0, kanak: 0, bayi: 0 },
            ber5: { dewasa: 0, kanak: 0, bayi: 0 }
        };
    }
}
