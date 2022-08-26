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
        console.log("error", error);
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
