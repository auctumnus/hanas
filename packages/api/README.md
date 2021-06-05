# Hanas

[![Snyk Vulnerabilities for GitHub Repo](https://img.shields.io/snyk/vulnerabilities/github/auctumnus/hanas?style=flat-square)](https://snyk.io)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/auctumnus/hanas/backend-ci?style=flat-square)](https://github.com/auctumnus/hanas/actions/workflows/node.js.yml)

This is the Hanas backend, built using [NestJS](https://nestjs.com).

## Installation

At the moment, Hanas uses [SQLite3](https://sqlite.org/index.html), so by default, no external database services need to be run, although this will likely change in the future.

Install the Node dependencies by running:

```bash
$ yarn
```

You will also need to supply [AWS S3](https://aws.amazon.com/s3/) credentials, and optionally a [Cloudfront](https://aws.amazon.com/cloudfront/) domain to use. Hanas will likely fit in the free tier, so you shouldn't need to worry about it.

## Configuration

The `.env.defaults` file holds many configuration options that you should explore. If you want to change any of them, then you can either add a .env file or use environment variables. The defaults are usually fine, although you will need to add your S3 credentials.

You may wish to edit the `ormconfig.json` to fit your particular database needs. Note that switching databases entirely will probably require you to install the relevant packages - see [typeorm](https://github.com/typeorm/typeorm) for more information on which databases are supported and which packages should be used.

## Running the app

```bash
# development
$ yarn start

# watch mode
$ yarn start:dev

# production mode
$ yarn start:prod

# run e2e tests
$ yarn test
```

Running tests shouldn't delete the database, but be wary about it.

## API Description

A preliminary description can be found at the [Github Pages site](https://auctumnus.github.io/hanas). Additional information on more complex topics can be found in the [wiki](https://github.com/auctumnus/hanas/wiki).
