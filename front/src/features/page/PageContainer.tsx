"use client";
import { ethers } from "ethers";
import React, { useState, useEffect } from "react";
import { PageView } from "./PageView";
/* ABIファイルを含むOkidoky.jsonファイルをインポートする */
import abi from "@/app/utils/OKIDOKY.json";

interface Alarm {
  address: string;
  timestamp: Date;
  message: string;
}

export default function PageContainer() {
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
    <PageView
      currentAccount={currentAccount}
      connectWallet={connectWallet}
      messageValue={messageValue}
      setMessageValue={setMessageValue}
      writeAlarm={writeAlarm}
      isExistLogs={!!isExistLogs}
      alarmHistory={alarmHistory}
    />
  );
}
