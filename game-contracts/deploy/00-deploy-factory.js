const { ethers } = require("hardhat");
const { verify } = require("../utils/verify");
require("dotenv").config();

async function main() {
	const Factory = await ethers.getContractFactory("GameFactory");
	const factory = await Factory.deploy();

	await factory.deployed();

	const newGame = await factory.createGame();
	newGame.wait();

	console.log("Factory address:", factory.address);

	if (process.env.ETHERSCAN_API_KEY) {
		await verify(factory.address);
		console.log("-------------------------------------------------");
	}
}

module.exports = main;

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
