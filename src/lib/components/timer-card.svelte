<script lang="ts">
  import { X, RotateCcw, Pause, Play, Trash2, Pencil } from "@lucide/svelte";
  import type { TimerData } from "$lib/timers.svelte";
  import { timer_store } from "$lib/timers.svelte";
  import {
    format_elapsed,
    format_date,
    to_datetime_local,
    from_datetime_local,
    haptic,
  } from "$lib/utils";
  import SessionCharts from "./session-charts.svelte";

  interface Props {
    timer: TimerData;
  }

  let { timer }: Props = $props();

  let open = $state(false);
  let card_pressed = $state(false);
  let now = $state(Date.now());
  let scrolled = $state(false);

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
    `${btn} rounded-lg shadow-[0_2px_0_0_rgba(255,255,255,0.06)] active:shadow-none active:translate-y-[2px]`;
</script>

<!-- Card -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="flex flex-col rounded-xl px-4 py-3 cursor-pointer select-none border
         transition-all duration-200 hover:brightness-110 {card_pressed ? 'scale-[0.98] brightness-110' : ''}
         {is_running ? 'bg-primary border-primary/50 text-background' : 'bg-background border-foreground/15'}"
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
      class="font-mono text-2xl tabular-nums {is_running ? 'text-background' : 'text-foreground/30'}"
    >
      {format_elapsed(elapsed)}
    </span>

    <div class="flex items-center gap-2 ml-auto shrink-0">
      {#if is_running}
        <button
          onclick={(e) => {
            e.stopPropagation();
            if (!confirm(`Restart "${timer.name}"?`)) return;
            haptic();
            timer_store.restart(timer.id);
          }}
          class="{btn_icon} size-12 bg-background text-secondary active:brightness-125"
          title="Restart"
        >
          <RotateCcw class="size-5" />
        </button>
        <button
          onclick={(e) => {
            e.stopPropagation();
            if (!confirm(`Stop "${timer.name}"?`)) return;
            haptic();
            timer_store.stop(timer.id);
          }}
          class="{btn_icon} size-12 bg-background text-accent active:brightness-125"
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
          class="{btn_icon} size-12 bg-primary text-background active:brightness-125"
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
  <div class="fixed inset-0 z-50 bg-background-dark safe-area-pad flex flex-col">
    <!-- Top bar -->
    <div class="flex items-center px-4 py-3 gap-2">
      <h2 class="text-lg font-bold truncate flex-1 min-w-0">{timer.name}</h2>
      <button
        onclick={() => {
          const name = prompt("Rename timer:", timer.name);
          if (name && name.trim()) {
            haptic(10);
            timer_store.rename(timer.id, name.trim());
          }
        }}
        class="{btn_icon} size-10 shrink-0 bg-foreground/10 text-foreground/50 active:brightness-125"
      >
        <Pencil class="size-5" />
      </button>
      <button
        onclick={() => {
          haptic(10);
          open = false;
        }}
        class="{btn_icon} size-10 shrink-0 bg-foreground/10 text-foreground/50 active:brightness-125"
      >
        <X class="size-5" />
      </button>
    </div>

    <!-- Timer + controls -->
    <div
      class="flex flex-col items-center px-4 border-b border-foreground/30 overflow-hidden transition-all duration-300 ease-in-out
             {scrolled ? 'gap-0 py-2' : 'gap-4 py-6'}"
    >
      <span
        class="font-mono tabular-nums transition-all duration-300 ease-in-out {is_running
          ? 'text-primary'
          : 'text-foreground/30'} {scrolled ? 'text-lg' : 'text-3xl'}"
      >
        {format_elapsed(elapsed)}
      </span>

      <div
        class="flex items-center gap-3 transition-all duration-300 ease-in-out origin-top
               {scrolled ? 'max-h-0 opacity-0 scale-y-0' : 'max-h-20 opacity-100 scale-y-100'}"
      >
        {#if is_running}
          <button
            onclick={() => {
              if (!confirm(`Restart "${timer.name}"?`)) return;
              haptic(25);
              timer_store.restart(timer.id);
            }}
            class="{btn_icon} size-14 bg-primary text-background active:brightness-125"
            title="Restart"
          >
            <RotateCcw class="size-6" />
          </button>
          <button
            onclick={() => {
              if (!confirm(`Stop "${timer.name}"?`)) return;
              haptic(25);
              timer_store.stop(timer.id);
            }}
            class="{btn_icon} size-14 bg-accent text-background active:brightness-125"
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
            class="{btn_icon} size-14 bg-primary text-background active:brightness-125"
            title="Start"
          >
            <Play class="size-6" />
          </button>
        {/if}
      </div>
    </div>

    <!-- Scrollable content -->
    <div
      class="flex-1 min-h-0 flex flex-col px-4 py-4 overflow-y-auto gap-4"
      onscroll={(e) => {
        scrolled = e.currentTarget.scrollTop > 10;
      }}
    >
      {#if is_running && timer.current_start}
        <label class="flex flex-col items-center gap-1 rounded-xl bg-background border border-foreground/15 px-4 py-3">
          <span class="text-xs text-foreground/40">Started at</span>
          <input
            type="datetime-local"
            value={to_datetime_local(timer.current_start)}
            onchange={(e) => {
              const ts = from_datetime_local(e.currentTarget.value);
              if (!isNaN(ts)) timer_store.set_start(timer.id, ts);
            }}
            class="rounded-lg bg-transparent px-3 py-1.5 text-sm text-foreground outline-none"
          />
        </label>
      {/if}
      {#if timer.sessions.length > 0}
        <SessionCharts sessions={timer.sessions} />
        <h3 class="text-sm text-foreground/50">Sessions</h3>
        <div class="flex flex-col rounded-xl bg-background border border-foreground/15 px-4">
          <div class="py-1">
            {#each timer.sessions.toReversed() as session, ri}
              {@const real_index = timer.sessions.length - 1 - ri}
              <div class="flex items-center py-2 text-sm gap-2">
                <span class="text-foreground/50">{format_date(session.started_at)}</span>
                <span class="font-mono tabular-nums text-foreground/70 ml-auto">
                  {format_elapsed(session.ended_at - session.started_at)}
                </span>
                <button
                  onclick={() => {
                    if (!confirm(`Delete session from "${timer.name}"?`)) return;
                    haptic(10);
                    timer_store.remove_session(timer.id, real_index);
                  }}
                  class="{btn} size-6 rounded text-foreground/20 active:text-secondary active:brightness-125"
                >
                  <X class="size-3.5" />
                </button>
              </div>
            {/each}
          </div>
        </div>
      {:else}
        <p class="text-sm text-foreground/30 text-center py-4">No sessions logged yet.</p>
      {/if}
    </div>

    <!-- Delete -->
    <div class="px-4 py-4 border-t border-foreground/30">
      <button
        onclick={() => {
          if (!confirm(`Delete "${timer.name}"? This action cannot be undone.`)) return;
          haptic(40);
          timer_store.remove(timer.id);
          open = false;
        }}
        class="{btn} w-full py-3 rounded-xl bg-secondary text-background
               shadow-[0_2px_0_0_rgba(255,255,255,0.06)] active:shadow-none active:translate-y-[2px]
               active:brightness-125 text-sm gap-2"
      >
        <Trash2 class="size-4" />
        Delete Timer
      </button>
    </div>
  </div>
{/if}
