import { ethers } from "hardhat";
import BookLibrary from "../artifacts/contracts/BookLibrary.sol/BookLibrary.json";
import "dotenv/config";

const INFURA_RPC_URL = process.env.INFURA_RPC_URL;
const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const GOERLI_BOOKLIB_CONTRACT = process.env.GOERLI_BOOKLIB_CONTRACT;

const LOCAL_HOST_URL = process.env.LOCAL_HOST_URL;
const LOCAL_HOST_ACC = process.env.LOCAL_HOST_ACC;
const LOCAL_HOST_PRIVATE_KEY = process.env.LOCAL_HOST_PRIVATE_KEY;
const LOCAL_HOST_BOOKLIB_CONTRACT = process.env.LOCAL_HOST_BOOKLIB_CONTRACT;

export async function main(isLocalHost: string) {
  // Use this var because isLocalHost is of string
  const isLocal = isLocalHost === "true";
  // Determine the contract's address and ABI
  const contractAddress: string = (
    isLocal ? LOCAL_HOST_BOOKLIB_CONTRACT : GOERLI_BOOKLIB_CONTRACT
  ) as string;
  const contractAbi = BookLibrary.abi;

  // Connect to a node
  const RPC_URL = isLocal ? LOCAL_HOST_URL : GOERLI_RPC_URL;
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  console.log(LOCAL_HOST_URL);
  console.log(GOERLI_RPC_URL);
  console.log(isLocalHost);
  console.log(RPC_URL);
  await doesContractExist(provider, contractAddress);

  // Instantiate the contract
  const privateKey: string = (
    isLocal ? LOCAL_HOST_PRIVATE_KEY : PRIVATE_KEY
  ) as string;
  const wallet = new ethers.Wallet(privateKey, provider);
  // 1) Reference contract with provider:
  // const bookLibrary = new ethers.Contract(contractAddress, contractAbi, provider);
  // 2) Reference contract with wallet:
  const bookLibrary = new ethers.Contract(contractAddress, contractAbi, wallet);
  const bookKey1 = await bookLibrary.listBookBorrowers("non-existing-title");
  console.log(bookKey1);

  // const bookLibraryFactory = await ethers.getContractFactory("BookLibrary");
  // const bookLibrary = await bookLibraryFactory.deploy();
  // await bookLibrary.deployed();

  console.log(`Book library deployed to ${bookLibrary.address}`);
  const title1: string = "Title1";
  const title2: string = "Book Title2";

  await (await bookLibrary.addBook(title1, 5)).wait();
  await (await bookLibrary.addBook(title2, 1)).wait();
  const bookKey: string = await bookLibrary.bookKey(0);
  console.log(bookKey);
  console.log(`Available books: ${await bookLibrary.getAvailableBooks()}`);
  console.log(await bookLibrary.books(bookKey));
  await (await bookLibrary.borrowBook(title2)).wait();
  console.log(`Is rented: ${await bookLibrary.isBorrowed(title2)}`);
  console.log(`Is available: ${await bookLibrary.isAvailable(title2)}`);
  await (await bookLibrary.returnBook(title2)).wait();
  console.log(`Is available: ${await bookLibrary.isAvailable(title2)}`);
  const bookInfo = await bookLibrary.getBookInfo(title2);
  console.log("Current book copies:");
  console.log(bookInfo.currentCopies.toString());
}

async function doesContractExist(provider: any, contractAddress: string) {
  // Test the connection
  // console.log(await provider.getBlock("latest"));
  // Test whether the contract exists by checking its code
  try {
    const code = await provider.getCode(contractAddress);
    if (code === "0x") {
      console.log("The contract does not exist");
    } else {
      console.log("The contract exists");
      // You can now interact with the contract using the 'contract' instance
    }
  } catch (error) {
    console.error("Failed to check contract code:", error);
  }
}
