import * as request from 'supertest'
import { INestApplication } from '@nestjs/common'
import { makeTestingApp } from './makeTestingApp'
import { version } from '../package.json'

describe('AppController (e2e)', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await makeTestingApp()
    await app.init()
  })

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect((res) => {
        expect(res.body.version).toBe(version)
      })
  })
})
