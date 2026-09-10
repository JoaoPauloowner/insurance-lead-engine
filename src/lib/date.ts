export interface UrgencyInfo {
  daysRemaining: number;
  status: 'urgente' | 'proximo' | 'em_dia' | 'vencido';
  label: string;
  badgeClass: string;
}

export function excelSerialToDate(serial: number): Date {
  const utcDays = Math.floor(serial - 25569);
  const utcValue = utcDays * 86400;
  const dateInfo = new Date(utcValue * 1000);
  const fractionalDay = serial - Math.floor(serial) + 0.0000001;
  let totalSeconds = Math.floor(86400 * fractionalDay);
  const seconds = totalSeconds % 60;
  totalSeconds -= seconds;
  const hours = Math.floor(totalSeconds / (60 * 60));
  const minutes = Math.floor(totalSeconds / 60) % 60;
  return new Date(dateInfo.getFullYear(), dateInfo.getMonth(), dateInfo.getDate(), hours, minutes, seconds);
}

export function parseDateFlexible(val: unknown): Date | null {
  if (!val) return null;

  if (val instanceof Date) {
    return isNaN(val.getTime()) ? null : val;
  }

  if (typeof val === 'number') {
    if (val > 30000 && val < 60000) {
      const d = excelSerialToDate(val);
      return isNaN(d.getTime()) ? null : d;
    }
  }

  const str = String(val).trim();
  if (!str) return null;

  const brMatch = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (brMatch) {
    const day = parseInt(brMatch[1], 10);
    const month = parseInt(brMatch[2], 10) - 1;
    const year = parseInt(brMatch[3], 10);
    const d = new Date(year, month, day, 12, 0, 0);
    if (!isNaN(d.getTime())) return d;
  }

  const isoMatch = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10) - 1;
    const day = parseInt(isoMatch[3], 10);
    const d = new Date(year, month, day, 12, 0, 0);
    if (!isNaN(d.getTime())) return d;
  }

  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDateBR(date: Date | string | null | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '-';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function calculateUrgency(vencimento: Date | string): UrgencyInfo {
  const target = typeof vencimento === 'string' ? new Date(vencimento) : vencimento;
  const now = new Date();
  
  const targetMidnight = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const diffMs = targetMidnight.getTime() - nowMidnight.getTime();
  const daysRemaining = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) {
    return {
      daysRemaining,
      status: 'vencido',
      label: `Venceu há ${Math.abs(daysRemaining)} dias`,
      badgeClass: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    };
  }

  if (daysRemaining === 0) {
    return {
      daysRemaining,
      status: 'urgente',
      label: 'Vence hoje!',
      badgeClass: 'bg-red-500/20 text-red-400 border-red-500/30 font-bold',
    };
  }

  if (daysRemaining <= 15) {
    return {
      daysRemaining,
      status: 'urgente',
      label: `Vence em ${daysRemaining} dias`,
      badgeClass: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    };
  }

  if (daysRemaining <= 30) {
    return {
      daysRemaining,
      status: 'proximo',
      label: `Vence em ${daysRemaining} dias`,
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    };
  }

  return {
    daysRemaining,
    status: 'em_dia',
    label: `Vence em ${daysRemaining} dias`,
    badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  };
}
