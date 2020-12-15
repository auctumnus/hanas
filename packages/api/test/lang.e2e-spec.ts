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

describe('LangController (e2e)', () => {
  let app: INestApplication
  let accessToken: string

  const sendExampleLangs = async (app: INestApplication, number: number) => {
    for (let i = 0; i < number; i++) {
      await request(app.getHttpServer())
        .post('/lang')
        .set('Authorization', 'Bearer ' + accessToken)
        .send({
          id: `aa${String.fromCharCode(97 + i)}`,
          name: `aaa ${i}`,
          description: `description ${i}`,
        })
    }
  }

  const sendAaa = (app: INestApplication) =>
    request(app.getHttpServer())
      .post('/lang')
      .set('Authorization', 'Bearer ' + accessToken)
      .send(aaa)
      .expect(201)

  beforeAll(async () => {
    app = await makeTestingApp()
    await app.init()
    await request(app.getHttpServer()).post('/user').send({
      username: 'aaa',
      password: 'ep1cpassword!!!!!!!!!!!',
    })
    const session = (
      await request(app.getHttpServer()).post('/user/aaa/session').send({
        username: 'aaa',
        password: 'ep1cpassword!!!!!!!!!!!',
      })
    ).body
    accessToken = session.accessToken
  })

  beforeEach(async () => {
    const uncleared = await request(app.getHttpServer()).get('/lang')
    await Promise.all(
      uncleared.body.data.map(async (lang) => {
        return request(app.getHttpServer())
          .delete(`/lang/${lang.id}`)
          .set('Authorization', 'Bearer ' + accessToken)
      }),
    )
  })

  afterAll(async () => {
    await request(app.getHttpServer())
      .delete('/user/aaa')
      .set('Authorization', 'Bearer ' + accessToken)
      .send()
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

  it('/lang/ (GET, all)', async () => {
    await sendExampleLangs(app, 25)
    return request(app.getHttpServer())
      .get('/lang')
      .expect((res) => expect(res.body.data.length).toBe(25))
  })

  it('/lang (GET, limit 2)', async () => {
    await sendExampleLangs(app, 6)
    const first = (
      await request(app.getHttpServer())
        .get('/lang?limit=2')
        .expect((res) => expect(res.body.data.length).toBe(2))
        .expect((res) =>
          // since the example langs are 0-indexed and the first returned is
          // the last added
          expect(res.body.data[0].name.includes('5')).toBeTruthy(),
        )
    ).body

    return request(app.getHttpServer())
      .get(`/lang?limit=2&cursor=${first.cursor.afterCursor}`)
      .expect((res) => expect(res.body.data.length).toBe(2))
      .expect((res) => expect(res.body.data[0].name.includes('3')).toBeTruthy())
  })

  it('/lang (GET, invalid cursor)', async () => {
    return request(app.getHttpServer()).get('/lang?cursor=jdfkdjfk').expect(400)
  })

  it('/lang (GET, wrong property in cursor)', async () => {
    return request(app.getHttpServer())
      .get('/lang?cursor=bmFtZTphYWE=')
      .expect(400)
  })

  it('/lang (POST)', async () => {
    return request(app.getHttpServer())
      .post('/lang')
      .set('Authorization', 'Bearer ' + accessToken)
      .send(aaa)
      .expect(201)
      .expect((res) => expect(isAaa(res.body)).toBeTruthy)
  })

  it('/lang (POST, 409)', async () => {
    await sendAaa(app)
    return request(app.getHttpServer())
      .post('/lang')
      .set('Authorization', 'Bearer ' + accessToken)
      .send(aaa)
      .expect(409)
  })

  it('/lang (POST, 400, empty name)', async () => {
    return request(app.getHttpServer())
      .post('/lang')
      .set('Authorization', 'Bearer ' + accessToken)
      .send({ ...aaa, name: ' ' })
      .expect(400)
      .expect((res) =>
        expect(res.body.message).toContain(
          'name must be longer than or equal to 1 characters',
        ),
      )
  })

  it('/lang (POST, 400, invalid id)', async () => {
    return request(app.getHttpServer())
      .post('/lang')
      .set('Authorization', 'Bearer ' + accessToken)
      .send({ ...aaa, id: '123' })
      .expect(400)
  })

  it('/lang (POST, 400, id too short)', async () => {
    return request(app.getHttpServer())
      .post('/lang')
      .set('Authorization', 'Bearer ' + accessToken)
      .send({ ...aaa, id: 'a' })
      .expect(400)
  })

  it('/lang (POST, 400, id too long)', async () => {
    return request(app.getHttpServer())
      .post('/lang')
      .set('Authorization', 'Bearer ' + accessToken)
      .send({ ...aaa, id: 'aaaaaaaaaaa' })
      .expect(400)
  })

  it('/lang (POST, 400, name too long)', async () => {
    return request(app.getHttpServer())
      .post('/lang')
      .set('Authorization', 'Bearer ' + accessToken)
      .send({ ...aaa, name: 'a'.repeat(100) })
      .expect(400)
  })

  it('/lang/:id (PATCH)', async () => {
    await request(app.getHttpServer())
      .post('/lang')
      .set('Authorization', 'Bearer ' + accessToken)
      .send({ ...aaa, name: 'b' })
      .expect(201)
    return request(app.getHttpServer())
      .patch('/lang/aaa')
      .set('Authorization', 'Bearer ' + accessToken)
      .send({ name: 'aaa' })
      .expect(200)
      .expect((res) => expect(isAaa(res.body)).toBeTruthy)
  })

  it('/lang/:id (PATCH, 404)', async () => {
    return request(app.getHttpServer())
      .patch('/lang/aaa')
      .set('Authorization', 'Bearer ' + accessToken)
      .send({ name: 'aaa' })
      .expect(404)
  })

  it('/lang/:id (PATCH, 204)', async () => {
    await sendAaa(app)
    return request(app.getHttpServer())
      .patch('/lang/aaa')
      .set('Authorization', 'Bearer ' + accessToken)
      .send({ asdfgh: 'jkl' })
      .expect((res) =>
        expect(res.body.message).toBe('No valid parameters were provided.'),
      )
  })

  it('/lang/:id (PATCH, 409)', async () => {
    await sendAaa(app)
    await request(app.getHttpServer())
      .post('/lang')
      .set('Authorization', 'Bearer ' + accessToken)
      .send({ ...aaa, id: 'aab' })
      .expect(201)
    return request(app.getHttpServer())
      .patch('/lang/aab')
      .set('Authorization', 'Bearer ' + accessToken)
      .send({ id: 'aaa' })
      .expect(409)
  })

  it('/lang/:id (DELETE)', async () => {
    await sendAaa(app)
    return request(app.getHttpServer())
      .delete('/lang/aaa')
      .set('Authorization', 'Bearer ' + accessToken)
      .expect(200)
  })

  it('/lang/:id (DELETE, 404)', async () => {
    return request(app.getHttpServer())
      .delete('/lang/aaa')
      .set('Authorization', 'Bearer ' + accessToken)
      .expect(404)
  })
})
