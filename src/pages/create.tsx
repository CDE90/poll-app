import { NextPage } from "next";
import { signIn, useSession } from "next-auth/react";
import Head from "next/head";
import React, { useState } from "react";
import { trpc } from "../utils/trpc";
import Button from "../components/Button";
import { useRouter } from "next/router";
import Cross from "../components/Cross";
import Plus from "../components/Plus";
import NavBar from "../components/NavBar";
import Toggle from "../components/Toggle";

const CreatePageContent: React.FC = () => {
  const [pollName, setPollName] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [privateToggle, setPrivateToggle] = useState(false);
  const router = useRouter();
  const { mutate } = trpc.useMutation("poll.createPoll", {
    onSuccess: (data) => {
      router.push(`/poll/${data?.pollId}`);
    },
  });

  const { status } = useSession();

  if (status === "loading") {
    return <main>Loading...</main>;
  }

  return (
    <>
      <NavBar />
      <main className="flex flex-col items-center">
        <h1 className="text-3xl font-bold text-center mt-4">Create Poll</h1>
        {status === "unauthenticated" ? (
          <p
            onClick={() => signIn("discord")}
            className="cursor-pointer text-blue-700 underline"
          >
            Sign in to create a poll
          </p>
        ) : (
          <></>
        )}

        <div className="pt-5">
          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();

              if (status === "unauthenticated") {
                return alert("You must be signed in to create a poll.");
              }

              const newOptions = options.filter((item) => item !== "");

              if (pollName === "" || newOptions.length < 2) {
                return;
              }

              mutate({
                name: pollName,
                options: newOptions.map((item) => {
                  return { name: item };
                }),
                isPrivate: privateToggle,
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
                disabled={status === "unauthenticated"}
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
                      disabled={status === "unauthenticated"}
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
                      disabled={status === "unauthenticated"}
                    >
                      <Cross className="invert w-6 h-6 group-hover:fill-red-500 group-hover:invert-0 group-hover:rotate-90 transition-all" />
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
                  disabled={status === "unauthenticated"}
                >
                  <Plus className="invert w-6 h-6 group-hover:fill-blue-700 group-hover:invert-0 group-hover:rotate-90 transition-all" />
                </button>
                <Button
                  displayText="Submit"
                  styles="flex-grow"
                  type="submit"
                  disabled={status === "unauthenticated"}
                />
              </div>
              <div className="mt-2">
                <Toggle
                  isToggled={privateToggle}
                  setToggled={setPrivateToggle}
                  label={"Private Poll"}
                  isDisabled={status === "unauthenticated"}
                />
              </div>
            </div>
          </form>
        </div>
      </main>
    </>
  );
};

const CreatePageContainer: NextPage = () => {
  return (
    <>
      <Head>
        <title>Create a Poll</title>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="description"
          content="Create polls & get votes on important matters"
        />
        <meta content="website" property="og:type" />
        <meta content="Create a new poll!" property="og:title" />
        <meta
          content="Create a new poll, and give people options to vote on"
          property="og:description"
        />
        <meta content="https://poll.ethancoward.dev/create" property="og:url" />
        <meta
          content="https://poll.ethancoward.dev/app-icon.png"
          property="og:image"
        />
        <meta content="#1d4ed8" data-react-helmet="true" name="theme-color" />
      </Head>

      <CreatePageContent />
    </>
  );
};

export default CreatePageContainer;
