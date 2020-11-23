import * as request from 'supertest'
import { makeTestingApp } from './makeTestingApp'
import { INestApplication } from '@nestjs/common'

describe('Authentication (e2e)', () => {
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

  it('/user/:username/session (POST)', async () => {
    await request(app.getHttpServer())
      .post('/user')
      .send({
        username: 'aaa',
        password: 'ep1cpassword!!!!!!!!!!!',
      })
      .expect(201)
    return request(app.getHttpServer())
      .post('/user/aaa/session')
      .send({
        username: 'aaa',
        password: 'ep1cpassword!!!!!!!!!!!',
      })
      .expect(201)
      .expect((res) => expect(res.body).toHaveProperty('user'))
      .expect((res) => expect(res.body).toHaveProperty('accessToken'))
      .expect((res) => expect(res.body).toHaveProperty('refresh'))
      .expect((res) => expect(res.body).toHaveProperty('refresh.refreshToken'))
      .expect((res) => expect(res.body).toHaveProperty('refresh.id'))
  })

  it('/user/:username/session (GET)', async () => {
    await request(app.getHttpServer())
      .post('/user')
      .send({
        username: 'aaa',
        password: 'ep1cpassword!!!!!!!!!!!',
      })
      .expect(201)
    const { accessToken } = (
      await request(app.getHttpServer()).post('/user/aaa/session').send({
        username: 'aaa',
        password: 'ep1cpassword!!!!!!!!!!!',
      })
    ).body
    return request(app.getHttpServer())
      .get('/user/aaa/session')
      .set('Authorization', 'Bearer ' + accessToken)
      .expect(200)
      .expect((res) => expect(res.body).toHaveProperty('data'))
      .expect((res) => expect(res.body).toHaveProperty('cursor'))
      .expect((res) => expect(res.body.data[0]).toHaveProperty('id'))
      .expect((res) => expect(res.body.data[0]).toHaveProperty('os'))
      .expect((res) => expect(res.body.data[0]).toHaveProperty('browser'))
      .expect((res) => expect(res.body.data[0]).toHaveProperty('created'))
  })
})
