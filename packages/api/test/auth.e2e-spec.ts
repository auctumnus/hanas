import request from 'supertest'
import { makeTestingApp, getRequestUrl } from './makeTestingApp'
import { INestApplication } from '@nestjs/common'

describe('Authentication (e2e)', () => {
  let app: INestApplication
  const server = request(getRequestUrl())

  beforeAll(async () => {
    app = await makeTestingApp()
  })

  beforeEach(async () => {
    const uncleared = await request(app.getHttpServer()).get('/user')
    await Promise.all(
      uncleared.body.data.map(async (user: any) => {
        return request(app.getHttpServer()).delete(`/user/${user.username}`)
      }),
    )
  })

  afterAll(async () => {
    await app.close()
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
        username: 'aaa',
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
})
