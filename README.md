<h1 align="center">
   <a href="https://hanas.app">
      <img
           width="400px"
           src="https://raw.githubusercontent.com/auctumnus/hanas/main/assets/logo-with-text.svg"
      >
   </a>
   
   [![Better than CWS][better-than-cws-badge]][better-than-cws-link]
   [![Join our Discord][discord-badge]][discord-link]
   [![Docs for the Hanas api][docs-badge]][docs-link]
   
</h1>

Hanas is a conlanging tool and community, primarily inspired by the work of
[ConWorkShop][cws]. The backend is built using [Express][express] and
[Prisma][prisma]. It is frontend-agnostic, but the official frontend is a webapp
built using [Vue 3][vue].

## Use & Connect

Hanas doesn't have an official instance (yet!). In the meantime, you can contribute code here,
and discuss the project [in our discord][discord-link]! (For the privacy enthusiasts:
eventually an IRC might be set up or something? Sorry, Discord's easy to use.)

## Running

1. Grep through the project for `CHANGEME`. There are a few places where
   the default configuration has default passwords and such, and these need to be
   changed.

### Using Docker (the easy way)

Run `docker-compose up` in the project root. Configure access with nginx if
you should so desire.

### Do it yourself (the hard way)

Hanas is made of a few different services:

- the database
- the backend
- the frontend (optional)
- the announcements server (optional)
- the events server (optional)
- and [Kratos][kratos].

The frontend is _technically_ optional, but in practice you'll want to run a
frontend of some sort. The announcements and events servers are entirely optional,
but can provide a better experience for the frontend.

#### Database

I prefer [Postgres][postgres], and so things will probably work best with that;
however, any database supported by Prisma other than Mongo should work. If you want
to change the database type, change it in `schema.prisma`. See the Prisma documentation
for how to do all that.

Once you have the database running, build a connection URL for it to supply to
the backend.

#### Kratos

Kratos is the authentication solution. It's not perfect yet, but it provides
enough that reimplementing what it has would be a waste of time.
In my experience, Kratos has been slightly hellish to set up. We provide a known
working Kratos config for Hanas in the root of the repo under `kratos-config`.

Once you have Kratos set up, remember which host and ports it's running on. By
default with our config, it's `localhost:4433` and `localhost:4434`.

#### Backend

See the README in `packages/api`.

#### Frontend

See the README in `packages/web`.

#### Announcements server

This is optional. It allows people with access to the running server to post
announcements with a certain period of relevance - say, notify about community
events, maintenance times, etc. See the README in `packages/announcement-server`.

#### Event server

This is also optional. It allows users to receive WebSocket notifications about
language invitations, announcements from the announcement server, and optionally
provide a sort of "activity feed" which details current work being done using
the website. See the README in `packages/event-server`.

## License

Somewhat out of the ordinary: the [Non-Violent Public License][nvpl]. You can
treat this as a fairly standard copyleft license, save for the ethical
restrictions on usage. Given that this is a conlanging webapp, most of these
can likely safely be ignored by anyone simply running or using Hanas, save for

> ii. You do not use the Work for the purpose of Surveilling or
> tracking individuals for financial gain.

and

> viii. You do not use the Work to either Discriminate or spread Hate Speech on
> the basis of sex, sexual orientation, gender identity, race, age, disability,
> color, national origin, religion, caste, or lower economic status.

I trust anyone running a Hanas instance should have no issues following either
part of the license.

[logo-link]: https://raw.githubusercontent.com/auctumnus/hanas/main/assets/logo-with-text.svg
[discord-badge]: https://img.shields.io/discord/924860049048883251?style=flat-square
[discord-link]: https://discord.gg/a9TtsC9MtF
[docs-badge]: https://img.shields.io/badge/docs-for%20hanas-89bfcd?style=flat-square
[docs-link]: https://docs.hanas.app
[cws]: https://conworkshop.com
[better-than-cws-badge]: https://img.shields.io/badge/better%20than-cws-blue?style=flat-square
[better-than-cws-link]: https://www.youtube.com/watch?v=xmkifWcTXiI
[express]: https://expressjs.com
[prisma]: https://prisma.io
[vue]: https://vuejs.org
[nvpl]: https://thufie.lain.haus/NPL.html
[kratos]: https://ory.sh/kratos
[postgres]: https://www.postgresql.org
