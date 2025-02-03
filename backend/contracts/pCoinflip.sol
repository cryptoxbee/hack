// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20Permit {
    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

interface IRandomNumber {
    function generateRandomInRange(uint256 min, uint256 max) external view returns (uint256);
}

contract pCoinflip {
    address public owner;
    address public tokenAddress;
    address public feeSetter;
    address public randomNumberAddress;

    address[] public heads;//yazı
    uint256[] public headsAmount;

    address[] public tails;//tura
    uint256[] public tailsAmount;

    bool public isBetting = false;
    bool public isPaused = false;

    modifier Betting() {
        require(isBetting, "Betting is not active");
        _;
    }

    modifier notBetting() {
        require(!isBetting, "Betting is active");
        _;
    }

    modifier Paused() {
        require(isPaused, "Betting is not paused");
        _;
    }

    modifier NotPaused() {
        require(!isPaused, "Betting is paused");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function pause() external onlyOwner notBetting {
        isPaused = true;
    }

    function unpause() external onlyOwner {
        isPaused = false;
    }
    
    constructor(address _tokenAddress, address _feeSetter, address _randomNumberAddress) {
        owner = msg.sender;
        tokenAddress = _tokenAddress;
        feeSetter = _feeSetter;
        randomNumberAddress = _randomNumberAddress;
    }

    function betHeadsWithPermit(
        uint256 amount,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external NotPaused {
        // Önce permit ile onay al
        IERC20Permit(tokenAddress).permit(msg.sender, address(this), amount, deadline, v, r, s);
        
        // Sonra transferi gerçekleştir
        require(IERC20Permit(tokenAddress).transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        heads.push(msg.sender);
        headsAmount.push(amount);
    }

    function betTailsWithPermit(
        uint256 amount,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external NotPaused {
        // Önce permit ile onay al
        IERC20Permit(tokenAddress).permit(msg.sender, address(this), amount, deadline, v, r, s);
        
        // Sonra transferi gerçekleştir
        require(IERC20Permit(tokenAddress).transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        tails.push(msg.sender);
        tailsAmount.push(amount);
    }

    function selectWinner() public {
        uint256 randomNumber = IRandomNumber(randomNumberAddress).generateRandomInRange(0, 100);
        if (randomNumber < 50) {
            for (uint256 i = 0; i < heads.length; i++) {
                IERC20Permit(tokenAddress).transfer(heads[i], headsAmount[i]*95/100);
            }
            tailsAmount = new uint256[](0);
            tails = new address[](0);
            headsAmount = new uint256[](0);
            heads = new address[](0);

        } else {
            for (uint256 i = 0; i < tails.length; i++) {
                IERC20Permit(tokenAddress).transfer(tails[i], tailsAmount[i]*95/100);
            }
            tailsAmount = new uint256[](0);
            tails = new address[](0);
            headsAmount = new uint256[](0);
            heads = new address[](0);
        }
    }

    function withdraw() external onlyOwner Paused {
        IERC20Permit(tokenAddress).transfer(owner, IERC20Permit(tokenAddress).balanceOf(address(this)));
    }

    function getHeadsLength() public view returns (uint256) {
        return heads.length;
    }

    function getTailsLength() public view returns (uint256) {
        return tails.length;
    }
}
