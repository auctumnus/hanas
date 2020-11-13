# Hanas
Hanas is a webapp and community built for conlanging. It is primarily inspired by the work of [ConWorkShop](https://conworkshop.com). The backend here is built using [NestJS](https://nestjs.com).

## Installation

At the moment, Hanas uses SQLite3, so by default, no external database services need to be run, although this will likely change in the future.
```bash
$ npm install
```

## Configuration
You may wish to edit the `ormconfig.json` to fit your particular database needs. Note that switching databases entirely will probably require you to install the relevant packages - see [typeorm](https://github.com/typeorm/typeorm) for more information on which databases are supported and which packages should be used.

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod

# run e2e tests
$ npm run test
```

Note that running tests will wipe the current database!

## API Description

wip
