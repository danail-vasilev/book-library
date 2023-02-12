import { ethers } from "hardhat";

export async function main() {
  const bookLibraryFactory = await ethers.getContractFactory("BookLibrary");
  const bookLibrary = await bookLibraryFactory.deploy();

  await bookLibrary.deployed();

  console.log(`Book library deployed to ${bookLibrary.address}`);
}
