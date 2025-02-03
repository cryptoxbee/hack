const { ethers } = require("hardhat");

async function main() {
    // Hesapları al
    const [owner, user1, user2, user3] = await ethers.getSigners();
    console.log("Test başlatılıyor...");

    // HackpotToken kontratını deploy et
    console.log("\nHackpotToken kontratı deploy ediliyor...");
    const HackpotToken = await ethers.getContractFactory("pHackpotToken");
    const hackpotToken = await HackpotToken.deploy();
    await hackpotToken.waitForDeployment();
    console.log("HackpotToken kontratı deploy edildi:", hackpotToken.target);

    // HackpotFeeSetter kontratını deploy et
    console.log("\nHackpotFeeSetter kontratı deploy ediliyor...");
    const HackpotFeeSetter = await ethers.getContractFactory("HackpotFeeSetter");
    const hackpotFeeSetter = await HackpotFeeSetter.deploy(hackpotToken.target);
    await hackpotFeeSetter.waitForDeployment();
    console.log("HackpotFeeSetter kontratı deploy edildi:", hackpotFeeSetter.target);

    // RandomNumber kontratını deploy et
    console.log("\nRandomNumber kontratı deploy ediliyor...");
    const RandomNumber = await ethers.getContractFactory("RandomNumber");
    const randomNumber = await RandomNumber.deploy();
    await randomNumber.waitForDeployment();
    console.log("RandomNumber kontratı deploy edildi:", randomNumber.target);

    // Coinflip kontratını deploy et
    console.log("\nCoinflip kontratı deploy ediliyor...");
    const Coinflip = await ethers.getContractFactory("pCoinflip");
    const coinflip = await Coinflip.deploy(hackpotToken.target, hackpotFeeSetter.target, randomNumber.target);
    await coinflip.waitForDeployment();
    console.log("Coinflip kontratı deploy edildi:", coinflip.target);

    // Kullanıcıların token alması
    const tokenAmount = ethers.parseEther("1000");
    await hackpotToken.mint(user1.address, tokenAmount);
    await hackpotToken.mint(user2.address, tokenAmount);
    await hackpotToken.mint(user3.address, tokenAmount);

    // Bahisleri test et
    console.log("\nBahisler yapılıyor...");
    try {
        // User1 için permit verileri hazırla
        const amount = ethers.parseEther("100");
        const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 saat
        const nonce = await hackpotToken.nonces(user1.address);

        // EIP-712 verileri
        const domain = {
            name: await hackpotToken.name(),
            version: '1',
            chainId: (await ethers.provider.getNetwork()).chainId,
            verifyingContract: hackpotToken.target
        };

        const types = {
            Permit: [
                { name: 'owner', type: 'address' },
                { name: 'spender', type: 'address' },
                { name: 'value', type: 'uint256' },
                { name: 'nonce', type: 'uint256' },
                { name: 'deadline', type: 'uint256' }
            ]
        };

        const value = {
            owner: user1.address,
            spender: coinflip.target,
            value: amount,
            nonce: nonce,
            deadline: deadline
        };

        // İmzayı al
        const signature = await user1.signTypedData(domain, types, value);
        const { v, r, s } = ethers.Signature.from(signature);

        // User1 yazıya 100 HPOT bahis yapsın
        await coinflip.connect(user1).betHeadsWithPermit(amount, deadline, v, r, s);
        console.log("User1 yazıya 100 HPOT bahis yaptı");

        // User2 için permit verileri hazırla
        const amount2 = ethers.parseEther("200");
        const nonce2 = await hackpotToken.nonces(user2.address);
        const value2 = {
            owner: user2.address,
            spender: coinflip.target,
            value: amount2,
            nonce: nonce2,
            deadline: deadline
        };
        const signature2 = await user2.signTypedData(domain, types, value2);
        const sig2 = ethers.Signature.from(signature2);

        // User2 yazıya 200 HPOT bahis yapsın
        await coinflip.connect(user2).betHeadsWithPermit(amount2, deadline, sig2.v, sig2.r, sig2.s);
        console.log("User2 yazıya 200 HPOT bahis yaptı");

        // User3 için permit verileri hazırla
        const amount3 = ethers.parseEther("300");
        const nonce3 = await hackpotToken.nonces(user3.address);
        const value3 = {
            owner: user3.address,
            spender: coinflip.target,
            value: amount3,
            nonce: nonce3,
            deadline: deadline
        };
        const signature3 = await user3.signTypedData(domain, types, value3);
        const sig3 = ethers.Signature.from(signature3);

        // User3 turaya 300 HPOT bahis yapsın
        await coinflip.connect(user3).betTailsWithPermit(amount3, deadline, sig3.v, sig3.r, sig3.s);
        console.log("User3 turaya 300 HPOT bahis yaptı");

        // Bahis durumunu göster
        console.log("\nBahis durumu:");
        console.log("Yazı bahisleri:");
        const headsLength = await coinflip.getHeadsLength();
        for (let i = 0; i < headsLength; i++) {
            const bettor = await coinflip.heads(i);
            const amount = await coinflip.headsAmount(i);
            console.log(`Bettor ${i + 1}: ${bettor}`);
            console.log(`Miktar ${i + 1}: ${ethers.formatEther(amount)} HPOT`);
        }

        console.log("\nTura bahisleri:");
        const tailsLength = await coinflip.getTailsLength();
        for (let i = 0; i < tailsLength; i++) {
            const bettor = await coinflip.tails(i);
            const amount = await coinflip.tailsAmount(i);
            console.log(`Bettor ${i + 1}: ${bettor}`);
            console.log(`Miktar ${i + 1}: ${ethers.formatEther(amount)} HPOT`);
        }

        // Kazananı seç ve ödülleri dağıt
        await coinflip.selectWinner();
        console.log("\nKazanan seçildi ve ödüller dağıtıldı");

    } catch (error) {
        console.log("Hata:", error.message);
    }

    console.log("\nTest tamamlandı!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
