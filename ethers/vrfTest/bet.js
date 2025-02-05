const { ethers } = require("ethers");
require('dotenv').config();

async function main() {
    // Provider ve cüzdanlar kurulumu
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const wallet1 = new ethers.Wallet(process.env.PRIVATE_KEY1, provider);
    const wallet2 = new ethers.Wallet(process.env.PRIVATE_KEY2, provider);
    console.log("Test cüzdanı 1:", wallet1.address);
    console.log("Test cüzdanı 2:", wallet2.address);

    // Kontrat ABI'leri
    const tokenABI = [
        "function balanceOf(address) view returns (uint256)",
        "function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)",
        "function nonces(address) view returns (uint256)",
        "function name() view returns (string)"
    ];

    const hackpotABI = [
        "function betTokens(uint256 amount, uint256 deadline, uint8 v, bytes32 r, bytes32 s)",
        "function bets(address) view returns (uint256)",
        "function totalBets() view returns (uint256)",
        "function isBetting() view returns (bool)",
        "function betSFinishTime() view returns (uint256)"
    ];

    // Kontrat adresleri
    const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS;
    const HACKPOT_ADDRESS = process.env.HACKPOT_ADDRESS;

    // Kontrat örnekleri
    const tokenContract1 = new ethers.Contract(TOKEN_ADDRESS, tokenABI, wallet1);
    const tokenContract2 = new ethers.Contract(TOKEN_ADDRESS, tokenABI, wallet2);
    const hackpotContract1 = new ethers.Contract(HACKPOT_ADDRESS, hackpotABI, wallet1);
    const hackpotContract2 = new ethers.Contract(HACKPOT_ADDRESS, hackpotABI, wallet2);

    try {
        // Başlangıç bakiyelerini kontrol et
        console.log("\n--- Başlangıç Bakiyeleri ---");
        const initialBalance1 = await tokenContract1.balanceOf(wallet1.address);
        const initialBalance2 = await tokenContract2.balanceOf(wallet2.address);
        console.log("Cüzdan 1 bakiyesi:", ethers.formatEther(initialBalance1), "pHPOT");
        console.log("Cüzdan 2 bakiyesi:", ethers.formatEther(initialBalance2), "pHPOT");

        // Bahis parametreleri
        const betAmount1 = ethers.parseEther("50"); // 50 token bahis
        const betAmount2 = ethers.parseEther("75"); // 75 token bahis
        const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 saat

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

        // Cüzdan 1 için permit imzalama
        console.log("\n--- Permit 1 Hazırlanıyor ---");
        const nonce1 = await tokenContract1.nonces(wallet1.address);
        const permitData1 = {
            owner: wallet1.address,
            spender: HACKPOT_ADDRESS,
            value: betAmount1,
            nonce: nonce1,
            deadline: deadline
        };

        const signature1 = await wallet1.signTypedData(domain, types, permitData1);
        const sig1 = ethers.Signature.from(signature1);

        // Cüzdan 2 için permit imzalama
        console.log("--- Permit 2 Hazırlanıyor ---");
        const nonce2 = await tokenContract2.nonces(wallet2.address);
        const permitData2 = {
            owner: wallet2.address,
            spender: HACKPOT_ADDRESS,
            value: betAmount2,
            nonce: nonce2,
            deadline: deadline
        };

        const signature2 = await wallet2.signTypedData(domain, types, permitData2);
        const sig2 = ethers.Signature.from(signature2);

        // Cüzdan 1'in bahis yapması
        console.log("\n--- Bahisler Yapılıyor ---");
        const tx1 = await hackpotContract1.betTokens(
            betAmount1,
            deadline,
            sig1.v,
            sig1.r,
            sig1.s
        );
        await tx1.wait();
        console.log(`Cüzdan 1: ${ethers.formatEther(betAmount1)} pHPOT ile bahis yapıldı`);

        // Cüzdan 2'nin bahis yapması
        const tx2 = await hackpotContract2.betTokens(
            betAmount2,
            deadline,
            sig2.v,
            sig2.r,
            sig2.s
        );
        await tx2.wait();
        console.log(`Cüzdan 2: ${ethers.formatEther(betAmount2)} pHPOT ile bahis yapıldı`);

        // Bahis sonrası durum kontrolü
        const isBetting = await hackpotContract1.isBetting();
        const betEndTime = await hackpotContract1.betSFinishTime();
        const userBet1 = await hackpotContract1.bets(wallet1.address);
        const userBet2 = await hackpotContract1.bets(wallet2.address);
        const totalBets = await hackpotContract1.totalBets();
        const finalBalance1 = await tokenContract1.balanceOf(wallet1.address);
        const finalBalance2 = await tokenContract2.balanceOf(wallet2.address);

        console.log("\n--- Bahis Sonrası Durum ---");
        console.log("Bahis aktif mi:", isBetting);
        console.log("Bahis bitiş zamanı:", new Date(Number(betEndTime) * 1000).toLocaleString());
        console.log("Cüzdan 1'in bahsi:", ethers.formatEther(userBet1), "pHPOT");
        console.log("Cüzdan 2'in bahsi:", ethers.formatEther(userBet2), "pHPOT");
        console.log("Toplam bahisler:", ethers.formatEther(totalBets), "pHPOT");
        console.log("Cüzdan 1'in kalan bakiyesi:", ethers.formatEther(finalBalance1), "pHPOT");
        console.log("Cüzdan 2'nin kalan bakiyesi:", ethers.formatEther(finalBalance2), "pHPOT");

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