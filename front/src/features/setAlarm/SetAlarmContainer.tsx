import { ethers } from "ethers";
import React, { FC, useState } from "react";
import { buttonStyle } from "../style/buttonStyle";

type Props = {
  currentAccount: string;
  contractAddress: string;
  contractABI: any;
};

/* 履歴の詳細を表示するコンポーネント */
interface AlarmDetailsProps {
  title: string;
  value: string;
}

const AlarmDetails: React.FC<AlarmDetailsProps> = ({ title, value }) => (
  <div className="py-3 px-4 block w-full border-gray-200 rounded-lg dark:bg-slate-900 dark:border-gray-700 dark:text-gray-100">
    <div>
      <p className="font-semibold">{title}</p>
      <p>{value}</p>
    </div>
  </div>
);

export const SetAlarmContainer: FC<Props> = ({
  currentAccount,
  contractAddress,
  contractABI,
}) => {
  /* ユーザーのメッセージを保存するために使用する状態変数 */
  const [messageValue, setMessageValue] = useState<string>("");

  /* ABIを読み込み、コントラクトに送金する（まだ途中） */
  const writeAlarm = async () => {
    try {
      const { ethereum } = window as any;
      if (ethereum) {
        const provider = new ethers.BrowserProvider(ethereum);
        const signer = await provider.getSigner();
        /* ABIを参照する */
        const okidokyContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        /* コントラクトにAlarmを書き込む */
        const alarmTxn = await okidokyContract.writeAlarm(messageValue, {
          gasLimit: 300000,
        });
        console.log("Mining...", alarmTxn.hash);
        await alarmTxn.wait();
        console.log("Mined -- ", alarmTxn.hash);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {/* コントラクトに書き込むボタン */}
      {currentAccount && (
        <>
          <div className="flex items-center">
            {/* ETH金額入力フィールド */}
            <input
              type="number"
              step="0.0001"
              min="0.0001"
              max="0.04"
              placeholder="金額を入力してください"
              name="ethAmount"
              id="ethAmount"
              value={messageValue}
              onChange={(e) => setMessageValue(e.target.value)}
              className="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:ring-gray-600"
            />
            {/* ETHの単位を表示 */}
            <span className="ml-2 text-sm text-gray-500">ETH</span>
          </div>
          {/* アラームの時刻設定フィールド */}
          <input
            type="time"
            // value={alarmTime}
            // onChange={(e) => setAlarmTime(e.target.value)}
            className="py-3 px-4 block border-gray-200 rounded-lg text-5xl focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:ring-gray-600"
          />
          <button
            className={`${buttonStyle} bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600`}
            onClick={writeAlarm}
          >
            Set Alarm⏰
          </button>
        </>
      )}
    </>
  );
};
