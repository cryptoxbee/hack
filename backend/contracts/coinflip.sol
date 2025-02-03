// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title CoinFlipGame
 * @notice Bu kontrat, oyuncuların Ether ile coinflip (yazı-tura) oyunu oynamasını sağlar.
 * Oyuncular bahis olarak Ether gönderir; doğru tahmin durumunda yatırdıkları bahsin 2 katı ödenir.
 */
contract CoinFlipGame {
    address public owner;

    /// Bahis sonucunu loglamak için event
    event BetResult(
        address indexed player,
        uint256 betAmount,
        bool playerGuess,
        bool outcome,   // Gerçek sonuç (örneğin true = "Yazı", false = "Tura")
        bool win
    );

    /// Sadece kontrat sahibi tarafından çağrılabilecek fonksiyonlar için modifier
    modifier onlyOwner() {
        require(msg.sender == owner, "Sadece kontrat sahibi kullanabilir.");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Oyuncunun coinflip oyunu oynamasını sağlar.
     * Bahis gönderimi için fonksiyona Ether eklenmelidir.
     * @param guess Oyuncunun tahmini; örneğin true = "Yazı", false = "Tura".
     * @return win Bahsin kazanılıp kazanılmadığı.
     */
    function flipCoin(bool guess) external payable returns (bool win) {
        uint256 betAmount = msg.value;
        require(betAmount > 0, "Bahis miktari sifirdan buyuk olmali.");

        // Kontrat, oyuncunun kazanması durumunda 2 * bahis tutarini ödeyebilmelidir.
        // msg.value kontrata eklendikten sonra bakiyede yer alır.
        require(address(this).balance >= 2 * betAmount, "Kontratta yeterli bakiye yok.");

        // Basit rastgelelik: true veya false üretir.
        bool outcome = random();

        if (outcome == guess) {
            // Oyuncu doğru tahmin etti: 2 * bahis miktarini öde.
            (bool success, ) = payable(msg.sender).call{value:  195*betAmount/100}("");
            require(success, "Odeme islemi basarisiz.");
            win = true;
        } else {
            // Yanlis tahmin: bahis kontratta kalir.
            win = false;
        }

        emit BetResult(msg.sender, betAmount, guess, outcome, win);
    }

    /**
     * @notice Basit (güvenli olmayan) rastgelelik fonksiyonu.
     * Gerçek projelerde Chainlink VRF gibi oracle çözümleri kullanılması önerilir.
     */
    function random() internal view returns (bool) {
        uint256 randomHash = uint256(
            keccak256(abi.encodePacked(block.timestamp, block.difficulty, msg.sender))
        );
        return (randomHash % 2 == 0);
    }

    /**
     * @notice Kontrat sahibinin kontrata Ether yatırması için kullanılabilir.
     */
    function deposit() external payable onlyOwner {
        // Ether, fon çağrısıyla otomatik olarak kontrata aktarılır.
    }

    /**
     * @notice Kontrata doğrudan Ether gönderilebilmesi için receive fonksiyonu.
     */
    receive() external payable {}
}