<script lang="ts">
  import "./app.css";
  import { Plus } from "@lucide/svelte";
  import { timer_store } from "$lib/timers.svelte";
  import { haptic } from "$lib/utils";
  import TimerCard from "$lib/components/timer-card.svelte";

  let new_name = $state("");

  function create_timer(e: SubmitEvent) {
    e.preventDefault();
    const name = new_name.trim();
    if (!name) return;
    haptic(20);
    timer_store.create(name);
    new_name = "";
  }
</script>

<div class="h-full overflow-y-auto safe-area-pad">
  <div class="mx-auto max-w-2xl p-4 flex flex-col gap-4">
    <h1 class="text-xl font-bold text-center text-foreground">Time Since</h1>

    <form onsubmit={create_timer} class="flex gap-2">
      <input
        bind:value={new_name}
        placeholder="New timer name..."
        class="flex-1 rounded-xl border border-foreground/10 bg-transparent px-4 py-2.5 text-foreground placeholder:text-foreground/30 outline-none focus:border-primary/50 transition-colors"
      />
      <button
        type="submit"
        class="flex items-center justify-center size-12 shrink-0 select-none rounded-xl border border-foreground/10 text-primary
               shadow-[0_2px_0_0_rgba(255,255,255,0.06)]
               transition-all duration-100
               active:scale-90 active:brightness-125 active:bg-primary/20 active:shadow-none active:translate-y-[2px]"
      >
        <Plus class="size-5" />
      </button>
    </form>

    <div class="flex flex-col gap-4">
      {#each timer_store.timers as timer (timer.id)}
        <TimerCard {timer} />
      {/each}
    </div>

    {#if timer_store.timers.length === 0}
      <p class="text-center text-foreground/30 py-8">No timers yet. Create one above.</p>
    {/if}
  </div>
</div>
