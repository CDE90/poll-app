import React from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import Button from "./Button";
import { useRouter } from "next/router";

const NavBar: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <nav className="w-full flex flex-row justify-between items-center bg-zinc-900 ">
      <div className="items-center flex flex-row">
        <Link href="/">
          <a className="p-4">
            <Image width={60} height={60} src="/app-icon.png" alt="logo" />
          </a>
        </Link>
        <Button
          callback={() => router.push("/create")}
          displayText="Create a Poll!"
          styles="ml-10"
        />
      </div>
      <ul className="flex flex-row items-center gap-10 mr-4">
        {session ? (
          <>
            <li className="flex flex-row items-center">
              <h3 className="mr-4">{session.user?.name}</h3>
              <Button callback={() => signOut()} displayText="Logout" />
            </li>
          </>
        ) : (
          <li>
            <Button callback={() => signIn("discord")} displayText="Login" />
          </li>
        )}
      </ul>
    </nav>
  );
};

export default NavBar;
