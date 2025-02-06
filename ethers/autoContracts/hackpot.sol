// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;
//VRF
import {VRFConsumerBaseV2Plus} from "@chainlink/contracts@1.2.0/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts@1.2.0/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
//AUTOMATION
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

interface IERC20Permit {
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;
}

contract pHackpot is VRFConsumerBaseV2Plus, AutomationCompatibleInterface {
    address public feeSetter;
    address public creator;
    address public randomNumberAddress;
    uint256 public totalBets;
    mapping(address => uint256) public bets;
    address[] public players;
    address public tokenAddress;
    bool public isPlaying=false;
    bool public isBetting=false;
    uint256 public betSFinishTime;
    address public winner;
    event betPlaced(address player, uint256 amount);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//AUTOMATION
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


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//VRF İÇİN  

    uint256 public s_subscriptionId;
    bytes32 public keyHash = 0x1770bdc7eec7771f7ba4ffd640f34260d7f095b79c92d34a5b2551d6f6cfd2be;
    uint32 public callbackGasLimit = 500000;
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

    function addOwnerForVrf(address aowner) public onlyCreator {
        ownersForVrf.push(aowner);
    }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    constructor(address afeeSetter, address atokenAddress, uint256 subId) VRFConsumerBaseV2Plus(0x5CE8D5A2BC84beb22a398CCA51996F7930313D61) {
        feeSetter = afeeSetter;
        creator = msg.sender;
        tokenAddress = atokenAddress;
        s_subscriptionId = subId;
        ownersForVrf.push(msg.sender);
    }
    bool public isSelectingWinner;
    
    modifier selectingWinnerTrue() {
        isSelectingWinner = true;
        _;
    }

    modifier selectingWinnerFalse() {
        _;
        isSelectingWinner = false;
    }

    modifier pauseWhileSelectingWinner() {
        require(isSelectingWinner == false, "Game is still in progress");
        _;
    }

    function requestRandomWords(
        //ödeme yöntemi
        bool enableNativePayment
    ) pauseWhileSelectingWinner selectingWinnerTrue public  returns (uint256 requestId) {
        //random sayı üretiliyor
        require(players.length > 0, "At least one player required to generate random number");
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









    

    modifier onlyCreator() {
        require(msg.sender == creator, "Only owner can call this function");
        _;
    }

    function setFeeSetter(address afeeSetter) public onlyOwner {
        feeSetter = afeeSetter;
    }

    function setCreator(address aowner) public onlyCreator {
        creator = aowner;
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


        


        uint256 startPoint = 0;

        //random sayı üretiliyor
        uint256 randomNumber1 = randoms[lastRequestId][0];
        randomNumber1 = randomNumber1 % totalBets;
        for (uint256 i = 0; i < players.length; i++) {
            //kazananın alanına girdiyse:
            if (startPoint + bets[players[i]] >= randomNumber1) {
                //kazanana token gönderiliyor
                IERC20Permit(tokenAddress).transfer(feeSetter, totalBets/100);
                IERC20Permit(tokenAddress).transfer(players[i], (totalBets*99)/100);
                //totalBets sıfırlanıyor
                totalBets = 0;
                winner = players[i];

                //mapping sıfırlanıyor
                for(uint256 j = 0; j < players.length; j++) {
                    delete bets[players[j]];
                }
                //array sıfırlanıyor
                players = new address[](0);
                break;
            }
            //playerın şansı kontrol ediliyor
            startPoint += bets[players[i]];
        }
        //random sayı üretimi kilidi kaldırılıyor
        isSelectingWinner = false;
        lastExecutionTime=block.timestamp;

    }


    function betTokens(
        uint256 amount,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
        ) public pauseWhileSelectingWinner {
        if(isBetting == false) {
            isBetting = true;
            betSFinishTime = block.timestamp+5;
        }
        IERC20Permit(tokenAddress).permit(msg.sender, address(this), amount, deadline, v, r, s);
        require(IERC20Permit(tokenAddress).transferFrom(msg.sender, address(this), amount), "Transfer failed");
        players.push(msg.sender);
        bets[msg.sender] += amount;
        totalBets += amount;
        emit betPlaced(msg.sender, amount);
    }
    
}   