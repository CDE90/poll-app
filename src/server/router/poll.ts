import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createRouter } from "./context";

export const pollRouter = createRouter()
  .query("getAll", {
    async resolve({ ctx }) {
      try {
        return await ctx.prisma.poll.findMany({
          select: {
            name: true,
            author: true,
            options: true,
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
      // options: z.array(
      //   z.object({
      //     name: z.string(),
      //   })
      // ),
    }),
    async resolve({ ctx, input }) {
      try {
        await ctx.prisma.poll.create({
          data: {
            name: input.name,
            authorId: ctx.session?.user?.id ? ctx.session.user.id : "",
          },
        });
      } catch (error) {
        console.log(error);
      }
    },
  });
