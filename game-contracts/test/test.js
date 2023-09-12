const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SquidGame", function () {
	let squidGame;
	let owner;
	let player1;
	let player2;

	beforeEach(async function () {
		[owner, player1, player2] = await ethers.getSigners();

		const SquidGameFactory = await ethers.getContractFactory("SquidGame");
		squidGame = await SquidGameFactory.deploy();
		await squidGame.deployed();
	});

	it("should allow players to enter the game", async function () {
		await squidGame.connect(player1).enterGame(player1.address);
        console.log("player2 address: ",player2.address)

		const player1Address = await squidGame.getPlayer();
        console.log("aaa",player1Address[0]);

		//expect(player1Address).to.equal(player1.address);
	});
});
