// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface IElection {
    function showDelegationVotes() external view returns(uint16[] memory);
    function showDeveloperVotes() external view returns(uint16[] memory);
    function showDesignerVotes() external view returns(uint16[] memory);
    function showResearcherVotes() external view returns(uint16[] memory);
    function showMarketingVotes() external view returns(uint16[] memory);
    function showEducationVotes() external view returns(uint16[] memory);
    
    function delegationCandidates(uint256) external view returns(address);
    function developerCandidates(uint256) external view returns(address);
    function designerCandidates(uint256) external view returns(address);
    function researcherCandidates(uint256) external view returns(address);
    function marketingCandidates(uint256) external view returns(address);
    function educationCandidates(uint256) external view returns(address);
}

interface IERC20 {
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function transfer(address to, uint256 value) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract ElectionPredict {
    address public electionAddress;
    address public owner;
    address public tokenAddress;  // Token adresi
    uint256 public betEndTime;
    bool public isBetsClosed = false;

    // Her seçim için ayrı mapping'ler
    mapping(address => mapping(address => uint256)) public delegationBets;
    mapping(address => mapping(address => uint256)) public developerBets;
    mapping(address => mapping(address => uint256)) public designerBets;
    mapping(address => mapping(address => uint256)) public researcherBets;
    mapping(address => mapping(address => uint256)) public marketingBets;
    mapping(address => mapping(address => uint256)) public educationBets;

    // Her seçim için ayrı toplam bahisler
    mapping(address => uint256) public totalDelegationBets;
    mapping(address => uint256) public totalDeveloperBets;
    mapping(address => uint256) public totalDesignerBets;
    mapping(address => uint256) public totalResearcherBets;
    mapping(address => uint256) public totalMarketingBets;
    mapping(address => uint256) public totalEducationBets;

    // Bahisçileri takip etmek için diziler
    address[] public delegationBettors;
    address[] public developerBettors;
    address[] public designerBettors;
    address[] public researcherBettors;
    address[] public marketingBettors;
    address[] public educationBettors;

    // Her komite için ayrı token havuzları
    uint256 public delegationTokenPool;
    uint256 public developerTokenPool;
    uint256 public designerTokenPool;
    uint256 public researcherTokenPool;
    uint256 public marketingTokenPool;
    uint256 public educationTokenPool;

    // Event'ler
    event BetPlaced(
        string electionType,
        address indexed bettor,
        address indexed candidate,
        uint256 amount
    );

    event PrizeDistributed(
        string electionType,
        address indexed winner,
        address indexed bettor,
        uint256 betAmount,
        uint256 prizeAmount
    );

    constructor(address _electionAddress, address _tokenAddress) {
        electionAddress = _electionAddress;
        tokenAddress = _tokenAddress;
        owner = msg.sender;
    }

    function betForDelegation(address candidate, uint256 amount) public {
        require(!isBetsClosed, "Bets are closed");
        require(amount > 0, "Bet amount must be greater than 0");
        require(IERC20(tokenAddress).transferFrom(msg.sender, address(this), amount), "Token transfer failed");
        
        if(delegationBets[msg.sender][candidate] == 0) {
            delegationBettors.push(msg.sender);
        }
        delegationBets[msg.sender][candidate] += amount;
        totalDelegationBets[candidate] += amount;
        delegationTokenPool += amount;
        
        emit BetPlaced("delegation", msg.sender, candidate, amount);
    }

    function betForDeveloper(address candidate) public payable {
        require(!isBetsClosed, "Bets are closed");
        require(msg.value > 0, "Bet amount must be greater than 0");
        if(developerBets[msg.sender][candidate] == 0) {
            developerBettors.push(msg.sender);
        }
        developerBets[msg.sender][candidate] += msg.value;
        totalDeveloperBets[candidate] += msg.value;
        emit BetPlaced("developer", msg.sender, candidate, msg.value);
    }

    function betForDesigner(address candidate) public payable {
        require(!isBetsClosed, "Bets are closed");
        require(msg.value > 0, "Bet amount must be greater than 0");
        if(designerBets[msg.sender][candidate] == 0) {
            designerBettors.push(msg.sender);
        }
        designerBets[msg.sender][candidate] += msg.value;
        totalDesignerBets[candidate] += msg.value;
        emit BetPlaced("designer", msg.sender, candidate, msg.value);
    }

    function betForResearcher(address candidate) public payable {
        require(!isBetsClosed, "Bets are closed");
        require(msg.value > 0, "Bet amount must be greater than 0");
        if(researcherBets[msg.sender][candidate] == 0) {
            researcherBettors.push(msg.sender);
        }
        researcherBets[msg.sender][candidate] += msg.value;
        totalResearcherBets[candidate] += msg.value;
        emit BetPlaced("researcher", msg.sender, candidate, msg.value);
    }

    function betForMarketing(address candidate, uint256 amount) public {
        require(!isBetsClosed, "Bets are closed");
        require(amount > 0, "Bet amount must be greater than 0");
        require(IERC20(tokenAddress).transferFrom(msg.sender, address(this), amount), "Token transfer failed");
        
        if(marketingBets[msg.sender][candidate] == 0) {
            marketingBettors.push(msg.sender);
        }
        marketingBets[msg.sender][candidate] += amount;
        totalMarketingBets[candidate] += amount;
        marketingTokenPool += amount;
        
        emit BetPlaced("marketing", msg.sender, candidate, amount);
    }

    function betForEducation(address candidate, uint256 amount) public {
        require(!isBetsClosed, "Bets are closed");
        require(amount > 0, "Bet amount must be greater than 0");
        require(IERC20(tokenAddress).transferFrom(msg.sender, address(this), amount), "Token transfer failed");
        
        if(educationBets[msg.sender][candidate] == 0) {
            educationBettors.push(msg.sender);
        }
        educationBets[msg.sender][candidate] += amount;
        totalEducationBets[candidate] += amount;
        educationTokenPool += amount;
        
        emit BetPlaced("education", msg.sender, candidate, amount);
    }

    // Her seçim için ayrı dağıtım fonksiyonları
    function distributeDelegationPrizes() public {
        require(isBetsClosed, "Bets are not closed yet");
        uint16[] memory votes = IElection(electionAddress).showDelegationVotes();
        address winner = findWinner(votes, "delegation");
        distributePrizes(winner, "delegation");
    }

    function distributeDeveloperPrizes() public {
        require(isBetsClosed, "Bets are not closed yet");
        uint16[] memory votes = IElection(electionAddress).showDeveloperVotes();
        address winner = findWinner(votes, "developer");
        distributePrizes(winner, "developer");
    }

    function distributeDesignerPrizes() public {
        require(isBetsClosed, "Bets are not closed yet");
        uint16[] memory votes = IElection(electionAddress).showDesignerVotes();
        address winner = findWinner(votes, "designer");
        distributePrizes(winner, "designer");
    }

    function distributeResearcherPrizes() public {
        require(isBetsClosed, "Bets are not closed yet");
        uint16[] memory votes = IElection(electionAddress).showResearcherVotes();
        address winner = findWinner(votes, "researcher");
        distributePrizes(winner, "researcher");
    }

    function distributeMarketingPrizes() public {
        require(isBetsClosed, "Bets are not closed yet");
        uint16[] memory votes = IElection(electionAddress).showMarketingVotes();
        address winner = findWinner(votes, "marketing");
        distributePrizes(winner, "marketing");
    }

    function distributeEducationPrizes() public {
        require(isBetsClosed, "Bets are not closed yet");
        uint16[] memory votes = IElection(electionAddress).showEducationVotes();
        address winner = findWinner(votes, "education");
        distributePrizes(winner, "education");
    }

    // Yardımcı fonksiyonlar
    function findWinner(uint16[] memory votes, string memory electionType) private view returns (address) {
        uint16 maxVotes = 0;
        uint256 winnerIndex = 0;
        
        for(uint256 i = 0; i < votes.length; i++) {
            if(votes[i] > maxVotes) {
                maxVotes = votes[i];
                winnerIndex = i;
            }
        }

        if(keccak256(bytes(electionType)) == keccak256(bytes("delegation"))) {
            return IElection(electionAddress).delegationCandidates(winnerIndex);
        } else if(keccak256(bytes(electionType)) == keccak256(bytes("developer"))) {
            return IElection(electionAddress).developerCandidates(winnerIndex);
        } else if(keccak256(bytes(electionType)) == keccak256(bytes("designer"))) {
            return IElection(electionAddress).designerCandidates(winnerIndex);
        } else if(keccak256(bytes(electionType)) == keccak256(bytes("marketing"))) {
            return IElection(electionAddress).marketingCandidates(winnerIndex);
        } else if(keccak256(bytes(electionType)) == keccak256(bytes("education"))) {
            return IElection(electionAddress).educationCandidates(winnerIndex);
        } else {
            return IElection(electionAddress).researcherCandidates(winnerIndex);
        }
    }

    function distributePrizes(address winner, string memory electionType) private {
        if(keccak256(bytes(electionType)) == keccak256(bytes("delegation"))) {
            uint256 totalPrize = totalDelegationBets[winner];
            require(totalPrize > 0, "No bets for winner");

            for(uint256 i = 0; i < delegationBettors.length; i++) {
                address bettor = delegationBettors[i];
                if(delegationBets[bettor][winner] > 0) {
                    uint256 betAmount = delegationBets[bettor][winner];
                    uint256 prize = (betAmount * delegationTokenPool) / totalPrize;
                    require(IERC20(tokenAddress).transfer(bettor, prize), "Token transfer failed");
                    emit PrizeDistributed("delegation", winner, bettor, betAmount, prize);
                }
            }
        } 
        else if(keccak256(bytes(electionType)) == keccak256(bytes("developer"))) {
            uint256 totalPrize = totalDeveloperBets[winner];
            require(totalPrize > 0, "No bets for winner");

            for(uint256 i = 0; i < developerBettors.length; i++) {
                address bettor = developerBettors[i];
                if(developerBets[bettor][winner] > 0) {
                    uint256 betAmount = developerBets[bettor][winner];
                    uint256 prize = (betAmount * developerTokenPool) / totalPrize;
                    require(IERC20(tokenAddress).transfer(bettor, prize), "Token transfer failed");
                    emit PrizeDistributed("developer", winner, bettor, betAmount, prize);
                }
            }
        }
        else if(keccak256(bytes(electionType)) == keccak256(bytes("designer"))) {
            uint256 totalPrize = totalDesignerBets[winner];
            require(totalPrize > 0, "No bets for winner");

            for(uint256 i = 0; i < designerBettors.length; i++) {
                address bettor = designerBettors[i];
                if(designerBets[bettor][winner] > 0) {
                    uint256 betAmount = designerBets[bettor][winner];
                    uint256 prize = (betAmount * designerTokenPool) / totalPrize;
                    require(IERC20(tokenAddress).transfer(bettor, prize), "Token transfer failed");
                    emit PrizeDistributed("designer", winner, bettor, betAmount, prize);
                }
            }
        }
        else if(keccak256(bytes(electionType)) == keccak256(bytes("marketing"))) {
            uint256 totalPrize = totalMarketingBets[winner];
            require(totalPrize > 0, "No bets for winner");

            for(uint256 i = 0; i < marketingBettors.length; i++) {
                address bettor = marketingBettors[i];
                if(marketingBets[bettor][winner] > 0) {
                    uint256 betAmount = marketingBets[bettor][winner];
                    uint256 prize = (betAmount * marketingTokenPool) / totalPrize;
                    require(IERC20(tokenAddress).transfer(bettor, prize), "Token transfer failed");
                    emit PrizeDistributed("marketing", winner, bettor, betAmount, prize);
                }
            }
        }
        else if(keccak256(bytes(electionType)) == keccak256(bytes("education"))) {
            uint256 totalPrize = totalEducationBets[winner];
            require(totalPrize > 0, "No bets for winner");

            for(uint256 i = 0; i < educationBettors.length; i++) {
                address bettor = educationBettors[i];
                if(educationBets[bettor][winner] > 0) {
                    uint256 betAmount = educationBets[bettor][winner];
                    uint256 prize = (betAmount * educationTokenPool) / totalPrize;
                    require(IERC20(tokenAddress).transfer(bettor, prize), "Token transfer failed");
                    emit PrizeDistributed("education", winner, bettor, betAmount, prize);
                }
            }
        }
    }

    function closeBets() public {
        require(msg.sender == owner, "Only owner can close bets");
        isBetsClosed = true;
    }
}