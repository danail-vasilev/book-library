# BookLibrary Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.ts
```

## Deploy BookLibrary contract to goerli network and verify it

```shell
npx hardhat deploy-pk-env
```

Deploying contracts with the account: 0x9B2378d28cb0E6aD5e58801e65dA7334fB1CC39B
The Book Library contract is deployed to 0x38d5ab137e3024c63477d317CBcF403aE6b5b504
The Book Library contract owner is 0x9B2378d28cb0E6aD5e58801e65dA7334fB1CC39B

```shell
npx hardhat verify --network goerli "0x38d5ab137e3024c63477d317CBcF403aE6b5b504"
```

Nothing to compile
No need to generate any newer typings.
Successfully submitted source code for contract
contracts/BookLibrary.sol:BookLibrary at 0x38d5ab137e3024c63477d317CBcF403aE6b5b504
for verification on the block explorer. Waiting for verification result...

Successfully verified contract BookLibrary on Etherscan.
https://goerli.etherscan.io/address/0x38d5ab137e3024c63477d317CBcF403aE6b5b504#code
