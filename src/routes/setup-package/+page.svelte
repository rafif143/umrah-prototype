<script>
	import {
		Info,
		FileText,
		Map,
		CheckCircle,
		HelpCircle,
		Image,
		Hotel,
		Users,
		Camera,
		Plus,
		X,
		ChevronRight,
		Home,
		Package,
		Settings,
		CreditCard,
		LayoutDashboard,
		Users2,
		ArrowLeft,
		Plane,
		Edit,
		Save
	} from 'lucide-svelte';
	import { fade, slide } from 'svelte/transition';

	// Main tab state
	let generalTab = $state('info');

	// Section states
	let activeInfoSection = $state('basic');
	let activeTripSection = $state('information');
	let peneranganTab = $state('description');
	let guideTab = $state('guide');
	let tripSetupTab = $state('accomodation');

	// Sections for General Info tab
	const infoSections = [
		{ id: 'basic', label: 'Basic Info', icon: Info },
		{ id: 'penerangan', label: 'Penerangan', icon: FileText },
		{ id: 'include', label: 'Include/Exclude', icon: CheckCircle },
		{ id: 'faq', label: 'FAQ', icon: HelpCircle },
		{ id: 'gallery', label: 'Gallery', icon: Image }
	];

	// Sections for Date Trip tab
	const tripSections = [
		{ id: 'information', label: 'Information', icon: Info },
		{ id: 'itinerary', label: 'Itinerary', icon: Map },
		{ id: 'flight', label: 'Flight', icon: Plane },
		{ id: 'tripsetup', label: 'Trip Setup', icon: Hotel },
		{ id: 'guide', label: 'Guide & Leader', icon: Users },
		{ id: 'calculation', label: 'Calculation', icon: CreditCard }
	];

	// Date Trip List State
	let showTripSetup = $state(false);

	// Accommodation State
	let showAccommodationModal = $state(false);
	let editingAccommodationIndex = $state(null);
	let accommodationList = $state([
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
	
	let accommodationForm = $state({
		city: '',
		hotel: '',
		supplier: '',
		roomType: '',
		checkIn: '',
		checkOut: '',
		nights: '',
		basis: '',
		rateCode: '',
		vat: '',
		municipalityTax: '',
		packageMeals: '',
		hotelView: '',
		adultCost: '',
		adultSell: '',
		adultOrs: '',
		childCost: '',
		childSell: '',
		childOrs: '',
		vatPercent: '',
		municipalityTaxPercent: '',
		adultTotal: '',
		childTotal: ''
	});

	// Meals State
	let showMealsModal = $state(false);
	let editingMealsIndex = $state(null);
	let mealsList = $state([
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
	
	let mealsForm = $state({
		supplier: '',
		hotel: '',
		foodType: '',
		fromDate: '',
		toDate: '',
		nights: '',
		rateCode: '',
		vat: '',
		adultCost: '',
		adultSell: '',
		adultOrs: '',
		childCost: '',
		childSell: '',
		childOrs: '',
		vatPercent: '',
		adultTotal: '',
		childTotal: ''
	});

	// Transport State
	let showTransportModal = $state(false);
	let editingTransportIndex = $state(null);
	let transportList = $state([
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
	
	let transportForm = $state({
		trip: '',
		supplier: '',
		travelDate: '',
		vehicle: '',
		rateCode: '',
		vat: '',
		fixedCost: '',
		adultCost: '',
		adultSell: '',
		adultOrs: '',
		childCost: '',
		childSell: '',
		childOrs: '',
		infantCost: '',
		infantSell: '',
		infantOrs: '',
		vatPercent: '',
		adultTotal: '',
		childTotal: '',
		infantTotal: '',
		fixedTotal: ''
	});

	// Operational Cost State
	let showOperationalCostModal = $state(false);
	let editingOperationalCostIndex = $state(null);
	let operationalCostList = $state([
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
	
	let operationalCostForm = $state({
		localCost: '',
		otherCost: ''
	});

	// Dropdown options for operational costs
	const localCostOptions = [
		'Transportation Fee',
		'Guide Services',
		'Local Tours',
		'City Tax',
		'Parking Fee'
	];

	const otherCostOptions = [
		'Visa Processing',
		'Insurance',
		'Documentation Fee',
		'Service Charge',
		'Handling Fee'
	];

	// Service State
	let showServiceModal = $state(false);
	let editingServiceIndex = $state(null);
	let serviceList = $state([
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
	
	let serviceForm = $state({
		supplier: '',
		service: '',
		adultCost: '',
		adultSell: '',
		adultOrs: '',
		childCost: '',
		childSell: '',
		childOrs: '',
		infantCost: '',
		infantSell: '',
		infantOrs: ''
	});

	// Room Calculator State
	let roomCalculator = $state({
		ber2: { dewasa: 0, kanak: 0, bayi: 0 },
		ber3: { dewasa: 0, kanak: 0, bayi: 0 },
		ber4: { dewasa: 0, kanak: 0, bayi: 0 },
		ber5: { dewasa: 0, kanak: 0, bayi: 0 }
	});

	// Room pricing (configurable for each room type)
	let roomPricing = $state({
		ber2: { dewasa: 12000, kanak: 8000, bayi: 2000 },
		ber3: { dewasa: 11000, kanak: 7500, bayi: 1800 },
		ber4: { dewasa: 10000, kanak: 7000, bayi: 1600 },
		ber5: { dewasa: 9000, kanak: 6500, bayi: 1500 }
	});

	// Calculation tab state
	let calculationTab = $state('room-simulation');

	// Service options
	const supplierOptions = [
		'Private',
		'Al Rajhi Services',
		'Saudi Services Co',
		'Makkah Services',
		'Madinah Services'
	];

	const serviceOptions = [
		'RAIN',
		'Zam-zam Water Delivery',
		'Laundry Service',
		'Shopping Tour',
		'City Tour',
		'Airport Assistance',
		'Luggage Handling',
		'Medical Assistance'
	];

	const tripDates = [
		{ id: 1, date: '2024-03-10', duration: '12 Days', price: 'RM 12,500', status: 'Active', flight: 'MH2123' },
		{ id: 2, date: '2024-03-25', duration: '12 Days', price: 'RM 12,800', status: 'Draft', flight: 'SV834' },
		{ id: 3, date: '2024-04-05', duration: '12 Days', price: 'RM 13,000', status: 'Active', flight: 'EK343' }
	];

	// Accommodation Functions
	function resetAccommodationForm() {
		accommodationForm = {
			city: '',
			hotel: '',
			supplier: '',
			roomType: '',
			checkIn: '',
			checkOut: '',
			nights: '',
			basis: '',
			rateCode: '',
			vat: '',
			municipalityTax: '',
			packageMeals: '',
			hotelView: '',
			adultCost: '',
			adultSell: '',
			adultOrs: '',
			childCost: '',
			childSell: '',
			childOrs: '',
			vatPercent: '',
			municipalityTaxPercent: '',
			adultTotal: '',
			childTotal: ''
		};
		editingAccommodationIndex = null;
	}

	function editAccommodation(accommodation, index) {
		accommodationForm = { ...accommodation };
		editingAccommodationIndex = index;
		showAccommodationModal = true;
	}

	function removeAccommodation(index) {
		if (confirm('Are you sure you want to remove this accommodation?')) {
			accommodationList = accommodationList.filter((_, i) => i !== index);
		}
	}

	function saveAccommodation() {
		if (editingAccommodationIndex !== null) {
			accommodationList[editingAccommodationIndex] = { ...accommodationForm };
		} else {
			accommodationList = [...accommodationList, { ...accommodationForm }];
		}
		showAccommodationModal = false;
		resetAccommodationForm();
	}

	function calculateNights() {
		if (accommodationForm.checkIn && accommodationForm.checkOut) {
			const checkIn = new Date(accommodationForm.checkIn);
			const checkOut = new Date(accommodationForm.checkOut);
			const timeDiff = checkOut.getTime() - checkIn.getTime();
			const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
			accommodationForm.nights = nights > 0 ? nights.toString() : '';
		}
	}

	function calculateTotals() {
		const adultCost = parseFloat(accommodationForm.adultCost) || 0;
		const adultSell = parseFloat(accommodationForm.adultSell) || 0;
		const adultOrs = parseFloat(accommodationForm.adultOrs) || 0;
		const vatPercent = parseFloat(accommodationForm.vatPercent) || 0;
		const municipalityPercent = parseFloat(accommodationForm.municipalityTaxPercent) || 0;

		const childCost = parseFloat(accommodationForm.childCost) || 0;
		const childSell = parseFloat(accommodationForm.childSell) || 0;
		const childOrs = parseFloat(accommodationForm.childOrs) || 0;

		// Calculate adult total
		const adultSubtotal = adultCost + adultSell + adultOrs;
		const adultVat = (adultSubtotal * vatPercent) / 100;
		const adultMunicipalityTax = (adultSubtotal * municipalityPercent) / 100;
		accommodationForm.adultTotal = (adultSubtotal + adultVat + adultMunicipalityTax).toFixed(2);

		// Calculate child total
		const childSubtotal = childCost + childSell + childOrs;
		const childVat = (childSubtotal * vatPercent) / 100;
		const childMunicipalityTax = (childSubtotal * municipalityPercent) / 100;
		accommodationForm.childTotal = (childSubtotal + childVat + childMunicipalityTax).toFixed(2);
	}

	// Meals Functions
	function resetMealsForm() {
		mealsForm = {
			supplier: '',
			hotel: '',
			foodType: '',
			fromDate: '',
			toDate: '',
			nights: '',
			rateCode: '',
			vat: '',
			adultCost: '',
			adultSell: '',
			adultOrs: '',
			childCost: '',
			childSell: '',
			childOrs: '',
			vatPercent: '',
			adultTotal: '',
			childTotal: ''
		};
		editingMealsIndex = null;
	}

	function editMeals(meals, index) {
		mealsForm = { ...meals };
		editingMealsIndex = index;
		showMealsModal = true;
	}

	function removeMeals(index) {
		if (confirm('Are you sure you want to remove this meal plan?')) {
			mealsList = mealsList.filter((_, i) => i !== index);
		}
	}

	function saveMeals() {
		if (editingMealsIndex !== null) {
			mealsList[editingMealsIndex] = { ...mealsForm };
		} else {
			mealsList = [...mealsList, { ...mealsForm }];
		}
		showMealsModal = false;
		resetMealsForm();
	}

	function calculateMealsNights() {
		if (mealsForm.fromDate && mealsForm.toDate) {
			const fromDate = new Date(mealsForm.fromDate);
			const toDate = new Date(mealsForm.toDate);
			const timeDiff = toDate.getTime() - fromDate.getTime();
			const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
			mealsForm.nights = nights > 0 ? nights.toString() : '';
		}
	}

	function calculateMealsTotals() {
		const adultCost = parseFloat(mealsForm.adultCost) || 0;
		const adultSell = parseFloat(mealsForm.adultSell) || 0;
		const adultOrs = parseFloat(mealsForm.adultOrs) || 0;
		const vatPercent = parseFloat(mealsForm.vatPercent) || 0;

		const childCost = parseFloat(mealsForm.childCost) || 0;
		const childSell = parseFloat(mealsForm.childSell) || 0;
		const childOrs = parseFloat(mealsForm.childOrs) || 0;

		// Calculate adult total
		const adultSubtotal = adultCost + adultSell + adultOrs;
		const adultVat = (adultSubtotal * vatPercent) / 100;
		mealsForm.adultTotal = (adultSubtotal + adultVat).toFixed(2);

		// Calculate child total
		const childSubtotal = childCost + childSell + childOrs;
		const childVat = (childSubtotal * vatPercent) / 100;
		mealsForm.childTotal = (childSubtotal + childVat).toFixed(2);
	}

	// Transport Functions
	function resetTransportForm() {
		transportForm = {
			trip: '',
			supplier: '',
			travelDate: '',
			vehicle: '',
			rateCode: '',
			vat: '',
			fixedCost: '',
			adultCost: '',
			adultSell: '',
			adultOrs: '',
			childCost: '',
			childSell: '',
			childOrs: '',
			infantCost: '',
			infantSell: '',
			infantOrs: '',
			vatPercent: '',
			adultTotal: '',
			childTotal: '',
			infantTotal: '',
			fixedTotal: ''
		};
		editingTransportIndex = null;
	}

	function editTransport(transport, index) {
		transportForm = { ...transport };
		editingTransportIndex = index;
		showTransportModal = true;
	}

	function removeTransport(index) {
		if (confirm('Are you sure you want to remove this transport?')) {
			transportList = transportList.filter((_, i) => i !== index);
		}
	}

	function saveTransport() {
		if (editingTransportIndex !== null) {
			transportList[editingTransportIndex] = { ...transportForm };
		} else {
			transportList = [...transportList, { ...transportForm }];
		}
		showTransportModal = false;
		resetTransportForm();
	}

	function calculateTransportTotals() {
		const vatPercent = parseFloat(transportForm.vatPercent) || 0;

		if (transportForm.rateCode === 'Fixed Cost') {
			// Calculate fixed cost total
			const fixedCost = parseFloat(transportForm.fixedCost) || 0;
			const fixedVat = (fixedCost * vatPercent) / 100;
			transportForm.fixedTotal = (fixedCost + fixedVat).toFixed(2);
			
			// Reset per pax totals
			transportForm.adultTotal = '0.00';
			transportForm.childTotal = '0.00';
			transportForm.infantTotal = '0.00';
		} else {
			// Calculate per pax totals
			const adultCost = parseFloat(transportForm.adultCost) || 0;
			const adultSell = parseFloat(transportForm.adultSell) || 0;
			const adultOrs = parseFloat(transportForm.adultOrs) || 0;

			const childCost = parseFloat(transportForm.childCost) || 0;
			const childSell = parseFloat(transportForm.childSell) || 0;
			const childOrs = parseFloat(transportForm.childOrs) || 0;

			const infantCost = parseFloat(transportForm.infantCost) || 0;
			const infantSell = parseFloat(transportForm.infantSell) || 0;
			const infantOrs = parseFloat(transportForm.infantOrs) || 0;

			// Calculate adult total
			const adultSubtotal = adultCost + adultSell + adultOrs;
			const adultVat = (adultSubtotal * vatPercent) / 100;
			transportForm.adultTotal = (adultSubtotal + adultVat).toFixed(2);

			// Calculate child total
			const childSubtotal = childCost + childSell + childOrs;
			const childVat = (childSubtotal * vatPercent) / 100;
			transportForm.childTotal = (childSubtotal + childVat).toFixed(2);

			// Calculate infant total
			const infantSubtotal = infantCost + infantSell + infantOrs;
			const infantVat = (infantSubtotal * vatPercent) / 100;
			transportForm.infantTotal = (infantSubtotal + infantVat).toFixed(2);
			
			// Reset fixed total
			transportForm.fixedTotal = '0.00';
		}
	}

	// Operational Cost Functions
	function resetOperationalCostForm() {
		operationalCostForm = {
			localCost: '',
			otherCost: ''
		};
		editingOperationalCostIndex = null;
	}

	function editOperationalCost(cost, index) {
		operationalCostForm = { ...cost };
		editingOperationalCostIndex = index;
		showOperationalCostModal = true;
	}

	function removeOperationalCost(index) {
		if (confirm('Are you sure you want to remove this operational cost?')) {
			operationalCostList = operationalCostList.filter((_, i) => i !== index);
		}
	}

	function saveOperationalCost() {
		// At least one field must be filled
		if (operationalCostForm.localCost || operationalCostForm.otherCost) {
			if (editingOperationalCostIndex !== null) {
				operationalCostList[editingOperationalCostIndex] = { ...operationalCostForm };
			} else {
				operationalCostList = [...operationalCostList, { ...operationalCostForm }];
			}
			showOperationalCostModal = false;
			resetOperationalCostForm();
		}
	}

	// Service Functions
	function resetServiceForm() {
		serviceForm = {
			supplier: '',
			service: '',
			adultCost: '',
			adultSell: '',
			adultOrs: '',
			childCost: '',
			childSell: '',
			childOrs: '',
			infantCost: '',
			infantSell: '',
			infantOrs: ''
		};
		editingServiceIndex = null;
	}

	function editService(service, index) {
		serviceForm = { ...service };
		editingServiceIndex = index;
		showServiceModal = true;
	}

	function removeService(index) {
		if (confirm('Are you sure you want to remove this service?')) {
			serviceList = serviceList.filter((_, i) => i !== index);
		}
	}

	function saveService() {
		if (editingServiceIndex !== null) {
			serviceList[editingServiceIndex] = { ...serviceForm };
		} else {
			serviceList = [...serviceList, { ...serviceForm }];
		}
		showServiceModal = false;
		resetServiceForm();
	}

	// Calculation Functions
	function calculateTotalCosts() {
		let accommodationTotal = 0;
		let mealsTotal = 0;
		let transportTotal = 0;
		let serviceTotal = 0;

		// Calculate accommodation totals
		accommodationList.forEach(item => {
			accommodationTotal += parseFloat(item.adultTotal || 0) + parseFloat(item.childTotal || 0);
		});

		// Calculate meals totals
		mealsList.forEach(item => {
			mealsTotal += parseFloat(item.adultTotal || 0) + parseFloat(item.childTotal || 0);
		});

		// Calculate transport totals
		transportList.forEach(item => {
			if (item.rateCode === 'Fixed Cost') {
				transportTotal += parseFloat(item.fixedTotal || 0);
			} else {
				transportTotal += parseFloat(item.adultTotal || 0) + parseFloat(item.childTotal || 0) + parseFloat(item.infantTotal || 0);
			}
		});

		// Calculate service totals (using Ors values as final price)
		serviceList.forEach(item => {
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

	// Room Calculator Functions
	function updateRoomCount(roomType, passengerType, change) {
		const currentValue = roomCalculator[roomType][passengerType];
		const newValue = Math.max(0, currentValue + change);
		roomCalculator[roomType][passengerType] = newValue;
	}

	function getTotalPax() {
		let totalDewasa = 0;
		let totalKanak = 0;
		let totalBayi = 0;

		Object.values(roomCalculator).forEach(room => {
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

	function calculateRoomTotal() {
		let total = 0;
		
		// Calculate for each room type
		Object.keys(roomCalculator).forEach(roomType => {
			const room = roomCalculator[roomType];
			const pricing = roomPricing[roomType];
			
			total += (room.dewasa * (pricing.dewasa || 0)) + 
					 (room.kanak * (pricing.kanak || 0)) + 
					 (room.bayi * (pricing.bayi || 0));
		});
		
		return total;
	}

	function resetRoomCalculator() {
		roomCalculator = {
			ber2: { dewasa: 0, kanak: 0, bayi: 0 },
			ber3: { dewasa: 0, kanak: 0, bayi: 0 },
			ber4: { dewasa: 0, kanak: 0, bayi: 0 },
			ber5: { dewasa: 0, kanak: 0, bayi: 0 }
		};
	}
</script>

<div class="flex min-h-screen bg-gray-50 font-sans text-gray-800">
	<!-- Left Icon Bar -->
	<aside class="flex w-14 flex-col items-center gap-2 border-r border-gray-200 bg-white py-4">
		<a
			href="/"
			class="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-[#972395]"
		>
			<Home size={20} />
		</a>
		<button
			class="flex h-10 w-10 items-center justify-center rounded-lg bg-[#972395]/10 text-[#972395]"
		>
			<Package size={20} />
		</button>
		<button
			class="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-[#972395]"
		>
			<Users2 size={20} />
		</button>
		<button
			class="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-[#972395]"
		>
			<CreditCard size={20} />
		</button>
		<button
			class="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-[#972395]"
		>
			<Settings size={20} />
		</button>
		<button
			class="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-[#972395]"
		>
			<LayoutDashboard size={20} />
		</button>
	</aside>

	<!-- Sidebar -->
	<aside class="relative z-10 flex w-[220px] flex-col border-r border-gray-200 bg-white shadow-sm">
		<div class="border-b border-gray-200 p-5">
			<a
				href="/"
				class="mb-4 flex w-fit items-center gap-1.5 rounded-md bg-gray-100 px-3 py-1.5 text-[13px] text-gray-700 transition-colors hover:bg-gray-200"
			>
				<ArrowLeft size={16} />
				Back
			</a>
			<h2 class="mb-1 text-base font-semibold text-gray-900">
				{generalTab === 'info' ? 'Package Setup' : 'Date Trip Setup'}
			</h2>
			<p class="text-xs text-gray-500">Complete all sections below</p>
		</div>

		<nav class="flex flex-1 flex-col gap-1 p-3">
			{#if generalTab === 'info'}
				{#each infoSections as section, idx}
					<button
						class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors {activeInfoSection ===
						section.id
							? 'bg-[#972395] text-white shadow-md'
							: 'text-gray-600 hover:bg-gray-50'}"
						onclick={() => (activeInfoSection = section.id)}
					>
						<span
							class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold {activeInfoSection ===
							section.id
								? 'bg-white text-[#972395]'
								: 'bg-gray-100 text-gray-500'}">{idx + 1}</span
						>
						<div class="flex flex-col">
							<span class="text-[13px] font-medium">{section.label}</span>
						</div>
					</button>
				{/each}
			{:else if showTripSetup}
				{#each tripSections as section, idx}
					<button
						class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors {activeTripSection ===
						section.id
							? 'bg-[#972395] text-white shadow-md'
							: 'text-gray-600 hover:bg-gray-50'}"
						onclick={() => (activeTripSection = section.id)}
					>
						<span
							class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold {activeTripSection ===
							section.id
								? 'bg-white text-[#972395]'
								: 'bg-gray-100 text-gray-500'}">{idx + 1}</span
						>
						<div class="flex flex-col">
							<span class="text-[13px] font-medium">{section.label}</span>
						</div>
					</button>
				{/each}
			{:else}
				<div class="px-3 py-2 text-sm text-gray-500">
					Select or add a trip date to configure details.
				</div>
			{/if}
		</nav>

		<div class="border-t border-gray-200 bg-gray-50 p-4">
			<span class="mb-2 block text-xs font-semibold tracking-wider text-gray-500 uppercase"
				>Progress</span
			>
			<div class="mb-2 h-1.5 w-full rounded-full bg-gray-200">
				<div class="h-1.5 rounded-full bg-[#972395]" style="width: 20%"></div>
			</div>
			<span class="text-xs font-medium text-gray-600">Step 1 of 5</span>
		</div>
	</aside>

	<!-- Main Content -->
	<main class="flex h-screen min-w-0 flex-1 flex-col overflow-hidden bg-gray-50/50">
		<div class="flex-1 overflow-auto p-8 pb-32">
			<!-- Breadcrumb -->
			<div class="mb-6 flex items-center gap-2 text-[13px] text-gray-500">
				<a href="/" class="hover:text-[#972395]">Package Management</a>
				<ChevronRight size={14} />
				<span class="font-medium text-gray-900">Setup Package</span>
			</div>

			<!-- Page Header -->
			<div class="mb-6">
				<h1 class="text-2xl font-bold text-gray-900">Package Setup</h1>
				<p class="mt-1 text-sm text-gray-500">Fill in the package information below</p>
			</div>

			<!-- Main Tabs -->
			<div class="mb-8 flex w-fit gap-1 rounded-xl border border-gray-100 bg-white p-1 shadow-sm">
				<button
					class="rounded-lg px-6 py-2.5 text-sm font-medium transition-all {generalTab === 'info'
						? 'bg-[#972395] text-white shadow-sm'
						: 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}"
					onclick={() => (generalTab = 'info')}
				>
					General Info
				</button>
				<button
					class="rounded-lg px-6 py-2.5 text-sm font-medium transition-all {generalTab === 'trip'
						? 'bg-[#972395] text-white shadow-sm'
						: 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}"
					onclick={() => (generalTab = 'trip')}
				>
					Date Trip
				</button>
			</div>

			<!-- Content -->
			<div class="w-full">
				<!-- GENERAL INFO TAB -->
				{#if generalTab === 'info'}
					{#if activeInfoSection === 'basic'}
						<section class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
							<div class="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
								<h3 class="text-base font-semibold text-gray-900">Basic Information</h3>
								<p class="mt-0.5 text-xs text-gray-500">
									Enter the basic details for this package.
								</p>
							</div>
							<div class="grid grid-cols-2 gap-6 p-6">
								<div class="flex flex-col gap-1.5">
									<label class="text-[13px] font-medium text-gray-700">Package Name</label>
									<input
										type="text"
										placeholder="Enter package name"
										class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
									/>
								</div>
								<div class="flex flex-col gap-1.5">
									<label class="text-[13px] font-medium text-gray-700">Category</label>
									<select
										class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
									>
										<option value="">Select category</option>
										<option>Umrah Regular</option>
										<option>Umrah Plus</option>
										<option>Umrah VIP</option>
									</select>
								</div>
								<div class="flex flex-col gap-1.5">
									<label class="text-[13px] font-medium text-gray-700">Sub Category</label>
									<select
										class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
									>
										<option value="">Select sub category</option>
										<option>Economy</option>
										<option>Standard</option>
										<option>Premium</option>
									</select>
								</div>
								<div class="flex flex-col gap-1.5">
									<label class="text-[13px] font-medium text-gray-700">Duration (Days)</label>
									<input
										type="number"
										placeholder="e.g., 9"
										class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
									/>
								</div>
							</div>
						</section>
					{/if}

					{#if activeInfoSection === 'penerangan'}
						<div class="mb-6 flex gap-6 border-b border-gray-200">
							<button
								class="border-b-2 pb-2 text-sm font-medium transition-colors {peneranganTab ===
								'description'
									? 'border-[#972395] text-[#972395]'
									: 'border-transparent text-gray-500 hover:text-gray-700'}"
								onclick={() => (peneranganTab = 'description')}>Penerangan</button
							>
							<button
								class="border-b-2 pb-2 text-sm font-medium transition-colors {peneranganTab ===
								'audience'
									? 'border-[#972395] text-[#972395]'
									: 'border-transparent text-gray-500 hover:text-gray-700'}"
								onclick={() => (peneranganTab = 'audience')}>Target Audience</button
							>
						</div>

						{#if peneranganTab === 'description'}
							<section class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
								<div class="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
									<h3 class="text-base font-semibold text-gray-900">Package Description</h3>
									<p class="mt-0.5 text-xs text-gray-500">Add detailed descriptions with images.</p>
								</div>
								<div class="flex flex-col p-6">
									<div class="mb-6 rounded-lg border border-gray-200 bg-gray-50/50 p-4">
										<div class="mb-4 flex items-center justify-between">
											<span
												class="flex h-6 w-6 items-center justify-center rounded-full bg-[#972395] text-xs font-bold text-white"
												>1</span
											>
											<button class="text-gray-400 hover:text-red-500"><X size={16} /></button>
										</div>
										<div class="grid grid-cols-[120px_1fr] gap-6">
											<div class="flex flex-col gap-1.5">
												<label class="text-[13px] font-medium text-gray-700">Image</label>
												<div
													class="flex h-24 w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-gray-300 bg-white text-gray-400 hover:border-[#972395] hover:text-[#972395]"
												>
													<Camera size={20} />
													<span class="text-xs">Upload</span>
												</div>
											</div>
											<div class="flex flex-col gap-1.5">
												<label class="text-[13px] font-medium text-gray-700">Description</label>
												<textarea
													rows="3"
													placeholder="Description..."
													class="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
												></textarea>
											</div>
										</div>
									</div>
									<button
										class="flex w-fit items-center gap-2.5 rounded-lg border border-dashed border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-[#972395] hover:text-[#972395]"
									>
										<Plus size={16} /> Add Description
									</button>
								</div>
							</section>
						{/if}

						{#if peneranganTab === 'audience'}
							<section class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
								<div class="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
									<h3 class="text-base font-semibold text-gray-900">Target Audience</h3>
									<p class="mt-0.5 text-xs text-gray-500">Define who this package is for.</p>
								</div>
								<div class="flex flex-col gap-3 p-6">
									<div class="flex items-center gap-3">
										<input
											type="text"
											placeholder="e.g., First-time Umrah pilgrims"
											class="flex-1 rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										/>
										<button class="text-gray-400 hover:text-red-500"><X size={18} /></button>
									</div>
									<button
										class="mt-2 mr-auto flex items-center gap-2 text-sm font-medium text-[#972395] hover:text-[#7a1c78]"
									>
										<Plus size={16} /> Add Audience
									</button>
								</div>
							</section>
						{/if}
					{/if}

					{#if activeInfoSection === 'include'}
						<div class="mb-6 flex gap-6 border-b border-gray-200">
							<button class="border-b-2 border-[#972395] pb-2 text-sm font-medium text-[#972395]"
								>Include</button
							>
							<button
								class="border-b-2 border-transparent pb-2 text-sm font-medium text-gray-500 hover:text-gray-700"
								>Exclude</button
							>
							<button
								class="border-b-2 border-transparent pb-2 text-sm font-medium text-gray-500 hover:text-gray-700"
								>Bonus</button
							>
						</div>
						<section class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
							<div class="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
								<h3 class="text-base font-semibold text-gray-900">Included Items</h3>
								<p class="mt-0.5 text-xs text-gray-500">List what's included in this package.</p>
							</div>
							<div class="flex flex-col gap-3 p-6">
								<div class="flex items-center gap-3">
									<input
										type="text"
										placeholder="e.g., Return flight tickets"
										class="flex-1 rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
									/>
									<button class="text-gray-400 hover:text-red-500"><X size={18} /></button>
								</div>
								<div class="flex items-center gap-3">
									<input
										type="text"
										placeholder="e.g., 5-star hotel accommodation"
										class="flex-1 rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
									/>
									<button class="text-gray-400 hover:text-red-500"><X size={18} /></button>
								</div>
								<button
									class="mt-2 mr-auto flex items-center gap-2 text-sm font-medium text-[#972395] hover:text-[#7a1c78]"
								>
									<Plus size={16} /> Add Item
								</button>
							</div>
						</section>
					{/if}

					{#if activeInfoSection === 'faq'}
						<section class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
							<div class="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
								<h3 class="text-base font-semibold text-gray-900">Frequently Asked Questions</h3>
								<p class="mt-0.5 text-xs text-gray-500">Add common questions and answers.</p>
							</div>
							<div class="flex flex-col p-6">
								<div class="relative mb-6 rounded-lg border border-gray-200 bg-gray-50/50 p-4">
									<div class="absolute top-4 right-4">
										<button class="text-gray-400 hover:text-red-500"><X size={16} /></button>
									</div>
									<div class="mb-4">
										<span
											class="flex h-6 w-6 items-center justify-center rounded-full bg-[#972395] text-xs font-bold text-white"
											>1</span
										>
									</div>
									<div class="flex flex-col gap-4">
										<div class="flex flex-col gap-1.5">
											<label class="text-[13px] font-medium text-gray-700">Question</label>
											<input
												type="text"
												placeholder="Enter question..."
												class="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
											/>
										</div>
										<div class="flex flex-col gap-1.5">
											<label class="text-[13px] font-medium text-gray-700">Answer</label>
											<textarea
												rows="2"
												placeholder="Enter answer..."
												class="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
											></textarea>
										</div>
									</div>
								</div>
								<button
									class="flex w-fit items-center gap-2.5 rounded-lg border border-dashed border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-[#972395] hover:text-[#972395]"
								>
									<Plus size={16} /> Add FAQ
								</button>
							</div>
						</section>
					{/if}

					{#if activeInfoSection === 'gallery'}
						<section class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
							<div class="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
								<h3 class="text-base font-semibold text-gray-900">Package Gallery</h3>
								<p class="mt-0.5 text-xs text-gray-500">Upload images for this package.</p>
							</div>
							<div class="p-6">
								<div
									class="flex h-64 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-gray-400 transition-colors hover:border-[#972395] hover:text-[#972395]"
								>
									<Camera size={32} strokeWidth={1.5} />
									<p class="text-sm font-medium text-gray-600">Drag photos here</p>
									<span class="text-xs text-gray-400">Supported files: jpg, png, svg</span>
								</div>
							</div>
						</section>
					{/if}
				{/if}

				<!-- DATE TRIP TAB -->
				{#if generalTab === 'trip'}
					{#if !showTripSetup}
						<div class="flex flex-col gap-6">
							<div class="flex items-center justify-between">
								<div>
									<h2 class="text-lg font-semibold text-gray-900">Trip Dates</h2>
									<p class="text-sm text-gray-500">Manage departure dates for this package.</p>
								</div>
								<button
									class="flex items-center gap-2 rounded-lg bg-[#972395] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7a1c78]"
									onclick={() => (showTripSetup = true)}
								>
									<Plus size={16} />
									Add Date Trip
								</button>
							</div>

							<div class="space-y-4">
								{#each tripDates as trip}
									<div
										class="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-6 transition-all hover:shadow-sm w-full"
									>
										<div class="grid grid-cols-5 gap-8 flex-1">
											<div class="flex flex-col">
												<span class="text-xs font-medium text-gray-500 uppercase tracking-wide">Departure Date</span>
												<span class="text-lg font-semibold text-gray-900">{trip.date}</span>
											</div>
											<div class="flex flex-col">
												<span class="text-xs font-medium text-gray-500 uppercase tracking-wide">Duration</span>
												<span class="text-sm text-gray-900">{trip.duration}</span>
											</div>
											<div class="flex flex-col">
												<span class="text-xs font-medium text-gray-500 uppercase tracking-wide">Flight</span>
												<span class="text-sm font-medium text-gray-900">{trip.flight}</span>
											</div>
											<div class="flex flex-col">
												<span class="text-xs font-medium text-gray-500 uppercase tracking-wide">Price</span>
												<span class="text-lg font-semibold text-[#972395]">{trip.price}</span>
											</div>
											<div class="flex flex-col">
												<span class="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</span>
												<span
													class="inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-medium {trip.status ===
													'Active'
														? 'bg-green-100 text-green-800'
														: 'bg-yellow-100 text-yellow-800'}"
												>
													{trip.status}
												</span>
											</div>
										</div>
										<div class="flex items-center ml-8">
											<button
												class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap"
												onclick={() => (showTripSetup = true)}
											>
												Edit Setup
											</button>
										</div>
									</div>
								{/each}
							</div>
						</div>
					{:else}
						<div class="mb-4">
							<button
								class="flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
								onclick={() => (showTripSetup = false)}
							>
								<ArrowLeft size={16} />
								Back to Trip List
							</button>
						</div>

						{#if activeTripSection === 'information'}
							<section class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
								<div class="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
									<h3 class="text-base font-semibold text-gray-900">Trip Information</h3>
									<p class="mt-0.5 text-xs text-gray-500">
										Set the travel dates, passenger capacity, and validity period for this trip.
									</p>
								</div>
								<div class="grid grid-cols-3 gap-6 p-6">
									<div class="flex flex-col gap-1.5">
										<label class="text-[13px] font-medium text-gray-700">Check-In Date</label>
										<input
											type="date"
											class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										/>
									</div>
									<div class="flex flex-col gap-1.5">
										<label class="text-[13px] font-medium text-gray-700">Check-Out Date</label>
										<input
											type="date"
											class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										/>
									</div>
									<div class="flex flex-col gap-1.5">
										<label class="text-[13px] font-medium text-gray-700">Pax Capacity <span class="text-red-500">*</span></label>
										<input
											type="number"
											placeholder="e.g., 45"
											class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										/>
									</div>
									<div class="flex flex-col gap-1.5">
										<label class="text-[13px] font-medium text-gray-700">Duration (Days)</label>
										<input
											type="number"
											placeholder="e.g., 9"
											class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										/>
									</div>
									<div class="flex flex-col gap-1.5">
										<label class="text-[13px] font-medium text-gray-700">Duration (Nights)</label>
										<input
											type="number"
											placeholder="e.g., 8"
											class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										/>
									</div>
									<div class="flex flex-col gap-1.5">
										<label class="text-[13px] font-medium text-gray-700">Validity Start</label>
										<input
											type="date"
											class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										/>
									</div>
									<div class="flex flex-col gap-1.5 col-span-2">
										<label class="text-[13px] font-medium text-gray-700">Validity End</label>
										<input
											type="date"
											class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										/>
									</div>
								</div>
							</section>
						{/if}

						{#if activeTripSection === 'itinerary'}
							<section class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
								<div class="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
									<h3 class="text-base font-semibold text-gray-900">Itinerary</h3>
									<p class="mt-0.5 text-xs text-gray-500">Plan the daily schedule.</p>
								</div>
								<div class="flex flex-col p-6">
									<div class="relative mb-6 rounded-lg border border-gray-200 bg-gray-50/50 p-4">
										<div class="absolute top-4 right-4">
											<button class="text-gray-400 hover:text-red-500"><X size={16} /></button>
										</div>
										<div class="mb-4">
											<span
												class="inline-flex items-center rounded-md bg-[#972395]/10 px-2.5 py-1 text-xs font-bold text-[#972395]"
												>Day 1</span
											>
										</div>
										<div class="mb-4 grid grid-cols-2 gap-4">
											<div class="flex flex-col gap-1.5">
												<label class="text-[13px] font-medium text-gray-700">Title</label>
												<input
													type="text"
													placeholder="e.g., Arrival in Jeddah"
													class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
												/>
											</div>
											<div class="flex flex-col gap-1.5">
												<label class="text-[13px] font-medium text-gray-700">Location</label>
												<input
													type="text"
													placeholder="e.g., Jeddah Airport"
													class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
												/>
											</div>
										</div>
										<div class="flex flex-col gap-1.5">
											<label class="text-[13px] font-medium text-gray-700">Description</label>
											<textarea
												rows="2"
												placeholder="Activities for this day..."
												class="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
											></textarea>
										</div>
									</div>
									<button
										class="flex w-fit items-center gap-2.5 rounded-lg border border-dashed border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-[#972395] hover:text-[#972395]"
									>
										<Plus size={16} /> Add Day
									</button>
								</div>
							</section>
						{/if}

						{#if activeTripSection === 'flight'}
							<section class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
								<div class="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
									<h3 class="text-base font-semibold text-gray-900">Flight Details</h3>
									<p class="mt-0.5 text-xs text-gray-500">Add flight information.</p>
								</div>
								<div class="flex flex-col p-6">
									<div class="relative mb-4 rounded-lg border border-gray-200 bg-gray-50/50 p-4">
										<div class="absolute top-4 right-4">
											<button class="text-gray-400 hover:text-red-500"><X size={16} /></button>
										</div>
										<div class="mb-4">
											<span class="text-sm font-semibold text-gray-900">Departure</span>
										</div>
										<div class="grid grid-cols-2 gap-4">
											<div class="flex flex-col gap-1.5">
												<label class="text-[13px] font-medium text-gray-700">Airline</label>
												<select
													class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
												>
													<option value="">Select airline</option>
													<option>Saudi Airlines</option>
													<option>Malaysia Airlines</option>
													<option>Emirates</option>
												</select>
											</div>
											<div class="flex flex-col gap-1.5">
												<label class="text-[13px] font-medium text-gray-700">Flight Number</label>
												<input
													type="text"
													placeholder="e.g., SV 834"
													class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
												/>
											</div>
										</div>
									</div>
									<button
										class="flex w-fit items-center gap-2.5 rounded-lg border border-dashed border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-[#972395] hover:text-[#972395]"
									>
										<Plus size={16} /> Add Flight
									</button>
								</div>
							</section>
						{/if}

						{#if activeTripSection === 'tripsetup'}
							<div class="mb-6 flex gap-2 overflow-x-auto border-b border-gray-200 pb-2">
								<button
									class="px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors {tripSetupTab ===
									'accomodation'
										? 'rounded-md bg-[#972395]/10 text-[#972395]'
										: 'text-gray-600 hover:text-gray-900'}"
									onclick={() => (tripSetupTab = 'accomodation')}>Accomodation</button
								>
								<button
									class="px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors {tripSetupTab ===
									'meal'
										? 'rounded-md bg-[#972395]/10 text-[#972395]'
										: 'text-gray-600 hover:text-gray-900'}"
									onclick={() => (tripSetupTab = 'meal')}>Meal</button
								>

								<button
									class="px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors {tripSetupTab ===
									'transport'
										? 'rounded-md bg-[#972395]/10 text-[#972395]'
										: 'text-gray-600 hover:text-gray-900'}"
									onclick={() => (tripSetupTab = 'transport')}>Transport</button
								>
								<button
									class="px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors {tripSetupTab ===
									'service'
										? 'rounded-md bg-[#972395]/10 text-[#972395]'
										: 'text-gray-600 hover:text-gray-900'}"
									onclick={() => (tripSetupTab = 'service')}>Service</button
								>
								<button
									class="px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors {tripSetupTab ===
									'opscost'
										? 'rounded-md bg-[#972395]/10 text-[#972395]'
										: 'text-gray-600 hover:text-gray-900'}"
									onclick={() => (tripSetupTab = 'opscost')}>Operational Cost</button
								>
							</div>

							{#if tripSetupTab === 'accomodation'}
								<div class="flex flex-col gap-6">
									<!-- Header with Add Button -->
									<div class="flex items-center justify-between">
										<div>
											<h3 class="text-base font-semibold text-gray-900">Accommodation Setup</h3>
											<p class="mt-0.5 text-xs text-gray-500">Manage hotels and accommodation details for this trip.</p>
										</div>
										<button
											class="flex items-center gap-2 rounded-lg bg-[#972395] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7a1c78]"
											onclick={() => (showAccommodationModal = true)}
										>
											<Plus size={16} />
											Add Accommodation
										</button>
									</div>

									<!-- Accommodation List -->
									<div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
										<table class="w-full text-left text-sm">
											<thead class="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
												<tr>
													<th class="px-4 py-3">City</th>
													<th class="px-4 py-3">Hotel</th>
													<th class="px-4 py-3">Room Type</th>
													<th class="px-4 py-3">Check-in</th>
													<th class="px-4 py-3">Check-out</th>
													<th class="px-4 py-3">Nights</th>
													<th class="px-4 py-3">Adult Cost</th>
													<th class="px-4 py-3">Child Cost</th>
													<th class="px-4 py-3 text-right">Actions</th>
												</tr>
											</thead>
											<tbody class="divide-y divide-gray-200">
												{#each accommodationList as accommodation, index}
													<tr class="transition-colors hover:bg-gray-50">
														<td class="px-4 py-3 font-medium text-gray-900">{accommodation.city}</td>
														<td class="px-4 py-3 text-gray-700">{accommodation.hotel}</td>
														<td class="px-4 py-3 text-gray-600">{accommodation.roomType}</td>
														<td class="px-4 py-3 text-gray-600">{accommodation.checkIn}</td>
														<td class="px-4 py-3 text-gray-600">{accommodation.checkOut}</td>
														<td class="px-4 py-3 text-gray-600">{accommodation.nights}</td>
														<td class="px-4 py-3 font-medium text-[#972395]">RM {accommodation.adultCost}</td>
														<td class="px-4 py-3 font-medium text-[#972395]">RM {accommodation.childCost}</td>
														<td class="px-4 py-3 text-right">
															<div class="flex justify-end gap-2">
																<button
																	class="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#972395]"
																	onclick={() => editAccommodation(accommodation, index)}
																>
																	<Edit size={14} />
																</button>
																<button
																	class="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
																	onclick={() => removeAccommodation(index)}
																>
																	<X size={14} />
																</button>
															</div>
														</td>
													</tr>
												{/each}
												{#if accommodationList.length === 0}
													<tr>
														<td colspan="9" class="px-4 py-8 text-center text-sm text-gray-500">
															No accommodations added yet. Click "Add Accommodation" to get started.
														</td>
													</tr>
												{/if}
											</tbody>
										</table>
									</div>
								</div>
							{/if}

							{#if tripSetupTab === 'meal'}
								<div class="flex flex-col gap-6">
									<!-- Header with Add Button -->
									<div class="flex items-center justify-between">
										<div>
											<h3 class="text-base font-semibold text-gray-900">Meals Setup</h3>
											<p class="mt-0.5 text-xs text-gray-500">Manage meal plans and catering details for this trip.</p>
										</div>
										<button
											class="flex items-center gap-2 rounded-lg bg-[#972395] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7a1c78]"
											onclick={() => (showMealsModal = true)}
										>
											<Plus size={16} />
											Add Meal Plan
										</button>
									</div>

									<!-- Meals List -->
									<div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
										<table class="w-full text-left text-sm">
											<thead class="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
												<tr>
													<th class="px-4 py-3">Supplier</th>
													<th class="px-4 py-3">Hotel</th>
													<th class="px-4 py-3">Food Type</th>
													<th class="px-4 py-3">From Date</th>
													<th class="px-4 py-3">To Date</th>
													<th class="px-4 py-3">Nights</th>
													<th class="px-4 py-3">Adult Total</th>
													<th class="px-4 py-3">Child Total</th>
													<th class="px-4 py-3 text-right">Actions</th>
												</tr>
											</thead>
											<tbody class="divide-y divide-gray-200">
												{#each mealsList as meals, index}
													<tr class="transition-colors hover:bg-gray-50">
														<td class="px-4 py-3 font-medium text-gray-900">{meals.supplier}</td>
														<td class="px-4 py-3 text-gray-700">{meals.hotel}</td>
														<td class="px-4 py-3 text-gray-600">{meals.foodType}</td>
														<td class="px-4 py-3 text-gray-600">{meals.fromDate}</td>
														<td class="px-4 py-3 text-gray-600">{meals.toDate}</td>
														<td class="px-4 py-3 text-gray-600">{meals.nights}</td>
														<td class="px-4 py-3 font-medium text-[#972395]">RM {meals.adultTotal}</td>
														<td class="px-4 py-3 font-medium text-[#972395]">RM {meals.childTotal}</td>
														<td class="px-4 py-3 text-right">
															<div class="flex justify-end gap-2">
																<button
																	class="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#972395]"
																	onclick={() => editMeals(meals, index)}
																>
																	<Edit size={14} />
																</button>
																<button
																	class="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
																	onclick={() => removeMeals(index)}
																>
																	<X size={14} />
																</button>
															</div>
														</td>
													</tr>
												{/each}
												{#if mealsList.length === 0}
													<tr>
														<td colspan="9" class="px-4 py-8 text-center text-sm text-gray-500">
															No meal plans added yet. Click "Add Meal Plan" to get started.
														</td>
													</tr>
												{/if}
											</tbody>
										</table>
									</div>
								</div>
							{/if}

							{#if tripSetupTab === 'transport'}
								<div class="flex flex-col gap-6">
									<!-- Header with Add Button -->
									<div class="flex items-center justify-between">
										<div>
											<h3 class="text-base font-semibold text-gray-900">Transportation Setup</h3>
											<p class="mt-0.5 text-xs text-gray-500">Manage transportation arrangements and vehicle details for this trip.</p>
										</div>
										<button
											class="flex items-center gap-2 rounded-lg bg-[#972395] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7a1c78]"
											onclick={() => (showTransportModal = true)}
										>
											<Plus size={16} />
											Add Transport
										</button>
									</div>

									<!-- Transport List -->
									<div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
										<table class="w-full text-left text-sm">
											<thead class="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
												<tr>
													<th class="px-4 py-3">Trip</th>
													<th class="px-4 py-3">Supplier</th>
													<th class="px-4 py-3">Travel Date</th>
													<th class="px-4 py-3">Vehicle</th>
													<th class="px-4 py-3">Rate Code</th>
													<th class="px-4 py-3">Total Cost</th>
													<th class="px-4 py-3 text-right">Actions</th>
												</tr>
											</thead>
											<tbody class="divide-y divide-gray-200">
												{#each transportList as transport, index}
													<tr class="transition-colors hover:bg-gray-50">
														<td class="px-4 py-3 font-medium text-gray-900">{transport.trip}</td>
														<td class="px-4 py-3 text-gray-700">{transport.supplier}</td>
														<td class="px-4 py-3 text-gray-600">{transport.travelDate}</td>
														<td class="px-4 py-3 text-gray-600">{transport.vehicle}</td>
														<td class="px-4 py-3 text-gray-600">{transport.rateCode}</td>
														<td class="px-4 py-3 font-medium text-[#972395]">
															{#if transport.rateCode === 'Fixed Cost'}
																RM {transport.fixedTotal || '0.00'}
															{:else}
																A: RM {transport.adultTotal || '0.00'} | C: RM {transport.childTotal || '0.00'} | I: RM {transport.infantTotal || '0.00'}
															{/if}
														</td>
														<td class="px-4 py-3 text-right">
															<div class="flex justify-end gap-2">
																<button
																	class="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#972395]"
																	onclick={() => editTransport(transport, index)}
																>
																	<Edit size={14} />
																</button>
																<button
																	class="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
																	onclick={() => removeTransport(index)}
																>
																	<X size={14} />
																</button>
															</div>
														</td>
													</tr>
												{/each}
												{#if transportList.length === 0}
													<tr>
														<td colspan="7" class="px-4 py-8 text-center text-sm text-gray-500">
															No transportation added yet. Click "Add Transport" to get started.
														</td>
													</tr>
												{/if}
											</tbody>
										</table>
									</div>
								</div>
							{/if}

							{#if tripSetupTab === 'service'}
								<div class="flex flex-col gap-6">
									<!-- Header with Add Button -->
									<div class="flex items-center justify-between">
										<div>
											<h3 class="text-base font-semibold text-gray-900">Services Setup</h3>
											<p class="mt-0.5 text-xs text-gray-500">Manage additional services and their pricing for this trip.</p>
										</div>
										<button
											class="flex items-center gap-2 rounded-lg bg-[#972395] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7a1c78]"
											onclick={() => (showServiceModal = true)}
										>
											<Plus size={16} />
											Add Service
										</button>
									</div>

									<!-- Service List -->
									<div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
										<table class="w-full text-left text-sm">
											<thead class="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
												<tr>
													<th class="px-4 py-3">Supplier</th>
													<th class="px-4 py-3">Service</th>
													<th class="px-4 py-3">Adult Ors</th>
													<th class="px-4 py-3">Child Ors</th>
													<th class="px-4 py-3">Infant Ors</th>
													<th class="px-4 py-3 text-right">Actions</th>
												</tr>
											</thead>
											<tbody class="divide-y divide-gray-200">
												{#each serviceList as service, index}
													<tr class="transition-colors hover:bg-gray-50">
														<td class="px-4 py-3 font-medium text-gray-900">{service.supplier}</td>
														<td class="px-4 py-3 text-gray-700">{service.service}</td>
														<td class="px-4 py-3 font-medium text-[#972395]">RM {service.adultOrs || '0.00'}</td>
														<td class="px-4 py-3 font-medium text-[#972395]">RM {service.childOrs || '0.00'}</td>
														<td class="px-4 py-3 font-medium text-[#972395]">RM {service.infantOrs || '0.00'}</td>
														<td class="px-4 py-3 text-right">
															<div class="flex justify-end gap-2">
																<button
																	class="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#972395]"
																	onclick={() => editService(service, index)}
																>
																	<Edit size={14} />
																</button>
																<button
																	class="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
																	onclick={() => removeService(index)}
																>
																	<X size={14} />
																</button>
															</div>
														</td>
													</tr>
												{/each}
												{#if serviceList.length === 0}
													<tr>
														<td colspan="6" class="px-4 py-8 text-center text-sm text-gray-500">
															No services added yet. Click "Add Service" to get started.
														</td>
													</tr>
												{/if}
											</tbody>
										</table>
									</div>
								</div>
							{/if}

							{#if tripSetupTab === 'opscost'}
								<div class="flex flex-col gap-6">
									<!-- Header with Add Button -->
									<div class="flex items-center justify-between">
										<div>
											<h3 class="text-base font-semibold text-gray-900">Operational Cost Setup</h3>
											<p class="mt-0.5 text-xs text-gray-500">Manage operational expenses and additional costs for this trip.</p>
										</div>
										<button
											class="flex items-center gap-2 rounded-lg bg-[#972395] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7a1c78]"
											onclick={() => (showOperationalCostModal = true)}
										>
											<Plus size={16} />
											Add Cost
										</button>
									</div>

									<!-- Operational Cost List -->
									<div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
										<table class="w-full text-left text-sm">
											<thead class="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
												<tr>
													<th class="px-4 py-3">Local Cost</th>
													<th class="px-4 py-3">Other Cost</th>
													<th class="px-4 py-3 text-right">Actions</th>
												</tr>
											</thead>
											<tbody class="divide-y divide-gray-200">
												{#each operationalCostList as cost, index}
													<tr class="transition-colors hover:bg-gray-50">
														<td class="px-4 py-3">
															{#if cost.localCost}
																<span class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
																	{cost.localCost}
																</span>
															{:else}
																<span class="text-gray-400">-</span>
															{/if}
														</td>
														<td class="px-4 py-3">
															{#if cost.otherCost}
																<span class="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
																	{cost.otherCost}
																</span>
															{:else}
																<span class="text-gray-400">-</span>
															{/if}
														</td>
														<td class="px-4 py-3 text-right">
															<div class="flex justify-end gap-2">
																<button
																	class="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#972395]"
																	onclick={() => editOperationalCost(cost, index)}
																>
																	<Edit size={14} />
																</button>
																<button
																	class="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
																	onclick={() => removeOperationalCost(index)}
																>
																	<X size={14} />
																</button>
															</div>
														</td>
													</tr>
												{/each}
												{#if operationalCostList.length === 0}
													<tr>
														<td colspan="3" class="px-4 py-8 text-center text-sm text-gray-500">
															No operational costs added yet. Click "Add Cost" to get started.
														</td>
													</tr>
												{/if}
											</tbody>
										</table>
									</div>
								</div>
							{/if}
						{/if}

						{#if activeTripSection === 'guide'}
							<div class="mb-6 flex gap-6 border-b border-gray-200">
								<button
									class="border-b-2 pb-2 text-sm font-medium transition-colors {guideTab === 'guide'
										? 'border-[#972395] text-[#972395]'
										: 'border-transparent text-gray-500 hover:text-gray-700'}"
									onclick={() => (guideTab = 'guide')}>Tour Guide</button
								>
								<button
									class="border-b-2 pb-2 text-sm font-medium transition-colors {guideTab ===
									'leader'
										? 'border-[#972395] text-[#972395]'
										: 'border-transparent text-gray-500 hover:text-gray-700'}"
									onclick={() => (guideTab = 'leader')}>Tour Leader</button
								>
							</div>

							{#if guideTab === 'guide'}
								<section
									class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
								>
									<div class="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
										<h3 class="text-base font-semibold text-gray-900">Tour Guide</h3>
										<p class="mt-0.5 text-xs text-gray-500">Assign tour guides.</p>
									</div>
									<div class="flex flex-col p-6">
										<div class="relative mb-4 rounded-lg border border-gray-200 bg-gray-50/50 p-4">
											<div class="absolute top-4 right-4">
												<button class="text-gray-400 hover:text-red-500"><X size={16} /></button>
											</div>
											<div class="mb-4">
												<span
													class="flex h-6 w-6 items-center justify-center rounded-full bg-[#972395] text-xs font-bold text-white"
													>1</span
												>
											</div>
											<div class="grid grid-cols-2 gap-4">
												<div class="flex flex-col gap-1.5">
													<label class="text-[13px] font-medium text-gray-700">Select Guide</label>
													<select
														class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
													>
														<option value="">Choose...</option>
														<option>Guide Ali (Makkah)</option>
														<option>Guide Hassan (Madinah)</option>
													</select>
												</div>
												<div class="flex flex-col gap-1.5">
													<label class="text-[13px] font-medium text-gray-700">Contact</label>
													<input
														type="text"
														placeholder="Auto-filled"
														disabled
														class="rounded-lg border border-gray-200 bg-gray-100 px-3.5 py-2.5 text-sm text-gray-500 outline-none"
													/>
												</div>
											</div>
										</div>
										<button
											class="flex w-fit items-center gap-2.5 rounded-lg border border-dashed border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-[#972395] hover:text-[#972395]"
										>
											<Plus size={16} /> Add Guide
										</button>
									</div>
								</section>
							{/if}

							{#if guideTab === 'leader'}
								<section
									class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
								>
									<div class="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
										<h3 class="text-base font-semibold text-gray-900">Tour Leader</h3>
										<p class="mt-0.5 text-xs text-gray-500">Assign tour leaders.</p>
									</div>
									<div class="flex flex-col p-6">
										<div class="relative mb-4 rounded-lg border border-gray-200 bg-gray-50/50 p-4">
											<div class="absolute top-4 right-4">
												<button class="text-gray-400 hover:text-red-500"><X size={16} /></button>
											</div>
											<div class="mb-4">
												<span
													class="flex h-6 w-6 items-center justify-center rounded-full bg-[#972395] text-xs font-bold text-white"
													>1</span
												>
											</div>
											<div class="grid grid-cols-2 gap-4">
												<div class="flex flex-col gap-1.5">
													<label class="text-[13px] font-medium text-gray-700">Select Leader</label>
													<select
														class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
													>
														<option value="">Choose...</option>
														<option>Ustaz Ahmad</option>
														<option>Ustaz Ibrahim</option>
													</select>
												</div>
												<div class="flex flex-col gap-1.5">
													<label class="text-[13px] font-medium text-gray-700">Contact</label>
													<input
														type="text"
														placeholder="Auto-filled"
														disabled
														class="rounded-lg border border-gray-200 bg-gray-100 px-3.5 py-2.5 text-sm text-gray-500 outline-none"
													/>
												</div>
											</div>
										</div>
										<button
											class="flex w-fit items-center gap-2.5 rounded-lg border border-dashed border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-[#972395] hover:text-[#972395]"
										>
											<Plus size={16} /> Add Leader
										</button>
									</div>
								</section>
							{/if}
						{/if}

						{#if activeTripSection === 'calculation'}
							<div class="flex flex-col gap-6">
								<div>
									<h3 class="text-base font-semibold text-gray-900">Calculation & Simulation</h3>
									<p class="mt-0.5 text-xs text-gray-500">Manage pricing calculations and room simulations.</p>
								</div>

								<!-- Calculation Tabs -->
								<div class="mb-6 flex gap-2 border-b border-gray-200 pb-2">
									<button
										class="px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors {calculationTab === 'room-simulation'
											? 'rounded-md bg-[#972395]/10 text-[#972395] border-b-2 border-[#972395]'
											: 'text-gray-600 hover:text-gray-900'}"
										onclick={() => (calculationTab = 'room-simulation')}>Room Simulation</button
									>
									<button
										class="px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors {calculationTab === 'calculation-price'
											? 'rounded-md bg-[#972395]/10 text-[#972395] border-b-2 border-[#972395]'
											: 'text-gray-600 hover:text-gray-900'}"
										onclick={() => (calculationTab = 'calculation-price')}>Calculation Price</button
									>
								</div>

								<!-- Room Simulation Tab -->
								{#if calculationTab === 'room-simulation'}
									<div class="flex flex-col gap-6">
										<div class="flex items-center justify-between">
											<div>
												<h4 class="text-base font-semibold text-gray-900">Room Simulation</h4>
												<p class="mt-0.5 text-xs text-gray-500">Configure pricing and simulate room bookings.</p>
											</div>
											<button 
												class="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
												onclick={resetRoomCalculator}
											>
												Reset All
											</button>
										</div>

								<!-- Pricing Configuration -->
								<div class="rounded-xl border border-gray-200 bg-white shadow-sm">
									<div class="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
										<h3 class="text-base font-semibold text-gray-900">Pricing Configuration</h3>
										<p class="mt-0.5 text-xs text-gray-500">Set prices for each room type and passenger category.</p>
									</div>
									<div class="p-6">
										<div class="overflow-hidden rounded-lg border border-gray-200">
											<div class="bg-[#972395] text-white">
												<div class="grid grid-cols-4 text-center text-sm font-semibold">
													<div class="p-3 border-r border-white/20">ROOM TYPE</div>
													<div class="p-3 border-r border-white/20">DEWASA (RM)</div>
													<div class="p-3 border-r border-white/20">KANAK² (RM)</div>
													<div class="p-3">BAYI (RM)</div>
												</div>
											</div>
											
											<div class="divide-y divide-gray-200">
												<!-- Bilik Ber-2 Pricing -->
												<div class="grid grid-cols-4 items-center">
													<div class="p-3 bg-gray-50 font-medium text-gray-700 text-center">BILIK BER-2</div>
													<div class="p-3">
														<input
															type="number"
															placeholder="12000"
															class="w-full rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
															bind:value={roomPricing.ber2.dewasa}
														/>
													</div>
													<div class="p-3">
														<input
															type="number"
															placeholder="8000"
															class="w-full rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
															bind:value={roomPricing.ber2.kanak}
														/>
													</div>
													<div class="p-3">
														<input
															type="number"
															placeholder="2000"
															class="w-full rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
															bind:value={roomPricing.ber2.bayi}
														/>
													</div>
												</div>

												<!-- Bilik Ber-3 Pricing -->
												<div class="grid grid-cols-4 items-center">
													<div class="p-3 bg-gray-50 font-medium text-gray-700 text-center">BILIK BER-3</div>
													<div class="p-3">
														<input
															type="number"
															placeholder="11000"
															class="w-full rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
															bind:value={roomPricing.ber3.dewasa}
														/>
													</div>
													<div class="p-3">
														<input
															type="number"
															placeholder="7500"
															class="w-full rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
															bind:value={roomPricing.ber3.kanak}
														/>
													</div>
													<div class="p-3">
														<input
															type="number"
															placeholder="1800"
															class="w-full rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
															bind:value={roomPricing.ber3.bayi}
														/>
													</div>
												</div>

												<!-- Bilik Ber-4 Pricing -->
												<div class="grid grid-cols-4 items-center">
													<div class="p-3 bg-gray-50 font-medium text-gray-700 text-center">BILIK BER-4</div>
													<div class="p-3">
														<input
															type="number"
															placeholder="10000"
															class="w-full rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
															bind:value={roomPricing.ber4.dewasa}
														/>
													</div>
													<div class="p-3">
														<input
															type="number"
															placeholder="7000"
															class="w-full rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
															bind:value={roomPricing.ber4.kanak}
														/>
													</div>
													<div class="p-3">
														<input
															type="number"
															placeholder="1600"
															class="w-full rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
															bind:value={roomPricing.ber4.bayi}
														/>
													</div>
												</div>

												<!-- Bilik Ber-5 Pricing -->
												<div class="grid grid-cols-4 items-center">
													<div class="p-3 bg-gray-50 font-medium text-gray-700 text-center">BILIK BER-5</div>
													<div class="p-3">
														<input
															type="number"
															placeholder="9000"
															class="w-full rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
															bind:value={roomPricing.ber5.dewasa}
														/>
													</div>
													<div class="p-3">
														<input
															type="number"
															placeholder="6500"
															class="w-full rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
															bind:value={roomPricing.ber5.kanak}
														/>
													</div>
													<div class="p-3">
														<input
															type="number"
															placeholder="1500"
															class="w-full rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
															bind:value={roomPricing.ber5.bayi}
														/>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>

								<!-- Room Calculator Section -->
								<div class="rounded-xl border border-gray-200 bg-white shadow-sm">
									<div class="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
										<h3 class="text-base font-semibold text-gray-900">Room Calculator Simulator</h3>
										<p class="mt-0.5 text-xs text-gray-500">Use the calculator below to simulate pricing. Click (+) to add or (-) to reduce passengers.</p>
									</div>
									<div class="p-6">
										<!-- Room Calculator Table -->
								<div class="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
									<div class="bg-[#972395] text-white">
										<div class="grid grid-cols-4 text-center text-sm font-semibold">
											<div class="p-4 border-r border-white/20">BILIK</div>
											<div class="p-4 border-r border-white/20">DEWASA</div>
											<div class="p-4 border-r border-white/20">KANAK²</div>
											<div class="p-4">BAYI</div>
										</div>
									</div>
									
									<div class="divide-y divide-gray-200">
										<!-- Bilik Ber-2 -->
										<div class="grid grid-cols-4 items-center">
											<div class="p-4 bg-gray-50 font-medium text-gray-700 text-center">BILIK BER-2</div>
											<div class="p-4 flex items-center justify-center gap-3">
												<button 
													class="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors"
													onclick={() => updateRoomCount('ber2', 'dewasa', -1)}
												>
													<span class="text-lg">−</span>
												</button>
												<span class="w-8 text-center font-semibold text-[#972395]">{roomCalculator.ber2.dewasa}</span>
												<button 
													class="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors"
													onclick={() => updateRoomCount('ber2', 'dewasa', 1)}
												>
													<span class="text-lg">+</span>
												</button>
											</div>
											<div class="p-4 flex items-center justify-center gap-3">
												<button 
													class="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors"
													onclick={() => updateRoomCount('ber2', 'kanak', -1)}
												>
													<span class="text-lg">−</span>
												</button>
												<span class="w-8 text-center font-semibold text-[#972395]">{roomCalculator.ber2.kanak}</span>
												<button 
													class="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors"
													onclick={() => updateRoomCount('ber2', 'kanak', 1)}
												>
													<span class="text-lg">+</span>
												</button>
											</div>
											<div class="p-4 flex items-center justify-center gap-3">
												<button 
													class="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors"
													onclick={() => updateRoomCount('ber2', 'bayi', -1)}
												>
													<span class="text-lg">−</span>
												</button>
												<span class="w-8 text-center font-semibold text-[#972395]">{roomCalculator.ber2.bayi}</span>
												<button 
													class="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors"
													onclick={() => updateRoomCount('ber2', 'bayi', 1)}
												>
													<span class="text-lg">+</span>
												</button>
											</div>
										</div>

										<!-- Bilik Ber-3 -->
										<div class="grid grid-cols-4 items-center">
											<div class="p-4 bg-gray-50 font-medium text-gray-700 text-center">BILIK BER-3</div>
											<div class="p-4 flex items-center justify-center gap-3">
												<button 
													class="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors"
													onclick={() => updateRoomCount('ber3', 'dewasa', -1)}
												>
													<span class="text-lg">−</span>
												</button>
												<span class="w-8 text-center font-semibold text-[#972395]">{roomCalculator.ber3.dewasa}</span>
												<button 
													class="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors"
													onclick={() => updateRoomCount('ber3', 'dewasa', 1)}
												>
													<span class="text-lg">+</span>
												</button>
											</div>
											<div class="p-4 flex items-center justify-center gap-3">
												<button 
													class="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors"
													onclick={() => updateRoomCount('ber3', 'kanak', -1)}
												>
													<span class="text-lg">−</span>
												</button>
												<span class="w-8 text-center font-semibold text-[#972395]">{roomCalculator.ber3.kanak}</span>
												<button 
													class="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors"
													onclick={() => updateRoomCount('ber3', 'kanak', 1)}
												>
													<span class="text-lg">+</span>
												</button>
											</div>
											<div class="p-4 flex items-center justify-center gap-3">
												<button 
													class="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors"
													onclick={() => updateRoomCount('ber3', 'bayi', -1)}
												>
													<span class="text-lg">−</span>
												</button>
												<span class="w-8 text-center font-semibold text-[#972395]">{roomCalculator.ber3.bayi}</span>
												<button 
													class="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors"
													onclick={() => updateRoomCount('ber3', 'bayi', 1)}
												>
													<span class="text-lg">+</span>
												</button>
											</div>
										</div>

										<!-- Bilik Ber-4 -->
										<div class="grid grid-cols-4 items-center">
											<div class="p-4 bg-gray-50 font-medium text-gray-700 text-center">BILIK BER-4</div>
											<div class="p-4 flex items-center justify-center gap-3">
												<button 
													class="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors"
													onclick={() => updateRoomCount('ber4', 'dewasa', -1)}
												>
													<span class="text-lg">−</span>
												</button>
												<span class="w-8 text-center font-semibold text-[#972395]">{roomCalculator.ber4.dewasa}</span>
												<button 
													class="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors"
													onclick={() => updateRoomCount('ber4', 'dewasa', 1)}
												>
													<span class="text-lg">+</span>
												</button>
											</div>
											<div class="p-4 flex items-center justify-center gap-3">
												<button 
													class="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors"
													onclick={() => updateRoomCount('ber4', 'kanak', -1)}
												>
													<span class="text-lg">−</span>
												</button>
												<span class="w-8 text-center font-semibold text-[#972395]">{roomCalculator.ber4.kanak}</span>
												<button 
													class="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors"
													onclick={() => updateRoomCount('ber4', 'kanak', 1)}
												>
													<span class="text-lg">+</span>
												</button>
											</div>
											<div class="p-4 flex items-center justify-center gap-3">
												<button 
													class="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors"
													onclick={() => updateRoomCount('ber4', 'bayi', -1)}
												>
													<span class="text-lg">−</span>
												</button>
												<span class="w-8 text-center font-semibold text-[#972395]">{roomCalculator.ber4.bayi}</span>
												<button 
													class="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors"
													onclick={() => updateRoomCount('ber4', 'bayi', 1)}
												>
													<span class="text-lg">+</span>
												</button>
											</div>
										</div>

										<!-- Bilik Ber-5 -->
										<div class="grid grid-cols-4 items-center">
											<div class="p-4 bg-gray-50 font-medium text-gray-700 text-center">BILIK BER-5</div>
											<div class="p-4 flex items-center justify-center gap-3">
												<button 
													class="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors"
													onclick={() => updateRoomCount('ber5', 'dewasa', -1)}
												>
													<span class="text-lg">−</span>
												</button>
												<span class="w-8 text-center font-semibold text-[#972395]">{roomCalculator.ber5.dewasa}</span>
												<button 
													class="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors"
													onclick={() => updateRoomCount('ber5', 'dewasa', 1)}
												>
													<span class="text-lg">+</span>
												</button>
											</div>
											<div class="p-4 flex items-center justify-center gap-3">
												<button 
													class="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors"
													onclick={() => updateRoomCount('ber5', 'kanak', -1)}
												>
													<span class="text-lg">−</span>
												</button>
												<span class="w-8 text-center font-semibold text-[#972395]">{roomCalculator.ber5.kanak}</span>
												<button 
													class="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors"
													onclick={() => updateRoomCount('ber5', 'kanak', 1)}
												>
													<span class="text-lg">+</span>
												</button>
											</div>
											<div class="p-4 flex items-center justify-center gap-3">
												<button 
													class="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors"
													onclick={() => updateRoomCount('ber5', 'bayi', -1)}
												>
													<span class="text-lg">−</span>
												</button>
												<span class="w-8 text-center font-semibold text-[#972395]">{roomCalculator.ber5.bayi}</span>
												<button 
													class="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors"
													onclick={() => updateRoomCount('ber5', 'bayi', 1)}
												>
													<span class="text-lg">+</span>
												</button>
											</div>
										</div>
									</div>

									<!-- Total Section -->
									<div class="bg-gray-50 border-t border-gray-200">
										<div class="grid grid-cols-4 items-center">
											<div class="p-4 font-bold text-gray-700 text-center">JUMLAH</div>
											<div class="p-4 col-span-3">
												<div class="bg-white border-2 border-[#972395] rounded-lg p-4 text-center">
													<span class="text-2xl font-bold text-[#972395]">RM {calculateRoomTotal().toFixed(2)}</span>
												</div>
											</div>
										</div>
									</div>
								</div>

								<!-- Pricing Summary -->
								<div class="grid grid-cols-3 gap-4">
									<div class="rounded-lg border border-gray-200 bg-white p-4 text-center">
										<h4 class="text-sm font-semibold text-gray-700 mb-2">Total Dewasa</h4>
										<div class="text-xl font-bold text-blue-600">{getTotalPax().dewasa}</div>
										<p class="text-xs text-gray-500 mt-1">orang</p>
									</div>
									<div class="rounded-lg border border-gray-200 bg-white p-4 text-center">
										<h4 class="text-sm font-semibold text-gray-700 mb-2">Total Kanak²</h4>
										<div class="text-xl font-bold text-green-600">{getTotalPax().kanak}</div>
										<p class="text-xs text-gray-500 mt-1">orang</p>
									</div>
									<div class="rounded-lg border border-gray-200 bg-white p-4 text-center">
										<h4 class="text-sm font-semibold text-gray-700 mb-2">Total Bayi</h4>
										<div class="text-xl font-bold text-purple-600">{getTotalPax().bayi}</div>
										<p class="text-xs text-gray-500 mt-1">orang</p>
									</div>
								</div>
									</div>
								</div>
									</div>
								{/if}

								<!-- Calculation Price Tab -->
								{#if calculationTab === 'calculation-price'}
									<div class="flex flex-col gap-6">
										<div>
											<h4 class="text-base font-semibold text-gray-900">Calculation Price Summary</h4>
											<p class="mt-0.5 text-xs text-gray-500">Summary of all costs from accommodation to operational expenses.</p>
										</div>

										<!-- Cost Summary Cards -->
										<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
											<!-- Accommodation Cost -->
											<div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
												<div class="flex items-center gap-3 mb-3">
													<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
														<Hotel size={20} class="text-blue-600" />
													</div>
													<div>
														<h4 class="text-sm font-semibold text-gray-900">Accommodation</h4>
														<p class="text-xs text-gray-500">{accommodationList.length} items</p>
													</div>
												</div>
												<div class="text-2xl font-bold text-blue-600">
													RM {calculateTotalCosts().accommodation}
												</div>
											</div>

											<!-- Meals Cost -->
											<div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
												<div class="flex items-center gap-3 mb-3">
													<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
														<svg class="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
															<path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
														</svg>
													</div>
													<div>
														<h4 class="text-sm font-semibold text-gray-900">Meals</h4>
														<p class="text-xs text-gray-500">{mealsList.length} items</p>
													</div>
												</div>
												<div class="text-2xl font-bold text-green-600">
													RM {calculateTotalCosts().meals}
												</div>
											</div>

											<!-- Transport Cost -->
											<div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
												<div class="flex items-center gap-3 mb-3">
													<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
														<svg class="h-5 w-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
															<path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
															<path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z"/>
														</svg>
													</div>
													<div>
														<h4 class="text-sm font-semibold text-gray-900">Transport</h4>
														<p class="text-xs text-gray-500">{transportList.length} items</p>
													</div>
												</div>
												<div class="text-2xl font-bold text-purple-600">
													RM {calculateTotalCosts().transport}
												</div>
											</div>

											<!-- Service Cost -->
											<div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
												<div class="flex items-center gap-3 mb-3">
													<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
														<svg class="h-5 w-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
															<path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
														</svg>
													</div>
													<div>
														<h4 class="text-sm font-semibold text-gray-900">Services</h4>
														<p class="text-xs text-gray-500">{serviceList.length} items</p>
													</div>
												</div>
												<div class="text-2xl font-bold text-orange-600">
													RM {calculateTotalCosts().service}
												</div>
											</div>

											<!-- Operational Cost -->
											<div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
												<div class="flex items-center gap-3 mb-3">
													<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
														<CreditCard size={20} class="text-gray-600" />
													</div>
													<div>
														<h4 class="text-sm font-semibold text-gray-900">Operational</h4>
														<p class="text-xs text-gray-500">{operationalCostList.length} items</p>
													</div>
												</div>
												<div class="text-2xl font-bold text-gray-600">
													RM 0.00
												</div>
												<p class="text-xs text-gray-400 mt-1">No pricing data</p>
											</div>
										</div>

										<!-- Grand Total -->
										<div class="rounded-xl border-2 border-[#972395] bg-gradient-to-r from-[#972395]/5 to-[#972395]/10 p-6">
											<div class="flex items-center justify-between">
												<div>
													<h3 class="text-lg font-semibold text-gray-900">Grand Total</h3>
													<p class="text-sm text-gray-600">Total cost for this trip package</p>
												</div>
												<div class="text-right">
													<div class="text-3xl font-bold text-[#972395]">
														RM {calculateTotalCosts().grandTotal}
													</div>
													<p class="text-sm text-gray-500">All components included</p>
												</div>
											</div>
										</div>

										<!-- Detailed Breakdown -->
										<div class="rounded-xl border border-gray-200 bg-white shadow-sm">
											<div class="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
												<h3 class="text-base font-semibold text-gray-900">Detailed Breakdown</h3>
												<p class="mt-0.5 text-xs text-gray-500">Cost breakdown by category and items.</p>
											</div>
											<div class="p-6">
												<div class="space-y-4">
													<div class="flex items-center justify-between py-2 border-b border-gray-100">
														<span class="text-sm font-medium text-gray-700">Accommodation ({accommodationList.length} items)</span>
														<span class="text-sm font-semibold text-gray-900">RM {calculateTotalCosts().accommodation}</span>
													</div>
													<div class="flex items-center justify-between py-2 border-b border-gray-100">
														<span class="text-sm font-medium text-gray-700">Meals ({mealsList.length} items)</span>
														<span class="text-sm font-semibold text-gray-900">RM {calculateTotalCosts().meals}</span>
													</div>
													<div class="flex items-center justify-between py-2 border-b border-gray-100">
														<span class="text-sm font-medium text-gray-700">Transport ({transportList.length} items)</span>
														<span class="text-sm font-semibold text-gray-900">RM {calculateTotalCosts().transport}</span>
													</div>
													<div class="flex items-center justify-between py-2 border-b border-gray-100">
														<span class="text-sm font-medium text-gray-700">Services ({serviceList.length} items)</span>
														<span class="text-sm font-semibold text-gray-900">RM {calculateTotalCosts().service}</span>
													</div>
													<div class="flex items-center justify-between py-2 border-b border-gray-100">
														<span class="text-sm font-medium text-gray-700">Operational ({operationalCostList.length} items)</span>
														<span class="text-sm font-semibold text-gray-900">RM 0.00</span>
													</div>
													<div class="flex items-center justify-between py-3 pt-4 border-t-2 border-[#972395]">
														<span class="text-base font-bold text-gray-900">Total Package Cost</span>
														<span class="text-lg font-bold text-[#972395]">RM {calculateTotalCosts().grandTotal}</span>
													</div>
												</div>
											</div>
										</div>
									</div>
								{/if}
							</div>
						{/if}
					{/if}
				{/if}
			</div>
		</div>

		<!-- Footer Actions -->
		<div
			class="fixed right-0 bottom-0 left-[276px] z-20 flex items-center justify-between border-t border-gray-200 bg-white px-8 py-4"
		>
			<a
				href="/"
				class="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
				>Cancel</a
			>
			<div class="flex items-center gap-3">
				<button
					class="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
					>Save Draft</button
				>
				<button
					class="flex items-center gap-2 rounded-lg bg-[#972395] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#7a1c78]"
				>
					Save Package <ChevronRight size={16} />
				</button>
			</div>
		</div>
	</main>
</div>

<!-- Accommodation Modal -->
{#if showAccommodationModal}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
		transition:fade={{ duration: 200 }}
	>
		<div
			class="no-scrollbar max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl transition-all duration-300"
			transition:slide={{ axis: 'y', duration: 300 }}
		>
			<div class="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white p-6">
				<div>
					<h2 class="text-xl font-semibold text-gray-900">
						{editingAccommodationIndex !== null ? 'Edit' : 'Add'} Accommodation
					</h2>
					<p class="mt-1 text-sm text-gray-500">Configure hotel accommodation details and pricing.</p>
				</div>
				<button
					class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
					onclick={() => {
						showAccommodationModal = false;
						resetAccommodationForm();
					}}
				>
					<X size={20} />
				</button>
			</div>

			<div class="p-6 space-y-6">
				<!-- Section 1: Basic Information -->
				<div class="rounded-xl border border-gray-200 bg-gray-50/30 p-5">
					<div class="mb-4 flex items-center gap-3">
						<div class="flex h-8 w-8 items-center justify-center rounded-full bg-[#972395] text-white text-sm font-bold">1</div>
						<h3 class="text-sm font-semibold text-gray-900">Basic Information</h3>
					</div>
					<div class="grid grid-cols-3 gap-4">
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700">City <span class="text-red-500">*</span></label>
							<select
								class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={accommodationForm.city}
							>
								<option value="">Select city</option>
								<option value="Makkah">Makkah</option>
								<option value="Madinah">Madinah</option>
								<option value="Jeddah">Jeddah</option>
							</select>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700">Hotel <span class="text-red-500">*</span></label>
							<select
								class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={accommodationForm.hotel}
							>
								<option value="">Select hotel</option>
								<option value="Al Safwah Royale Orchid">Al Safwah Royale Orchid</option>
								<option value="Hilton Makkah">Hilton Makkah</option>
								<option value="Swissotel Makkah">Swissotel Makkah</option>
								<option value="Oberoi Madina">Oberoi Madina</option>
							</select>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700">Supplier <span class="text-red-500">*</span></label>
							<select
								class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={accommodationForm.supplier}
							>
								<option value="">Select supplier</option>
								<option value="Al Safwah Royale Orchid">Al Safwah Royale Orchid</option>
								<option value="Medina Oberoi">Medina Oberoi</option>
							</select>
						</div>
					</div>
				</div>

				<!-- Section 2: Room & Stay Details -->
				<div class="rounded-xl border border-gray-200 bg-gray-50/30 p-5">
					<div class="mb-4 flex items-center gap-3">
						<div class="flex h-8 w-8 items-center justify-center rounded-full bg-[#972395] text-white text-sm font-bold">2</div>
						<h3 class="text-sm font-semibold text-gray-900">Room & Stay Details</h3>
					</div>
					<div class="grid grid-cols-4 gap-4">
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700">Room Type <span class="text-red-500">*</span></label>
							<select
								class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={accommodationForm.roomType}
							>
								<option value="">Select room type</option>
								<option value="DBL">DBL</option>
								<option value="TWN">TWN</option>
								<option value="TRP">TRP</option>
								<option value="QUD">QUD</option>
							</select>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700">Check-in <span class="text-red-500">*</span></label>
							<input
								type="date"
								class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={accommodationForm.checkIn}
								onchange={calculateNights}
							/>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700">Check-out <span class="text-red-500">*</span></label>
							<input
								type="date"
								class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={accommodationForm.checkOut}
								onchange={calculateNights}
							/>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700">Nights</label>
							<input
								type="number"
								class="rounded-lg border border-gray-300 bg-gray-100 px-3.5 py-2.5 text-sm outline-none"
								bind:value={accommodationForm.nights}
								readonly
							/>
						</div>
					</div>
				</div>

				<!-- Section 3: Service & Amenities -->
				<div class="rounded-xl border border-gray-200 bg-gray-50/30 p-5">
					<div class="mb-4 flex items-center gap-3">
						<div class="flex h-8 w-8 items-center justify-center rounded-full bg-[#972395] text-white text-sm font-bold">3</div>
						<h3 class="text-sm font-semibold text-gray-900">Service & Amenities</h3>
					</div>
					<div class="grid grid-cols-4 gap-4">
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700">Basis</label>
							<select
								class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={accommodationForm.basis}
							>
								<option value="">Select basis</option>
								<option value="Room Only">Room Only</option>
								<option value="Bed & Breakfast">Bed & Breakfast</option>
								<option value="Half Board">Half Board</option>
								<option value="Full Board">Full Board</option>
							</select>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700">Rate Code</label>
							<select
								class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={accommodationForm.rateCode}
							>
								<option value="">Select rate code</option>
								<option value="Per Room Per Night">Per Room Per Night</option>
								<option value="Per Person Per Night">Per Person Per Night</option>
							</select>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700">Package Meals</label>
							<select
								class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={accommodationForm.packageMeals}
							>
								<option value="">Select meals</option>
								<option value="Breakfast Asian">Breakfast Asian</option>
								<option value="Lunch Asian">Lunch Asian</option>
								<option value="Dinner Asian">Dinner Asian</option>
							</select>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700">Hotel View</label>
							<select
								class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={accommodationForm.hotelView}
							>
								<option value="">Select view</option>
								<option value="Haram View">Haram View</option>
								<option value="City View">City View</option>
								<option value="Sea View">Sea View</option>
							</select>
						</div>
					</div>
				</div>

				<!-- Section 4: Tax & Additional Charges -->
				<div class="rounded-xl border border-gray-200 bg-gray-50/30 p-5">
					<div class="mb-4 flex items-center gap-3">
						<div class="flex h-8 w-8 items-center justify-center rounded-full bg-[#972395] text-white text-sm font-bold">4</div>
						<h3 class="text-sm font-semibold text-gray-900">Tax & Additional Charges</h3>
					</div>
					<div class="grid grid-cols-4 gap-4">
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700">VAT</label>
							<select
								class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={accommodationForm.vat}
							>
								<option value="">Select VAT</option>
								<option value="Select">Select</option>
							</select>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700">Municipality Tax</label>
							<select
								class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={accommodationForm.municipalityTax}
							>
								<option value="">Select</option>
								<option value="Select">Select</option>
							</select>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700">VAT %</label>
							<input
								type="number"
								placeholder="15"
								class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={accommodationForm.vatPercent}
								oninput={calculateTotals}
							/>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700">Municipality Tax %</label>
							<input
								type="number"
								placeholder="5"
								class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={accommodationForm.municipalityTaxPercent}
								oninput={calculateTotals}
							/>
						</div>
					</div>
				</div>

				<!-- Section 5: Cost Breakdown -->
				<div class="rounded-xl border border-gray-200 bg-gray-50/30 p-5">
					<div class="mb-4 flex items-center gap-3">
						<div class="flex h-8 w-8 items-center justify-center rounded-full bg-[#972395] text-white text-sm font-bold">5</div>
						<h3 class="text-sm font-semibold text-gray-900">Cost Breakdown</h3>
					</div>
					<div class="space-y-4">
						<!-- Adult Row -->
						<div class="rounded-lg border border-gray-200 bg-white p-4">
							<h4 class="mb-3 text-sm font-semibold text-gray-900">Adult Pricing</h4>
							<div class="grid grid-cols-4 gap-3">
								<div class="flex flex-col gap-1">
									<label class="text-xs font-medium text-gray-600">Cost</label>
									<input
										type="number"
										placeholder="0"
										class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={accommodationForm.adultCost}
										oninput={calculateTotals}
									/>
								</div>
								<div class="flex flex-col gap-1">
									<label class="text-xs font-medium text-gray-600">Sell</label>
									<input
										type="number"
										placeholder="0"
										class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={accommodationForm.adultSell}
										oninput={calculateTotals}
									/>
								</div>
								<div class="flex flex-col gap-1">
									<label class="text-xs font-medium text-gray-600">Ors</label>
									<input
										type="number"
										placeholder="0"
										class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={accommodationForm.adultOrs}
										oninput={calculateTotals}
									/>
								</div>
								<div class="flex flex-col gap-1">
									<label class="text-xs font-medium text-gray-600">Total</label>
									<div class="rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-sm font-semibold text-[#972395]">
										RM {accommodationForm.adultTotal || '0.00'}
									</div>
								</div>
							</div>
						</div>

						<!-- Child Row -->
						<div class="rounded-lg border border-gray-200 bg-white p-4">
							<h4 class="mb-3 text-sm font-semibold text-gray-900">Child Pricing</h4>
							<div class="grid grid-cols-4 gap-3">
								<div class="flex flex-col gap-1">
									<label class="text-xs font-medium text-gray-600">Cost</label>
									<input
										type="number"
										placeholder="0"
										class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={accommodationForm.childCost}
										oninput={calculateTotals}
									/>
								</div>
								<div class="flex flex-col gap-1">
									<label class="text-xs font-medium text-gray-600">Sell</label>
									<input
										type="number"
										placeholder="0"
										class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={accommodationForm.childSell}
										oninput={calculateTotals}
									/>
								</div>
								<div class="flex flex-col gap-1">
									<label class="text-xs font-medium text-gray-600">Ors</label>
									<input
										type="number"
										placeholder="0"
										class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={accommodationForm.childOrs}
										oninput={calculateTotals}
									/>
								</div>
								<div class="flex flex-col gap-1">
									<label class="text-xs font-medium text-gray-600">Total</label>
									<div class="rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-sm font-semibold text-[#972395]">
										RM {accommodationForm.childTotal || '0.00'}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="sticky bottom-0 z-10 flex items-center justify-end gap-3 border-t border-gray-100 bg-white p-6">
				<button
					class="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
					onclick={() => {
						showAccommodationModal = false;
						resetAccommodationForm();
					}}
				>
					Cancel
				</button>
				<button
					class="flex items-center gap-2 rounded-lg bg-[#972395] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#7a1c78]"
					onclick={saveAccommodation}
				>
					<Save size={18} />
					{editingAccommodationIndex !== null ? 'Update' : 'Add'} Accommodation
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Meals Modal -->
{#if showMealsModal}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
		transition:fade={{ duration: 200 }}
	>
		<div
			class="no-scrollbar max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl transition-all duration-300"
			transition:slide={{ axis: 'y', duration: 300 }}
		>
			<div class="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white p-6">
				<div>
					<h2 class="text-xl font-semibold text-gray-900">
						{editingMealsIndex !== null ? 'Edit' : 'Add'} Meal Plan
					</h2>
					<p class="mt-1 text-sm text-gray-500">Configure meal plan details and pricing.</p>
				</div>
				<button
					class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
					onclick={() => {
						showMealsModal = false;
						resetMealsForm();
					}}
				>
					<X size={20} />
				</button>
			</div>

			<div class="p-6 space-y-6">
				<!-- Section 1: Basic Information -->
				<div class="rounded-xl border border-gray-200 bg-gray-50/30 p-5">
					<div class="mb-4 flex items-center gap-3">
						<div class="flex h-8 w-8 items-center justify-center rounded-full bg-[#972395] text-white text-sm font-bold">1</div>
						<h3 class="text-sm font-semibold text-gray-900">Basic Information</h3>
					</div>
					<div class="grid grid-cols-3 gap-4">
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700">Supplier <span class="text-red-500">*</span></label>
							<select
								class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={mealsForm.supplier}
							>
								<option value="">Select supplier</option>
								<option value="Ibtisam Catering">Ibtisam Catering</option>
								<option value="Dallah Groups">Dallah Groups</option>
								<option value="Al Baik Catering">Al Baik Catering</option>
							</select>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700">Hotel <span class="text-red-500">*</span></label>
							<select
								class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={mealsForm.hotel}
							>
								<option value="">Select hotel</option>
								<option value="Abdul Aziz Husni">Abdul Aziz Husni</option>
								<option value="Dallah Taibah">Dallah Taibah</option>
								<option value="Al Safwah Royale Orchid">Al Safwah Royale Orchid</option>
							</select>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700">Food Type <span class="text-red-500">*</span></label>
							<select
								class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={mealsForm.foodType}
							>
								<option value="">Select food type</option>
								<option value="FullBoard">FullBoard</option>
								<option value="Lunch">Lunch</option>
								<option value="Dinner">Dinner</option>
								<option value="Breakfast">Breakfast</option>
							</select>
						</div>
					</div>
				</div>

				<!-- Section 2: Date & Duration -->
				<div class="rounded-xl border border-gray-200 bg-gray-50/30 p-5">
					<div class="mb-4 flex items-center gap-3">
						<div class="flex h-8 w-8 items-center justify-center rounded-full bg-[#972395] text-white text-sm font-bold">2</div>
						<h3 class="text-sm font-semibold text-gray-900">Date & Duration</h3>
					</div>
					<div class="grid grid-cols-3 gap-4">
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700">From Date <span class="text-red-500">*</span></label>
							<input
								type="date"
								class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={mealsForm.fromDate}
							/>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700">To Date <span class="text-red-500">*</span></label>
							<input
								type="date"
								class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={mealsForm.toDate}
							/>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700">Nights</label>
							<input
								type="number"
								placeholder="0"
								class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={mealsForm.nights}
							/>
						</div>
					</div>
				</div>

				<!-- Section 3: Rate & Tax -->
				<div class="rounded-xl border border-gray-200 bg-gray-50/30 p-5">
					<div class="mb-4 flex items-center gap-3">
						<div class="flex h-8 w-8 items-center justify-center rounded-full bg-[#972395] text-white text-sm font-bold">3</div>
						<h3 class="text-sm font-semibold text-gray-900">Rate & Tax</h3>
					</div>
					<div class="grid grid-cols-3 gap-4">
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700">Rate Code</label>
							<select
								class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={mealsForm.rateCode}
							>
								<option value="">Select rate code</option>
								<option value="Per Pax">Per Pax</option>
								<option value="Per Room">Per Room</option>
							</select>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700">VAT</label>
							<select
								class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={mealsForm.vat}
							>
								<option value="">Select VAT</option>
								<option value="VAT_2018">VAT_2018</option>
								<option value="VAT_2020">VAT_2020</option>
							</select>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700">VAT %</label>
							<input
								type="number"
								placeholder="5"
								class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={mealsForm.vatPercent}
								oninput={calculateMealsTotals}
							/>
						</div>
					</div>
				</div>

				<!-- Section 4: Cost Breakdown -->
				<div class="rounded-xl border border-gray-200 bg-gray-50/30 p-5">
					<div class="mb-4 flex items-center gap-3">
						<div class="flex h-8 w-8 items-center justify-center rounded-full bg-[#972395] text-white text-sm font-bold">4</div>
						<h3 class="text-sm font-semibold text-gray-900">Cost Breakdown</h3>
					</div>
					<div class="space-y-4">
						<!-- Adult Row -->
						<div class="rounded-lg border border-gray-200 bg-white p-4">
							<h4 class="mb-3 text-sm font-semibold text-gray-900">Adult Pricing</h4>
							<div class="grid grid-cols-4 gap-3">
								<div class="flex flex-col gap-1">
									<label class="text-xs font-medium text-gray-600">Cost</label>
									<input
										type="number"
										placeholder="0"
										class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={mealsForm.adultCost}
										oninput={calculateMealsTotals}
									/>
								</div>
								<div class="flex flex-col gap-1">
									<label class="text-xs font-medium text-gray-600">Sell</label>
									<input
										type="number"
										placeholder="0"
										class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={mealsForm.adultSell}
										oninput={calculateMealsTotals}
									/>
								</div>
								<div class="flex flex-col gap-1">
									<label class="text-xs font-medium text-gray-600">Ors</label>
									<input
										type="number"
										placeholder="0"
										class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={mealsForm.adultOrs}
										oninput={calculateMealsTotals}
									/>
								</div>
								<div class="flex flex-col gap-1">
									<label class="text-xs font-medium text-gray-600">Total</label>
									<div class="rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-sm font-semibold text-[#972395]">
										RM {mealsForm.adultTotal || '0.00'}
									</div>
								</div>
							</div>
						</div>

						<!-- Child Row -->
						<div class="rounded-lg border border-gray-200 bg-white p-4">
							<h4 class="mb-3 text-sm font-semibold text-gray-900">Child Pricing</h4>
							<div class="grid grid-cols-4 gap-3">
								<div class="flex flex-col gap-1">
									<label class="text-xs font-medium text-gray-600">Cost</label>
									<input
										type="number"
										placeholder="0"
										class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={mealsForm.childCost}
										oninput={calculateMealsTotals}
									/>
								</div>
								<div class="flex flex-col gap-1">
									<label class="text-xs font-medium text-gray-600">Sell</label>
									<input
										type="number"
										placeholder="0"
										class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={mealsForm.childSell}
										oninput={calculateMealsTotals}
									/>
								</div>
								<div class="flex flex-col gap-1">
									<label class="text-xs font-medium text-gray-600">Ors</label>
									<input
										type="number"
										placeholder="0"
										class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={mealsForm.childOrs}
										oninput={calculateMealsTotals}
									/>
								</div>
								<div class="flex flex-col gap-1">
									<label class="text-xs font-medium text-gray-600">Total</label>
									<div class="rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-sm font-semibold text-[#972395]">
										RM {mealsForm.childTotal || '0.00'}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="sticky bottom-0 z-10 flex items-center justify-end gap-3 border-t border-gray-100 bg-white p-6">
				<button
					class="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
					onclick={() => {
						showMealsModal = false;
						resetMealsForm();
					}}
				>
					Cancel
				</button>
				<button
					class="flex items-center gap-2 rounded-lg bg-[#972395] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#7a1c78]"
					onclick={saveMeals}
				>
					<Save size={18} />
					{editingMealsIndex !== null ? 'Update' : 'Add'} Meal Plan
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Transport Modal -->
{#if showTransportModal}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
		transition:fade={{ duration: 200 }}
	>
		<div
			class="no-scrollbar max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl transition-all duration-300"
			transition:slide={{ axis: 'y', duration: 300 }}
		>
			<div class="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white p-6">
				<div>
					<h2 class="text-xl font-semibold text-gray-900">
						{editingTransportIndex !== null ? 'Edit' : 'Add'} Transportation
					</h2>
					<p class="mt-1 text-sm text-gray-500">Configure transportation details and pricing.</p>
				</div>
				<button
					class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
					onclick={() => {
						showTransportModal = false;
						resetTransportForm();
					}}
				>
					<X size={20} />
				</button>
			</div>

			<div class="p-6 space-y-6">
				<!-- Section 1: Basic Information -->
				<div class="rounded-xl border border-gray-200 bg-gray-50/30 p-5">
					<div class="mb-4 flex items-center gap-3">
						<div class="flex h-8 w-8 items-center justify-center rounded-full bg-[#972395] text-white text-sm font-bold">1</div>
						<h3 class="text-sm font-semibold text-gray-900">Basic Information</h3>
					</div>
					<div class="grid grid-cols-4 gap-4">
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700">Trip <span class="text-red-500">*</span></label>
							<select
								class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={transportForm.trip}
							>
								<option value="">Select trip</option>
								<option value="Round Trip">Round Trip</option>
								<option value="One Way">One Way</option>
								<option value="Airport Transfer">Airport Transfer</option>
							</select>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700">Supplier <span class="text-red-500">*</span></label>
							<select
								class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={transportForm.supplier}
							>
								<option value="">Select supplier</option>
								<option value="Hussain">Hussain</option>
								<option value="Al Rajhi Transport">Al Rajhi Transport</option>
								<option value="Saudi Transport Co">Saudi Transport Co</option>
							</select>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700">Travel Date <span class="text-red-500">*</span></label>
							<input
								type="date"
								class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={transportForm.travelDate}
							/>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700">Vehicle <span class="text-red-500">*</span></label>
							<select
								class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={transportForm.vehicle}
							>
								<option value="">Select vehicle</option>
								<option value="BUS">BUS</option>
								<option value="VAN">VAN</option>
								<option value="CAR">CAR</option>
								<option value="COASTER">COASTER</option>
							</select>
						</div>
					</div>
				</div>

				<!-- Section 2: Rate & Tax Information -->
				<div class="rounded-xl border border-gray-200 bg-gray-50/30 p-5">
					<div class="mb-4 flex items-center gap-3">
						<div class="flex h-8 w-8 items-center justify-center rounded-full bg-[#972395] text-white text-sm font-bold">2</div>
						<h3 class="text-sm font-semibold text-gray-900">Rate & Tax Information</h3>
					</div>
					<div class="grid grid-cols-3 gap-4">
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700">Rate Code <span class="text-red-500">*</span></label>
							<select
								class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={transportForm.rateCode}
								onchange={calculateTransportTotals}
							>
								<option value="">Select rate code</option>
								<option value="Per Pax">Per Pax</option>
								<option value="Fixed Cost">Fixed Cost</option>
							</select>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700">VAT</label>
							<select
								class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={transportForm.vat}
							>
								<option value="">Select VAT</option>
								<option value="VAT_2018">VAT_2018</option>
								<option value="VAT_2020">VAT_2020</option>
							</select>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700">VAT %</label>
							<input
								type="number"
								placeholder="5"
								class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={transportForm.vatPercent}
								oninput={calculateTransportTotals}
							/>
						</div>
					</div>
				</div>

				<!-- Section 3: Cost Breakdown -->
				<div class="rounded-xl border border-gray-200 bg-gray-50/30 p-5">
					<div class="mb-4 flex items-center gap-3">
						<div class="flex h-8 w-8 items-center justify-center rounded-full bg-[#972395] text-white text-sm font-bold">3</div>
						<h3 class="text-sm font-semibold text-gray-900">Cost Breakdown</h3>
					</div>
					
					{#if transportForm.rateCode === 'Fixed Cost'}
						<!-- Fixed Cost Input -->
						<div class="grid grid-cols-2 gap-4">
							<div class="flex flex-col gap-1.5">
								<label class="text-[13px] font-medium text-gray-700">Fixed Cost Amount</label>
								<input
									type="number"
									placeholder="0"
									class="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
									bind:value={transportForm.fixedCost}
									oninput={calculateTransportTotals}
								/>
							</div>
							<div class="flex flex-col gap-1.5">
								<label class="text-[13px] font-medium text-gray-700">Total (with VAT)</label>
								<div class="rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm font-semibold text-[#972395]">
									RM {transportForm.fixedTotal || '0.00'}
								</div>
							</div>
						</div>
					{:else if transportForm.rateCode === 'Per Pax'}
						<!-- Per Pax Table - Compact Version -->
						<div class="space-y-4">
							<!-- Adult Row -->
							<div class="rounded-lg border border-gray-200 bg-white p-4">
								<h4 class="mb-3 text-sm font-semibold text-gray-900">Adult Pricing</h4>
								<div class="grid grid-cols-4 gap-3">
									<div class="flex flex-col gap-1">
										<label class="text-xs font-medium text-gray-600">Cost</label>
										<input
											type="number"
											placeholder="0"
											class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
											bind:value={transportForm.adultCost}
											oninput={calculateTransportTotals}
										/>
									</div>
									<div class="flex flex-col gap-1">
										<label class="text-xs font-medium text-gray-600">Sell</label>
										<input
											type="number"
											placeholder="0"
											class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
											bind:value={transportForm.adultSell}
											oninput={calculateTransportTotals}
										/>
									</div>
									<div class="flex flex-col gap-1">
										<label class="text-xs font-medium text-gray-600">Ors</label>
										<input
											type="number"
											placeholder="0"
											class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
											bind:value={transportForm.adultOrs}
											oninput={calculateTransportTotals}
										/>
									</div>
									<div class="flex flex-col gap-1">
										<label class="text-xs font-medium text-gray-600">Total</label>
										<div class="rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-sm font-semibold text-[#972395]">
											RM {transportForm.adultTotal || '0.00'}
										</div>
									</div>
								</div>
							</div>

							<!-- Child Row -->
							<div class="rounded-lg border border-gray-200 bg-white p-4">
								<h4 class="mb-3 text-sm font-semibold text-gray-900">Child Pricing</h4>
								<div class="grid grid-cols-4 gap-3">
									<div class="flex flex-col gap-1">
										<label class="text-xs font-medium text-gray-600">Cost</label>
										<input
											type="number"
											placeholder="0"
											class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
											bind:value={transportForm.childCost}
											oninput={calculateTransportTotals}
										/>
									</div>
									<div class="flex flex-col gap-1">
										<label class="text-xs font-medium text-gray-600">Sell</label>
										<input
											type="number"
											placeholder="0"
											class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
											bind:value={transportForm.childSell}
											oninput={calculateTransportTotals}
										/>
									</div>
									<div class="flex flex-col gap-1">
										<label class="text-xs font-medium text-gray-600">Ors</label>
										<input
											type="number"
											placeholder="0"
											class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
											bind:value={transportForm.childOrs}
											oninput={calculateTransportTotals}
										/>
									</div>
									<div class="flex flex-col gap-1">
										<label class="text-xs font-medium text-gray-600">Total</label>
										<div class="rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-sm font-semibold text-[#972395]">
											RM {transportForm.childTotal || '0.00'}
										</div>
									</div>
								</div>
							</div>

							<!-- Infant Row -->
							<div class="rounded-lg border border-gray-200 bg-white p-4">
								<h4 class="mb-3 text-sm font-semibold text-gray-900">Infant Pricing</h4>
								<div class="grid grid-cols-4 gap-3">
									<div class="flex flex-col gap-1">
										<label class="text-xs font-medium text-gray-600">Cost</label>
										<input
											type="number"
											placeholder="0"
											class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
											bind:value={transportForm.infantCost}
											oninput={calculateTransportTotals}
										/>
									</div>
									<div class="flex flex-col gap-1">
										<label class="text-xs font-medium text-gray-600">Sell</label>
										<input
											type="number"
											placeholder="0"
											class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
											bind:value={transportForm.infantSell}
											oninput={calculateTransportTotals}
										/>
									</div>
									<div class="flex flex-col gap-1">
										<label class="text-xs font-medium text-gray-600">Ors</label>
										<input
											type="number"
											placeholder="0"
											class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
											bind:value={transportForm.infantOrs}
											oninput={calculateTransportTotals}
										/>
									</div>
									<div class="flex flex-col gap-1">
										<label class="text-xs font-medium text-gray-600">Total</label>
										<div class="rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-sm font-semibold text-[#972395]">
											RM {transportForm.infantTotal || '0.00'}
										</div>
									</div>
								</div>
							</div>
						</div>
					{:else}
						<!-- Placeholder when no rate code selected -->
						<div class="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
							<p class="text-sm text-gray-500">Please select a rate code to configure pricing</p>
						</div>
					{/if}
				</div>
			</div>

			<div class="sticky bottom-0 z-10 flex items-center justify-end gap-3 border-t border-gray-100 bg-white p-6">
				<button
					class="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
					onclick={() => {
						showTransportModal = false;
						resetTransportForm();
					}}
				>
					Cancel
				</button>
				<button
					class="flex items-center gap-2 rounded-lg bg-[#972395] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#7a1c78]"
					onclick={saveTransport}
				>
					<Save size={18} />
					{editingTransportIndex !== null ? 'Update' : 'Add'} Transportation
				</button>
			</div>
		</div>
	</div>
{/if}
<!-- Operational Cost Modal -->
{#if showOperationalCostModal}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
		transition:fade={{ duration: 200 }}
	>
		<div
			class="w-full max-w-lg rounded-2xl bg-white shadow-2xl transition-all duration-300"
			transition:slide={{ axis: 'y', duration: 300 }}
		>
			<div class="flex items-center justify-between border-b border-gray-100 bg-white p-6">
				<div>
					<h2 class="text-xl font-semibold text-gray-900">
						{editingOperationalCostIndex !== null ? 'Edit' : 'Add'} Operational Cost
					</h2>
					<p class="mt-1 text-sm text-gray-500">Select local cost and/or other cost (at least one required).</p>
				</div>
				<button
					class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
					onclick={() => {
						showOperationalCostModal = false;
						resetOperationalCostForm();
					}}
				>
					<X size={20} />
				</button>
			</div>

			<div class="p-6 space-y-4">
				<!-- Local Cost Selection -->
				<div class="flex flex-col gap-1.5">
					<label class="text-[13px] font-medium text-gray-700">Local Cost</label>
					<select
						class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
						bind:value={operationalCostForm.localCost}
					>
						<option value="">Select local cost (optional)</option>
						{#each localCostOptions as option}
							<option value={option}>{option}</option>
						{/each}
					</select>
				</div>

				<!-- Other Cost Selection -->
				<div class="flex flex-col gap-1.5">
					<label class="text-[13px] font-medium text-gray-700">Other Cost</label>
					<select
						class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
						bind:value={operationalCostForm.otherCost}
					>
						<option value="">Select other cost (optional)</option>
						{#each otherCostOptions as option}
							<option value={option}>{option}</option>
						{/each}
					</select>
				</div>

				<!-- Preview -->
				{#if operationalCostForm.localCost || operationalCostForm.otherCost}
					<div class="rounded-lg border border-gray-200 bg-gray-50 p-3">
						<p class="text-sm text-gray-600">Preview:</p>
						<div class="mt-2 flex flex-wrap gap-2">
							{#if operationalCostForm.localCost}
								<span class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
									Local: {operationalCostForm.localCost}
								</span>
							{/if}
							{#if operationalCostForm.otherCost}
								<span class="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
									Other: {operationalCostForm.otherCost}
								</span>
							{/if}
						</div>
					</div>
				{/if}

				<!-- Validation Message -->
				{#if !operationalCostForm.localCost && !operationalCostForm.otherCost}
					<div class="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
						<p class="text-sm text-yellow-800">Please select at least one cost (local or other).</p>
					</div>
				{/if}
			</div>

			<div class="flex items-center justify-end gap-3 border-t border-gray-100 bg-white p-6">
				<button
					class="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
					onclick={() => {
						showOperationalCostModal = false;
						resetOperationalCostForm();
					}}
				>
					Cancel
				</button>
				<button
					class="flex items-center gap-2 rounded-lg bg-[#972395] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#7a1c78] disabled:opacity-50 disabled:cursor-not-allowed"
					onclick={saveOperationalCost}
					disabled={!operationalCostForm.localCost && !operationalCostForm.otherCost}
				>
					<Save size={18} />
					{editingOperationalCostIndex !== null ? 'Update' : 'Add'} Cost
				</button>
			</div>
		</div>
	</div>
{/if}
<!-- Service Modal -->
{#if showServiceModal}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
		transition:fade={{ duration: 200 }}
	>
		<div
			class="no-scrollbar max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl transition-all duration-300"
			transition:slide={{ axis: 'y', duration: 300 }}
		>
			<div class="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white p-6">
				<div>
					<h2 class="text-xl font-semibold text-gray-900">
						{editingServiceIndex !== null ? 'Edit' : 'Add'} Service
					</h2>
					<p class="mt-1 text-sm text-gray-500">Configure service details and pricing.</p>
				</div>
				<button
					class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
					onclick={() => {
						showServiceModal = false;
						resetServiceForm();
					}}
				>
					<X size={20} />
				</button>
			</div>

			<div class="p-6 space-y-6">
				<!-- Section 1: Service Information -->
				<div class="rounded-xl border border-gray-200 bg-gray-50/30 p-5">
					<div class="mb-4 flex items-center gap-3">
						<div class="flex h-8 w-8 items-center justify-center rounded-full bg-[#972395] text-white text-sm font-bold">1</div>
						<h3 class="text-sm font-semibold text-gray-900">Service Information</h3>
					</div>
					<div class="grid grid-cols-2 gap-4">
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700">Supplier <span class="text-red-500">*</span></label>
							<select
								class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={serviceForm.supplier}
							>
								<option value="">Select supplier</option>
								{#each supplierOptions as supplier}
									<option value={supplier}>{supplier}</option>
								{/each}
							</select>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-[13px] font-medium text-gray-700">Service <span class="text-red-500">*</span></label>
							<select
								class="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
								bind:value={serviceForm.service}
							>
								<option value="">Select service</option>
								{#each serviceOptions as service}
									<option value={service}>{service}</option>
								{/each}
							</select>
						</div>
					</div>
				</div>

				<!-- Section 2: Cost Breakdown -->
				<div class="rounded-xl border border-gray-200 bg-gray-50/30 p-5">
					<div class="mb-4 flex items-center gap-3">
						<div class="flex h-8 w-8 items-center justify-center rounded-full bg-[#972395] text-white text-sm font-bold">2</div>
						<h3 class="text-sm font-semibold text-gray-900">Cost Breakdown</h3>
					</div>
					<div class="space-y-4">
						<!-- Adult Row -->
						<div class="rounded-lg border border-gray-200 bg-white p-4">
							<h4 class="mb-3 text-sm font-semibold text-gray-900">Adult Pricing</h4>
							<div class="grid grid-cols-3 gap-3">
								<div class="flex flex-col gap-1">
									<label class="text-xs font-medium text-gray-600">Cost</label>
									<input
										type="number"
										placeholder="0"
										class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={serviceForm.adultCost}
									/>
								</div>
								<div class="flex flex-col gap-1">
									<label class="text-xs font-medium text-gray-600">Sell</label>
									<input
										type="number"
										placeholder="0"
										class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={serviceForm.adultSell}
									/>
								</div>
								<div class="flex flex-col gap-1">
									<label class="text-xs font-medium text-gray-600">Ors</label>
									<input
										type="number"
										placeholder="0"
										class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={serviceForm.adultOrs}
									/>
								</div>
							</div>
						</div>

						<!-- Child Row -->
						<div class="rounded-lg border border-gray-200 bg-white p-4">
							<h4 class="mb-3 text-sm font-semibold text-gray-900">Child Pricing</h4>
							<div class="grid grid-cols-3 gap-3">
								<div class="flex flex-col gap-1">
									<label class="text-xs font-medium text-gray-600">Cost</label>
									<input
										type="number"
										placeholder="0"
										class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={serviceForm.childCost}
									/>
								</div>
								<div class="flex flex-col gap-1">
									<label class="text-xs font-medium text-gray-600">Sell</label>
									<input
										type="number"
										placeholder="0"
										class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={serviceForm.childSell}
									/>
								</div>
								<div class="flex flex-col gap-1">
									<label class="text-xs font-medium text-gray-600">Ors</label>
									<input
										type="number"
										placeholder="0"
										class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={serviceForm.childOrs}
									/>
								</div>
							</div>
						</div>

						<!-- Infant Row -->
						<div class="rounded-lg border border-gray-200 bg-white p-4">
							<h4 class="mb-3 text-sm font-semibold text-gray-900">Infant Pricing</h4>
							<div class="grid grid-cols-3 gap-3">
								<div class="flex flex-col gap-1">
									<label class="text-xs font-medium text-gray-600">Cost</label>
									<input
										type="number"
										placeholder="0"
										class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={serviceForm.infantCost}
									/>
								</div>
								<div class="flex flex-col gap-1">
									<label class="text-xs font-medium text-gray-600">Sell</label>
									<input
										type="number"
										placeholder="0"
										class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={serviceForm.infantSell}
									/>
								</div>
								<div class="flex flex-col gap-1">
									<label class="text-xs font-medium text-gray-600">Ors</label>
									<input
										type="number"
										placeholder="0"
										class="rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
										bind:value={serviceForm.infantOrs}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="sticky bottom-0 z-10 flex items-center justify-end gap-3 border-t border-gray-100 bg-white p-6">
				<button
					class="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
					onclick={() => {
						showServiceModal = false;
						resetServiceForm();
					}}
				>
					Cancel
				</button>
				<button
					class="flex items-center gap-2 rounded-lg bg-[#972395] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#7a1c78]"
					onclick={saveService}
				>
					<Save size={18} />
					{editingServiceIndex !== null ? 'Update' : 'Add'} Service
				</button>
			</div>
		</div>
	</div>
{/if}