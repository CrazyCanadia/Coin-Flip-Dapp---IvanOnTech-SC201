# Coin-Flip-Dapp  ---> IvanOnTech-SC201

**This is a Coin Flip betting Dapp built for educational purposes only.**


This is a Coin Flip betting dapp built for the ethereum ecosystem. It has been made for educational purposes only as the final assignment in the IvanOnTech Academy's Ethereum Smart Contract Programming 201 course. This may, and almost certainly, contains bugs, errors, and inefficiencies. This is not intended for mainnet use. This is only intended for testnet play and discovery.

If you gain some knowledge from this, I am glad. I have certainly learned a lot making it.

 <img src="/Click the Coin.jpg" alt="Dapp Example Screenshot">

In short, you pick heads or tails and bet on the flip of a coin. In the background, the contracts are receiving funds, as bets against a community created liquidity pool. For each bet the contract requests a random number using the ProvableAPI (https://github.com/provable-things/ethereum-api). This Oracle service fulfills the request by sending back a random number. Upon which this contract acts to verify your win or loss.

## Contract address
<a href="https://ropsten.etherscan.io/address/0x0B311F2C3Aa1c851A32F81c61d80e3d8C0DF9883">This contract is deployed at this address (Ropsten Testnet): 0x0B311F2C3Aa1c851A32F81c61d80e3d8C0DF9883</a>
Please use the "Front End" folder and files in this repository. You can start a local http server using "python -m http.server" in your terminal or powershell from the "Front End" directory. After that you can user your web browser at "localhost:xxxx" (were 'xxxx' is your port number, usually 8000). Be sure to connect your Metamask to the Ropsten network.

This has been an incredibly valuable learning experience. Thanks to IvanOnTech Academy (https://academy.ivanontech.com/).

##  -- -- For Educational Purposes Only -- --

## Installation:

Clone the repo / npm install in the root / http.server from "Front End" directory.
You can start a local http server using "python -m http.server" in your terminal or powershell from the "Front End" directory. After that you can user your web browser at "localhost:xxxx" (were 'xxxx' is your port number, usually 8000). Be sure to connect your Metamask to the Ropsten network.

Clone the repository
```
git clone https://github.com/CrazyCanadia/Coin-Flip-Dapp---IvanOnTech-SC201.git
```

Install NPM packages in the root directory of this project.
```
npm install
```

run python local web server (localhost:8000)
```
py -m http.server
```
