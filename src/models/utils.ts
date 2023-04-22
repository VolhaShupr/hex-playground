export function sortBy<T, K extends keyof T>(items: T[], key: K, desc: boolean = false): T[] {
  const direction = desc ? -1 : 1;
  return [...items].sort((a: T, b: T): number => ((a[key] as number) - (b[key] as number)) * direction);
}

export function groupBy<T, K extends keyof T>(items: T[], key: K): T[][] {
  const grouped = items.reduce((acc: Record<PropertyKey, T[]>, item: T) => {
    const value = item[key] as PropertyKey;
    return {
      ...acc,
      [value]: acc[value] ? [...acc[value], item] : [item]
    };
  }, {});
  return Object.values(grouped);
}

export function areObjectsKeysEqual(obj1: Record<string | number, unknown>, obj2: Record<string | number, unknown>): boolean {
  return areArraysEqual(Object.keys(obj1), Object.keys(obj2));
}
export function areArraysEqual(arr1: unknown[], arr2: unknown[]): boolean {
  return JSON.stringify([...arr1].sort()) === JSON.stringify([...arr2].sort());
}

export function isInRange(value: number, min: number, max: number): boolean {
  return (value - min) * ( value-max ) <= 0;
}

export function getUrlSearchParams(): Record<string, string> {
  const urlSearchParams = new URLSearchParams(window.location.search);
  return Object.fromEntries(urlSearchParams.entries());
}
