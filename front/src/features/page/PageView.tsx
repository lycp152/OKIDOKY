"use client";
import React, { FC } from "react";
import { HistoryContainer } from "@/features/components/history/History";
import { SetAlarmContainer } from "@/features/components/setAlarm/SetAlarm";
import { ConnectWalletContainer } from "@/features/components/connectWallet/ConnectWallet";

type Props = {
  currentAccount: string;
  connectWallet: any;
  messageValue: any;
  setMessageValue: any;
  writeAlarm: any;
  isExistLogs: any;
  alarmHistory: { address: any; timestamp: Date; message: any }[];
};

export const PageView: FC<Props> = ({
  currentAccount,
  connectWallet,
  messageValue,
  setMessageValue,
  writeAlarm,
  isExistLogs,
  alarmHistory,
}) => {
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
          connectWallet={connectWallet}
        />
        <SetAlarmContainer
          currentAccount={currentAccount}
          messageValue={messageValue}
          setMessageValue={setMessageValue}
          writeAlarm={writeAlarm}
        />
        <HistoryContainer
          isExistLogs={isExistLogs}
          alarmHistory={alarmHistory}
        />
      </div>
    </div>
  );
};
