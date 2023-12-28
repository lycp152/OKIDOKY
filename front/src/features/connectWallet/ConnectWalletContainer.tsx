import { ethers } from "ethers";
import React, { FC, useEffect } from "react";
import { buttonStyle } from "../style/buttonStyle";

type Props = {
  currentAccount: string;
  setCurrentAccount: any;
  contractAddress: string;
  contractABI: any;
  setAlarmHistory: any;
};

export const ConnectWalletContainer: FC<Props> = ({
  currentAccount,
  setCurrentAccount,
  contractAddress,
  contractABI,
  setAlarmHistory,
}) => {
  interface Alarm {
    address: string;
    timestamp: Date;
    message: string;
  }

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
  }, [contractAddress, setAlarmHistory, contractABI, setCurrentAccount]);

  return (
    <>
      {/* ウォレットを接続するボタン */}
      {!currentAccount && (
        <button
          onClick={connectWallet}
          type="button"
          className={`bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600 ${buttonStyle}`}
        >
          Connect Wallet
        </button>
      )}
      {/* ウォレット接続済みのボタン */}
      {currentAccount && (
        <button
          disabled={true}
          title="Wallet Connected"
          className={`bg-indigo-900 text-white cursor-not-allowed ${buttonStyle}`}
        >
          Wallet Connected
        </button>
      )}
    </>
  );
};
