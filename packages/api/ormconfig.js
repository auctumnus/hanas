// eslint-disable-next-line @typescript-eslint/no-var-requires
const { join } = require('path')
module.exports = {
  type: 'better-sqlite3',
  database: './db/hanas.db',
  entities: [join(__dirname, '/**/*.entity{.ts,.js}')],
  synchronize: true,
}
