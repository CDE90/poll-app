import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createRouter } from "./context";
import { Option } from "@prisma/client";

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

        const options = await prisma?.option.findMany({
          where: { pollId: input.id },
          select: { name: true, id: true },
        });

        const votes = await prisma?.vote.groupBy({
          where: { pollId: input.id },
          by: ["optionId"],
          _count: true,
        });

        console.log(poll);
        console.log(options);
        console.log(votes);
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
        const poll = await ctx.prisma.poll.create({
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
      } catch (error) {
        console.log(error);
      }
    },
  });
