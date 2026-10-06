import type { Plot } from "./types";

export function formatNaira(n: number) {
  return `₦${Math.round(n).toLocaleString("en-NG")}`;
}

// 4500000 -> "₦4.5M", 4750000 -> "₦4.75M", 800000 -> "₦800,000"
export function formatNairaShort(n: number) {
  if (n >= 1_000_000) {
    return `₦${Number((n / 1_000_000).toFixed(2))}M`;
  }
  return formatNaira(n);
}

export function isNumericSize(size: string) {
  return /^\d+$/.test(size.trim());
}

// "300" -> "300 m²", "Custom" -> "Custom"
export function sizeLabel(plot: Plot) {
  return isNumericSize(plot.size_sqm) ? `${plot.size_sqm} m²` : plot.size_sqm;
}

// "08061730950" -> "0806 173 0950"
export function formatPhone(phone: string) {
  const digits = phone.replace(/\s+/g, "");
  if (/^0\d{10}$/.test(digits)) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  return phone;
}

// "Mrs. Mabel Bassey" -> "MB"
export function initials(name: string) {
  const words = name
    .split(/\s+/)
    .filter((w) => w && !/^(mr|mrs|ms|miss|dr|prof|engr|chief|barr|hon)\.?$/i.test(w));
  return words
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
