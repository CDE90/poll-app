import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createRouter } from "./context";
import { Option, Poll } from "@prisma/client";

export const pollRouter = createRouter()
  .query("getAll", {
    async resolve({ ctx }) {
      try {
        return await ctx.prisma.poll.findMany({
          select: {
            name: true,
            author: true,
            options: true,
            id: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        });
      } catch (error) {
        console.log(error);
      }
    },
  })
  .query("getById", {
    input: z.object({ id: z.string() }),
    async resolve({ input, ctx }) {
      try {
        const poll = await ctx.prisma.poll.findFirst({
          where: {
            id: input.id,
          },
        });

        const options = await ctx.prisma.option.findMany({
          where: { pollId: input.id },
          select: { name: true, id: true },
        });

        const votes = await ctx.prisma.vote.groupBy({
          where: { pollId: input.id },
          by: ["optionId"],
          _count: true,
        });

        const totalVotes = await ctx.prisma.vote.count({
          where: {
            pollId: input.id,
          },
        });

        const optionVotes = options?.map((opt) => {
          let count = votes?.find(
            (element) => element.optionId === opt.id
          )?._count;
          return {
            ...opt,
            count: count ? count : 0,
          };
        });

        const userVoted = await ctx.prisma.vote.findFirst({
          where: {
            pollId: input.id,
            voteToken: ctx.token,
          },
        });

        return {
          poll,
          votes: optionVotes,
          totalVotes: totalVotes ? totalVotes : 0,
          userVoted: !!userVoted,
        };
      } catch (error) {
        console.log(error);
      }
    },
  })
  .mutation("voteForPoll", {
    input: z.object({
      pollId: z.string(),
      optionId: z.string(),
    }),
    async resolve({ ctx, input }) {
      try {
        await ctx.prisma.vote.create({
          data: {
            optionId: input.optionId,
            pollId: input.pollId,
            voteToken: ctx.token as string,
          },
        });
      } catch (error) {
        console.log(error);
      }
    },
  })
  .middleware(async ({ ctx, next }) => {
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next();
  })
  .mutation("createPoll", {
    input: z.object({
      name: z.string(),
      options: z.array(
        z.object({
          name: z.string(),
        })
      ),
    }),
    async resolve({ ctx, input }) {
      try {
        const poll: Poll = await ctx.prisma.poll.create({
          data: {
            name: input.name,
            authorId: ctx.session?.user?.id ? ctx.session.user.id : "",
          },
        });
        await ctx.prisma.option.createMany({
          data: input.options.map((item) => {
            return { name: item.name, pollId: poll.id } as Option;
          }),
        });

        return {
          pollId: poll.id,
        };
      } catch (error) {
        console.log(error);
      }
    },
  });
