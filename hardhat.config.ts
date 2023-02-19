import { HardhatUserConfig, task, subtask } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";
import "@nomiclabs/hardhat-etherscan";

const INFURA_RPC_URL = process.env.INFURA_RPC_URL;
const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const GOERLI_BOOKLIB_CONTRACT = process.env.GOERLI_BOOKLIB_CONTRACT;

const LOCAL_HOST_URL = process.env.LOCAL_HOST_URL;
const LOCAL_HOST_ACC = process.env.LOCAL_HOST_ACC;
const LOCAL_HOST_PRIVATE_KEY = process.env.LOCAL_HOST_PRIVATE_KEY;
const LOCAL_HOST_BOOKLIB_CONTRACT = process.env.LOCAL_HOST_BOOKLIB_CONTRACT;

const lazyImport = async (module: any) => {
  return await import(module);
};

task("interact", "Interact with book lib contract")
  .addParam(
    "isLocal",
    "If true - interacts with contract from localhost network, otherwise goerli network"
  )
  .setAction(async ({ isLocal }) => {
    const { main } = await lazyImport("./scripts/interact");
    await main(isLocal);
  });

task(
  "deploy-env",
  "Deploys contract with pk from env to local host or goerli network"
)
  .addParam(
    "isLocal",
    "If true - deploys contract to localhost network, otherwise goerli network"
  )
  .setAction(async ({ isLocal }) => {
    const { main } = await lazyImport("./scripts/deploy-pk");
    const isLocalHost = isLocal === "true";
    await main(
      isLocalHost ? LOCAL_HOST_PRIVATE_KEY : PRIVATE_KEY,
      isLocalHost ? LOCAL_HOST_URL : GOERLI_RPC_URL
    );
  });

// TODO: Test subtask
// await hre.run('print', { message: "Done!" })
subtask("print", "Prints a message")
  .addParam("message", "The message to print")
  .setAction(async (taskArgs) => {
    console.log(taskArgs.message);
  });

task("deploy-with-pk", "Deploys contract with pk to goerli network")
  .addParam("privateKey", "Please provide the private key")
  .setAction(async ({ privateKey }) => {
    const { main } = await lazyImport("./scripts/deploy-pk");
    await main(privateKey, GOERLI_RPC_URL);
  });

task(
  "deploy-goerli-pk-env",
  "Deploys contract with pk from env to goerli network"
).setAction(async () => {
  const { main } = await lazyImport("./scripts/deploy-pk");
  await main(PRIVATE_KEY, GOERLI_RPC_URL);
});

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  defaultNetwork: "hardhat",
  networks: {
    goerli: {
      url: GOERLI_RPC_URL,
      accounts: [PRIVATE_KEY!],
      chainId: 5,
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at <https://etherscan.io/>
    apiKey: ETHERSCAN_API_KEY,
  },
};

export default config;
