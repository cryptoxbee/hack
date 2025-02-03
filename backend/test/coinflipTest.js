const { ethers } = require("hardhat");

async function main() {
    // Hesapları al
    const [owner, user1, user2, user3] = await ethers.getSigners();
    console.log("Test başlatılıyor...");

    // HackpotToken kontratını deploy et
    console.log("\nHackpotToken kontratı deploy ediliyor...");
    const HackpotToken = await ethers.getContractFactory("HackpotToken");
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
    const Coinflip = await ethers.getContractFactory("Coinflip");
    const coinflip = await Coinflip.deploy(hackpotToken.target, hackpotFeeSetter.target, randomNumber.target);
    await coinflip.waitForDeployment();
    console.log("Coinflip kontratı deploy edildi:", coinflip.target);


    // Önce owner'ın bakiyesini kontrol et
    const ownerBalance = await hackpotToken.balanceOf(owner.address);
    console.log("\nOwner bakiyesi:", ethers.formatEther(ownerBalance), "HPOT");

    const tokenAmount = ethers.parseEther("1000");
    await hackpotToken.mint(user1.address, tokenAmount);
    await hackpotToken.mint(user2.address, tokenAmount);
    await hackpotToken.mint(user3.address, tokenAmount);

    await hackpotToken.connect(user1).approve(coinflip.target, tokenAmount);
    await hackpotToken.connect(user2).approve(coinflip.target, tokenAmount);
    await hackpotToken.connect(user3).approve(coinflip.target, tokenAmount);

    // Bahisleri test et
    console.log("\nBahisler yapılıyor...");
    try {
        // User1 yazıya 100 HPOT bahis yapsın
        await coinflip.connect(user1).betHeads(ethers.parseEther("100"));
        console.log("User1 yazıya 100 HPOT bahis yaptı");

        // User2 yazıya 200 HPOT bahis yapsın
        await coinflip.connect(user2).betHeads(ethers.parseEther("200"));
        console.log("User2 yazıya 200 HPOT bahis yaptı");

        // User3 turaya 300 HPOT bahis yapsın
        await coinflip.connect(user3).betTails(ethers.parseEther("300"));
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

        // Kullanıcıların kalan bakiyelerini göster
        console.log("\nKalan bakiyeler:");
        console.log("User1:", ethers.formatEther(await hackpotToken.balanceOf(user1.address)), "HPOT");
        console.log("User2:", ethers.formatEther(await hackpotToken.balanceOf(user2.address)), "HPOT");
        console.log("User3:", ethers.formatEther(await hackpotToken.balanceOf(user3.address)), "HPOT");

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
