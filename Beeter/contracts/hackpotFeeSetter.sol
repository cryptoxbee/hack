// SPDX-License-Identifier: MIT
pragma solidity ^ 0.8.26;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns(bool);
    function balanceOf(address account) external view returns(uint256);
}   

interface IRandom {
    function getRandomNumber() external view returns(uint256);
}

contract HackpotFeeSetter {
    address public owner;
    address public hackpot;
    address public token;

    constructor(address atoken) {
        owner = msg.sender;
        token = atoken;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function showBalance() public view returns(uint256) {
        return IERC20(token).balanceOf(address(this));
    }

    function withdraw(uint256 amount) public onlyOwner {
        IERC20(token).transfer(owner, amount);
    }
}