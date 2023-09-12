// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./GameContract.sol";

contract GameFactory {
   
    SquidGame[] public games;
    
    event GameCreated(address gameAddress, uint indexed index);

   function createGame() public returns (address) {
      SquidGame game = new SquidGame();
      games.push(game);
      emit GameCreated(address(game), games.length-1);
      return address(game);
   }
   function getNumberOfGames() public view returns (uint) {
        return games.length;
    }
    function getGameAddress(uint index) public view returns (address) {
        require(index < games.length, "Invalid index");
        return address(games[index]);
    }
     function getLastGameAddress() public view returns (address) {
        require(games.length > 0, "No games");
        return address(games[games.length - 1]);
    }
}