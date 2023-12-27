import { NextPage } from "next";
import { AuthContainer } from "../../feature/auth/AuthContainer";

/**
 * AuthPage
 */
const AuthPage: NextPage = () => {
  const id = searchParams.get("id");

  const userData = await fetch(`http://localhost:3000/api/user/${id}`);

  return <AuthContainer userId={id} userData={""} />;
};
