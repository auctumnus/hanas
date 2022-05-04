# Hanas Backend

This is the backend for Hanas.

## Running

### In Docker

See the root's README for the Docker means of setting this up.

### Manually

Ensure that `.env` is filled out to your liking. `.env.defaults`
shows the default values.

You'll probably want to figure out something with `nodemon` or
a systemd service setup for production, but

```sh
$ pnpm i
$ pnpm run build
$ pnpm run start
```

should be good enough.

## Hacking

We use Prisma for accessing the database since it's a fairly good
interface that doesn't require us to repeat ourselves across the
schema and typings.

We use Express as the actual webserver. I would love to move to
something slightly more lightweight but Polka is a mess.

Communication with Kratos is kept to `auth.ts` and `hooks.ts` and should be kept
as abstractions there. Kratos' official SDK sucks, so we just send
HTTP requests and hope the API doesn't shift under our feet.

The backend has a fairly clear organization to the code.

1. Each model is kept in a sub-folder.
2. Each model has four files:
   - dto.ts, which handles parsing the body of POSTs and PATCHes,
   - endpoints.ts, which handles routing and the logic of the
     endpoints for this model,
   - serialize.ts, which handles serialization of the model
     (in current cases, just removing some keys, but this
     is meant to be a little future-proof)
   - index.ts, which simply exports all of these.

The endpoints should be kept so that similar routes are kept together.

Better documentation of how to navigate this codebase should be written. Bother
Autumn if you need help, she'll be happy to help. (I'm third-person-ing myself!)
