const { ethers } = require("hardhat");


async function main() {

    const [owner, user1, user2] = await ethers.getSigners();


    const getHacktoken = await ethers.getContractFactory("HackpotToken");
    const hacktoken = await getHacktoken.deploy();
    await hacktoken.waitForDeployment();
    console.log("HackToken deployed to:", hacktoken.target);
    console.log("owner:", owner.address);


    const getHackpotFeeSetter = await ethers.getContractFactory("HackpotFeeSetter");
    const hackpotFeeSetter = await getHackpotFeeSetter.deploy(hacktoken.target);
    await hackpotFeeSetter.waitForDeployment();
    console.log("HackpotFeeSetter deployed to:", hackpotFeeSetter.target);

    const getRandomNumber = await ethers.getContractFactory("RandomNumber");
    const randomNumber = await getRandomNumber.deploy();
    await randomNumber.waitForDeployment();
    console.log("RandomNumber deployed to:", randomNumber.target);

    const getHackpot = await ethers.getContractFactory("Hackpot");
    const hackpot = await getHackpot.deploy(hackpotFeeSetter.target, randomNumber.target, hacktoken.target);
    await hackpot.waitForDeployment();
    console.log("Hackpot deployed to:", hackpot.target);

    console.log("bahis öncesi ether bakiye owner:   ", await ethers.provider.getBalance(owner.address));
    console.log("bahis öncesi ether bakiye user2:   ", await ethers.provider.getBalance(user2.address));
    console.log("bahis öncesi ether bakiye user1:   ", await ethers.provider.getBalance(user1.address));

    // Token dağıtımı
    await hacktoken.mint(owner.address, ethers.parseEther("1000"));
    await hacktoken.mint(user1.address, ethers.parseEther("1000"));
    await hacktoken.mint(user2.address, ethers.parseEther("1000"));

    // Token onayları
    await hacktoken.approve(hackpot.target, ethers.parseEther("1000"));
    await hacktoken.connect(user1).approve(hackpot.target, ethers.parseEther("1000"));
    await hacktoken.connect(user2).approve(hackpot.target, ethers.parseEther("1000"));

    console.log("Bahis öncesi owner bakiye:   ", await hacktoken.balanceOf(owner.address));
    console.log("Bahis öncesi user1 bakiye:   ", await hacktoken.balanceOf(user1.address));
    console.log("Bahis öncesi user2 bakiye:   ", await hacktoken.balanceOf(user2.address));

    // Bahisler
    await hackpot.betTokens(ethers.parseEther("100"));
    await hackpot.connect(user1).betTokens(ethers.parseEther("100"));
    await hackpot.connect(user2).betTokens(ethers.parseEther("100"));

    await new Promise(resolve => setTimeout(resolve, 6000));

    console.log("Bahis sonrası owner bakiye:   ", await hacktoken.balanceOf(owner.address));
    console.log("Bahis sonrası user1 bakiye:   ", await hacktoken.balanceOf(user1.address));
    console.log("Bahis sonrası user2 bakiye:   ", await hacktoken.balanceOf(user2.address));

    await hackpot.selectWinner();
    console.log("randomNumber:  ", await hackpot.randomNumber1());
    console.log("Kazanan:  ", await hackpot.winner());

    console.log("oyun sonrası owner bakiye:   ", await hacktoken.balanceOf(owner.address));
    console.log("oyun sonrası user1 bakiyesi:   ", await hacktoken.balanceOf(user1.address));
    console.log("oyun sonrası user2 bakiyesi:   ", await hacktoken.balanceOf(user2.address));
    console.log("oyun sonrası feeSetter bakiyesi:   ", await hackpotFeeSetter.showBalance());

    console.log("oyun sonrası ether bakiye owner:   ", await ethers.provider.getBalance(owner.address));
    console.log("oyun sonrası ether bakiye user1:   ", await ethers.provider.getBalance(user1.address));
    console.log("oyun sonrası ether bakiye user2:   ", await ethers.provider.getBalance(user2.address));





}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});