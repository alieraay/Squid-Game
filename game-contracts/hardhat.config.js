require("@nomiclabs/hardhat-etherscan");
require("hardhat-deploy");
require("solidity-coverage");
require("dotenv").config();
require("@nomiclabs/hardhat-ethers");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const GOERLI_URL = process.env.GOERLI_URL;
const PRIVATE_KEY_ACCOUNT_2 = process.env.PRIVATE_KEY_ACCOUNT_2;

module.exports = {
	solidity: {
		compilers: [{ version: "0.8.18" }],
	},

	defaultNetwork: "goerli",
	networks: {
		hardhat: {
			accounts: [
				{
					privateKey: PRIVATE_KEY,
					balance: "100000000000000000000000",
				},
				{
					privateKey: PRIVATE_KEY_ACCOUNT_2,
					balance: "100000000000000000000000",
				},
			],
		},
		goerli: {
			chainId: 5,
			url: GOERLI_URL,
			accounts: [PRIVATE_KEY],
		},
	},
	etherscan: {
		apiKey: {
			goerli: ETHERSCAN_API_KEY,
		},
	},
	mocha: {
		timeout: 200000,
	},
};
