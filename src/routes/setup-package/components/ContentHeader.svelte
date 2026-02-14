<script>
	/** @type {{ activeSection: string }} */
	let { activeSection } = $props();

	const headers = {
		information: {
			title: 'General Information',
			subtitle: 'Set the basic details of this package.'
		},
		itinerary: {
			title: 'Trip Itinerary',
			subtitle: 'Plan the day-to-day activities.'
		},
		flight: {
			title: 'Flight Information',
			subtitle: 'Set the travel dates, flight details for this batch.'
		},
		packages: {
			title: 'Package Variants',
			subtitle: 'Create different package tiers and their specific details.'
		},
		'variant-info': {
			title: 'General Information',
			subtitle: 'Basic details for this variant.'
		},
		'variant-ground': {
			title: 'Ground Handling',
			subtitle: 'Hotels, meals, transport, services, and additional costs.'
		}
	};

	let current = $derived(headers[activeSection] || headers.flight);
</script>

<div class="border-b border-gray-100 px-8 py-6">
	<h2 class="text-xl font-bold text-gray-900">{current.title}</h2>
	<p class="text-sm text-gray-500">{current.subtitle}</p>
</div>
