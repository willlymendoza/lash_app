import { faker } from "@faker-js/faker";
import { hashPassword } from "better-auth/crypto";
import { randomUUID } from "node:crypto";
import { parseArgs } from "node:util";
import { and, eq, isNull } from "drizzle-orm";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { z } from "zod";

import { client, db } from "../db";
import {
  account,
  clients,
  lashistProfiles,
  services,
  user as authUsers,
  users,
} from "../db/schema";
import { getAppEnv, getRequiredEnv } from "../lib/env";
import { generateInitialPassword } from "../lib/password";
import { createClientSchema } from "../modules/clients/schemas/client.schema";
import { updateLashistProfileSchema } from "../modules/lashists/schemas/lashist-profile.schema";
import { createServiceSchema } from "../modules/services/schemas/service.schema";

const optionsSchema = z
  .object({
    clients: z.coerce.number().int().min(0).max(1000),
    services: z.coerce.number().int().min(0).max(1000),
    lashists: z.coerce.number().int().min(0).max(1000),
  })
  .refine(
    (options) => options.clients + options.services + options.lashists > 0,
    { message: "Request at least one client, service, or lash artist." },
  );

const placeholderLashistSchema = z.object({
  fullName: z.string().trim().min(3).max(120),
  email: z.string().trim().email().max(255).toLowerCase(),
  phone: createClientSchema.shape.phone,
  profile: updateLashistProfileSchema,
});

function generateClient(currentYear: number) {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const year = currentYear - faker.number.int({ min: 19, max: 80 });
  const month = String(faker.number.int({ min: 1, max: 12 })).padStart(2, "0");
  // Days 1–28 are valid in every month, including February.
  const day = String(faker.number.int({ min: 1, max: 28 })).padStart(2, "0");

  return createClientSchema.parse({
    firstName,
    lastName,
    phone: String(faker.number.int({ min: 10000000, max: 99999999 })),
    address: faker.location.streetAddress(),
    instagram: faker.internet.username({ firstName, lastName }).toLowerCase(),
    email: faker.internet.exampleEmail({ firstName, lastName }).toLowerCase(),
    birthDate: `${year}-${month}-${day}`,
  });
}

function generateService() {
  const name = `Demo ${faker.commerce.productAdjective()} Lash Treatment`;
  const duration = faker.number.int({ min: 1, max: 12 }) * 15;
  const cents = faker.number.int({ min: 5000, max: 75000 });

  return createServiceSchema.parse({
    name,
    description: `${name}: a ${duration}-minute appointment with a personalized consultation and lash styling.`,
    basePrice: (cents / 100).toFixed(2),
    estimatedDurationMinutes: String(duration),
  });
}

function generateLashist() {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  return placeholderLashistSchema.parse({
    fullName: `${firstName} ${lastName}`,
    email: faker.internet.exampleEmail({ firstName, lastName }),
    phone: String(faker.number.int({ min: 10000000, max: 99999999 })),
    profile: {
      defaultCommissionType: "percent",
      defaultCommissionValue: String(faker.number.int({ min: 20, max: 50 })),
      color: faker.color.rgb({ format: "hex" }),
    },
  });
}

async function generatePlaceholderData() {
  try {
    const { values } = parseArgs({
      options: {
        clients: { type: "string", default: "5" },
        services: { type: "string", default: "5" },
        lashists: { type: "string", default: "5" },
        help: { type: "boolean", short: "h", default: false },
      },
      strict: true,
      allowPositionals: false,
    });

    if (values.help) {
      console.log(
        "Usage: pnpm db:placeholder --clients 5 --services 5 --lashists 5",
      );
      console.log(
        "Development only. Counts must be integers from 0 to 1000. Each run appends new data.",
      );
      return;
    }

    if (getAppEnv() !== "development" || process.env.NODE_ENV === "production") {
      throw new Error(
        "Placeholder data can only be generated in development. Integration tests manage their own fixtures.",
      );
    }

    const counts = optionsSchema.parse(values);
    const timeZone = getRequiredEnv("NEXT_PUBLIC_TIMEZONE");
    const currentYear = Number(formatInTimeZone(new Date(), timeZone, "yyyy"));
    const administratorEmail = getRequiredEnv("SUPERADMIN_EMAIL")
      .trim()
      .toLowerCase();

    const [administrator] = await db
      .select({ id: users.id })
      .from(users)
      .where(
        and(
          eq(users.email, administratorEmail),
          eq(users.isActive, true),
          isNull(users.deletedAt),
        ),
      )
      .limit(1);

    if (!administrator) {
      throw new Error(
        "An active development administrator is required for audit fields. Run pnpm db:seed first.",
      );
    }

    const clientRows = Array.from({ length: counts.clients }, () => {
      const generated = generateClient(currentYear);

      return {
        ...generated,
        birthDate: fromZonedTime(`${generated.birthDate}T00:00:00`, timeZone),
        createdByUserId: administrator.id,
        updatedByUserId: administrator.id,
      };
    });
    const serviceRows = Array.from({ length: counts.services }, () => {
      const generated = generateService();

      return {
        ...generated,
        estimatedDurationMinutes: Number(generated.estimatedDurationMinutes),
        isActive: true,
        createdByUserId: administrator.id,
        updatedByUserId: administrator.id,
      };
    });

    // Hash generated passwords before opening the transaction; never log credentials.
    const lashistRows = [];
    for (let index = 0; index < counts.lashists; index++) {
      lashistRows.push({
        ...generateLashist(),
        authUserId: randomUUID(),
        accountId: randomUUID(),
        passwordHash: await hashPassword(generateInitialPassword()),
      });
    }

    await db.transaction(async (transaction) => {
      if (clientRows.length > 0) {
        await transaction.insert(clients).values(clientRows);
      }

      if (serviceRows.length > 0) {
        await transaction.insert(services).values(serviceRows);
      }

      for (const lashist of lashistRows) {
        await transaction.insert(authUsers).values({
          id: lashist.authUserId,
          name: lashist.fullName,
          email: lashist.email,
          emailVerified: false,
        });
        await transaction.insert(account).values({
          id: lashist.accountId,
          accountId: lashist.authUserId,
          providerId: "credential",
          userId: lashist.authUserId,
          password: lashist.passwordHash,
        });

        const [newUser] = await transaction
          .insert(users)
          .values({
            fullName: lashist.fullName,
            email: lashist.email,
            phone: lashist.phone,
            isActive: true,
            createdByUserId: administrator.id,
            updatedByUserId: administrator.id,
          })
          .returning({ id: users.id });

        if (!newUser) {
          throw new Error("Could not create the placeholder lash artist user.");
        }

        await transaction.insert(lashistProfiles).values({
          userId: newUser.id,
          defaultCommissionType: lashist.profile.defaultCommissionType,
          defaultCommissionValue:
            lashist.profile.defaultCommissionValue.toFixed(2),
          color: lashist.profile.color,
          createdByUserId: administrator.id,
          updatedByUserId: administrator.id,
        });
      }
    });

    console.log(
      `[Placeholder data] Added ${counts.clients} clients, ${counts.services} services, and ${counts.lashists} lash artists to development.`,
    );
  } finally {
    await client.end();
  }
}

void generatePlaceholderData().catch((error: unknown) => {
  console.error("[Placeholder data] Generation failed:", error);
  process.exitCode = 1;
});
