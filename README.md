# lash_app

Internal studio management built with Next.js, TypeScript, Drizzle, PostgreSQL, and Better Auth. The application uses English, Guatemala time, and day/month/year dates.

## Configuration

Copy `.env.example` to `.env` and replace every placeholder with the required configuration. The administrator settings are used only when seeding development. The root `.env` is the only runtime environment file and is ignored by Git; `.env.example` is a tracked template without secrets. Do not create environment-specific copies or commit credentials.

| Settings | Purpose |
| --- | --- |
| `COMPOSE_PROJECT_NAME` | Docker Compose project isolation |
| `POSTGRES_IMAGE` | PostgreSQL Docker image |
| `POSTGRES_BIND_ADDRESS`, `POSTGRES_HOST` | Docker port binding and app database host |
| `POSTGRES_USER`, `POSTGRES_PASSWORD` | Shared local PostgreSQL credentials |
| `POSTGRES_DEV_DB`, `POSTGRES_DEV_PORT`, `POSTGRES_DEV_VOLUME` | Development database |
| `POSTGRES_TEST_DB`, `POSTGRES_TEST_PORT`, `POSTGRES_TEST_VOLUME` | Separate test database |
| `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_LOCALE` | Application name and display language/locale |
| `NEXT_PUBLIC_TIMEZONE` | Required Guatemala timezone; also sets server and container timezones |
| `NEXT_PUBLIC_CURRENCY_SYMBOL` | Display symbol; does not convert monetary amounts |
| `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET` | Authentication origin and secret |
| `INITIAL_PASSWORD_CHARSET`, `INITIAL_PASSWORD_LENGTH` | Secure initial password generation |
| `SUPERADMIN_NAME`, `SUPERADMIN_EMAIL`, `SUPERADMIN_PASSWORD` | Initial administrator used by the seed |

Connection URLs are built from the PostgreSQL settings, including encoded credentials. There is no separate `DATABASE_URL` to keep synchronized. Development and test cannot target the same database. `APP_ENV` selects `development` or `test` through commands; leave it out of `.env`. Production database targets and production-specific scripts have been removed. Next.js still uses its standard production mode for `build` and `start`.

Public settings use explicit `NEXT_PUBLIC_` references as required by [Next.js environment variable handling](https://nextjs.org/docs/app/guides/environment-variables). Restart the dev server after changing `.env`; rebuild to change public settings in a built app.

## Fresh database setup

Run the following commands yourself, from the project root:

```sh
pnpm install

docker compose up -d

pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm db:check

pnpm dev
```

The configured volume names are new, so existing project data and its database-side migration journal remain untouched. If old containers already occupy the configured host ports, stop those containers or choose available host ports in `.env` before starting Compose. PostgreSQL database names and credentials only initialize an empty volume; changing them does not reconfigure an existing database.

The old SQL migrations, snapshots, and journal were removed from the repository. `db:generate` creates a new initial migration from the current schema. Do not create migration SQL manually. Review the generated migration before applying it.

| Command | Behavior |
| --- | --- |
| `pnpm db:generate` | Generate one shared migration history for the schema |
| `pnpm db:migrate` | Apply that history to development, then test |
| `pnpm db:push` | Push the schema to development, then test; alternative to migrations for disposable local databases |
| `pnpm db:seed` | Initialize permissions, system roles, administrator, expense categories, and payment methods in development only |
| `pnpm db:check` | Check the reported permission join in both databases without changing data |
| `pnpm db:studio` | Open Drizzle Studio for development |

Commands stop on the first failure. A successful update of development is not rolled back if test fails; fix the cause and rerun the command. For a single target, append `development` or `test`, for example `pnpm db:check test` or `pnpm db:studio test`. Do not run `db:push` before the initial `db:migrate` on the same fresh database.

`pnpm dev:test` runs the app against the test database without changing Next.js development mode. Use the administrator credentials in `.env` to sign in after seeding. Old browser sessions belong to the previous database; sign in again.

## Permission query troubleshooting

The reported SQL matches the current role/permission schema. The query alone does not identify the underlying PostgreSQL error. Run `pnpm db:check` to obtain it. Missing tables or columns require initializing the fresh schema; connection or authorization failures require checking `.env` and Docker. Permission failures remain errors and never grant access automatically.

## Verification

Only integration tests are configured. They use the separate test database and require its schema to be initialized first. Integration tests create and clean up their own fixture data when needed; never run the development seed against the test database. The permission schema check is read-only and does not need seeded data.

```sh
pnpm lint
pnpm typecheck
pnpm test:integration
```

`pnpm test`, `pnpm test:watch`, and `pnpm test:coverage` run integration tests. Function unit tests and the Playwright E2E setup have been removed.

After setup, manually verify sign-in, role/permission pages, user creation/password reset, client/service management, and appointment/deposit flows. Check English messages, Guatemala dates, and unchanged deposit amounts and payment behavior.
