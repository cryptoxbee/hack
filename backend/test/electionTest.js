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

    // Oy verme işlemini test et
    console.log("\nOy verme test ediliyor...");
    try {
        await election.connect(user2).vote(
            user1.address,
            user3.address,
            user5.address,
            user7.address
        );
        console.log("Oy verme başarılı");
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

    console.log("\nTest tamamlandı!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
