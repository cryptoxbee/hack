// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract Election {
    address[] private realVoters;//ONAYLANMIŞ VOTERLAR
    address[] public owners;//YETKİLİLER
    mapping(address => string) private delegationVotes;//VOTERIN OYU
    address[] public delegationCandidates;//ADAYLAR
    mapping(address => string) private developerVotes;//VOTERİN OYU
    address[] public developerCandidates;//ADAYLAR
    mapping(address => string) private designerVotes;//VOTERİN OYU
    address[] public designerCandidates;//ADAYLAR
    mapping(address => string) private researcherVotes;//VOTERİN OYU
    address[] public researcherCandidates;//ADAYLAR

    mapping(string => uint16) private delegationVotesCount;//ADAYIN ALDIĞI OY SAYISI
    mapping(string => uint16) private developerVotesCount;//ADAYIN ALDIĞI OY SAYISI
    mapping(string => uint16) private designerVotesCount;//ADAYIN ALDIĞI OY SAYISI
    mapping(string => uint16) private researcherVotesCount;//ADAYIN ALDIĞI OY SAYISI

    

    address[] private voters;//OY KULLANANLAR
    /////////////////////////////////////////////////////////////////////////////////
    //YETKİLİLER İLE ALAKALI FONKSİYONLAR
    /////////////////////////////////////////////////////////////////////////////////
    constructor() {
        owners.push(msg.sender);
    }

    function showVoters() public view onlyOwners returns(address[] memory) {
        return voters;
    }
    function showRealVoters() public view onlyOwners returns(address[] memory) {
        return realVoters;
    }

    modifier onlyOwners() {
        bool isOwner = false;
        for(uint256 i = 0; i < owners.length; i++) {
            if(owners[i] == msg.sender) {
                isOwner = true;
                break;
            }
        }
        require(isOwner, "Only owners can call this function");
        _;
    }

    uint256 public startTime;
    uint256 public endTime;
    uint256 public startCandidateApplyingTime;
    uint256 public endCandidateApplyingTime;

    uint16[] public delegationResult;
    uint16[] public developerResult;
    uint16[] public designerResult;
    uint16[] public researcherResult;

    /////////////////////////////////////////////////////////////////////////////////
    //ZAMANLAMA GİBİ ŞEYLERİN AYARLANMASI
    /////////////////////////////////////////////////////////////////////////////////
    function setStartTime(uint256 _startTime) public onlyOwners {
        startTime = _startTime;
    }

    function setEndTime(uint256 _endTime) public onlyOwners {
        endTime = _endTime;
    }

    function setStartCandidateApplyingTime(uint256 _startCandidateApplyingTime) public onlyOwners {
        startCandidateApplyingTime = _startCandidateApplyingTime;
    }

    function setEndCandidateApplyingTime(uint256 _endCandidateApplyingTime) public onlyOwners {
        endCandidateApplyingTime = _endCandidateApplyingTime;
    }

    
    modifier isElectionOn() {
        require(block.timestamp > startTime && block.timestamp < endTime, "Election is not on");
        _;
    }

    modifier isCandidateApplyingOn() {
        require(block.timestamp > startCandidateApplyingTime && block.timestamp < endCandidateApplyingTime, "Candidate applying is not on");
        _;
    }

    modifier afterElection() {
        require(block.timestamp > endTime, "Election is not over");
        _;
    }

    function addRealVoter(address voter) public onlyOwners {
        realVoters.push(voter);
    }

    modifier isRealVoter() {
        bool isRealVoter = false;
        for(uint256 i = 0; i < realVoters.length; i++) {
            if(realVoters[i] == msg.sender) {
                isRealVoter = true;
                break;
            }
        }
        require(isRealVoter, "You are not a real voter");
        _;
    }
    
    //YETKİLİ EKLEME
    function addOwner(address owner) public onlyOwners {
        owners.push(owner);
    }
    /////////////////////////////////////////////////////////////////////////////////
    //ADAYLARIN EKLENMESİ(SADECE YETKİLİLER EKLER)
    /////////////////////////////////////////////////////////////////////////////////

    function addDelegationCandidate(address candidate) public onlyOwners isCandidateApplyingOn {
        delegationCandidates.push(candidate);
    }

    function addDeveloperCandidate(address candidate) public onlyOwners isCandidateApplyingOn {
        developerCandidates.push(candidate);
    }

    function addDesignerCandidate(address candidate) public onlyOwners isCandidateApplyingOn {
        designerCandidates.push(candidate);
    }

    function addResearcherCandidate(address candidate) public onlyOwners isCandidateApplyingOn {
        researcherCandidates.push(candidate);
    }
    /////////////////////////////////////////////////////////////////////////////////
    //VOTELERİN YAPILMASI(REVOTE İÇİN DE KULLANILIR)
    /////////////////////////////////////////////////////////////////////////////////

    function vote(string memory delegationCandidate, string memory developerCandidate, string memory designerCandidate, string memory researcherCandidate) public isElectionOn isRealVoter {
        for(uint256 i = 0; i < delegationCandidates.length; i++) {  

            if(delegationCandidates[i] == msg.sender) {
                delegationVotes[msg.sender] = delegationCandidate;
            }
            else if(i==delegationCandidates.length-1) {
                delegationVotes[msg.sender] = "";
            }
        }
        for(uint256 i = 0; i < developerCandidates.length; i++) {
            if(developerCandidates[i] == msg.sender) {
                developerVotes[msg.sender] = developerCandidate;
            }
            else if(i==developerCandidates.length-1) {
                developerVotes[msg.sender] = "";
            }
        }
        for(uint256 i = 0; i < designerCandidates.length; i++) {
            if(designerCandidates[i] == msg.sender) {
                designerVotes[msg.sender] = designerCandidate;
            }
            else if(i==designerCandidates.length-1) {
                designerVotes[msg.sender] = "";
            }
        }
        for(uint256 i = 0; i < researcherCandidates.length; i++) {
            if(researcherCandidates[i] == msg.sender) {
                researcherVotes[msg.sender] = researcherCandidate;
            }
            else if(i==researcherCandidates.length-1) {
                researcherVotes[msg.sender] = "";
            }
        }


        for(uint256 i = 0; i < voters.length; i++) {
            if(bytes(delegationVotes[voters[i]]).length > 0) {
                delegationVotesCount[delegationVotes[voters[i]]]++;
            }
        }
        for(uint256 i = 0; i < developerCandidates.length; i++) {
            if(bytes(developerVotes[developerCandidates[i]]).length > 0) {
                developerVotesCount[developerVotes[developerCandidates[i]]]++;
            }
        }
        for(uint256 i = 0; i < designerCandidates.length; i++) {
            if(bytes(designerVotes[designerCandidates[i]]).length > 0) {
                designerVotesCount[designerVotes[designerCandidates[i]]]++;
            }
        }
        for(uint256 i = 0; i < researcherCandidates.length; i++) {
            if(bytes(researcherVotes[researcherCandidates[i]]).length > 0) {
                researcherVotesCount[researcherVotes[researcherCandidates[i]]]++;
            }
        }
    }

    /////////////////////////////////////////////////////////////////////////////////
    //SONUÇLARIN HESAPLANIP GÖSTERİLMESİ
    /////////////////////////////////////////////////////////////////////////////////
    function addressToString(address _addr) internal pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(_addr)));
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = "0";
        str[1] = "x";
        for (uint256 i = 0; i < 20; i++) {
            str[2+i*2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3+i*2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        return string(str);
    }

    function showDelegationVotes() public view afterElection returns(uint16[] memory) {
        uint16[] memory result = new uint16[](delegationCandidates.length);
        for(uint256 i = 0; i < delegationCandidates.length; i++) {
            result[i] = delegationVotesCount[addressToString(delegationCandidates[i])];
        }
        return result;
    }

    function showDeveloperVotes() public view afterElection returns(uint16[] memory) {
        uint16[] memory result = new uint16[](developerCandidates.length);
        for(uint256 i = 0; i < developerCandidates.length; i++) {
            result[i] = developerVotesCount[addressToString(developerCandidates[i])];
        }
        return result;
    }

    function showDesignerVotes() public view afterElection returns(uint16[] memory) {
        uint16[] memory result = new uint16[](designerCandidates.length);
        for(uint256 i = 0; i < designerCandidates.length; i++) {
            result[i] = designerVotesCount[addressToString(designerCandidates[i])];
        }
        return result;
    }

    function showResearcherVotes() public view afterElection returns(uint16[] memory) {
        uint16[] memory result = new uint16[](researcherCandidates.length);
        for(uint256 i = 0; i < researcherCandidates.length; i++) {
            result[i] = researcherVotesCount[addressToString(researcherCandidates[i])];
        }
        return result;
    }


    
    



    

}