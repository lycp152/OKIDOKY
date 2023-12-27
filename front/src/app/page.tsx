"use client";
import { ethers } from "ethers";
import React, { useState, useEffect } from "react";

/* ABIファイルを含むOkidoky.jsonファイルをインポートする */
import abi from "./utils/Okidoky.json";

interface Alarm {
  address: string;
  timestamp: Date;
  message: string;
}

/* ボタンのスタイルをまとめた変数 */
const buttonStyle =
  "flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

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

export default function Home() {
  /* ユーザーのパブリックウォレットを保存するために使用する状態変数 */
  const [currentAccount, setCurrentAccount] = useState<string>("");
  console.log("currentAccount: ", currentAccount);
  /* ユーザーのメッセージを保存するために使用する状態変数 */
  const [messageValue, setMessageValue] = useState<string>("");
  const [alarmHistory, setAlarmHistory] = useState<
    { address: any; timestamp: Date; message: any }[]
  >([]);

  /* デプロイされたコントラクトのアドレスを保持する変数 */
  const contractAddress = "0xd8D86d6E6Fcab058b273FFc80a30e4874e9d0de6";
  /* ABIの内容を参照する変数 */
  const contractABI = abi.abi;

  useEffect(() => {
    (async () => {
      let okidokyContract: ethers.Contract;

      const onAlarmStop = (
        from: string,
        timestamp: number,
        message: string
      ) => {
        console.log("NewAlarm", from, timestamp, message);
        setAlarmHistory((prevState) => [
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
  }, [currentAccount, contractABI]);

  const connectWallet = async () => {
    try {
      /* ユーザーが認証可能なウォレットアドレスを持っているか確認する */
      const { ethereum } = window as any;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }
      /* 持っている場合は、ユーザーに対してウォレットへのアクセス許可を求める
       * 許可されれば、ユーザーの最初のウォレットアドレスを currentAccount に格納する */
      const accounts = (await ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];
      console.log("Connected: ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

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

  useEffect(() => {
    const checkIfWalletIsConnected = async () => {
      /* window.ethereumにアクセスできることを確認する */
      /* 'ethereum' プロパティの型情報がないため any を使用する */
      try {
        const { ethereum } = window as any;
        if (!ethereum) {
          console.log("Make sure you have MetaMask!");
        } else {
          console.log("We have the ethereum object", ethereum);
        }
        /* ユーザーのウォレットへのアクセスが許可されているか確認する */
        const accounts = await ethereum.request({ method: "eth_accounts" });
        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log("Found an authorized account:", account);
          setCurrentAccount(account);
          getAlarmHistory();
        } else {
          console.log("No authorized account found");
        }
      } catch (error) {
        console.log(error);
      }
    };

    const getAlarmHistory = async () => {
      const { ethereum } = window as any;
      try {
        if (ethereum) {
          const provider = new ethers.BrowserProvider(ethereum);
          const signer = await provider.getSigner();
          const okidokyContract = new ethers.Contract(
            contractAddress,
            contractABI,
            signer
          );

          /* コントラクトからgetAlarmHistoryメソッドを呼び出す */
          const alarms = await okidokyContract.getAlarmHistory();

          /* UIに必要なのは、アドレス、タイムスタンプ、メッセージだけなので、以下のように設定する */
          const newAlarmHistory = alarms.map((alarm: Alarm, index: number) => {
            return {
              address: alarm.address,
              timestamp: new Date(Number(alarm.timestamp) * 1000),
              message: alarm.message,
            };
          });

          /* React Stateにデータを格納する */
          setAlarmHistory(newAlarmHistory);
        } else {
          console.log("Ethereum object doesn't exist!");
        }
      } catch (error) {
        console.log(error);
      }
    };

    checkIfWalletIsConnected();
  }, [contractABI]);

  const isExistLogs = currentAccount && alarmHistory;

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      {/* ヘッダー */}
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <h1 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-white-900">
          OKIDOKY⏰
        </h1>
        <div className="bio mt-2 mb-8">
          ウォレットを接続して、ETHの金額とアラームを設定。時間通りに起きられたら2倍のETHが帰ってきます。起きられなかった場合、設定したETHの金額はプールされます。
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg space-y-6">
        {/* ウォレットを接続するボタン */}
        {!currentAccount && (
          <button
            onClick={connectWallet}
            type="button"
            className={`${buttonStyle} bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600`}
          >
            Connect Wallet
          </button>
        )}
        {/* ウォレット接続済みのボタン */}
        {currentAccount && (
          <button
            disabled={true}
            title="Wallet Connected"
            className={`${buttonStyle} bg-indigo-900 text-white cursor-not-allowed`}
          >
            Wallet Connected
          </button>
        )}
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
                        .map((alarm, index) => (
                          <tr key={index}>
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
      </div>
    </div>
  );
}
