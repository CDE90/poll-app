import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createRouter } from "./context";
import { Option, Poll } from "@prisma/client";

export const pollRouter = createRouter()
  .query("getAll", {
    input: z.object({ getPrivatePolls: z.boolean().default(false) }),
    async resolve({ ctx, input }) {
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
          where: {
            OR: [
              {
                private: {
                  equals: false,
                },
              },
              {
                private: {
                  equals: input.getPrivatePolls,
                },
              },
            ],
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
          select: {
            author: true,
            authorId: true,
            id: true,
            name: true,
            createdAt: true,
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

        const userVoted =
          (poll?.authorId && poll.authorId === ctx.session?.user?.id) ||
          (await ctx.prisma.vote.findFirst({
            where: {
              pollId: input.id,
              voteToken: ctx.token,
            },
          }));

        let totalVotes = 0;

        const optionVotes = options?.map((opt) => {
          const count = votes?.find(
            (element) => element.optionId === opt.id,
          )?._count;
          return {
            ...opt,
            count: count ?? 0,
          };
        });

        optionVotes.forEach((item) => {
          totalVotes += item.count;
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
  .query("getByName", {
    input: z.object({
      name: z.optional(z.string()),
      getPrivatePolls: z.boolean().default(false),
    }),
    async resolve({ ctx, input }) {
      try {
        if (input.name) {
          return await ctx.prisma.poll.findMany({
            where: {
              AND: [
                {
                  OR: [
                    {
                      private: {
                        equals: false,
                      },
                    },
                    {
                      private: {
                        equals: input.getPrivatePolls,
                      },
                    },
                  ],
                },
                {
                  name: {
                    contains: input.name,
                  },
                },
              ],
            },
            select: {
              name: true,
              author: true,
              options: true,
              id: true,
              _count: {
                select: {
                  votes: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 25,
          });
        }
        return await ctx.prisma.poll.findMany({
          select: {
            name: true,
            author: true,
            options: true,
            id: true,
            _count: {
              select: {
                votes: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          where: {
            OR: [
              {
                private: {
                  equals: false,
                },
              },
              {
                private: {
                  equals: input.getPrivatePolls,
                },
              },
            ],
          },
        });
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
        }),
      ),
      isPrivate: z.boolean().default(false),
    }),
    async resolve({ ctx, input }) {
      try {
        const poll: Poll = await ctx.prisma.poll.create({
          data: {
            name: input.name,
            authorId: ctx.session?.user?.id ? ctx.session.user.id : "",
            private: input.isPrivate,
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
