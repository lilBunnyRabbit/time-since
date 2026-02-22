import { v4 as uuidv4 } from "uuid";

export interface TimerSession {
  started_at: number;
  ended_at: number;
}

export interface TimerData {
  id: string;
  name: string;
  created_at: number;
  current_start: number | null;
  sessions: TimerSession[];
}

const STORAGE_KEY = "time-since-timers";

function load(): TimerData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(timers: TimerData[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
}

class TimerStore {
  timers = $state<TimerData[]>(load());

  #save() {
    save(this.timers);
  }

  create(name: string) {
    this.timers.push({
      id: uuidv4(),
      name,
      created_at: Date.now(),
      current_start: Date.now(),
      sessions: [],
    });
    this.#save();
  }

  restart(id: string) {
    const timer = this.timers.find((t) => t.id === id);
    if (!timer?.current_start) return;
    const now = Date.now();
    timer.sessions.push({ started_at: timer.current_start, ended_at: now });
    timer.current_start = now;
    this.#save();
  }

  stop(id: string) {
    const timer = this.timers.find((t) => t.id === id);
    if (!timer?.current_start) return;
    const now = Date.now();
    timer.sessions.push({ started_at: timer.current_start, ended_at: now });
    timer.current_start = null;
    this.#save();
  }

  start(id: string) {
    const timer = this.timers.find((t) => t.id === id);
    if (!timer || timer.current_start) return;
    timer.current_start = Date.now();
    this.#save();
  }

  set_start(id: string, timestamp: number) {
    const timer = this.timers.find((t) => t.id === id);
    if (!timer || !timer.current_start) return;
    timer.current_start = timestamp;
    this.#save();
  }

  remove_session(id: string, session_index: number) {
    const timer = this.timers.find((t) => t.id === id);
    if (!timer || session_index < 0 || session_index >= timer.sessions.length) return;
    const session = timer.sessions[session_index];
    const is_latest = session_index === timer.sessions.length - 1;
    timer.sessions.splice(session_index, 1);
    if (is_latest && timer.current_start === null) {
      timer.current_start = session.started_at;
    }
    this.#save();
  }

  remove(id: string) {
    const idx = this.timers.findIndex((t) => t.id === id);
    if (idx !== -1) this.timers.splice(idx, 1);
    this.#save();
  }
}

export const timer_store = new TimerStore();
