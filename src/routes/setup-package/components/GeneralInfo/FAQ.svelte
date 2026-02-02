<script>
	import { X, Plus } from 'lucide-svelte';

	/** @type {{ state: import('../../packageState.svelte').PackageState }} */
	let { state } = $props();
</script>

<section class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
	<div class="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
		<h3 class="text-base font-semibold text-gray-900">Frequently Asked Questions</h3>
		<p class="mt-0.5 text-xs text-gray-500">Add common questions and answers.</p>
	</div>
	<div class="flex flex-col p-6">
		{#each state.faqList as faq, i}
			<div class="relative mb-6 rounded-lg border border-gray-200 bg-gray-50/50 p-4">
				<div class="absolute top-4 right-4">
					<button
						class="text-gray-400 hover:text-red-500"
						onclick={() => (state.faqList = state.faqList.filter((_, idx) => idx !== i))}
						><X size={16} /></button
					>
				</div>
				<div class="mb-4">
					<span
						class="flex h-6 w-6 items-center justify-center rounded-full bg-[#972395] text-xs font-bold text-white"
						>{i + 1}</span
					>
				</div>
				<div class="flex flex-col gap-4">
					<div class="flex flex-col gap-1.5">
						<label class="text-[13px] font-medium text-gray-700">Question</label>
						<input
							type="text"
							placeholder="Enter question..."
							bind:value={faq.question}
							class="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
						/>
					</div>
					<div class="flex flex-col gap-1.5">
						<label class="text-[13px] font-medium text-gray-700">Answer</label>
						<textarea
							rows="2"
							placeholder="Enter answer..."
							bind:value={faq.answer}
							class="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-shadow outline-none focus:border-[#972395] focus:ring-1 focus:ring-[#972395]"
						></textarea>
					</div>
				</div>
			</div>
		{/each}
		<button
			class="flex w-fit items-center gap-2.5 rounded-lg border border-dashed border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-[#972395] hover:text-[#972395]"
			onclick={() => (state.faqList = [...state.faqList, { question: '', answer: '' }])}
		>
			<Plus size={16} /> Add FAQ
		</button>
	</div>
</section>
