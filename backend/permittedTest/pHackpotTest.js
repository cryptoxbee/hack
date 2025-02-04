const { ethers } = require("hardhat");


async function main() {

    const [owner, user1, user2] = await ethers.getSigners();


    const getHacktoken = await ethers.getContractFactory("pHackpotToken");
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

    const getHackpot = await ethers.getContractFactory("pHackpot");
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


    console.log("Bahis öncesi owner bakiye:   ", await hacktoken.balanceOf(owner.address));
    console.log("Bahis öncesi user1 bakiye:   ", await hacktoken.balanceOf(user1.address));
    console.log("Bahis öncesi user2 bakiye:   ", await hacktoken.balanceOf(user2.address));




    // Bahisler
    // User1 için permit verileri hazırla
    const amount = ethers.parseEther("100");
    const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 saat
    const nonce = await hacktoken.nonces(user1.address);

    // EIP-712 verileri
    const domain = {
        name: await hacktoken.name(),
        version: '1',
        chainId: (await ethers.provider.getNetwork()).chainId,
        verifyingContract: hacktoken.target
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
    //owner için permit verileri hazırla
    const valueOwner = {
        owner: owner.address,
        spender: hackpot.target,
        value: amount,
        nonce: nonce,
        deadline: deadline
    };
    const signatureOwner = await owner.signTypedData(domain, types, valueOwner);
    const sigOwner = ethers.Signature.from(signatureOwner);
    await hackpot.connect(owner).betTokens(amount, deadline, sigOwner.v, sigOwner.r, sigOwner.s);
    console.log("Owner yazıya 100 HPOT bahis yaptı");

    //user1 için permit verileri hazırla
    const value = {
        owner: user1.address,
        spender: hackpot.target,
        value: amount,
        nonce: nonce,
        deadline: deadline
    };

    // İmzayı al
    const signature = await user1.signTypedData(domain, types, value);
    const { v, r, s } = ethers.Signature.from(signature);

    // User1 yazıya 100 HPOT bahis yapsın
    await hackpot.connect(user1).betTokens(amount, deadline, v, r, s);
    console.log("User1 yazıya 100 HPOT bahis yaptı");

    // User2 için permit verileri hazırla
    const amount2 = ethers.parseEther("200");
    const nonce2 = await hacktoken.nonces(user2.address);
    const value2 = {
        owner: user2.address,
        spender: hackpot.target,
        value: amount2,
        nonce: nonce2,
        deadline: deadline
    };
    const signature2 = await user2.signTypedData(domain, types, value2);
    const sig2 = ethers.Signature.from(signature2);

    // User2 yazıya 200 HPOT bahis yapsın
    await hackpot.connect(user2).betTokens(amount2, deadline, sig2.v, sig2.r, sig2.s);
    console.log("User2 yazıya 200 HPOT bahis yaptı");






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