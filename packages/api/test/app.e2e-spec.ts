import request from 'supertest'
import { INestApplication } from '@nestjs/common'
import { makeTestingApp, getRequestUrl } from './makeTestingApp'
import { version } from '../package.json'

describe('AppController (e2e)', () => {
  let app: INestApplication
  const server = request(getRequestUrl())
  beforeAll(async () => {
    app = await makeTestingApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('/ (GET)', () =>
    server
      .get('/')
      .expect(200)
      .expect((res) => {
        expect(res.body.version).toBe(version)
      }))
})
