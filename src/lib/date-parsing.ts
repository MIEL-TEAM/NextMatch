export function parseDateString(dateString: string): Date | null {
  const match = dateString.match(/^(\d{1,2}) (\w{3}) (\d{2}):(\d{2})$/);
  if (!match) return null;

  const [, day, month, hours, minutes] = match;
  const monthMap: { [key: string]: number } = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11,
  };

  const year = new Date().getFullYear();
  const monthIndex = monthMap[month];
  if (monthIndex === undefined) return null;

  return new Date(
    year,
    monthIndex,
    parseInt(day),
    parseInt(hours),
    parseInt(minutes)
  );
}
