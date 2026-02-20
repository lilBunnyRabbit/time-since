export function haptic(ms = 15) {
  if (navigator?.vibrate) navigator.vibrate(ms);
}

export function format_elapsed(ms: number): string {
  if (ms < 0) ms = 0;
  const total_seconds = Math.floor(ms / 1000);
  const days = Math.floor(total_seconds / 86400);
  const hours = Math.floor((total_seconds % 86400) / 3600);
  const minutes = Math.floor((total_seconds % 3600) / 60);
  const seconds = total_seconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(days)}:${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function to_datetime_local(timestamp: number): string {
  const d = new Date(timestamp);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function from_datetime_local(value: string): number {
  return new Date(value).getTime();
}

export function format_date(timestamp: number): string {
  const d = new Date(timestamp);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
