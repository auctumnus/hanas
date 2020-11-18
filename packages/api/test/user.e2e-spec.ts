import * as request from 'supertest'
import { makeTestingApp } from './makeTestingApp'
import { INestApplication } from '@nestjs/common'

describe('UserController (e2e)', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await makeTestingApp()
    await app.init()
  })

  beforeEach(async () => {
    const uncleared = await request(app.getHttpServer()).get('/user')
    await Promise.all(
      uncleared.body.data.map(async (user) => {
        return request(app.getHttpServer()).delete(`/user/${user.username}`)
      }),
    )
  })

  afterAll(async () => {
    await app.close()
  })

  it('/user (POST)', async () => {
    return request(app.getHttpServer())
      .post('/user')
      .send({
        username: 'user',
        password: 'ep1cpassword!!!!!!!!!!!',
      })
      .expect((res) => expect(res.body.hasOwnProperty('password')).toBeFalsy())
      .expect((res) =>
        expect(res.body.hasOwnProperty('password_hash')).toBeFalsy(),
      )
  })

  it('/user (PATCH)', async () => {
    await request(app.getHttpServer())
      .post('/user')
      .send({
        username: 'user',
        password: 'ep1cpassword!!!!!!!!!!!',
      })
      .expect(201)
    return request(app.getHttpServer())
      .patch('/user/user')
      .send({
        password: 'ep2cpassword!!!!!!!!!!!!!!!',
      })
      .expect((res) => expect(res.body.hasOwnProperty('password')).toBeFalsy())
      .expect((res) =>
        expect(res.body.hasOwnProperty('password_hash')).toBeFalsy(),
      )
  })
})
