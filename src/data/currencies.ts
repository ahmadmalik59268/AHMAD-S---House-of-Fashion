import { Currency, CurrencyCode } from '../types';

export const CURRENCIES: Record<CurrencyCode, Currency> = {
  PKR: {
    code: 'PKR',
    symbol: 'Rs.',
    rate: 1,
    flag: '🇵🇰',
    label: 'PKR (₨)',
  },
  USD: {
    code: 'USD',
    symbol: '$',
    rate: 0.0036, // approx 1 USD = ~278 PKR
    flag: '🇺🇸',
    label: 'USD ($)',
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    rate: 0.0028, // approx 1 GBP = ~355 PKR
    flag: '🇬🇧',
    label: 'GBP (£)',
  },
  AED: {
    code: 'AED',
    symbol: 'AED ',
    rate: 0.013, // approx 1 AED = ~76 PKR
    flag: '🇦🇪',
    label: 'AED (د.إ)',
  },
  SAR: {
    code: 'SAR',
    symbol: 'SAR ',
    rate: 0.0135,
    flag: '🇸🇦',
    label: 'SAR (﷼)',
  },
  CAD: {
    code: 'CAD',
    symbol: 'CA$',
    rate: 0.0049,
    flag: '🇨🇦',
    label: 'CAD ($)',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    rate: 0.0033,
    flag: '🇪🇺',
    label: 'EUR (€)',
  },
};

export function formatPrice(amountPKR: number, currency: Currency): string {
  const converted = amountPKR * currency.rate;
  if (currency.code === 'PKR') {
    return `Rs. ${amountPKR.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
  }
  return `${currency.symbol}${converted.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
