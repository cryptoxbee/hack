// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract Election {
    address[] private realVoters;//ONAYLANMIŞ VOTERLAR
    address[] public owners;//YETKİLİLER
    mapping(address => address) private delegationVotes;//VOTERIN OYU
    address[] public delegationCandidates;//ADAYLAR
    mapping(address => address) private developerVotes;//VOTERİN OYU
    address[] public developerCandidates;//ADAYLAR
    mapping(address => address) private designerVotes;//VOTERİN OYU
    address[] public designerCandidates;//ADAYLAR
    mapping(address => address) private researcherVotes;//VOTERİN OYU
    address[] public researcherCandidates;//ADAYLAR

    mapping(address => uint16) private delegationVotesCount;//ADAYIN ALDIĞI OY SAYISI
    mapping(address => uint16) private developerVotesCount;//ADAYIN ALDIĞI OY SAYISI
    mapping(address => uint16) private designerVotesCount;//ADAYIN ALDIĞI OY SAYISI
    mapping(address => uint16) private researcherVotesCount;//ADAYIN ALDIĞI OY SAYISI

    

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

    // Delegation için oy verme
    function voteForDelegation(address delegationCandidate) public isElectionOn isRealVoter {
        // Önceki oyu sıfırla (eğer varsa)
        if(delegationVotes[msg.sender] != address(0)) {
            delegationVotesCount[delegationVotes[msg.sender]]--;
        }

        // Yeni oyu kaydet
        delegationVotes[msg.sender] = delegationCandidate;
        delegationVotesCount[delegationCandidate]++;

        // İlk kez oy kullanıyorsa listeye ekle
        bool isFirstVote = true;
        for(uint256 i = 0; i < voters.length; i++) {
            if(voters[i] == msg.sender) {
                isFirstVote = false;
                break;
            }
        }
        if(isFirstVote) {
            voters.push(msg.sender);
        }
    }

    // Developer için oy verme
    function voteForDeveloper(address developerCandidate) public isElectionOn isRealVoter {
        if(developerVotes[msg.sender] != address(0)) {
            developerVotesCount[developerVotes[msg.sender]]--;
        }
        developerVotes[msg.sender] = developerCandidate;
        developerVotesCount[developerCandidate]++;

        bool isFirstVote = true;
        for(uint256 i = 0; i < voters.length; i++) {
            if(voters[i] == msg.sender) {
                isFirstVote = false;
                break;
            }
        }
        if(isFirstVote) {
            voters.push(msg.sender);
        }
    }

    // Designer için oy verme
    function voteForDesigner(address designerCandidate) public isElectionOn isRealVoter {
        if(designerVotes[msg.sender] != address(0)) {
            designerVotesCount[designerVotes[msg.sender]]--;
        }
        designerVotes[msg.sender] = designerCandidate;
        designerVotesCount[designerCandidate]++;

        bool isFirstVote = true;
        for(uint256 i = 0; i < voters.length; i++) {
            if(voters[i] == msg.sender) {
                isFirstVote = false;
                break;
            }
        }
        if(isFirstVote) {
            voters.push(msg.sender);
        }
    }

    // Researcher için oy verme
    function voteForResearcher(address researcherCandidate) public isElectionOn isRealVoter {
        if(researcherVotes[msg.sender] != address(0)) {
            researcherVotesCount[researcherVotes[msg.sender]]--;
        }
        researcherVotes[msg.sender] = researcherCandidate;
        researcherVotesCount[researcherCandidate]++;

        bool isFirstVote = true;
        for(uint256 i = 0; i < voters.length; i++) {
            if(voters[i] == msg.sender) {
                isFirstVote = false;
                break;
            }
        }
        if(isFirstVote) {
            voters.push(msg.sender);
        }
    }

    /////////////////////////////////////////////////////////////////////////////////
    //SONUÇLARIN HESAPLANIP GÖSTERİLMESİ
    /////////////////////////////////////////////////////////////////////////////////
    

    function showDelegationVotes() public view afterElection returns(uint16[] memory) {
        uint16[] memory result = new uint16[](delegationCandidates.length);
        for(uint256 i = 0; i < delegationCandidates.length; i++) {
            result[i] = delegationVotesCount[delegationCandidates[i]];
        }
        return result;
    }

    function showDeveloperVotes() public view afterElection returns(uint16[] memory) {
        uint16[] memory result = new uint16[](developerCandidates.length);
        for(uint256 i = 0; i < developerCandidates.length; i++) {
            result[i] = developerVotesCount[developerCandidates[i]];
        }
        return result;
    }

    function showDesignerVotes() public view afterElection returns(uint16[] memory) {
        uint16[] memory result = new uint16[](designerCandidates.length);
        for(uint256 i = 0; i < designerCandidates.length; i++) {
            result[i] = designerVotesCount[designerCandidates[i]];
        }
        return result;
    }

    function showResearcherVotes() public view afterElection returns(uint16[] memory) {
        uint16[] memory result = new uint16[](researcherCandidates.length);
        for(uint256 i = 0; i < researcherCandidates.length; i++) {
            result[i] = researcherVotesCount[researcherCandidates[i]];
        }
        return result;
    }


    
    



    

}
