export function parseDateBR(raw: string): Date | undefined {
  const match = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return undefined;
  const [, day, month, year] = match;
  const parsed = new Date(
    Number.parseInt(year),
    Number.parseInt(month) - 1,
    Number.parseInt(day),
  );
  if (isNaN(parsed.getTime())) return undefined;
  return parsed;
}
