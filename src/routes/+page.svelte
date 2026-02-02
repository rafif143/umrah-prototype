<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		goto('/package-management');
	});
</script>

<svelte:head>
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="flex min-h-screen flex-col items-center justify-center bg-gray-50 font-sans">
	<div
		class="mb-4 h-10 w-10 animate-spin rounded-full border-[3px] border-gray-200 border-t-[#972395]"
	></div>
	<p class="text-sm text-gray-500">Redirecting...</p>
</div>
