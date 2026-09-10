export function sanitizePhone(phone: string | number | null | undefined): string {
  if (!phone) return '';
  return String(phone).replace(/\D/g, '');
}

export function normalizePhoneBR(raw: string | number | null | undefined): {
  normalized: string;
  isValid: boolean;
  formatted: string;
} {
  let digits = sanitizePhone(raw);

  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    // Ok, já tem DDI
  } else if (digits.length === 10 || digits.length === 11) {
    digits = '55' + digits;
  } else {
    return {
      normalized: digits,
      isValid: false,
      formatted: digits,
    };
  }

  const ddd = digits.slice(2, 4);
  const numberPart = digits.slice(4);

  const dddNum = parseInt(ddd, 10);
  if (isNaN(dddNum) || dddNum < 11 || dddNum > 99) {
    return {
      normalized: digits,
      isValid: false,
      formatted: digits,
    };
  }

  let formatted = `(${ddd}) `;
  if (numberPart.length === 9) {
    formatted += `${numberPart.slice(0, 5)}-${numberPart.slice(5)}`;
  } else if (numberPart.length === 8) {
    formatted += `${numberPart.slice(0, 4)}-${numberPart.slice(4)}`;
  } else {
    formatted += numberPart;
  }

  return {
    normalized: digits,
    isValid: digits.length === 12 || digits.length === 13,
    formatted,
  };
}

export function buildWaMeUrl(phone: string, text?: string): string {
  const { normalized } = normalizePhoneBR(phone);
  let url = `https://wa.me/${normalized}`;
  if (text && text.trim().length > 0) {
    url += `?text=${encodeURIComponent(text.trim())}`;
  }
  return url;
}
