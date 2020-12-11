import * as request from 'supertest'
import { makeTestingApp } from './makeTestingApp'
import { INestApplication } from '@nestjs/common'

describe('UserController (e2e)', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await makeTestingApp()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('/user (POST)', async () => {
    await request(app.getHttpServer())
      .post('/user')
      .send({
        username: 'user',
        password: 'ep1cpassword!!!!!!!!!!!',
      })
      .expect((res) => expect(res.body.hasOwnProperty('password')).toBeFalsy())
      .expect((res) =>
        expect(res.body.hasOwnProperty('password_hash')).toBeFalsy(),
      )
    const { accessToken } = (
      await request(app.getHttpServer()).post('/user/user/session').send({
        username: 'user',
        password: 'ep1cpassword!!!!!!!!!!!',
      })
    ).body
    await request(app.getHttpServer())
      .delete('/user/user')
      .set('Authorization', 'Bearer ' + accessToken)
      .send()
  })

  it('/user (PATCH)', async () => {
    await request(app.getHttpServer())
      .post('/user')
      .send({
        username: 'user',
        password: 'ep1cpassword!!!!!!!!!!!',
      })
      .expect(201)
    const { accessToken } = (
      await request(app.getHttpServer()).post('/user/user/session').send({
        username: 'user',
        password: 'ep1cpassword!!!!!!!!!!!',
      })
    ).body
    await request(app.getHttpServer())
      .patch('/user/user')
      .set('Authorization', 'Bearer ' + accessToken)
      .send({
        password: 'ep2cpassword!!!!!!!!!!!!!!!',
      })
      .expect((res) => expect(res.body.hasOwnProperty('password')).toBeFalsy())
      .expect((res) =>
        expect(res.body.hasOwnProperty('password_hash')).toBeFalsy(),
      )
    await request(app.getHttpServer())
      .delete('/user/user')
      .set('Authorization', 'Bearer ' + accessToken)
      .send()
  })
})
