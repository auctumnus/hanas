import request from 'supertest'
import { makeTestingApp, getRequestUrl } from './makeTestingApp'
import { INestApplication } from '@nestjs/common'
import { sign, decode } from 'jsonwebtoken'
import { REFRESH_JWT_SECRET } from '../src/constants'
describe('Authentication (e2e)', () => {
  let app: INestApplication
  const server = request(getRequestUrl())
  const otherUser = {
    username: 'ugjb',
    password: 'lkwaj#LKJ$#bl23kjd',
  }
  let otherAccessToken: string
  let session: any

  let payload: any

  let expiredAccess: string
  let modifiedAccess: string

  let expiredRefresh: string
  let modifiedRefresh: string

  beforeAll(async () => {
    app = await makeTestingApp()
    await server.post('/user').send(otherUser).expect(201)
    session = (
      await server.post('/user/ugjb/session').send(otherUser).expect(201)
    ).body
    otherAccessToken = session.accessToken
    payload = decode(session.refresh.refreshToken)
    expiredRefresh = sign(
      {
        ...payload,
        exp: 1613601023,
      },
      REFRESH_JWT_SECRET,
    )
    modifiedRefresh = sign(
      {
        ...payload,
        sub: 437,
      },
      REFRESH_JWT_SECRET,
    )
  })

  afterAll(async () => {
    await app.close()
  })

  it('/user/:username/session (POST, 404)', () =>
    server
      .post('/user/askd/session')
      .send({
        username: 'askd',
        password: 'kjdhfkj#HJK#h4kqjb',
      })
      .expect(404))

  it('/user/:username/session (POST, 403)', () =>
    server
      .post('/user/ugjb/session')
      .send({
        username: 'ugjb',
        password: 'ahkjhkj32h2kb#$',
      })
      .expect(403))

  it('/user/:username/session/refresh (POST, 401)', () =>
    server
      .post('/user/ugjb/session/refresh')
      .send({
        id: session.refresh.id,
        refreshToken: expiredRefresh,
      })
      .expect(401))

  it('/user/:username/session/refresh (POST, 400)', () =>
    server
      .post('/user/ugjb/session/refresh')
      .send({
        id: session.refresh.id,
        refreshToken: modifiedRefresh,
      })
      .expect(400))

  it('/user/:username/session/refresh (POST, 401)', () =>
    server
      .post('/user/ugjb/session/refresh')
      .send({
        id: session.refresh.id,
        refreshToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVnamIiLCJzdWIiOjEsImlhdCI6MTYxMzc5MDg0MiwiZXhwIjoxNTEzNzkxMTQyfQ.BwnMWrUU61-OO9HhqGmwfUQeDRhwtqQT_OOCZuzbySA',
      })
      .expect(400))

  it('/user/:username/session/refresh (POST, 404)', () =>
    server
      .post('/user/ugjb/session/refresh')
      .send({
        id: 'dskj3',
        refreshToken: session.refresh.refreshToken,
      })
      .expect(404))

  it('/user/:username/session/refresh (POST, 201)', () =>
    server
      .post('/user/ugjb/session/refresh')
      .send(session.refresh)
      .expect(201)
      .expect(({ body }) => {
        otherAccessToken = body.accessToken
      }))

  it('/user/:username/session (POST, 403)', async () => {
    await server
      .post('/user')
      .send({
        username: 'aca',
        password: 'ep1cpassword!!!!!!!!!!!',
      })
      .expect(201)

    await server.post('/user/aca/session').send(otherUser).expect(403)

    const { accessToken } = (
      await server.post('/user/aca/session').send({
        username: 'aca',
        password: 'ep1cpassword!!!!!!!!!!!',
      })
    ).body
    await server
      .delete('/user/aca')
      .set('Authorization', 'Bearer ' + accessToken)
      .send()
  })

  it('/user/:username/session (POST)', async () => {
    await server
      .post('/user')
      .send({
        username: 'aba',
        password: 'ep1cpassword!!!!!!!!!!!',
      })
      .expect(201)
    await server
      .post('/user/aba/session')
      .send({
        username: 'aba',
        password: 'ep1cpassword!!!!!!!!!!!',
      })
      .expect(201)
      .expect((res) => expect(res.body).toHaveProperty('user'))
      .expect((res) => expect(res.body).toHaveProperty('accessToken'))
      .expect((res) => expect(res.body).toHaveProperty('refresh'))
      .expect((res) => expect(res.body).toHaveProperty('refresh.refreshToken'))
      .expect((res) => expect(res.body).toHaveProperty('refresh.id'))
    const { accessToken } = (
      await server.post('/user/aba/session').send({
        username: 'aba',
        password: 'ep1cpassword!!!!!!!!!!!',
      })
    ).body
    await server
      .delete('/user/aba')
      .set('Authorization', 'Bearer ' + accessToken)
      .send()
  })

  it('/user/:username/session (GET)', async () => {
    await server
      .post('/user')
      .send({
        username: 'aaa',
        password: 'ep1cpassword!!!!!!!!!!!',
      })
      .expect(201)
    const { accessToken } = (
      await server.post('/user/aaa/session').send({
        username: 'aaa',
        password: 'ep1cpassword!!!!!!!!!!!',
      })
    ).body
    await server
      .get('/user/aaa/session')
      .set('Authorization', 'Bearer ' + accessToken)
      .expect(200)
      .expect((res) => expect(res.body).toHaveProperty('data'))
      .expect((res) => expect(res.body).toHaveProperty('cursor'))
      .expect((res) => expect(res.body.data[0]).toHaveProperty('id'))
      .expect((res) => expect(res.body.data[0]).toHaveProperty('os'))
      .expect((res) => expect(res.body.data[0]).toHaveProperty('browser'))
      .expect((res) => expect(res.body.data[0]).toHaveProperty('created'))
    await server
      .delete('/user/aaa')
      .set('Authorization', 'Bearer ' + accessToken)
      .send()
  })

  it('/user/:username/session (GET, 404)', () =>
    server
      .get('/user/ugfln/session')
      .set('Authorization', 'Bearer ' + otherAccessToken)
      .expect(404))
  it('/user/:username/session/:session (DELETE, 404)', () =>
    server
      .delete('/user/ugjb/session/sdfk')
      .set('Authorization', 'Bearer ' + otherAccessToken)
      .send()
      .expect(404))
  it('/user/:username/session/:session (DELETE)', () =>
    server
      .delete(`/user/ugjb/session/${session.refresh.id}`)
      .set('Authorization', 'Bearer ' + otherAccessToken)
      .send()
      .expect(200))
})
