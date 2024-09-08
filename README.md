`Note: this project should be run with node version higher than 20.0.0`
# What is this project about?
This project is a simple trading bot that trades on Binance, Phemex and Bybit, which searches for arbitrage opportunities between the three exchanges. The bot only trades on spot markets with user-specified pairs (you can modify it in the `index.js`).
# How to run the project?
1. `npm i`
2. fill in the `.env` file with the following information:
```
BINANCE_API_KEY=<api_key>
BINANCE_SECRET=<secret>
PHEMEX_API_KEY=<api_key>
PHEMEX_SECRET=<secret>
BYBIT_API_KEY=<api_key>
BYBIT_SECRET=<secret>
```
3. `npm start`