pragma solidity ^0.8.0;

contract RandomNumber {
    function generateRandomNumber() public view returns (uint256) {
        uint256 randomHash = uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty, msg.sender, block.number, block.gaslimit, block.coinbase, block.timestamp, block.number, block.gaslimit, block.coinbase)));
        
        return randomHash;
    }

    function generateRandomInRange(uint256 _min, uint256 _max) external view returns (uint256) {
        uint256 randomNumber = generateRandomNumber();
        uint256 range = _max - _min;
        
        return _min + (randomNumber % range);
    }
}