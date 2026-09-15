const timers = new Set<number>();

export function trackInterval(id: number): number {
  timers.add(id);
  return id;
}

export function clearTicks(): void {
  for (const id of timers) window.clearInterval(id);
  timers.clear();
}
