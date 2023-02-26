import { HardhatUserConfig, task, subtask } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";
import "@nomiclabs/hardhat-etherscan";

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL;
const GOERLI_CHAIN_ID = process.env.GOERLI_CHAIN_ID as unknown as number;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const SEPOLIA_CHAIN_ID = process.env.SEPOLIA_CHAIN_ID as unknown as number;

const LOCAL_HOST_URL = process.env.LOCAL_HOST_URL;
const LOCAL_HOST_CHAIN_ID = process.env
  .LOCAL_HOST_CHAIN_ID as unknown as number;
const LOCAL_HOST_PRIVATE_KEY = process.env.LOCAL_HOST_PRIVATE_KEY;

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

const lazyImport = async (module: any) => {
  return await import(module);
};

task(
  "interact-config",
  "Interact with book lib contract; Just pass network and config is loaded from hardhat"
).setAction(async () => {
  const { mainHardhatConfig } = await lazyImport("./scripts/interact");
  await mainHardhatConfig();
});

task("interact-params", "Interact with book lib contract")
  .addParam(
    "isLocal",
    "If true - interacts with contract from localhost network, otherwise goerli network"
  )
  .setAction(async ({ isLocal }) => {
    const { mainParams } = await lazyImport("./scripts/interact");
    await mainParams(isLocal);
  });

task(
  "deploy-config",
  "Deploys book lib contract; Just pass network and config is loaded from hardhat"
).setAction(async () => {
  const { mainHardhatConfig } = await lazyImport("./scripts/deploy-pk");
  await mainHardhatConfig();
});

task(
  "deploy-params",
  "Deploys contract with pk from env to local host or goerli network"
)
  .addParam(
    "isLocal",
    "If true - deploys contract to localhost network, otherwise goerli network"
  )
  .setAction(async ({ isLocal }) => {
    const { mainParams } = await lazyImport("./scripts/deploy-pk");
    const isLocalHost = isLocal === "true";
    await mainParams(
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
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY!],
      chainId: 11155111,
    },
    local: {
      url: LOCAL_HOST_URL,
      accounts: [LOCAL_HOST_PRIVATE_KEY!],
      chainId: 31337,
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at <https://etherscan.io/>
    apiKey: ETHERSCAN_API_KEY,
  },
};

export default config;
