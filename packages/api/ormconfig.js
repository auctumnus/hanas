// eslint-disable-next-line @typescript-eslint/no-var-requires
const { join } = require('path')
const isTest = process.env.NODE_ENV === 'test'
const entities = isTest
  ? join(__dirname, '/**/*.entity{.ts,.js}')
  : 'dist/**/*.entity{.ts,.js}'
module.exports = {
  type: 'better-sqlite3',
  database: './db/hanas.db',
  entities: [entities],
  synchronize: true,
}
