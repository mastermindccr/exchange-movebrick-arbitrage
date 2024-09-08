import ccxt, { pro } from "ccxt";
import { fetch_balance } from "./fetch_balance.js";
import { truncate } from "./truncate.js";
import { getDate } from "./get_date.js";
const binance = ccxt.binance;
const bybit = ccxt.bybit;
const phemex = ccxt.phemex;

const tokens = ['BTC', 'ETH', 'BNB', 'DOGE', 'LINK', 'PEPE']; // you can modify this list

const decimal = {
    'BTC': 4,
    'ETH': 4,
    'BNB': 4,
    'DOGE': 0,
    'LINK': 2,
    'PEPE': 0
}

var exchanges = [
    {
        name: 'binance',
        ex: new binance({
            apiKey: process.env.BINANCE_API_KEY,
            secret: process.env.BINANCE_SECRET,
        }),
        fee: 0.001,
        balance: {
            'BTC': 0,
            'ETH': 0,
            'BNB': 0,
            'DOGE': 0,
            'LINK': 0,
            'USDT': 0
        }
    },
    {
        name: 'phemex',
        ex: new phemex({
            apiKey: process.env.PHEMEX_API_KEY,
            secret: process.env.PHEMEX_SECRET,
        }),
        fee: 0.001,
        balance: {
            'BTC': 0,
            'ETH': 0,
            'BNB': 0,
            'DOGE': 0,
            'LINK': 0,
            'USDT': 0
        }
    },
    {
        name: 'bybit',
        ex: new bybit({
            apiKey: process.env.BYBIT_API_KEY,
            secret: process.env.BYBIT_SECRET,
            options: {
                "createMarketBuyOrderRequiresPrice": false,
            }
        }),
        fee: 0.001,
        balance: {
            'BTC': 0,
            'ETH': 0,
            'BNB': 0,
            'DOGE': 0,
            'LINK': 0,
            'USDT': 0
        }
    }
];

const go = async () => {
    while(true){
        for(let token of tokens) {
            let token_pair = token + '/USDT';
            let promises = exchanges.map(ex => ex.ex.fetchOrderBook(token_pair));
            await Promise.all(promises).then(orderBooks => {
                let max_price = 0, max_amount, max_idx = -1, min_price = 999999, min_amount, min_idx = -1;
                for(let i = 0; i < orderBooks.length; i++) {
                    if(orderBooks[i].bids[0][0]>max_price){
                        max_price = orderBooks[i].bids[0][0];
                        max_amount = orderBooks[i].bids[0][1];
                        max_idx = i;
                    }
                    if(orderBooks[i].asks[0][0]<min_price){
                        min_price = orderBooks[i].asks[0][0];
                        min_amount = orderBooks[i].asks[0][1];
                        min_idx = i;
                    }
                }
                let profit = min_price<max_price*Math.pow((1-exchanges[max_idx].fee), 2);
                if(profit){
                    // check balance and minimum amount to not result in slippage
                    let min_balance = exchanges[min_idx].balance['USDT'];
                    let max_balance = exchanges[max_idx].balance[token];
    
                    let amount_can_buy = truncate(min_balance/min_price, decimal[token]);
                    let amount_has_buy = truncate(min_amount, decimal[token]);
                    let amount_can_sell = truncate(max_balance, decimal[token]);
                    let amount_has_sell = truncate(max_amount, decimal[token]);
                    let amount = Math.min(amount_can_buy, amount_has_buy, amount_can_sell, amount_has_sell);
                    console.log(`[${getDate()}]: buy ${amount} ${token_pair} at ${min_price} in ${exchanges[min_idx].name}, sell at ${max_price} in ${exchanges[max_idx].name}`);
                    if(amount>0){
                        // buy
                        exchanges[min_idx].ex.createLimitBuyOrder(token_pair, amount, min_price).then(async res => {
                            exchanges[min_idx].balance[token] = await fetch_balance(exchanges[min_idx], token);
                        });
                        // sell
                        exchanges[max_idx].ex.createLimitSellOrder(token_pair, amount, max_price).then(async res => {
                            exchanges[max_idx].balance[token] = await fetch_balance(exchanges[max_idx], token);
                        })
                    }
                }
            });
        }
    }
    
}

// main
(async () => {
    for(let exchange of exchanges){
        for(let token of tokens){
            const balance = await fetch_balance(exchange, token);
            exchange.balance[token] = balance;
        }
        const balance = await fetch_balance(exchange, 'USDT');
        exchange.balance['USDT'] = balance;
    }
    go();
})();

// some tokens have decimal problem