import { ethers } from "hardhat";
const main = async () => {
  const alarmContractFactory = await ethers.getContractFactory("OKIDOKY");
  const alarmContract = await alarmContractFactory.deploy();

  const deployedContractAddress = await alarmContract.getAddress();
  console.log("Contract added to:", deployedContractAddress);

  /**
   * Alarmを送る
   */
  let alarmTxn = await alarmContract.writeAlarm("A message!");
  await alarmTxn.wait(); // トランザクションが承認されるのを待つ（テスト:1回目）

  const [_, randomPerson] = await ethers.getSigners();
  alarmTxn = await alarmContract
    .connect(randomPerson)
    .writeAlarm("Another message!");
  await alarmTxn.wait(); // トランザクションが承認されるのを待つ（テスト:2回目）

  let alarmHistory = await alarmContract.getAlarmHistory();
  console.log(alarmHistory);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
