import ccxt from 'ccxt';

export const truncate = (number, decimal) => {
    return ccxt.decimalToPrecision(number, ccxt.decimalToPrecision.TRUNCATE, decimal);
}