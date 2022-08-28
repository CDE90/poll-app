import { NextPage } from "next";
import { useSession, signIn, signOut } from "next-auth/react";
import Head from "next/head";
import { useState } from "react";
import { trpc } from "../utils/trpc";
import Button from "../components/Button";
import { useRouter } from "next/router";
import Cross from "../components/Cross";
import Plus from "../components/Plus";

const CreatePage: NextPage = () => {
  const { data: session, status } = useSession({ required: true });
  const [pollName, setPollName] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const { mutate } = trpc.useMutation("poll.createPoll", {
    onSuccess: (data) => {
      router.push(`/poll/${data?.pollId}`);
    },
  });
  const router = useRouter();

  if (status === "loading") {
    return <main>Loading...</main>;
  }

  return (
    <>
      <Head>
        <title>Create a Poll</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center">
        <div className="flex flex-row w-full justify-between p-1">
          <h1 className="text-3xl">Create Poll</h1>
          {session ? (
            <div>
              <span className="mr-2">{session.user?.name}</span>
              <Button callback={() => signOut()} displayText="Logout" />
            </div>
          ) : (
            <div>
              <Button
                callback={() => signIn("discord")}
                displayText="Login with Discord"
              />
            </div>
          )}
        </div>

        <div className="pt-10">
          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();

              const newOptions = options.filter((item) => item !== "");

              if (pollName === "" || newOptions.length < 2) {
                return;
              }

              mutate({
                name: pollName,
                options: newOptions.map((item) => {
                  return { name: item };
                }),
              });
            }}
          >
            <div className="flex flex-col">
              <input
                type="text"
                value={pollName}
                placeholder="Poll name..."
                maxLength={100}
                onChange={(event) => setPollName(event.target.value)}
                className="my-1 px-4 py-2 rounded-md border-2 border-zinc-800 bg-neutral-900 focus:outline-none focus:border-blue-700"
              />

              {options.map((op, index) => {
                return (
                  <div className="flex flex-row items-center" key={index}>
                    <input
                      type="text"
                      value={op}
                      placeholder={"Option " + (index + 1)}
                      maxLength={100}
                      onChange={(event) => {
                        const l = [...options];
                        l[index] = event.target.value;
                        setOptions(l);
                      }}
                      key={index}
                      className="my-1 px-4 py-2 rounded-md border-2 border-zinc-800 bg-neutral-900 focus:outline-none focus:border-blue-700"
                    />
                    <button
                      className="mx-2 w-11 h-11 flex justify-center items-center group"
                      onClick={(event) => {
                        event.preventDefault();

                        if (options.length <= 2) {
                          return alert("You must have at least 2 options");
                        }
                        const l = [...options];
                        l.splice(index, 1);
                        setOptions(l);
                      }}
                    >
                      <Cross className="invert w-6 h-6 group-hover:fill-red-500 group-hover:invert-0" />
                    </button>
                  </div>
                );
              })}
              <div className="flex flex-row py-1">
                <button
                  className="mr-2 w-11 h-11 flex justify-center items-center group bg-zinc-800 rounded-full"
                  onClick={(event) => {
                    event.preventDefault();

                    setOptions([...options, ""]);
                  }}
                >
                  <Plus className="invert w-6 h-6 group-hover:fill-blue-700 group-hover:invert-0" />
                </button>
                <Button
                  callback={() => null}
                  displayText="Submit"
                  styles="flex-grow"
                  type="submit"
                />
              </div>
            </div>
          </form>
        </div>
      </main>
    </>
  );
};

export default CreatePage;
