import { ethers, network } from "hardhat";
import BookLibrary from "../artifacts/contracts/BookLibrary.sol/BookLibrary.json";
import LIB from "../artifacts/contracts/LIB.sol/LIB.json";
import "dotenv/config";
import { Contract } from "ethers";

const GOERLI_LIBTOKEN_CONTRACT = process.env.GOERLI_LIBTOKEN_CONTRACT;
const GOERLI_BOOKLIB_CONTRACT = process.env.GOERLI_BOOKLIB_CONTRACT;

const SEPOLIA_LIBTOKEN_CONTRACT = process.env.SEPOLIA_LIBTOKEN_CONTRACT;
const SEPOLIA_BOOKLIB_CONTRACT = process.env.SEPOLIA_BOOKLIB_CONTRACT;

const LOCAL_HOST_LIBTOKEN_CONTRACT = process.env.LOCAL_HOST_LIBTOKEN_CONTRACT;
const LOCAL_HOST_BOOKLIB_CONTRACT = process.env.LOCAL_HOST_BOOKLIB_CONTRACT;

const LOCAL_HOST_URL = process.env.LOCAL_HOST_URL;
const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL;

const GOERLI_CHAIN_ID = process.env.GOERLI_CHAIN_ID;
const SEPOLIA_CHAIN_ID = process.env.SEPOLIA_CHAIN_ID;
const LOCAL_HOST_CHAIN_ID = process.env.LOCAL_HOST_CHAIN_ID;

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const LOCAL_HOST_PRIVATE_KEY = process.env.LOCAL_HOST_PRIVATE_KEY;

export async function mainParams(isLocalHost: string) {
  // Use this var because isLocalHost is of string
  const isLocal = isLocalHost === "true";

  // Determine the contract's address and ABI
  const contractAddress: string = (
    isLocal ? LOCAL_HOST_BOOKLIB_CONTRACT : GOERLI_BOOKLIB_CONTRACT
  ) as string;

  // Connect to a node
  const RPC_URL = isLocal ? LOCAL_HOST_URL : GOERLI_RPC_URL;
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

  await doesContractExist(provider, contractAddress);

  // Instantiate the contract
  const privateKey: string = (
    isLocal ? LOCAL_HOST_PRIVATE_KEY : PRIVATE_KEY
  ) as string;
  const wallet = new ethers.Wallet(privateKey, provider);
  // 1) Reference contract with provider:
  // const bookLibrary = new ethers.Contract(contractAddress, contractAbi, provider);
  // 2) Reference contract with wallet:
  const contractAbi = BookLibrary.abi;
  const bookLibrary = new ethers.Contract(contractAddress, contractAbi, wallet);
  await bookLibInteraction(bookLibrary);
}

// Define local network settings in order to interact with an already deployed contract on local node because
// default hardhat run-time server is different than running a hardhat node
export async function mainHardhatConfig() {
  const [owner] = await ethers.getSigners();
  // Use provider from hardhat config
  // Both are the same
  const provider = owner.provider;
  //let provider = ethers.provider;

  // Contracts are already deployed to corresponding network. Based on the network use related contract address.
  const contractAddresses: string[] = getContractAddressesFromChainId();
  const libTokenAddress = contractAddresses[0];
  const bookLibAddress = contractAddresses[1];

  const libTokenAbi = LIB.abi;
  await doesContractExist(provider, libTokenAddress);
  console.log("lib token contract address:", libTokenAddress);

  const bookLibAbi = BookLibrary.abi;
  await doesContractExist(provider, bookLibAddress);
  console.log("booklib contract address:", bookLibAddress);

  // const wallet = new ethers.Wallet(privateKey, provider);
  // 1) Reference contract with provider:
  // const bookLibrary = new ethers.Contract(contractAddress, contractAbi, provider);
  // 2) Reference contract with wallet:

  const libToken = new ethers.Contract(libTokenAddress, libTokenAbi, owner);
  const bookLibrary = new ethers.Contract(bookLibAddress, bookLibAbi, owner);

  console.log();
  await libTokenInteraction(libToken, owner.address, bookLibAddress);
  await bookLibInteraction(bookLibrary);
}

function getContractAddressesFromChainId() {
  const chainId = network.config.chainId;
  console.log(chainId);
  if (chainId == LOCAL_HOST_CHAIN_ID) {
    // hardhat local network
    return [LOCAL_HOST_LIBTOKEN_CONTRACT, LOCAL_HOST_BOOKLIB_CONTRACT];
  } else if (chainId == GOERLI_CHAIN_ID) {
    // goerli network
    return [GOERLI_LIBTOKEN_CONTRACT, GOERLI_BOOKLIB_CONTRACT];
  } else if (chainId == SEPOLIA_CHAIN_ID) {
    return [SEPOLIA_LIBTOKEN_CONTRACT, SEPOLIA_BOOKLIB_CONTRACT];
  } else {
    console.warn("No contracts");
    return;
  }
}

async function libTokenInteraction(
  libToken: Contract,
  contractOwnerAddress: string,
  bookLibAddress: string
) {
  await (await libToken.mint(contractOwnerAddress, 12)).wait();
  await (await libToken.mint(bookLibAddress, 12)).wait();
  await (await libToken.approve(bookLibAddress, 10)).wait();
  console.log(`Total supply: ${await libToken.totalSupply()}`);
  console.log(
    `Balance of owner: ${await libToken.balanceOf(contractOwnerAddress)}`
  );
  console.log(
    `Balance of booklib: ${await libToken.balanceOf(bookLibAddress)}`
  );
  console.log(
    `Allowence of book lib: ${await libToken.allowance(
      contractOwnerAddress,
      bookLibAddress
    )}`
  );

  // await (await libToken.transfer(bookLibAddress, 3)).wait();
  // await (await libToken.burn(3)).wait();
  // TODO: check why an error is thrown ?
  // await (await libToken.burnFrom(contractOwnerAddress, 3)).wait();
  // await (
  //   await libToken.transferFrom(contractOwnerAddress, bookLibAddress, 3)
  // ).wait();
}

async function bookLibInteraction(bookLibrary: Contract) {
  console.log(await bookLibrary.borrowPrice());
  const bookKey1 = await bookLibrary.listBookBorrowers("non-existing-title");
  console.log(bookKey1);

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
