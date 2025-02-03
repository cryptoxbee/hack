const { ethers, network } = require("hardhat");

async function main() {
    // Hesapları al
    const [owner, user1, user2, user3, user4, user5, user6, user7, user8] = await ethers.getSigners();
    console.log("Test başlatılıyor...");

    // Kontratı deploy et
    const Election = await ethers.getContractFactory("Election");
    const election = await Election.deploy();
    await election.waitForDeployment();
    console.log("Election kontratı deploy edildi:", election.target);

    // Seçim zamanlarını ayarla
    const currentTime = Math.floor(Date.now() / 1000);
    await election.setStartCandidateApplyingTime(currentTime);
    await election.setEndCandidateApplyingTime(currentTime + 3600);
    await election.setStartTime(currentTime);
    await election.setEndTime(currentTime + 60);
    console.log("Seçim zamanları ayarlandı");

    // Owner fonksiyonlarını test et
    console.log("\nOwner fonksiyonları test ediliyor...");
    console.log("İlk owner:", await election.owners(0));

    await election.addOwner(user1.address);
    console.log("Yeni owner eklendi:", await election.owners(1));

    await election.addRealVoter(user2.address);
    const realVoters = await election.showRealVoters();
    console.log("Real voter eklendi:", realVoters[0]);

    // Adayları ekle
    console.log("\nAdaylar ekleniyor...");
    await election.addDelegationCandidate(user1.address);
    await election.addDelegationCandidate(user2.address);
    await election.addDeveloperCandidate(user3.address);
    await election.addDeveloperCandidate(user4.address);
    await election.addDesignerCandidate(user5.address);
    await election.addDesignerCandidate(user6.address);
    await election.addResearcherCandidate(user7.address);
    await election.addResearcherCandidate(user8.address);

    console.log("\nAdaylar:");
    console.log("Delegation adayları:",
        await election.delegationCandidates(0),
        await election.delegationCandidates(1)
    );
    console.log("Developer adayları:",
        await election.developerCandidates(0),
        await election.developerCandidates(1)
    );
    console.log("Designer adayları:",
        await election.designerCandidates(0),
        await election.designerCandidates(1)
    );
    console.log("Researcher adayları:",
        await election.researcherCandidates(0),
        await election.researcherCandidates(1)
    );

    // Oy verme işlemlerini test et
    console.log("\nOy verme test ediliyor...");
    try {
        await election.connect(user2).voteForDelegation(user1.address);
        console.log("Delegation oyu verildi");

        await election.connect(user2).voteForDeveloper(user3.address);
        console.log("Developer oyu verildi");

        await election.connect(user2).voteForDesigner(user5.address);
        console.log("Designer oyu verildi");

        await election.connect(user2).voteForResearcher(user7.address);
        console.log("Researcher oyu verildi");
    } catch (error) {
        console.log("Oy verme hatası:", error.message);
    }

    // Blockchain zamanını seçim sonuna getir
    await network.provider.send("evm_increaseTime", [61]); // 61 saniye ilerlet
    await network.provider.send("evm_mine"); // Yeni blok oluştur

    // Sonuçları göster
    console.log("\nSeçim sonuçları:");
    try {
        const delegationVotes = await election.showDelegationVotes();
        const developerVotes = await election.showDeveloperVotes();
        const designerVotes = await election.showDesignerVotes();
        const researcherVotes = await election.showResearcherVotes();

        console.log("Delegation oyları:", delegationVotes.map(v => v.toString()));
        console.log("Developer oyları:", developerVotes.map(v => v.toString()));
        console.log("Designer oyları:", designerVotes.map(v => v.toString()));
        console.log("Researcher oyları:", researcherVotes.map(v => v.toString()));
    } catch (error) {
        console.log("Sonuçları gösterme hatası:", error.message);
    }

    // HpotToken kontratını deploy et
    console.log("\nHpotToken kontratı deploy ediliyor...");
    const HpotToken = await ethers.getContractFactory("HackpotToken");
    const hpotToken = await HpotToken.deploy();
    await hpotToken.waitForDeployment();
    console.log("HpotToken kontratı deploy edildi:", hpotToken.target);

    // ElectionPredict kontratını deploy et
    const ElectionPredict = await ethers.getContractFactory("ElectionPredict");
    const electionPredict = await ElectionPredict.deploy(election.target, hpotToken.target);
    await electionPredict.waitForDeployment();
    console.log("ElectionPredict kontratı deploy edildi:", electionPredict.target);

    // Kullanıcılara token ver ve approve et
    const tokenAmount = ethers.parseEther("1000");
    await hpotToken.transfer(user3.address, tokenAmount);
    await hpotToken.transfer(user4.address, tokenAmount);
    await hpotToken.transfer(user5.address, tokenAmount);
    await hpotToken.transfer(user6.address, tokenAmount);

    await hpotToken.connect(user3).approve(electionPredict.target, tokenAmount);
    await hpotToken.connect(user4).approve(electionPredict.target, tokenAmount);
    await hpotToken.connect(user5).approve(electionPredict.target, tokenAmount);
    await hpotToken.connect(user6).approve(electionPredict.target, tokenAmount);

    // Bahisleri test et
    console.log("\nBahisler yapılıyor...");
    try {
        // İlk bettor (user3) 1. adaya 100 HPOT
        const bet1 = await electionPredict.connect(user3).betForDelegation(user1.address, ethers.parseEther("100"));
        const bet1Receipt = await bet1.wait();
        const bet1Event = bet1Receipt.logs.find(log =>
            log.fragment && log.fragment.name === 'BetPlaced'
        );
        console.log("Delegation bahisi 1 yapıldı:", {
            bettor: bet1Event.args[1],
            candidate: bet1Event.args[2],
            amount: ethers.formatEther(bet1Event.args[3]) + " HPOT"
        });

        // İkinci bettor (user4) 1. adaya 200 HPOT
        const bet2 = await electionPredict.connect(user4).betForDelegation(user1.address, ethers.parseEther("200"));
        const bet2Receipt = await bet2.wait();
        const bet2Event = bet2Receipt.logs.find(log =>
            log.fragment && log.fragment.name === 'BetPlaced'
        );
        console.log("Delegation bahisi 2 yapıldı:", {
            bettor: bet2Event.args[1],
            candidate: bet2Event.args[2],
            amount: ethers.formatEther(bet2Event.args[3]) + " HPOT"
        });

        // Üçüncü bettor (user5) 2. adaya 600 HPOT
        const bet3 = await electionPredict.connect(user5).betForDelegation(user2.address, ethers.parseEther("600"));
        const bet3Receipt = await bet3.wait();
        const bet3Event = bet3Receipt.logs.find(log =>
            log.fragment && log.fragment.name === 'BetPlaced'
        );
        console.log("Delegation bahisi 3 yapıldı:", {
            bettor: bet3Event.args[1],
            candidate: bet3Event.args[2],
            amount: ethers.formatEther(bet3Event.args[3]) + " HPOT"
        });

        // Diğer komiteler için bahisler
        await electionPredict.connect(user6).betForDeveloper(user3.address, ethers.parseEther("200"));
        await electionPredict.connect(user3).betForDesigner(user5.address, ethers.parseEther("150"));
        await electionPredict.connect(user4).betForResearcher(user7.address, ethers.parseEther("175"));
        console.log("Diğer komiteler için bahisler yapıldı");

        // Toplam bahisleri göster
        console.log("\nDelegation bahis durumu:");
        console.log("1. Aday toplam bahis:", ethers.formatEther(await electionPredict.totalDelegationBets(user1.address)) + " HPOT");
        console.log("2. Aday toplam bahis:", ethers.formatEther(await electionPredict.totalDelegationBets(user2.address)) + " HPOT");

    } catch (error) {
        console.log("Bahis yapma hatası:", error.message);
    }

    // Bahisleri kapat
    await electionPredict.closeBets();
    console.log("Bahisler kapatıldı");

    // Seçim sonuçlarını bekle ve ödülleri dağıt
    await network.provider.send("evm_increaseTime", [61]);
    await network.provider.send("evm_mine");

    console.log("\nÖdüller dağıtılıyor...");
    try {
        const tx1 = await electionPredict.distributeDelegationPrizes();
        const receipt1 = await tx1.wait();
        const prizeEvents1 = receipt1.logs.filter(log =>
            log.fragment && log.fragment.name === 'PrizeDistributed'
        );

        for (const event of prizeEvents1) {
            console.log("Delegation ödülü dağıtıldı:", {
                winner: event.args[1],
                bettor: event.args[2],
                betAmount: ethers.formatEther(event.args[3]) + " HPOT",
                prizeAmount: ethers.formatEther(event.args[4]) + " HPOT"
            });
        }

        // Diğer ödülleri dağıt
        await electionPredict.distributeDeveloperPrizes();
        await electionPredict.distributeDesignerPrizes();
        await electionPredict.distributeResearcherPrizes();
        console.log("Tüm ödüller dağıtıldı");
    } catch (error) {
        console.log("Ödül dağıtma hatası:", error.message);
    }

    console.log("\nTest tamamlandı!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
