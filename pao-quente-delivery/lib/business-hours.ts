// Horário oficial Pão Quente
// Segunda a Sábado: 05:00–19:00
// Domingo: 05:00–12:00

export type Schedule = { open: number; close: number } | null;

export function getScheduleFor(day: number): Schedule {
  if (day === 0) return { open: 5, close: 12 }; // domingo
  return { open: 5, close: 19 }; // seg-sab
}

export function isOpenAt(date: Date): boolean {
  const sched = getScheduleFor(date.getDay());
  if (!sched) return false;
  const hour = date.getHours() + date.getMinutes() / 60;
  return hour >= sched.open && hour < sched.close;
}

export function statusLabel(date = new Date()): { open: boolean; label: string } {
  const open = isOpenAt(date);
  if (open) {
    const sched = getScheduleFor(date.getDay())!;
    return { open: true, label: `Aberto agora — fecha às ${sched.close.toString().padStart(2, "0")}:00` };
  }
  return { open: false, label: "Fechado no momento" };
}
