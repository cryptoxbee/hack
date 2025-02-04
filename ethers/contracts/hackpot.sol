// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts@1.2.0/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts@1.2.0/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

interface randomNumber {
    function generateRandomInRange(uint256 _min, uint256 _max) external view returns (uint256);
}
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

contract pHackpot is VRFConsumerBaseV2Plus {
    address public feeSetter;
    address public owner;
    address public randomNumberAddress;
    uint256 public totalBets;
    mapping(address => uint256) public bets;
    address[] public players;
    address public tokenAddress;
    bool public isPlaying=false;
    bool public isBetting=false;
    uint256 public betSFinishTime;
    address public winner;
    uint256 public randomNumber1;
    event betPlaced(address player, uint256 amount);

    uint256 public s_subscriptionId;
    bytes32 public keyHash = 0x1770bdc7eec7771f7ba4ffd640f34260d7f095b79c92d34a5b2551d6f6cfd2be;
    uint32 public callbackGasLimit = 50000000000;
    uint16 public requestConfirmations = 3;
    uint32 public numWords = 1;


    constructor(address afeeSetter, address atokenAddress, uint256 subId) VRFConsumerBaseV2Plus(0x5CE8D5A2BC84beb22a398CCA51996F7930313D61) {
        feeSetter = afeeSetter;
        owner = msg.sender;
        tokenAddress = atokenAddress;
        s_subscriptionId = subId;
    }
    
    modifier selectingWinnerTrue() {
        isSelectingWinner = true;
        _;
    }

    modifier selectingWinnerFalse() {
        _;
        isSelectingWinner = false;
    }


    function requestRandomWords(
        //ödeme yöntemi
        bool enableNativePayment
    ) isSelectingWinner selectingWinnerTrue external returns (uint256 requestId) {
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
        //event gönderiliyor
        emit RequestSent(requestId, numWords);
        //requestId döndürülüyor
        return requestId;
    }


    function fulfillRandomWords(
        uint256 _requestId,
        uint256[] calldata _randomWords
    )  internal override {
        require(s_requests[_requestId].exists, "request not found");
        s_requests[_requestId].fulfilled = true;
        s_requests[_requestId].randomWords = _randomWords;
        emit RequestFulfilled(_requestId, _randomWords);
        randoms[lastRequestId] = _randomWords;
    }

    function getRequestStatus(
        uint256 _requestId
    ) external view returns (bool fulfilled, uint256[] memory randomWords) {
        require(s_requests[_requestId].exists, "request not found");
        RequestStatus memory request = s_requests[_requestId];
        return (request.fulfilled, request.randomWords);
    }









    modifier pauseWhileSelectingWinner() {
        require(isSelectingWinner == false, "Game is still in progress");
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





    bool public isExecutingSelectWinner;
    modifier isExecutingSelectWinner() {
        require(isSelectingWinner == false, "Game is not in progress");
        _;
    }

    function selectWinner() public onlyOwner isExecutingSelectWinner returns (address) {

        //bahis bitim zamanı kontrol ediliyor
        require(block.timestamp >= betSFinishTime, "Betting time is not over");


        //fonksiyon kitleniyor
        isExecutingSelectWinner = true;


        uint256 startPoint = 0;
        //random sayı üretiliyor
        randomNumber1 = randomNumber(randomNumberAddress).generateRandomInRange(0, totalBets);
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
        //fonksiyon kilidi kaldırılıyor
        isExecutingSelectWinner = false;

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