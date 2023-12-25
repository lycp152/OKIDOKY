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
  const [latestAlarm, setLatestAlarm] = useState<Alarm | null>(null);

  /* デプロイされたコントラクトのアドレスを保持する変数 */
  const contractAddress = "0x9841CD0E43709D8C69a7b3B10dA6A814A6Fd848a";
  /* ABIの内容を参照する変数 */
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    /* window.ethereumにアクセスできることを確認する */
    /* 'ethereum' プロパティの型情報がないため any を使用する */
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
    } else {
      console.log("No authorized account found");
    }
  };

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

  /* ABIを読み込み、コントラクトにAlarmを書き込む */
  const writeAlarm = async () => {
    try {
      const { ethereum } = window as any;
      if (ethereum) {
        const provider = new ethers.BrowserProvider(ethereum);
        const signer = await provider.getSigner();
        /* ABIを参照する */
        const ethAlarmContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        /* コントラクトにAlarmを書き込む */
        const alarmTxn = await ethAlarmContract.writeAlarm(messageValue, {
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

  const getLatestAlarm = async () => {
    const { ethereum } = window as any;
    try {
      if (ethereum) {
        const provider = new ethers.BrowserProvider(ethereum);
        const signer = await provider.getSigner();
        const ethAlarmContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        /* コントラクトからgetLatestAlarmメソッドを呼び出す */
        const alarm = await ethAlarmContract.getLatestAlarm();

        /* UIに必要なのは、アドレス、タイムスタンプ、メッセージだけなので、以下のように設定する */
        const newLatestAlarm: Alarm = {
          address: alarm.alarmer,
          timestamp: new Date(Number(alarm.timestamp) * 1000),
          message: alarm.message,
        };

        /* React Stateにデータを格納する */
        setLatestAlarm(newLatestAlarm);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    (async () => {
      checkIfWalletIsConnected();
      let ethAlarmContract: ethers.Contract;

      const onNewAlarm = (from: string, timestamp: number, message: string) => {
        console.log("NewAlarm", from, timestamp, message);
      };

      /* NewAlarmイベントがコントラクトから発信されたときに、情報を受け取る */
      if ((window as any).ethereum) {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const signer = await provider.getSigner();

        ethAlarmContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        ethAlarmContract.on("NewAlarm", onNewAlarm);
      }

      /* メモリリークを防ぐために、NewAlarmのイベントを解除する */
      return () => {
        if (ethAlarmContract) {
          ethAlarmContract.off("NewAlarm", onNewAlarm);
        }
      };
    })();
  }, [contractAddress, contractABI]);

  const isExistLogs = currentAccount && latestAlarm;

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      {/* ヘッダー */}
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <h1 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-white-900">
          OKIDOKY⏰
        </h1>
        <div className="bio mt-2 mb-8">
          イーサリアムウォレットを接続して、アラームを設定。時間通りに起きられたら0.0001ETHがもらえます。起きられなかった場合、0.0001ETHをプールします。
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg space-y-6">
        <div>
          {/* メッセージボックス */}
          {currentAccount && (
            <textarea
              placeholder="メッセージはこちら"
              name="messageArea"
              id="message"
              value={messageValue}
              onChange={(e) => setMessageValue(e.target.value)}
              className="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:ring-gray-600"
            />
          )}
        </div>

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
            <button
              className={`${buttonStyle} bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600`}
              onClick={writeAlarm}
            >
              Set Alarm⏰
            </button>
            <input
              type="time"
              // value={alarmTime}
              // onChange={(e) => setAlarmTime(e.target.value)}
              className="py-3 px-4 block border-gray-200 rounded-lg text-5xl focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700  dark:text-gray-400 dark:focus:ring-gray-600"
            />
          </>
        )}
        {/* 履歴を表示する */}
        {isExistLogs && (
          <div className="py-3 px-4 block w-full border-gray-200 rounded-lg dark:bg-slate-900 dark:border-gray-700 dark:text-gray-100">
            <div>
              <AlarmDetails title="Address" value={latestAlarm.address} />
              <AlarmDetails
                title="Time🦴🐕💨"
                value={latestAlarm.timestamp.toString()}
              />
              <AlarmDetails title="Message" value={latestAlarm.message} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
