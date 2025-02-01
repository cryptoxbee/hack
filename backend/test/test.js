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


    await hacktoken.mint(owner.address, ethers.parseEther("1000"));
    await hacktoken.mint(user1.address, ethers.parseEther("1000"));


    await hacktoken.approve(hackpot.target, ethers.parseEther("1000"));
    await hacktoken.connect(user1).approve(hackpot.target, ethers.parseEther("1000"));


    console.log("Bahis öncesi owner bakiye:   ", await hacktoken.balanceOf(owner.address));
    console.log("Bahis öncesi user1 bakiye:   ", await hacktoken.balanceOf(user1.address));

    await hackpot.betTokens(ethers.parseEther("100"));
    await hackpot.connect(user1).betTokens(ethers.parseEther("100"));
    await new Promise(resolve => setTimeout(resolve, 65000));

    console.log("Bahis sonrası owner bakiye:   ", await hacktoken.balanceOf(owner.address));
    console.log("Bahis sonrası user1 bakiye:   ", await hacktoken.balanceOf(user1.address));

    await hackpot.selectWinner();
    console.log("randomNumber:  ", await hackpot.randomNumber1());
    console.log("Kazanan:  ", await hackpot.winner());
    console.log("oyun sonrası owner bakiye:   ", await hacktoken.balanceOf(owner.address));
    console.log("oyun sonrası user1 bakiyesi:   ", await hacktoken.balanceOf(user1.address));
    console.log("oyun sonrası feeSetter bakiyesi:   ", await hackpotFeeSetter.showBalance());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});