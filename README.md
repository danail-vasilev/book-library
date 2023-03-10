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
npx hardhat deploy-config --network goerli
```

Deploying contracts with the account: 0x9B2378d28cb0E6aD5e58801e65dA7334fB1CC39B
The Book Library contract is deployed to 0xaff5e74dBB53A685C219CEDFBD3D28d812742077
The Book Library contract owner is 0x9B2378d28cb0E6aD5e58801e65dA7334fB1CC39B

```shell
npx hardhat verify --network goerli "0xaff5e74dBB53A685C219CEDFBD3D28d812742077"
```

Nothing to compile
No need to generate any newer typings.
Successfully submitted source code for contract
contracts/BookLibrary.sol:BookLibrary at 0xaff5e74dBB53A685C219CEDFBD3D28d812742077
for verification on the block explorer. Waiting for verification result...

Successfully verified contract BookLibrary on Etherscan.
https://goerli.etherscan.io/address/0xaff5e74dBB53A685C219CEDFBD3D28d812742077#code

## Deploy BookLibrary contract to sepolia network and verify it

```shell
npx hardhat deploy-config --network sepolia
```

Deploying contracts with the account: 0x9B2378d28cb0E6aD5e58801e65dA7334fB1CC39B
The Book Library contract is deployed to 0xA8E46754033a8Fa049Fe602418B3B9D4B630fc94
The Book Library contract owner is 0x9B2378d28cb0E6aD5e58801e65dA7334fB1CC39B

```shell
npx hardhat verify --network sepolia "0xA8E46754033a8Fa049Fe602418B3B9D4B630fc94"
```

Nothing to compile
No need to generate any newer typings.
Successfully submitted source code for contract
contracts/BookLibrary.sol:BookLibrary at 0xA8E46754033a8Fa049Fe602418B3B9D4B630fc94
for verification on the block explorer. Waiting for verification result...

Successfully verified contract BookLibrary on Etherscan.
https://sepolia.etherscan.io/address/0xA8E46754033a8Fa049Fe602418B3B9D4B630fc94#code
