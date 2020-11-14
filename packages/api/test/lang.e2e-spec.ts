import * as request from 'supertest'
import { makeTestingApp } from './makeTestingApp'
import { INestApplication } from '@nestjs/common'

const aaa = {
  id: 'aaa',
  name: 'aaaa',
  description: 'aaaaa',
}

const isAaa = (res: unknown) => {
  if (!res) return false
  for (const key of Object.keys(aaa)) {
    if (!res.hasOwnProperty(key)) return false
    if (res[key] !== aaa[key]) return false
  }
  return true
}

const sendAaa = (app: INestApplication) =>
  request(app.getHttpServer()).post('/lang').send(aaa).expect(201)

describe('LangController (e2e)', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await makeTestingApp()
    await app.init()
  })

  beforeEach(async () => {
    const uncleared = await request(app.getHttpServer()).get('/lang')
    await Promise.all(
      uncleared.body.map(async (lang) => {
        return request(app.getHttpServer()).delete(`/lang/${lang.id}`)
      }),
    )
  })

  afterAll(async () => {
    await app.close()
  })

  it('/lang/:id (GET)', async () => {
    await sendAaa(app)
    return request(app.getHttpServer())
      .get('/lang/aaa')
      .expect(200)
      .expect((res) => expect(isAaa(res.body)).toBeTruthy)
      .expect((res) => expect(res.body.internal_id).toBeUndefined())
  })

  it('/lang/:id (GET, 404)', async () => {
    return request(app.getHttpServer()).get('/lang/aaa').expect(404)
  })

  it('/lang/ (GET)', async () => {
    await sendAaa(app)
    return request(app.getHttpServer())
      .get('/lang/')
      .expect(200)
      .expect((res) => expect(isAaa(res.body[0])).toBeTruthy)
  })

  it('/lang (POST)', async () => {
    return request(app.getHttpServer())
      .post('/lang')
      .send(aaa)
      .expect(201)
      .expect((res) => expect(isAaa(res.body)).toBeTruthy)
  })

  it('/lang (POST, 409)', async () => {
    await sendAaa(app)
    return request(app.getHttpServer()).post('/lang').send(aaa).expect(409)
  })

  it('/lang/:id (PATCH)', async () => {
    await request(app.getHttpServer())
      .post('/lang')
      .send({ ...aaa, name: 'b' })
      .expect(201)
    return request(app.getHttpServer())
      .patch('/lang/aaa')
      .send({ name: 'aaa' })
      .expect(200)
      .expect((res) => expect(isAaa(res.body)).toBeTruthy)
  })

  it('/lang/:id (PATCH, 404)', async () => {
    return request(app.getHttpServer())
      .patch('/lang/aaa')
      .send({ name: 'aaa' })
      .expect(404)
  })

  it('/lang/:id (PATCH, 204)', async () => {
    await sendAaa(app)
    return request(app.getHttpServer())
      .patch('/lang/aaa')
      .send({ asdfgh: 'jkl' })
      .expect((res) =>
        expect(res.body.message).toBe('No valid parameters were provided.'),
      )
  })

  it('/lang/:id (DELETE)', async () => {
    await sendAaa(app)
    return request(app.getHttpServer()).delete('/lang/aaa').expect(200)
  })

  it('/lang/:id (DELETE, 404)', async () => {
    return request(app.getHttpServer()).delete('/lang/aaa').expect(404)
  })
})
