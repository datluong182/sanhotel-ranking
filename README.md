## Description

[Data Platform](https://github.com/mikelhpdatke/data-platform) is open platform to scrap data from [booking.com](https://www.booking.com/) and save data to your personal database using NestJS, Postgresql, Prisma, Apify and [booking-scraper](https://github.com/mikelhpdatke/actor-booking-scraper) API.

## .env for test
DATABASE_URL=postgres://postgres:123qwe123@<localhost | ip>:5432/crawl_db?connection_limit=200
APIFY_KEY=apify_api_xGJfdAmgr2DnRmTmqGhMt3hhiV3rpS3qUi1l
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=123qwe123
DATABASE_DB=crawl_db
DATABASE_PORT=5432
DATABASE_HOST=<localhost | ip>


## Install Using NPM

```bash
$ npm install
```

## Running using Docker

```bash
# doker compose
$ docker-compose up -d
```

## Migration prisma

```bash
# migration db
$ npm run migrate-prisma
# generate client prisma
$ npm run generate-prisma

```


## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Swagger

```bash
  $ http://localhost:3000/api
```

## Stay in touch

- Author -
- Website -
- Twitter -

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
