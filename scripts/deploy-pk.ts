import { Wallet } from "@ethersproject/wallet";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";

// Define local network settings in order to interact with an already deployed contract on local node because
// default hardhat run-time server is different than running a hardhat node
export async function mainHardhatConfig() {
  const [owner] = await ethers.getSigners();

  const provider = owner.provider;

  await deployContract(owner);
}

export async function mainParams(_privateKey: string, _rpcUrl: string) {
  console.log(_privateKey);
  console.log(_rpcUrl);

  const provider = new ethers.providers.JsonRpcProvider(_rpcUrl);
  const wallet = new ethers.Wallet(_privateKey, provider);
  // console.log(
  //   `private key: ${_privateKey}\nprovider: ${ethers.provider.connection.url}`
  // );
  // const wallet = new ethers.Wallet(_privateKey, ethers.provider); // New wallet with the privateKey passed from CLI as param
  await deployContract(wallet);
}

async function deployContract(signer: SignerWithAddress | Wallet) {
  console.log("Deploying contracts with the account:", signer.address); // We are printing the address of the deployer
  const BookLibrary_Factory = await ethers.getContractFactory("BookLibrary");
  const bookLibrary = await BookLibrary_Factory.connect(signer).deploy();
  await bookLibrary.deployed();
  console.log(
    `The Book Library contract is deployed to ${bookLibrary.address}`
  );
  const owner = await bookLibrary.owner();
  console.log(`The Book Library contract owner is ${owner}`);
}
