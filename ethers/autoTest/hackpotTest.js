const { ethers } = require("ethers");
require('dotenv').config();

async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

    const wallet1 = new ethers.Wallet(process.env.PRIVATE_KEY1, provider);
    const wallet2 = new ethers.Wallet(process.env.PRIVATE_KEY2, provider);
    console.log("Wallet1:", wallet1.address);
    console.log("Wallet2:", wallet2.address);

    const pHackpotTokenABI = [
        "function balanceOf(address) view returns (uint256)",
        "function transfer(address to, uint256 amount) returns (bool)",
        "function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)",
        "function nonces(address) view returns (uint256)",
        "function name() view returns (string)",
        "function DOMAIN_SEPARATOR() view returns (bytes32)"
    ];

    const hackpotABI = [
        "function betTokens(uint256 amount, uint256 deadline, uint8 v, bytes32 r, bytes32 s)",
        "function selectWinner() returns (address)",
        "function requestRandomWords(bool enableNativePayment) returns (uint256)",
        "function totalBets() view returns (uint256)",
        "function winner() view returns (address)",
        "function bets(address) view returns (uint256)",
        "function isBetting() view returns (bool)",
        "function betSFinishTime() view returns (uint256)"
    ];

    const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS;
    const HACKPOT_ADDRESS = process.env.HACKPOT_ADDRESS;

    const tokenContract = new ethers.Contract(TOKEN_ADDRESS, pHackpotTokenABI, wallet1);
    const hackpotContract = new ethers.Contract(HACKPOT_ADDRESS, hackpotABI, wallet1);

    try {
        console.log("\n--- Başlangıç Bakiyeleri ---");
        const balance1 = await tokenContract.balanceOf(wallet1.address);
        const balance2 = await tokenContract.balanceOf(wallet2.address);
        console.log("Wallet1 bakiyesi:", ethers.formatEther(balance1), "pHPOT");
        console.log("Wallet2 bakiyesi:", ethers.formatEther(balance2), "pHPOT");

        // Bahis miktarları ve deadline
        const amount1 = ethers.parseEther("100");
        const amount2 = ethers.parseEther("200");
        const deadline = Math.floor(Date.now() / 1000) + 3600;

        // Permit için domain data
        const domain = {
            name: "pHackpot Token",
            version: "1",
            chainId: (await provider.getNetwork()).chainId,
            verifyingContract: TOKEN_ADDRESS
        };

        const types = {
            Permit: [
                { name: "owner", type: "address" },
                { name: "spender", type: "address" },
                { name: "value", type: "uint256" },
                { name: "nonce", type: "uint256" },
                { name: "deadline", type: "uint256" }
            ]
        };

        // Wallet1'in permit işlemi
        console.log("\n--- Permit İşlemleri ---");
        console.log("Wallet1 permit hazırlanıyor...");
        const nonce1 = await tokenContract.nonces(wallet1.address);
        const value1 = {
            owner: wallet1.address,
            spender: HACKPOT_ADDRESS,
            value: amount1,
            nonce: nonce1,
            deadline: deadline
        };
        const signature1 = await wallet1.signTypedData(domain, types, value1);
        const sig1 = ethers.Signature.from(signature1);

        // Wallet2'nin permit işlemi
        console.log("Wallet2 permit hazırlanıyor...");
        const nonce2 = await tokenContract.nonces(wallet2.address);
        const value2 = {
            owner: wallet2.address,
            spender: HACKPOT_ADDRESS,
            value: amount2,
            nonce: nonce2,
            deadline: deadline
        };
        const signature2 = await wallet2.signTypedData(domain, types, value2);
        const sig2 = ethers.Signature.from(signature2);

        // Wallet1'in bahisi
        console.log("\n--- Bahisler Yapılıyor ---");
        console.log("Wallet1 bahis yapıyor...");
        const tx1 = await hackpotContract.betTokens(amount1, deadline);
        await tx1.wait();
        console.log("Wallet1: 100 pHPOT ile bahis yapıldı");

        // Wallet2'nin bahisi
        console.log("Wallet2 bahis yapıyor...");
        const tx2 = await hackpotContract.connect(wallet2).betTokens(amount2, deadline);
        await tx2.wait();
        console.log("Wallet2: 200 pHPOT ile bahis yapıldı");

        // Bahis durumunu kontrol et
        const isBetting = await hackpotContract.isBetting();
        const betEndTime = await hackpotContract.betSFinishTime();
        console.log("\n--- Bahis Durumu ---");
        console.log("Bahis aktif mi:", isBetting);
        console.log("Bahis bitiş zamanı:", new Date(Number(betEndTime) * 1000).toLocaleString());

        // Toplam bahisleri göster
        const totalBets = await hackpotContract.totalBets();
        console.log("\nToplam bahis:", ethers.formatEther(totalBets), "pHPOT");

        // Random sayı iste
        console.log("\n--- Random Sayı İsteniyor ---");
        const requestTx = await hackpotContract.requestRandomWords(false);
        await requestTx.wait();
        console.log("Random sayı istendi");

        // Bahis süresini bekle
        console.log("\nBahis süresi bekleniyor (60 saniye)...");
        await new Promise(resolve => setTimeout(resolve, 65000));

        // Kazananı seç
        console.log("\n--- Kazanan Seçiliyor ---");
        const selectTx = await hackpotContract.selectWinner();
        await selectTx.wait();

        // Sonuçları kontrol et
        const winner = await hackpotContract.winner();
        const finalBalance1 = await tokenContract.balanceOf(wallet1.address);
        const finalBalance2 = await tokenContract.balanceOf(wallet2.address);
        const bet1 = await hackpotContract.bets(wallet1.address);
        const bet2 = await hackpotContract.bets(wallet2.address);

        console.log("\n--- Final Sonuçları ---");
        console.log("Kazanan:", winner);
        console.log("Wallet1 son bakiye:", ethers.formatEther(finalBalance1), "pHPOT");
        console.log("Wallet2 son bakiye:", ethers.formatEther(finalBalance2), "pHPOT");
        console.log("Wallet1 bahis miktarı:", ethers.formatEther(bet1), "pHPOT");
        console.log("Wallet2 bahis miktarı:", ethers.formatEther(bet2), "pHPOT");

    } catch (error) {
        console.error("\nHATA:", error);
        if (error.data) {
            console.log("Hata detayı:", error.data);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    }); 