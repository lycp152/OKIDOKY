"use client";

import React, { FC, ReactNode, useState } from "react";
import { AuthView } from "./AuthView";

type Props = {
  userId: string;
  userData: any;
};

/**
 * AuthContainer
 */
export const AuthContainer: FC<Props> = ({ userId }) => {
  const [first, setfirst] = useState("");

  const handleSubmit = () => {
    console.log("handleSubmit");
  };

  return (
    <div>
      AuthContent
      <AuthView onSubmit={handleSubmit} />
    </div>
  );
};
