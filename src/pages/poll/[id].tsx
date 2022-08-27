import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import Button from "../../components/Button";
import { trpc } from "../../utils/trpc";

const PollPageContent: React.FC<{ id: string }> = ({ id }) => {
  const ctx = trpc.useContext();
  const { data: pollData, isLoading } = trpc.useQuery([
    "poll.getById",
    { id: id },
  ]);
  const castVote = trpc.useMutation("poll.voteForPoll", {
    onMutate: () => {
      ctx.cancelQuery(["poll.getById"]);

      let optimisticUpdate = ctx.getQueryData(["poll.getById", { id: id }]);
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

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <Head>
        <title>Vote on {pollData?.poll?.name}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-10 text-center">
          {pollData?.poll?.name}
        </h1>
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
                  <progress
                    value={item.count}
                    max={pollData.totalVotes}
                    className="progress progress-secondary w-full"
                  ></progress>
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
