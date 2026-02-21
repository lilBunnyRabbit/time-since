<script lang="ts">
  import { X, RotateCcw, Pause, Play, Trash2 } from "@lucide/svelte";
  import type { TimerData } from "$lib/timers.svelte";
  import { timer_store } from "$lib/timers.svelte";
  import {
    format_elapsed,
    format_date,
    to_datetime_local,
    from_datetime_local,
    haptic,
  } from "$lib/utils";

  interface Props {
    timer: TimerData;
  }

  let { timer }: Props = $props();

  let open = $state(false);
  let card_pressed = $state(false);
  let now = $state(Date.now());

  const is_running = $derived(timer.current_start !== null);
  const elapsed = $derived(timer.current_start ? now - timer.current_start : 0);

  $effect(() => {
    if (!is_running) return;
    now = Date.now();
    const interval = setInterval(() => {
      now = Date.now();
    }, 1000);
    return () => clearInterval(interval);
  });

  const btn =
    "flex items-center justify-center select-none transition-all duration-100 active:scale-90 active:brightness-125";
  const btn_icon =
    `${btn} rounded-lg border border-foreground/20 shadow-[0_2px_0_0_rgba(255,255,255,0.06)] active:shadow-none active:translate-y-[2px]`;
</script>

<!-- Card -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="flex flex-col rounded-xl border border-foreground/10 px-4 py-3 cursor-pointer select-none
         transition-all duration-100 hover:bg-foreground/5 {card_pressed ? 'scale-[0.98] bg-foreground/5' : ''}"
  onpointerdown={(e) => {
    if ((e.target as HTMLElement).closest("button")) return;
    card_pressed = true;
  }}
  onpointerup={() => (card_pressed = false)}
  onpointerleave={() => (card_pressed = false)}
  onclick={(e) => {
    if ((e.target as HTMLElement).closest("button")) return;
    haptic(10);
    open = true;
  }}
  onkeydown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      haptic(10);
      open = true;
    }
  }}
  role="button"
  tabindex="0"
>
  <span class="font-medium">{timer.name}</span>

  <div class="flex items-center gap-3 mt-2">
    <span
      class="font-mono text-2xl tabular-nums {is_running ? 'text-primary' : 'text-foreground/30'}"
    >
      {format_elapsed(elapsed)}
    </span>

    <div class="flex items-center gap-2 ml-auto shrink-0">
      {#if is_running}
        <button
          onclick={(e) => {
            e.stopPropagation();
            haptic();
            timer_store.restart(timer.id);
          }}
          class="{btn_icon} size-12 text-primary active:bg-primary/20"
          title="Restart"
        >
          <RotateCcw class="size-5" />
        </button>
        <button
          onclick={(e) => {
            e.stopPropagation();
            haptic();
            timer_store.stop(timer.id);
          }}
          class="{btn_icon} size-12 text-accent active:bg-accent/20"
          title="Stop"
        >
          <Pause class="size-5" />
        </button>
      {:else}
        <button
          onclick={(e) => {
            e.stopPropagation();
            haptic();
            timer_store.start(timer.id);
          }}
          class="{btn_icon} size-12 text-primary active:bg-primary/20"
          title="Start"
        >
          <Play class="size-5" />
        </button>
      {/if}
    </div>
  </div>
</div>

<!-- Full-screen detail -->
{#if open}
  <div class="fixed inset-0 z-50 bg-background safe-area-pad flex flex-col overflow-y-auto">
    <!-- Top bar -->
    <div class="flex items-center justify-between px-4 py-3">
      <h2 class="text-lg font-bold">{timer.name}</h2>
      <button
        onclick={() => {
          haptic(10);
          open = false;
        }}
        class="{btn_icon} size-10 text-foreground/50 active:bg-foreground/10"
      >
        <X class="size-5" />
      </button>
    </div>

    <!-- Timer + controls -->
    <div class="flex flex-col items-center gap-4 px-4 py-6">
      <span
        class="font-mono text-3xl tabular-nums {is_running
          ? 'text-primary'
          : 'text-foreground/30'}"
      >
        {format_elapsed(elapsed)}
      </span>

      {#if is_running && timer.current_start}
        <label class="flex flex-col items-center gap-1">
          <span class="text-xs text-foreground/40">Started at</span>
          <input
            type="datetime-local"
            value={to_datetime_local(timer.current_start)}
            onchange={(e) => {
              const ts = from_datetime_local(e.currentTarget.value);
              if (!isNaN(ts)) timer_store.set_start(timer.id, ts);
            }}
            class="rounded-lg border border-foreground/10 bg-transparent px-3 py-1.5 text-sm text-foreground outline-none focus:border-primary/50 transition-colors"
          />
        </label>
      {/if}

      <div class="flex items-center gap-3">
        {#if is_running}
          <button
            onclick={() => {
              haptic(25);
              timer_store.restart(timer.id);
            }}
            class="{btn_icon} size-14 text-primary active:bg-primary/20"
            title="Restart"
          >
            <RotateCcw class="size-6" />
          </button>
          <button
            onclick={() => {
              haptic(25);
              timer_store.stop(timer.id);
            }}
            class="{btn_icon} size-14 text-accent active:bg-accent/20"
            title="Stop"
          >
            <Pause class="size-6" />
          </button>
        {:else}
          <button
            onclick={() => {
              haptic(25);
              timer_store.start(timer.id);
            }}
            class="{btn_icon} size-14 text-primary active:bg-primary/20"
            title="Start"
          >
            <Play class="size-6" />
          </button>
        {/if}
      </div>
    </div>

    <!-- Session log -->
    <div class="flex-1 px-4">
      {#if timer.sessions.length > 0}
        <h3 class="text-sm text-foreground/50 mb-2">Sessions</h3>
        <div class="flex flex-col rounded-xl border border-foreground/10 px-4 py-1">
          {#each timer.sessions.toReversed() as session}
            <div class="flex justify-between items-center py-2 text-sm">
              <span class="text-foreground/50">{format_date(session.started_at)}</span>
              <span class="font-mono tabular-nums text-foreground/70">
                {format_elapsed(session.ended_at - session.started_at)}
              </span>
            </div>
          {/each}
        </div>
      {:else}
        <p class="text-sm text-foreground/30 text-center py-4">No sessions logged yet.</p>
      {/if}
    </div>

    <!-- Delete -->
    <div class="px-4 py-4">
      <button
        onclick={() => {
          if (!confirm("Delete this timer? This action cannot be undone.")) return;
          haptic(40);
          timer_store.remove(timer.id);
          open = false;
        }}
        class="{btn} w-full py-3 rounded-xl border border-secondary/30 text-secondary/70
               shadow-[0_2px_0_0_rgba(255,255,255,0.06)] active:shadow-none active:translate-y-[2px]
               active:text-secondary active:bg-secondary/10 text-sm gap-2"
      >
        <Trash2 class="size-4" />
        Delete Timer
      </button>
    </div>
  </div>
{/if}
