import request from 'supertest'
import { getRequestUrl, makeTestingApp } from './makeTestingApp'
import { INestApplication } from '@nestjs/common'

describe('UserController (e2e)', () => {
  let app: INestApplication

  const server = request(getRequestUrl())

  beforeAll(async () => {
    app = await makeTestingApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('/user (POST)', async () => {
    await server
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
      await server.post('/user/user/session').send({
        username: 'user',
        password: 'ep1cpassword!!!!!!!!!!!',
      })
    ).body
    await server
      .delete('/user/user')
      .set('Authorization', 'Bearer ' + accessToken)
      .send()
  })

  it('/user (PATCH)', async () => {
    await server
      .post('/user')
      .send({
        username: 'user',
        password: 'ep1cpassword!!!!!!!!!!!',
      })
      .expect(201)
    const { accessToken } = (
      await server.post('/user/user/session').send({
        username: 'user',
        password: 'ep1cpassword!!!!!!!!!!!',
      })
    ).body
    await server
      .patch('/user/user')
      .set('Authorization', 'Bearer ' + accessToken)
      .send({
        password: 'ep2cpassword!!!!!!!!!!!!!!!',
      })
      .expect((res) => expect(res.body.hasOwnProperty('password')).toBeFalsy())
      .expect((res) =>
        expect(res.body.hasOwnProperty('password_hash')).toBeFalsy(),
      )
    await server
      .delete('/user/user')
      .set('Authorization', 'Bearer ' + accessToken)
      .send()
  })
})
