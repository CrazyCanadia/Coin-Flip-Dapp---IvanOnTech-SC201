# Coin-Flip-Dapp  ---> IvanOnTech-SC201

**Warning: For educational purposes only.**
This is a Coin Flip betting Dapp built for educational purposes only.


This is a Coin Flip betting dapp built for the ethereum ecosystem. It has been made for educational purposes only as the final assignment in the IvanOnTech Academy's Ethereum Smart Contract Programming 201 course. This may, and almost certainly, contains bugs, errors, and inefficiencies. This is not intended for mainnet use. This is only intended for testnet play and discovery.

If you gain some knowledge from this, I am glad. I have certainly learned a lot making it.

In short, you pick heads or tails and bet on the flip of a coin. In the background, the contracts are receiving funds, as bets against a community created liquidity pool. For each bet the contract requests a random number using the ProvableAPI (https://github.com/provable-things/ethereum-api). This Oracle service fulfills the request by sending back a random number. Upon which this contract acts to verify your win or loss.

**Contract address**
This contract is deployed on the Ropsten Testnet at this address 0x0B311F2C3Aa1c851A32F81c61d80e3d8C0DF9883.
Please use the "Front End" folder and files in this repository. You can start a local http server using "python -m http.server" in your terminal or powershell from the "Front End" directory. After that you can user your web browser at "localhost:xxxx" (were 'xxxx' is your port number, usually 8000). Be sure to connect your Metamask to the Ropsten network.

This has been an incredibly valuable learning experience. Thanks to IvanOnTech Academy (https://academy.ivanontech.com/).

                            **-For Educational Purposes Only-**
