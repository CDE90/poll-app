import type { NextPage } from "next";
import Head from "next/head";
import { trpc } from "../utils/trpc";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";
import Button from "../components/Button";
import NavBar from "../components/NavBar";

const Polls = () => {
  const { data: polls, isLoading } = trpc.useQuery(["poll.getAll"]);

  if (isLoading) return <div>Fetching polls...</div>;

  return (
    <div className="flex flex-col gap-4">
      {polls?.map((pll, index) => {
        return (
          <div key={index}>
            <p>
              {pll.name} - {pll.id}
            </p>
            <span>{pll.author.name}</span>
            <ul>
              {pll.options.map((opt, i) => {
                return (
                  <li className="list-disc" key={0 - i}>
                    {opt.name}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
};

const Home: NextPage = () => {
  const { data: session, status } = useSession();
  const [name, setName] = useState("");
  const ctx = trpc.useContext();
  const postPoll = trpc.useMutation("poll.createPoll", {
    onMutate: () => {
      ctx.cancelQuery(["poll.getAll"]);

      const optimisticUpdate = ctx.getQueryData(["poll.getAll"]);
      if (optimisticUpdate) {
        ctx.setQueryData(["poll.getAll"], optimisticUpdate);
      }
    },
    onSettled: () => {
      ctx.invalidateQueries(["poll.getAll"]);
    },
  });

  if (status === "loading") {
    return <main className="flex flex-col items-center pt-4">Loading...</main>;
  }

  return (
    <>
      <Head>
        <title>Poll App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <NavBar />
      <main className="flex flex-col items-center">
        <h1 className="text-3xl font-bold text-center mt-4">Polls</h1>

        <div className="pt-5">
          {session ? (
            <div>
              <div className="pt-6">
                <form
                  className="flex gap-2"
                  onSubmit={(event) => {
                    event.preventDefault();

                    postPoll.mutate({ name: name, options: [] });

                    setName("");
                  }}
                >
                  <input
                    type={"text"}
                    value={name}
                    placeholder="Poll name..."
                    maxLength={100}
                    onChange={(event) => setName(event.target.value)}
                    className="px-4 py-2 rounded-md border-2 border-zinc-800 bg-neutral-900 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="p-2 rounded-md border-2 border-zinc-800 focus:outline-none"
                  >
                    Submit
                  </button>
                </form>
              </div>

              <div className="pt-10" />
              <Polls />
            </div>
          ) : (
            <div>
              <button
                onClick={() => signIn("discord")}
                className="p-2 rounded-md border-2 border-zinc-800 focus:outline-none"
              >
                Login with Discord
              </button>

              <div className="pt-10" />
              <Polls />
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Home;
