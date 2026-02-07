<script>
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { page } from '$app/stores';

	let { children } = $props();
</script>

<div class="flex min-h-screen bg-gray-50 font-sans">
	<!-- Sidebar with auto-detected active page -->
	<Sidebar activePage={$page.url.pathname} />

	<!-- Main Content Wrapper -->
	<main
		class="ml-[230px] min-h-screen flex-1 bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-50"
	>
		<div class="h-full">
			{@render children()}
		</div>
	</main>
</div>
