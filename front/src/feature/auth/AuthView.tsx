import React, { FC, ReactNode } from "react";

type Props = {
  onSubmit: () => void;
};

/**
 * AuthView
 */
export const AuthView: FC<Props> = ({ onSubmit }) => {
  return (
    <div>
      AuthView
      <button>ログイン</button>
      <button>ログイン</button>
      <button>ログイン</button>
      <p>fadfaf</p>
      <p>fadfaf</p>
      <p>fadfaf</p>
      <p>fadfaf</p>
      <button onClick={onSubmit}>Submit</button>
    </div>
  );
};
