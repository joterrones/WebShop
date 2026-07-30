export function toNumber(
  value: number | string | { toString(): string },
): number {
  return Number(value);
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}
