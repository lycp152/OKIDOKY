import { ethers } from "ethers";
import React, { FC, useEffect } from "react";

type Props = {
  currentAccount: string;
  contractAddress: string;
  contractABI: any;
  alarmHistory: { address: any; timestamp: Date; message: any }[];
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
    <>
      {/* 履歴を表示する */}
      {isExistLogs && (
        <div className="py-3 px-4 block w-full border-gray-200 rounded-lg dark:bg-slate-900 dark:border-gray-700 dark:text-gray-100">
          <div className="-m-1.5 overflow-x-auto">
            <div className="p-1.5 min-w-full inline-block align-middle">
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase"
                      >
                        アドレス
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase"
                      >
                        タイムスタンプ
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase"
                      >
                        メッセージ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {alarmHistory
                      .slice(0)
                      .reverse()
                      .map((alarm) => (
                        <tr
                          key={`${alarm.address}-${alarm.timestamp.getTime()}`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">
                            {alarm.address}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                            {alarm.timestamp.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                            {alarm.message}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
