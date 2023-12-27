import { ethers } from "ethers";
import React, { FC, useEffect } from "react";
import { HistoryView } from "./HistoryView";

type Props = {
  currentAccount: string;
  contractAddress: string;
  contractABI: any;
  alarmHistory: any;
  setAlarmHistory: any;
};

export const HistoryContainer: FC<Props> = ({
  currentAccount,
  contractAddress,
  contractABI,
  alarmHistory,
  setAlarmHistory,
}) => {
  useEffect(() => {
    (async () => {
      let okidokyContract: ethers.Contract;

      const onAlarmStop = (
        from: string,
        timestamp: number,
        message: string
      ) => {
        console.log("NewAlarm", from, timestamp, message);
        setAlarmHistory((prevState: any) => [
          ...prevState,
          {
            address: from,
            timestamp: new Date(Number(timestamp) * 1000),
            message: message,
          },
        ]);
      };

      /* AlarmStopイベントがコントラクトから発信されたときに、情報を受け取る */
      if (currentAccount === "" || !currentAccount) return;
      if ((window as any).ethereum) {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const signer = await provider.getSigner();

        okidokyContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        okidokyContract.on("AlarmStop", onAlarmStop);
      }

      /* メモリリークを防ぐために、AlarmStopのイベントを解除する */
      return () => {
        if (okidokyContract) {
          okidokyContract.off("AlarmStop", onAlarmStop);
        }
      };
    })();
  }, [currentAccount, contractABI, contractAddress, setAlarmHistory]);

  const isExistLogs = Boolean(currentAccount && alarmHistory);

  return (
    <div>
      <HistoryView isExistLogs={isExistLogs} alarmHistory={alarmHistory} />
    </div>
  );
};
