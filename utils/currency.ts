export type CurrencyCode = 'ALL' | 'EUR' | 'USD';

const CURRENCY_SYMBOL: Record<CurrencyCode, { symbol: string; position: 'before' | 'after' }> = {
  ALL: { symbol: 'Lekë', position: 'after' },
  EUR: { symbol: '€', position: 'before' },
  USD: { symbol: '$', position: 'before' },
};

function groupThousands(value: number) {
  return Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatCurrency(amount: number, currency: CurrencyCode = 'ALL') {
  const { symbol, position } = CURRENCY_SYMBOL[currency];
  const formatted = groupThousands(amount);
  return position === 'before' ? `${symbol}${formatted}` : `${formatted} ${symbol}`;
}
