<div align="center">
	<br>
	<div>
		<img height="136" src="media/logo.svg" alt="hanas">
	</div>
	<br>
	<br>
	<br>
</div>

[![Snyk Vulnerabilities for GitHub Repo][snyk]](https://snyk.io)
[![Github Workflow Status for Backend][gh-badge-backend]][gh-workflow-backend]
[![Github Workflow Status for Frontend][gh-badge-frontend]][gh-workflow-frontend]
[![Better than CWS][better-than-cws-badge]][better-than-cws-link]

Hanas is a conlanging tool and community, primarily inspired by the work of
[Conworkshop][cws]. The backend is built with [Nest.js][nest], and the frontend
uses [Vue 3][vue] on top of [Vite][vite].

## Installing

Clone the repo, then use `yarn` to install dependencies:

```sh
$ git clone https://github.com/auctumnus/hanas.git && cd hanas

$ yarn
```

### Backend

The backend simply runs as an API with Node.

```sh
$ cd packages/api

$ yarn run build

$ yarn run start      # For playing around

$ yarn run start:prod # For production
```

### Frontend

The frontend is built into a static site, which can be hosted however you like.
If I had to choose a particular setup, I'd run the backend on a subdomain like
api.example.com and the frontend on example.com. 

```sh
$ cd packages/web

$ yarn run build                          # This puts the static site files in `dist`.

$ python -m http.server --directory dist  # This is just one way - for production,
                                          # you should do something better!
```

## Configuration

See the respective folders for the frontend and backend for how to configure them.

## License
[MIT][MIT].

[snyk]: https://img.shields.io/snyk/vulnerabilities/github/auctumnus/hanas?style=flat-square
[gh-badge-frontend]: https://img.shields.io/github/workflow/status/auctumnus/hanas/frontend-ci?label=web%20build&style=flat-square
[gh-workflow-frontend]: https://github.com/auctumnus/hanas/actions/workflows/frontend.yml
[gh-badge-backend]: https://img.shields.io/github/workflow/status/auctumnus/hanas/backend-ci?style=flat-square&label=api%20build
[gh-workflow-backend]: https://github.com/auctumnus/hanas/actions/workflows/node.js.yml
[better-than-cws-badge]: https://img.shields.io/badge/better%20than-cws-blue?style=flat-square
[better-than-cws-link]: https://www.youtube.com/watch?v=xmkifWcTXiI
[cws]: https://conworkshop.com
[nest]: https://nestjs.com
[vue]: https://vuejs.org
[vite]: https://vitejs.dev
[MIT]: https://github.com/auctumnus/hanas/blob/main/LICENSE
