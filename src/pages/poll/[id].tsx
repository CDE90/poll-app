import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import Button from "../../components/Button";
import NavBar from "../../components/NavBar";
import { trpc } from "../../utils/trpc";

const PollPageContent: React.FC<{ id: string }> = ({ id }) => {
  const ctx = trpc.useContext();
  const { data: pollData } = trpc.useQuery(["poll.getById", { id: id }]);
  const castVote = trpc.useMutation("poll.voteForPoll", {
    onMutate: () => {
      ctx.cancelQuery(["poll.getById"]);

      const optimisticUpdate = ctx.getQueryData(["poll.getById", { id: id }]);
      if (optimisticUpdate) {
        ctx.setQueryData(["poll.getById"], optimisticUpdate);
      }
    },
    onSettled: () => {
      ctx.invalidateQueries(["poll.getById"]);
    },
  });

  const getPercent = (voteCount?: number, totalVotes?: number) => {
    if (voteCount !== undefined && totalVotes !== undefined && totalVotes > 0) {
      return (voteCount / totalVotes) * 100;
    } else return 0;
  };

  // if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <Head>
        <title>{`Vote on ${pollData?.poll?.name}`}</title>
        <link rel="icon" href="/favicon.ico" />
        <meta content="website" property="og:type" />
        <meta content={`Vote on ${pollData?.poll?.name}`} property="og:title" />
        <meta
          content={`${pollData?.poll?.author.name} asks: ${pollData?.poll?.name}. Vote now!`}
          property="og:description"
        />
        <meta
          content={`https://poll.ethancoward.dev/poll/${id}`}
          property="og:url"
        />
        <meta
          content="https://poll.ethancoward.dev/app-icon.png"
          property="og:image"
        />
        <meta content="#1d4ed8" data-react-helmet="true" name="theme-color" />
      </Head>

      <NavBar />
      <main className="max-w-2xl mx-auto">
        <div className="flex flex-row justify-between mt-6">
          <h1 className="text-2xl font-bold mb-6 text-center">
            {pollData?.poll?.name}
          </h1>
          <div>
            <p className="text-md text-right">
              Asked by: {pollData?.poll?.author.name}
            </p>
            <p className="text-md mb-4 text-right">
              {pollData?.poll?.createdAt.toLocaleString().slice(0, -3)}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {pollData?.votes?.map((item) => {
            if (pollData.userVoted) {
              return (
                <div key={item.id}>
                  <div className="flex justify-between">
                    <p className="font-bold">{item.name}</p>
                    <p>
                      {getPercent(item.count, pollData.totalVotes).toFixed(1)}%
                    </p>
                  </div>

                  <div className="w-full bg-zinc-600 h-3 mb-3 mt-1">
                    <div
                      className="bg-blue-700 h-3"
                      style={{
                        width: `${getPercent(
                          item.count,
                          pollData.totalVotes
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              );
            } else {
              return (
                <Button
                  callback={() => {
                    castVote.mutate({
                      pollId: pollData.poll?.id as string,
                      optionId: item.id,
                    });
                  }}
                  key={item.id}
                  displayText={item.name}
                />
              );
            }
          })}
        </div>
      </main>
    </>
  );
};

const PollPage: NextPage = () => {
  const { query } = useRouter();
  const { id } = query;

  if (!id || typeof id !== "string") {
    return <div>No ID provided</div>;
  }

  return <PollPageContent id={id} />;
};

export default PollPage;
