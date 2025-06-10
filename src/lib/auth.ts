import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { customSession } from "better-auth/plugins";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { usersTable, usersToClinicsTable } from "@/db/schema";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
    schema: schema,
  }),
  plugins: [
    customSession(async ({ user, session }) => {
      const [userToClinic] = await db.query.usersToClinicsTable.findMany({
        where: eq(usersToClinicsTable.userId, user.id),
        with: {
          clinic: true,
          user: true,
        },
      });

      if (!userToClinic) {
        const userWithPlan = await db.query.usersTable.findFirst({
          where: eq(usersTable.id, user.id),
        });
        return {
          user: {
            ...user,
            plan: userWithPlan?.plan,
            clinic: undefined,
          },
        };
      }

      return {
        user: {
          ...user,
          plan: userToClinic?.user?.plan,
          clinic: userToClinic
            ? {
                id: userToClinic.clinicId,
                name: userToClinic.clinic.name,
              }
            : undefined,
        },
        session,
      };
    }),
  ],
  user: {
    modelName: "usersTable",
    additionalFields: {
      stripeCustomerId: {
        type: "string",
        fieldName: "stripeCustomerId",
        required: false,
      },
      stripeSubscriptionId: {
        type: "string",
        fieldName: "stripeSubscriptionId",
        required: false,
      },
      plan: {
        type: "string",
        fieldName: "plan",
        required: false,
      },
    },
  },
  session: {
    modelName: "sessionsTable",
  },
  account: {
    modelName: "accountsTable",
  },
  verification: {
    modelName: "verificationsTable",
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
