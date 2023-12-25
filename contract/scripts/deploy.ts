import { ethers } from "hardhat";
const main = async () => {
  const [deployer] = await ethers.getSigners();
  const accountBalance = await deployer.provider.getBalance(deployer.address);
  const alarmContractFactory = await ethers.getContractFactory("OKIDOKY");
  const alarmContract = await alarmContractFactory.deploy();
  const okidoky = await alarmContract.waitForDeployment();

  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", accountBalance.toString());
  const deployedContractAddress = await okidoky.getAddress();
  console.log("Contract deployed to:", deployedContractAddress);
  console.log("Contract deployed by:", deployer.address);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

runMain();
