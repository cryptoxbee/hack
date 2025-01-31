// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface randomNumber {
    function generateRandomInRange(uint256 _min, uint256 _max) external view returns (uint256);
}
interface ERC20 {
    function transfer(address to, uint256 value) external returns (bool);
}

contract Hackpot {
    address public feeSetter;
    address public owner;
    address public randomNumberAddress;
    uint256 public totalBets;
    mapping(address => uint256) public bets;
    address[] public players;
    address public tokenAddress;
    bool public isPlaying;
    bool public isBetting;
    uint256 public betSFinishTime;

    constructor(address afeeSetter,address arandomNumber,address tokenAddress) {
        feeSetter = afeeSetter;
        owner = msg.sender;
        randomNumberAddress = arandomNumber;
        tokenAddress = tokenAddress;
    }

    modifier pauseWhilePlaying() {
        require(isPlaying == false, "Game is still in progress");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function setFeeSetter(address afeeSetter) public onlyOwner {
        feeSetter = afeeSetter;
    }

    function setOwner(address aowner) public onlyOwner {
        owner = aowner;
    }

    function selectWinner() public onlyOwner pauseWhilePlaying {
        require(block.timestamp >= betSFinishTime, "Betting time is not over");
        isPlaying = true;
        uint256 startPoint = 0;
        uint256 randomNumber = randomNumberAddress.generateRandomInRange(0, totalBets);
        for (uint256 i = 0; i < players.length; i++) {
            if (startPoint + bets[players[i]] >= randomNumber) {
                ERC20(tokenAddress).transfer(players[i], totalBets);
                totalBets = 0;
                players = new address[](0);
                bets = new mapping(address => uint256)(0);
                break;
            }
            startPoint += bets[players[i]];
        }
        isPlaying = false;
    }

    function betTokens(uint256 amount) public  {
        if(isBetting == false) {
            isBetting = true;
            betSFinishTime = block.timestamp+60;
        }
        ERC20(tokenAddress).transfer(address(this), amount);
        players.push(msg.sender);//sıfırlama okey
        bets[msg.sender] += amount;//sıfırlama okey
        totalBets += amount;//sıfırlama okey
        emit BetPlaced(msg.sender, amount);
    }
    
}   
