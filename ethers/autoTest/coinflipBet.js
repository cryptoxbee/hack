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

    const coinflipABI = [
        "function betHeads(uint256 amount, uint256 deadline, uint8 v, bytes32 r, bytes32 s)",
        "function betTails(uint256 amount, uint256 deadline, uint8 v, bytes32 r, bytes32 s)",
        "function getHeadsLength() view returns (uint256)",
        "function getTailsLength() view returns (uint256)",
        "function isSelectingWinner() view returns (bool)",
        "function isPaused() view returns (bool)",
        "function isBetting() view returns (bool)",
        "function betSFinishTime() view returns (uint256)"
    ];

    // Kontrat adresleri
    const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS;
    const COINFLIP_ADDRESS = process.env.COINFLIP_ADDRESS;

    // Kontrat örnekleri
    const tokenContract1 = new ethers.Contract(TOKEN_ADDRESS, tokenABI, wallet1);
    const tokenContract2 = new ethers.Contract(TOKEN_ADDRESS, tokenABI, wallet2);
    const coinflipContract1 = new ethers.Contract(COINFLIP_ADDRESS, coinflipABI, wallet1);
    const coinflipContract2 = new ethers.Contract(COINFLIP_ADDRESS, coinflipABI, wallet2);

    try {
        // Başlangıç durumunu kontrol et
        const isBetting = await coinflipContract1.isBetting();
        const betEndTime = await coinflipContract1.betSFinishTime();

        console.log("\n--- Başlangıç Durumu ---");
        console.log("Bahis aktif mi:", isBetting);
        if (betEndTime > 0) {
            console.log("Bahis bitiş zamanı:", new Date(Number(betEndTime) * 1000).toLocaleString());
        }

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

        // Cüzdan 1 için permit imzalama (YAZI)
        console.log("\n--- Permit 1 Hazırlanıyor (YAZI) ---");
        const nonce1 = await tokenContract1.nonces(wallet1.address);
        const permitData1 = {
            owner: wallet1.address,
            spender: COINFLIP_ADDRESS,
            value: betAmount1,
            nonce: nonce1,
            deadline: deadline
        };

        const signature1 = await wallet1.signTypedData(domain, types, permitData1);
        const sig1 = ethers.Signature.from(signature1);

        // Cüzdan 2 için permit imzalama (TURA)
        console.log("--- Permit 2 Hazırlanıyor (TURA) ---");
        const nonce2 = await tokenContract2.nonces(wallet2.address);
        const permitData2 = {
            owner: wallet2.address,
            spender: COINFLIP_ADDRESS,
            value: betAmount2,
            nonce: nonce2,
            deadline: deadline
        };

        const signature2 = await wallet2.signTypedData(domain, types, permitData2);
        const sig2 = ethers.Signature.from(signature2);

        // Kontrat durumunu kontrol et
        const isPaused = await coinflipContract1.isPaused();
        const isSelecting = await coinflipContract1.isSelectingWinner();
        console.log("\n--- Kontrat Durumu ---");
        console.log("Kontrat duraklatıldı mı:", isPaused);
        console.log("Kazanan seçiliyor mu:", isSelecting);

        // Cüzdan 1'in YAZI'ya bahis yapması
        console.log("\n--- Bahisler Yapılıyor ---");
        const tx1 = await coinflipContract1.betHeads(
            betAmount1,
            deadline,
            sig1.v,
            sig1.r,
            sig1.s
        );
        await tx1.wait();
        console.log(`Cüzdan 1: ${ethers.formatEther(betAmount1)} pHPOT ile YAZI'ya bahis yapıldı`);

        // Cüzdan 2'nin TURA'ya bahis yapması
        const tx2 = await coinflipContract2.betTails(
            betAmount2,
            deadline,
            sig2.v,
            sig2.r,
            sig2.s
        );
        await tx2.wait();
        console.log(`Cüzdan 2: ${ethers.formatEther(betAmount2)} pHPOT ile TURA'ya bahis yapıldı`);

        // Bahis sonrası durum kontrolü
        const headsCount = await coinflipContract1.getHeadsLength();
        const tailsCount = await coinflipContract1.getTailsLength();
        const finalBalance1 = await tokenContract1.balanceOf(wallet1.address);
        const finalBalance2 = await tokenContract2.balanceOf(wallet2.address);

        console.log("\n--- Bahis Sonrası Durum ---");
        console.log("YAZI bahis sayısı:", headsCount.toString());
        console.log("TURA bahis sayısı:", tailsCount.toString());
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