export const fetch_balance = async(exchange, token) => {
    if(exchange.name=='binance'){
        const balance = await exchange.ex.fetchBalance();
        return balance[token]['free'];
    }
    else if(exchange.name=='phemex'){
        const balance = await exchange.ex.fetchBalance({"type": "spot", "currency": token});
        return balance[token]['free'];
    }
    else{
        const balance = await exchange.ex.fetchBalance({"type": "spot", "coin": token});
        return balance.free[token]?balance.free[token]:0;
    }
}