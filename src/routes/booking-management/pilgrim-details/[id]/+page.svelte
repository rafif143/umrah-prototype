<script>
	import { page } from '$app/stores';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { ArrowLeft, User } from 'lucide-svelte';

	let { data } = $props();
	const pilgrimId = $page.params.id; // Get ID from URL
</script>

<div class="flex min-h-screen bg-gray-50 font-sans">
	<Sidebar activePage="/booking-management" />

	<main class="ml-[230px] min-h-screen flex-1 bg-gray-50/50">
		<div class="flex h-full flex-col p-6">
			<!-- Header -->
			<div class="mb-6 flex items-center gap-4">
				<a
					href="/booking-management"
					class="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm hover:bg-gray-50 hover:text-gray-900"
				>
					<ArrowLeft size={20} />
				</a>
				<div>
					<h1 class="text-2xl font-bold text-gray-900">Detail Jemaah</h1>
					<p class="mt-1 text-sm text-gray-500">ID Jemaah: {pilgrimId}</p>
				</div>
			</div>

			<!-- Content Placeholder -->
			<div class="rounded-xl border border-gray-200 bg-white p-10 shadow-sm">
				<div class="text-center">
					<div
						class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-50 text-[#972395]"
					>
						<User size={32} />
					</div>
					<h3 class="text-lg font-medium text-gray-900">Menunggu Konten...</h3>
					<p class="text-gray-500">Halaman ini siap untuk diisi dengan form detail jemaah.</p>
				</div>
			</div>
		</div>
	</main>
</div>
