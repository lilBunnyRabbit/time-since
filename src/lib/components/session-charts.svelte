<script lang="ts">
  import type { TimerSession } from "$lib/timers.svelte";
  import { format_elapsed } from "$lib/utils";

  interface Props {
    sessions: TimerSession[];
  }

  let { sessions }: Props = $props();

  const durations = $derived(sessions.map((s) => s.ended_at - s.started_at));

  // --- Stats ---
  const total_duration = $derived(durations.reduce((a, b) => a + b, 0));
  const avg_duration = $derived(durations.length ? total_duration / durations.length : 0);
  const min_duration = $derived(durations.length ? Math.min(...durations) : 0);
  const max_duration = $derived(durations.length ? Math.max(...durations) : 0);

  // --- Duration bar chart ---
  const bar_max = $derived(max_duration || 1);
  const chart_sessions = $derived(
    sessions.map((s, i) => ({
      duration: durations[i],
      pct: (durations[i] / bar_max) * 100,
      date: new Date(s.started_at),
    }))
  );

  // --- Activity heatmap (day of week x hour) ---
  const day_labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const heatmap_data = $derived.by(() => {
    const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
    for (const s of sessions) {
      const d = new Date(s.ended_at);
      const day = (d.getDay() + 6) % 7; // Mon=0
      const hour = d.getHours();
      grid[day][hour]++;
    }
    return grid;
  });

  const heatmap_max = $derived(
    Math.max(1, ...heatmap_data.flat())
  );

  function format_short_date(d: Date): string {
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}`;
  }
</script>

{#if sessions.length > 0}
  <div class="flex flex-col gap-4">
    <!-- Stats -->
    <div class="grid grid-cols-2 gap-2">
      <div class="rounded-lg border border-foreground/10 px-3 py-2">
        <div class="text-[10px] text-foreground/40 uppercase tracking-wider">Average</div>
        <div class="font-mono text-sm tabular-nums text-foreground/70">{format_elapsed(avg_duration)}</div>
      </div>
      <div class="rounded-lg border border-foreground/10 px-3 py-2">
        <div class="text-[10px] text-foreground/40 uppercase tracking-wider">Total</div>
        <div class="font-mono text-sm tabular-nums text-foreground/70">{format_elapsed(total_duration)}</div>
      </div>
      <div class="rounded-lg border border-foreground/10 px-3 py-2">
        <div class="text-[10px] text-foreground/40 uppercase tracking-wider">Shortest</div>
        <div class="font-mono text-sm tabular-nums text-foreground/70">{format_elapsed(min_duration)}</div>
      </div>
      <div class="rounded-lg border border-foreground/10 px-3 py-2">
        <div class="text-[10px] text-foreground/40 uppercase tracking-wider">Longest</div>
        <div class="font-mono text-sm tabular-nums text-foreground/70">{format_elapsed(max_duration)}</div>
      </div>
    </div>

    <!-- Duration bar chart -->
    {#if sessions.length > 1}
      <div class="flex flex-col gap-1">
        <h4 class="text-xs text-foreground/40 uppercase tracking-wider">Session Durations</h4>
        <div class="rounded-lg border border-foreground/10 p-3">
          <div class="flex flex-col gap-1">
            {#each chart_sessions as s, i}
              <div class="group flex items-center gap-2">
                <span class="text-[10px] text-foreground/30 w-12 shrink-0 tabular-nums font-mono">
                  {format_short_date(s.date)}
                </span>
                <div class="flex-1 h-4 relative">
                  <div
                    class="h-full rounded-sm bg-primary/60 transition-all duration-300"
                    style="width: {Math.max(s.pct, 2)}%"
                  ></div>
                </div>
                <span class="text-[10px] text-foreground/40 w-20 shrink-0 text-right tabular-nums font-mono">
                  {format_elapsed(s.duration)}
                </span>
              </div>
            {/each}
          </div>
        </div>
      </div>
    {/if}

    <!-- Activity heatmap -->
    <div class="flex flex-col gap-1">
      <h4 class="text-xs text-foreground/40 uppercase tracking-wider">Activity Heatmap</h4>
      <div class="rounded-lg border border-foreground/10 p-3 overflow-x-auto">
        <svg viewBox="0 0 {24 * 14 + 30} {7 * 14 + 16}" class="w-full" style="min-width: 320px;">
          <!-- Hour labels -->
          {#each Array(24) as _, h}
            {#if h % 3 === 0}
              <text
                x={30 + h * 14 + 6}
                y="10"
                text-anchor="middle"
                class="fill-foreground/30"
                font-size="8"
                font-family="monospace"
              >
                {h.toString().padStart(2, "0")}
              </text>
            {/if}
          {/each}
          <!-- Day labels + cells -->
          {#each heatmap_data as row, day}
            <text
              x="0"
              y={16 + day * 14 + 10}
              class="fill-foreground/30"
              font-size="8"
              font-family="monospace"
            >
              {day_labels[day]}
            </text>
            {#each row as count, hour}
              {@const opacity = count === 0 ? 0.06 : 0.15 + (count / heatmap_max) * 0.85}
              <rect
                x={30 + hour * 14}
                y={16 + day * 14}
                width="12"
                height="12"
                rx="2"
                class="fill-primary"
                fill-opacity={opacity}
              >
                <title>{day_labels[day]} {hour.toString().padStart(2, "0")}:00 — {count} session{count !== 1 ? "s" : ""}</title>
              </rect>
            {/each}
          {/each}
        </svg>
      </div>
    </div>
  </div>
{/if}
