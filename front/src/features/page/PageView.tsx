"use client";
import { useAppState } from "@/features/state";
import { HistoryContainer } from "@/features/history/HistoryContainer";
import { SetAlarmContainer } from "@/features/setAlarm/SetAlarmContainer";
import { ConnectWalletContainer } from "@/features/connectWallet/ConnectWalletContainer";

export default function PageView() {
  const {
    currentAccount,
    setCurrentAccount,
    alarmHistory,
    setAlarmHistory,
    contractAddress,
    contractABI,
  } = useAppState();

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
        <ConnectWalletContainer
          currentAccount={currentAccount}
          setCurrentAccount={setCurrentAccount}
          contractAddress={contractAddress}
          contractABI={contractABI}
          setAlarmHistory={setAlarmHistory}
        />
        <SetAlarmContainer
          currentAccount={currentAccount}
          contractAddress={contractAddress}
          contractABI={contractABI}
        />
        <HistoryContainer
          currentAccount={currentAccount}
          contractAddress={contractAddress}
          contractABI={contractABI}
          alarmHistory={alarmHistory}
          setAlarmHistory={setAlarmHistory}
        />
      </div>
    </div>
  );
}
