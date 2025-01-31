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

    const getHackpot = await ethers.getContractFactory("Hackpot");
    const hackpot = await getHackpot.deploy(hackpotFeeSetter.target);
    await hackpot.waitForDeployment();
    console.log("Hackpot deployed to:", hackpot.target);

    console.log(await hackpot.generateRandomInRange(0, 100));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});