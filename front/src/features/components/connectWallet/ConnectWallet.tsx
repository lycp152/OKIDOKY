import React, { FC } from "react";
import { buttonStyle } from "../../style/buttonStyle";

type Props = { currentAccount: string; connectWallet: () => void };

export const ConnectWallet: FC<Props> = ({ currentAccount, connectWallet }) => {
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
