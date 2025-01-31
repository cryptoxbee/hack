const { ethers } = require("hardhat");


async function main() {

    const [owner, user1, user2] = await ethers.getSigners();


    const getHacktoken = await ethers.getContractFactory("HackpotToken");
    const hacktoken = await getHacktoken.deploy();
    await hacktoken.waitForDeployment();
    console.log("HackToken deployed to:", hacktoken.target);

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

    await hackpot.betTokens(100);

    console.log(await hackpot.selectWinner());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});