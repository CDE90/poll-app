import type { NextPage } from "next";
import Head from "next/head";
import { trpc } from "../utils/trpc";
import React, { useState } from "react";
import NavBar from "../components/NavBar";
import Button from "../components/Button";
import Link from "next/link";
import { getBaseUrl } from "./_app";

type pollProps = {
  pollName?: string;
};

const Polls: React.FC<pollProps> = ({ pollName }) => {
  const { data: polls, isLoading } = trpc.useQuery([
    "poll.getByName",
    { name: pollName },
  ]);

  if (isLoading) return <div>Fetching polls...</div>;

  return (
    <div className="flex flex-col gap-4">
      {polls?.map((pll, index) => {
        return (
          <Link href={`${getBaseUrl()}/poll/${pll.id}`} key={index}>
            <div
              className="rounded-md border-zinc-800 border-2 hover:bg-zinc-800 px-4 py-2 flex flex-col cursor-pointer focus:outline-none focus:border-blue-700"
              tabIndex={0}
            >
              <p className="text-lg font-bold">{pll.name}</p>
              <div className="flex flex-row">
                <p>
                  {pll._count.votes} {pll._count.votes === 1 ? "vote" : "votes"}
                </p>
                <p className="ml-auto">{pll.author.name}</p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

const Home: NextPage = () => {
  const [name, setName] = useState("");
  const [preName, setPreName] = useState("");

  return (
    <>
      <Head>
        <title>Poll App</title>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="description"
          content="Create polls & get votes on important matters"
        />
        <meta content="website" property="og:type" />
        <meta content="Poll App" property="og:title" />
        <meta
          content="Create polls & get votes on important matters"
          property="og:description"
        />
        <meta content="https://poll.ethancoward.dev" property="og:url" />
        <meta
          content="https://poll.ethancoward.dev/app-icon.png"
          property="og:image"
        />
        <meta content="#1d4ed8" data-react-helmet="true" name="theme-color" />
      </Head>

      <NavBar />
      <main className="flex flex-col items-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mt-4">Polls</h1>

        <div className="pt-5 w-full">
          <div className="pt-6 w-full">
            <form
              className="flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                setName(preName);
              }}
            >
              <input
                type={"text"}
                value={preName}
                placeholder="Search for poll..."
                maxLength={100}
                onChange={(event) => setPreName(event.target.value)}
                className="px-4 py-2 rounded-md border-2 border-zinc-800 bg-neutral-900 focus:outline-none focus:border-blue-700 w-full"
              />
              <Button type="submit" displayText="Seach" />
            </form>
          </div>

          <div className="pt-10" />
          <Polls pollName={name} />
        </div>
      </main>
    </>
  );
};

export default Home;
