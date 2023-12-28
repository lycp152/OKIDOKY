import { useState } from "react";
import abi from "@/app/utils/OKIDOKY.json";

export const useAppState = () => {
  const [currentAccount, setCurrentAccount] = useState<string>("");
  const [alarmHistory, setAlarmHistory] = useState<
    {
      address: any;
      timestamp: Date;
      message: any;
    }[]
  >([]);
  const contractAddress = "0xd8D86d6E6Fcab058b273FFc80a30e4874e9d0de6";
  const contractABI = abi.abi;

  return {
    currentAccount,
    setCurrentAccount,
    alarmHistory,
    setAlarmHistory,
    contractAddress,
    contractABI,
  };
};
