export type LunariaCurrency = {
  gold: number;
  silver: number;
  bronze: number;
};

export const BRONZE_PER_SILVER = 100;
export const SILVER_PER_GOLD = 1000;
export const BRONZE_PER_GOLD = SILVER_PER_GOLD * BRONZE_PER_SILVER;

export function safeNumber(value: unknown) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return 0;
  }

  return Math.max(0, Math.floor(numberValue));
}

export function currencyToBronze(currency: Partial<LunariaCurrency>) {
  const gold = safeNumber(currency.gold);
  const silver = safeNumber(currency.silver);
  const bronze = safeNumber(currency.bronze);

  return gold * BRONZE_PER_GOLD + silver * BRONZE_PER_SILVER + bronze;
}

export function bronzeToCurrency(totalBronzeInput: number): LunariaCurrency {
  const totalBronze = Math.max(0, Math.floor(Number(totalBronzeInput) || 0));

  const gold = Math.floor(totalBronze / BRONZE_PER_GOLD);
  const remainingAfterGold = totalBronze % BRONZE_PER_GOLD;

  const silver = Math.floor(remainingAfterGold / BRONZE_PER_SILVER);
  const bronze = remainingAfterGold % BRONZE_PER_SILVER;

  return {
    gold,
    silver,
    bronze,
  };
}

export function normalizeCurrency(
  currency: Partial<LunariaCurrency>
): LunariaCurrency {
  return bronzeToCurrency(currencyToBronze(currency));
}

export function addCurrency(
  current: Partial<LunariaCurrency>,
  change: Partial<LunariaCurrency>
): LunariaCurrency {
  const total = currencyToBronze(current) + currencyToBronze(change);
  return bronzeToCurrency(total);
}

export function subtractCurrency(
  current: Partial<LunariaCurrency>,
  change: Partial<LunariaCurrency>
): LunariaCurrency {
  const total = currencyToBronze(current) - currencyToBronze(change);
  return bronzeToCurrency(total);
}

export function canAfford(
  current: Partial<LunariaCurrency>,
  cost: Partial<LunariaCurrency>
) {
  return currencyToBronze(current) >= currencyToBronze(cost);
}

export function formatCurrency(currency: Partial<LunariaCurrency>) {
  const normalized = normalizeCurrency(currency);

  const parts: string[] = [];

  if (normalized.gold > 0) {
    parts.push(`${normalized.gold}G`);
  }

  if (normalized.silver > 0) {
    parts.push(`${normalized.silver}S`);
  }

  if (normalized.bronze > 0) {
    parts.push(`${normalized.bronze}B`);
  }

  if (parts.length === 0) {
    return "0B";
  }

  return parts.join(" ");
}

export function formatCurrencyLong(currency: Partial<LunariaCurrency>) {
  const normalized = normalizeCurrency(currency);

  return `${normalized.gold} Gold • ${normalized.silver} Silver • ${normalized.bronze} Bronze`;
}

export function silverToCurrency(silver: number): LunariaCurrency {
  return normalizeCurrency({
    gold: 0,
    silver,
    bronze: 0,
  });
}

export function bronzePriceToText(totalBronze: number) {
  return formatCurrency(bronzeToCurrency(totalBronze));
                           }
