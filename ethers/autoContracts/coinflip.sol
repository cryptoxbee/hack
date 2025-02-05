// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;
///VRF IMPORTS
import {VRFConsumerBaseV2Plus} from "@chainlink/contracts@1.2.0/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts@1.2.0/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
//AUTOMATION
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";


interface IERC20Permit {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external;
}

contract Coinflip is VRFConsumerBaseV2Plus, AutomationCompatibleInterface {
    address public creator;
    address public tokenAddress;
    address public feeSetter;
    address public randomNumberAddress;

    address[] public heads;//yazı
    uint256[] public headsAmount;

    address[] public tails;//tura
    uint256[] public tailsAmount;

    bool public isBetting = false;
    bool public isPaused = false;


    
    uint256 public betSFinishTime;

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //VRF ZIRVALARI(BİT ARTIIIIIIK :'))
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    uint256 public s_subscriptionId;
    bytes32 public keyHash = 0x1770bdc7eec7771f7ba4ffd640f34260d7f095b79c92d34a5b2551d6f6cfd2be;
    uint32 public callbackGasLimit = 3000000;
    uint16 public requestConfirmations = 3;
    uint32 public numWords = 1;

    struct RequestStatus {
        bool fulfilled;
        bool exists;
        uint256[] randomWords;
    }
    mapping(uint256 => RequestStatus) public s_requests;

    uint256[] public requestIds;
    uint256 public lastRequestId;

    mapping(uint256 => uint256[]) public randoms;

    address[] public ownersForVrf;

    function addOwnerForVrf(address aowner) public onlyOwner {
        ownersForVrf.push(aowner);
    }


    modifier onlyOwnersForVrf() {
        bool isOwner = false;
        for(uint256 i = 0; i < ownersForVrf.length; i++) {
            if(msg.sender == ownersForVrf[i]) {
                isOwner = true;
                break;
            }
        }
        require(isOwner, "Only owners can call this function");
        _;
    }
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //AUTOMATION
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
     uint256 public lastExecutionTime;
    uint256 public interval = 60; // 60 saniye
    //Test
    function checkUpkeep(bytes calldata) external view override returns (bool upkeepNeeded, bytes memory) {
    upkeepNeeded = (block.timestamp - lastExecutionTime) >= interval;
    return (upkeepNeeded, "");
}

    // Chainlink Keepers tarafından 60 saniyede bir çağrılan fonksiyon
    function performUpkeep(bytes calldata) external override onlyOwnersForVrf {
        if ((block.timestamp - lastExecutionTime) >= interval) {
            requestRandomWords(false);
        }
    }
    
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


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

    modifier onlyCreator() {
        require(msg.sender == creator, "Only owner can call this function");
        _;
    }

    bool public isSelectingWinner;
    modifier pauseWhileSelectingWinner() {
        require(isSelectingWinner == false, "Game is still in progress");
        _;
    }

    modifier selectingWinnerTrue() {
        isSelectingWinner = true;
        _;
    }

    function pause() external onlyCreator notBetting {
        isPaused = true;
    }

    function unpause() external onlyCreator {
        isPaused = false;
    }
    
    constructor(address _tokenAddress, address _feeSetter,  uint256 subId) VRFConsumerBaseV2Plus(0x5CE8D5A2BC84beb22a398CCA51996F7930313D61) {
        feeSetter = _feeSetter;
        creator = msg.sender;
        tokenAddress = _tokenAddress;
        s_subscriptionId = subId;
        ownersForVrf.push(msg.sender);
    }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //BET FONKSIYONLARI
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function betHeads(
        uint256 amount,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
        ) external pauseWhileSelectingWinner{
        IERC20Permit(tokenAddress).permit(msg.sender, address(this), amount, deadline, v, r, s);
        require(IERC20Permit(tokenAddress).transferFrom(msg.sender, address(this), amount), "Transfer failed");
        heads.push(msg.sender);
        headsAmount.push(amount);
    }

    function betTails(
        uint256 amount,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
        ) external pauseWhileSelectingWinner {
        IERC20Permit(tokenAddress).permit(msg.sender, address(this), amount, deadline, v, r, s);
        require(IERC20Permit(tokenAddress).transferFrom(msg.sender, address(this), amount), "Transfer failed");
        tails.push(msg.sender);
        tailsAmount.push(amount);
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //VRF FALAN FİLAN
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function requestRandomWords(
        //ödeme yöntemi
        bool enableNativePayment
    ) pauseWhileSelectingWinner selectingWinnerTrue public  returns (uint256 requestId) {
        //random sayı üretiliyor
        requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                //keyHash
                keyHash: keyHash,
                //subscription id
                subId: s_subscriptionId,
                //doğrulama sayısı
                requestConfirmations: requestConfirmations,
                //gaz limiti
                callbackGasLimit: callbackGasLimit,
                //kaç sayı üretilecek
                numWords: numWords,
                //ödeme yöntemi
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({
                        //ödeme yöntemi
                        nativePayment: enableNativePayment
                    })
                )
            })
        );
        //requestId ile requestStatus mapping
        s_requests[requestId] = RequestStatus({
            randomWords: new uint256[](0),
            exists: true,
            fulfilled: false
        });
        //requestId array'e ekleniyor
        requestIds.push(requestId);
        //son requestId
        lastRequestId = requestId;
        //requestId döndürülüyor
        return requestId;
    }


    function fulfillRandomWords(
        uint256 _requestId,
        uint256[] calldata _randomWords
    )  internal onlyOwnersForVrf override {
        require(s_requests[_requestId].exists, "request not found");
        require(s_requests[_requestId].fulfilled == false, "request already fulfilled");
        s_requests[_requestId].fulfilled = true;
        s_requests[_requestId].randomWords = _randomWords;
        randoms[lastRequestId] = _randomWords;
    }

    function getRequestStatus(
        uint256 _requestId
    ) external view returns (bool fulfilled, uint256[] memory randomWords) {
        require(s_requests[_requestId].exists, "request not found");
        RequestStatus memory request = s_requests[_requestId];
        return (request.fulfilled, request.randomWords);
    }



    //seleWinner fonksiyonunu 2 kez çağırılmasını önlemek için
    bool public isExecutingSelectWinner;
    modifier MisExecutingSelectWinner() {
        require(isExecutingSelectWinner == false, "Game is not in progress");
        isExecutingSelectWinner = true;
        _;
        isExecutingSelectWinner = false;
    }

    function selectWinner() public MisExecutingSelectWinner {
        //bahis bitim zamanı kontrol ediliyor
        require(block.timestamp >= betSFinishTime, "Betting time is not over");
        uint256 randomNumber = randoms[lastRequestId][0];
        randomNumber = randomNumber % 100; 
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
        isSelectingWinner = false;
    }

    function withdraw() external onlyCreator Paused {
        IERC20Permit(tokenAddress).transfer(creator, IERC20Permit(tokenAddress).balanceOf(address(this)));
    }

    function getHeadsLength() public view returns (uint256) {
        return heads.length;
    }

    function getTailsLength() public view returns (uint256) {
        return tails.length;
    }
}
