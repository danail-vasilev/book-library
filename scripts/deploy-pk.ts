import { ethers } from "hardhat";

export async function main(_privateKey, _rpcUrl) {
  const provider = new ethers.providers.JsonRpcProvider(_rpcUrl);
  const wallet = new ethers.Wallet(_privateKey, provider);
  // console.log(
  //   `private key: ${_privateKey}\nprovider: ${ethers.provider.connection.url}`
  // );
  // const wallet = new ethers.Wallet(_privateKey, ethers.provider); // New wallet with the privateKey passed from CLI as param
  console.log("Deploying contracts with the account:", wallet.address); // We are printing the address of the deployer
  const BookLibrary_Factory = await ethers.getContractFactory("BookLibrary");
  const bookLibrary = await BookLibrary_Factory.connect(wallet).deploy();
  await bookLibrary.deployed();
  console.log(
    `The Book Library contract is deployed to ${bookLibrary.address}`
  );
  const owner = await bookLibrary.owner();
  console.log(`The Book Library contract owner is ${owner}`);
}
