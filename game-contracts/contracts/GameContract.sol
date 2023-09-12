// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SquidGame {

    event GameStarted();
    event WinnerSelected(address winner);

    enum GameStatus {
        WAITING,
        PLAYING,
        FINISHED
    }

    struct Player {
        bool isReady;
        address playerAddress;
        uint8 playerLives;
        uint8 playerScore;
        uint8 playerStep;
    }
    Player public player1;
    Player public player2;

    address public winner;
    bool isGameOver;

    // This will be randomized later
    // 0 = left, 1 = right
    uint[] player1Lines = [0, 1, 0, 1, 0, 1, 0, 1, 0, 1];
    uint[] player2Lines = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0];

    GameStatus public gameStatus = GameStatus.WAITING;

    function enterGame(address _player) public {
        require(
            gameStatus == GameStatus.WAITING,
            "Game is not waiting for players"
        );
        require(player2.isReady == false, "Game is full");
        require(
            msg.sender != player1.playerAddress,
            "You are already in the game"
        );

        if (player1.isReady == false) {
            player1.isReady = true;

            player1.playerAddress = _player;
            player1.playerLives = 4;
            player1.playerScore = 0;
            player1.playerStep = 0;
        } else if (player2.isReady == false) {
            player2.isReady = true;
            player2.playerAddress = _player;
            player2.playerLives = 4;
            player2.playerScore = 0;
            player2.playerStep = 0;
            gameStatus = GameStatus.PLAYING;

            emit GameStarted();
        } else {
            revert("Game is full");
        }
    }

    // 0 = left, 1 = right
    function move(address _playerAddress, uint _nextStep) public {
        require(gameStatus == GameStatus.PLAYING, "Game is not playing");
        require(
            _playerAddress == player1.playerAddress ||
                _playerAddress == player2.playerAddress,
            "You are not in the game"
        );
        require(_nextStep == 0 || _nextStep == 1, "You can only move 1 or 0");

        if (_playerAddress == player1.playerAddress) {
            require(
                player1.playerStep < 10,
                "You have reached the end of the line"
            );
            require(player1.playerLives > 0, "You have no lives left");
            if (player1Lines[player1.playerStep] == _nextStep) {
                player1.playerScore += 1;
                player1.playerStep += 1;

                // correct move
            } else {
                player1.playerLives -= 1;
                // wrong move
            }
        } else if (_playerAddress == player2.playerAddress) {
            require(
                player2.playerStep < 10,
                "You have reached the end of the line"
            );
            require(player2.playerLives > 0, "You have no lives left");

            if (player2Lines[player2.playerStep] == _nextStep) {
                player2.playerScore += 1;
                player2.playerStep += 1;
                // correct move
            } else {
                player2.playerLives -= 1;
                // wrong move
            }
        }

        if (player1.playerLives == 0 && player2.playerLives == 0) {
            gameStatus = GameStatus.FINISHED;
        }

        if (gameStatus == GameStatus.FINISHED) {
            if (player1.playerScore > player2.playerScore) {
                winner = player1.playerAddress;
            } else if (player1.playerScore < player2.playerScore) {
                winner = player2.playerAddress;
            } else {
                winner = address(0);
            }
            emit WinnerSelected(winner);
        }
    }
    function getPlayer() public view returns(Player[] memory){
        Player[] memory players = new Player[](2);

        players[0] = Player(player1.isReady, player1.playerAddress, player1.playerLives, player1.playerScore, player1.playerStep);
        players[1] = Player(player2.isReady, player2.playerAddress, player2.playerLives, player2.playerScore, player2.playerStep);

        return players;
    }
}
