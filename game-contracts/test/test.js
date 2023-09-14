const { assert, expect } = require("chai");
const { ethers } = require("hardhat");

// There are some 0n's in test but at first I didn't need to do this.
// After some updates and adding packages I got an error like
// "AssertionError: expected 0n to equal +0". I couldn't figure it out yet but I am taking not here

describe("SquidGame", function () {
	const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
	let factory;
	let gameAddress;
	let user1;
	let user2;
	let user3;

	before(async function () {
		[user1, user2] = await ethers.getSigners();
		const user3Wallet = ethers.Wallet.createRandom();

		user3 = user3Wallet.connect(ethers.provider); // Yeni cüzdanı sağlayıcıya bağlayın

		console.log("user1 address: ", user1.address);
		console.log("user2 address", user2.address);
		console.log("user3 address :", user3.address);

		const SquidGameFactory = await ethers.getContractFactory("GameFactory");
		factory = await SquidGameFactory.deploy();
		await factory.waitForDeployment();
	});

	/*
	----------TEST STRUCTURE----------
			***************************
				Factory contract tests
			***************************

	is createGame() working?
	is getNumberOfGames() working?
	is getLastGameAddress working?

			***************************
				Game contract tests
			***************************
			----Before game starts----

	is the gameStatus correct? must be WAITING
	is the winner 0?
	check player1 and player2 structs with getPlayer() function
	is move() function working? must not

			***************************
	can player1 entering the game?
	can player1 entering the game again?
	can player2 entering the game?
	try to enter the game with 3rd account. must revert
	is the gameStatus correct? must be PLAYING
			***************************
			----After game starts----
	is the gameStatus correct? must be PLAYING
	is the winner 0?
	is move() function working? check correct and wrong moves
	check playerLives after any moves
	check players steps etc. with getPlayer() function
	check if player is dead lives == 0
	if both lives == 0, check gameStatus and winner
	*/

	//						 				***************************
	// 										Factory contract tests
	// 										***************************
	// is createGame() working?
	// is getNumberOfGames() working?
	// is getLastGameAddress working?

	describe("Factory contract tests", function () {
		it("is createGame working?", async function () {
			await factory.createGame();
			gameAddress = await factory.getLastGameAddress();
			squidGame = await ethers.getContractAt("SquidGame", gameAddress);
			expect(gameAddress).to.not.equal(0);
		});
		it("is getNumberOfGames working?", async function () {
			const numberOfGames = await factory.getNumberOfGames();
			expect(Number(numberOfGames)).to.equal(1);
		});
		it("getGameAddress control invalid index",async function(){
			await expect( factory.getGameAddress(1)).to.be.revertedWith("Invalid index")
		})
		it("getGameAddress control", async function(){
			expect(await factory.getGameAddress(0)).to.be.equal(gameAddress)
		})
	});

	// 										***************************
	// 										Game contract tests
	// 										***************************
	// ----Before game starts----
	// is the gameStatus correct? must be WAITING
	// is the winner 0?
	// check player1 and player2 structs with getPlayer() function
	// is move() function working? must not
	// can player1 entering the game?
	// can player1 entering the game again?
	// can player2 entering the game?
	// try to enter the game with 3rd account. must revert
	// is the gameStatus correct? must be PLAYING

	describe("Before game start tests", function () {
		it("check GameStatus", async function () {
			const gameStatus = await squidGame.gameStatus();
			expect(gameStatus).to.equal(0n);
		});
		it("is the winner none?", async function () {
			const winner = await squidGame.winner();
			expect(winner).to.equal(ZERO_ADDRESS);
		});
		it("check player1 and player2 structs", async function () {
			const expectedStruct = [false, ZERO_ADDRESS, 0n, 0n, 0n];
			const player1 = await squidGame.player1();
			let i = 0;
			while (i < 5) {
				expect(player1[i]).to.equal(expectedStruct[i]);
				i++;
			}
		});
		it("move func must not work", async function () {
			await expect(
				squidGame.connect(user1).move(user1.address, 0)
			).to.be.revertedWith("Game is not started yet");
		});
		it("can player1 entering the game?", async function () {
			await squidGame.connect(user1).enterGame(user1.address);
			const player1 = await squidGame.player1();
			expect(await player1[1]).to.equal(user1.address);
		});
		it("can player1 entering the game again?", async function () {
			await expect(
				squidGame.connect(user1).enterGame(user1.address)
			).to.be.revertedWith("You are already in the game");
		});
		it("can player2 entering the game", async function () {
			await squidGame.connect(user2).enterGame(user2.address);
			const player2 = await squidGame.player2();
			expect(await player2[1]).to.equal(user2.address);
		});
		it("// try to enter the game with 3rd account. must revert", async function () {
			await expect(
				squidGame.connect(user3).enterGame(user3.address)
			).to.be.revertedWith("Game is not waiting for players");
		});
	});
	// 				----After game starts----
	// is the gameStatus correct? must be PLAYING
	// is the winner 0?
	// is move() function working? check correct and wrong moves
	// check playerLives after any moves
	// check players steps etc. with getPlayer() function
	// check if player is dead lives == 0
	// if both lives == 0, check gameStatus and winner

	describe("After game starts", function () {
		it("is the gameStatus correct? must be PLAYING", async function () {
			const gameStatus = await squidGame.gameStatus();
			expect(gameStatus).to.equal(1n);
			console.log("-----------------");
			console.log("The game started properly");
			console.log("-----------------");
		});
		it("is the winner none?", async function () {
			const winner = await squidGame.winner();
			expect(winner).to.equal(ZERO_ADDRESS);
		});
		it("is move() function working? check correct moves player1", async function () {
			const beforeStepP1 = await squidGame.player1();

			await squidGame.connect(user1).move(user1.address, 0);
			const afterCorrectStepP1 = await squidGame.player1();

			expect(Number(beforeStepP1[4]) + 1).to.equal(
				Number(afterCorrectStepP1[4])
			);
			expect(Number(afterCorrectStepP1[3])).to.equal(1);
		});
		it("is move() function working? check correct moves player2", async function () {
			const beforeStepP2 = await squidGame.player2();

			await squidGame.connect(user2).move(user2.address, 1);
			const afterCorrectStepP2 = await squidGame.player2();

			expect(Number(beforeStepP2[4]) + 1).to.equal(
				Number(afterCorrectStepP2[4])
			);
			expect(Number(afterCorrectStepP2[3])).to.equal(1);
		});
		it("is move() function working? check wrong moves player1", async function () {
			const beforeStepP1 = await squidGame.player1();

			await squidGame.connect(user1).move(user1.address, 0);
			const afterWrongStepP1 = await squidGame.player1();

			expect(Number(beforeStepP1[4])).to.equal(Number(afterWrongStepP1[4]));
			expect(Number(afterWrongStepP1[3])).to.equal(1);
			expect(Number(beforeStepP1[2]) - 1).to.equal(Number(afterWrongStepP1[2]));
		});
		it("is move() function working? check wrong moves player2", async function () {
			const beforeStepP2 = await squidGame.player2();

			await squidGame.connect(user2).move(user2.address, 1);
			const afterWrongStepP2 = await squidGame.player2();

			expect(Number(beforeStepP2[4])).to.equal(Number(afterWrongStepP2[4]));
			expect(Number(afterWrongStepP2[3])).to.equal(1);
			expect(Number(beforeStepP2[2]) - 1).to.equal(Number(afterWrongStepP2[2]));
		});

		it("check if player1 is dead lives == 0", async function () {
			const beforeStepP1 = await squidGame.player1();
			console.log("p1 beforeLives", beforeStepP1[2]);
			console.log("p1 beforeStep", beforeStepP1[4]);
			await squidGame.connect(user1).move(user1.address, 0);
			await squidGame.connect(user1).move(user1.address, 0);
			await squidGame.connect(user1).move(user1.address, 0);
			await expect(
				squidGame.connect(user1).move(user1.address, 0)
			).to.be.revertedWith("You have no lives left");
		});
		it("check if player2 is completed race", async function () {
			const beforeStepP2 = await squidGame.player2();
			console.log("p2 beforeLives", beforeStepP2[2]);
			console.log("p2 beforeStep", beforeStepP2[4]);

			await squidGame.connect(user2).move(user2.address, 0);
			await squidGame.connect(user2).move(user2.address, 1);
			await squidGame.connect(user2).move(user2.address, 0);
			await squidGame.connect(user2).move(user2.address, 1);
			await squidGame.connect(user2).move(user2.address, 0);
			await squidGame.connect(user2).move(user2.address, 1);
			await squidGame.connect(user2).move(user2.address, 0);
			await squidGame.connect(user2).move(user2.address, 1);

			const afterStepP2 = await squidGame.player2();
			expect(Number(afterStepP2[4])).to.equal(9n)
		});

		it("if both lives == 0, check gameStatus and winner", async function () {
			const winner = await squidGame.winner();
			expect(winner).to.equal(user2.address)
		});
		it("is game finished?", async function(){
			const gameStatus = await squidGame.gameStatus();
			expect(gameStatus).to.equal(2n);
		})
	});
});
