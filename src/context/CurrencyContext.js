import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext(null);

export const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar ($)' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)' },
  { code: 'EUR', symbol: '€', name: 'Euro (€)' },
  { code: 'GBP', symbol: '£', name: 'British Pound (£)' },
];

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    const saved = localStorage.getItem('currency_preference');
    return saved ? JSON.parse(saved) : currencies[1]; // Default to INR (Rupee) as requested
  });

  const changeCurrency = (code) => {
    const selected = currencies.find(c => c.code === code) || currencies[1];
    setCurrency(selected);
    localStorage.setItem('currency_preference', JSON.stringify(selected));
  };

  const formatAmount = (amount) => {
    const val = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
    return `${currency.symbol}${val.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, changeCurrency, formatAmount, currencies }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
