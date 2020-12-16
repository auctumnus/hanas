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

  const server = () => request(app.getHttpServer())

  const sendExampleLangs = async (number: number) => {
    for (let i = 0; i < number; i++) {
      await server()
        .post('/lang')
        .set('Authorization', 'Bearer ' + accessToken)
        .send({
          id: `aa${String.fromCharCode(97 + i)}`,
          name: `aaa ${i}`,
          description: `description ${i}`,
        })
    }
  }

  const sendAaa = () =>
    server()
      .post('/lang')
      .set('Authorization', 'Bearer ' + accessToken)
      .send(aaa)
      .expect(201)

  beforeAll(async () => {
    app = await makeTestingApp()
    await app.init()
    await server().post('/user').send({
      username: 'aaa',
      password: 'ep1cpassword!!!!!!!!!!!',
    })
    const session = (
      await server().post('/user/aaa/session').send({
        username: 'aaa',
        password: 'ep1cpassword!!!!!!!!!!!',
      })
    ).body
    accessToken = session.accessToken
  })

  beforeEach(async () => {
    const uncleared = await server().get('/lang')
    await Promise.all(
      uncleared.body.data.map(async (lang) => {
        return server()
          .delete(`/lang/${lang.id}`)
          .set('Authorization', 'Bearer ' + accessToken)
      }),
    )
  })

  afterAll(async () => {
    await server()
      .delete('/user/aaa')
      .set('Authorization', 'Bearer ' + accessToken)
      .send()
    await app.close()
  })

  it('/lang/:id (GET)', async () => {
    await sendAaa()
    return server()
      .get('/lang/aaa')
      .expect(200)
      .expect((res) => expect(isAaa(res.body)).toBeTruthy)
      .expect((res) => expect(res.body.internal_id).toBeUndefined())
  })

  it('/lang/:id (GET, 404)', () => server().get('/lang/aaa').expect(404))

  it('/lang/ (GET, all)', async () => {
    await sendExampleLangs(25)
    return server()
      .get('/lang')
      .expect((res) => expect(res.body.data.length).toBe(25))
  })

  it('/lang (GET, limit 2)', async () => {
    await sendExampleLangs(6)
    const first = (
      await server()
        .get('/lang?limit=2')
        .expect((res) => expect(res.body.data.length).toBe(2))
        .expect((res) =>
          // since the example langs are 0-indexed and the first returned is
          // the last added
          expect(res.body.data[0].name.includes('5')).toBeTruthy(),
        )
    ).body

    return server()
      .get(`/lang?limit=2&cursor=${first.cursor.afterCursor}`)
      .expect((res) => expect(res.body.data.length).toBe(2))
      .expect((res) => expect(res.body.data[0].name.includes('3')).toBeTruthy())
  })

  it('/lang (GET, invalid cursor)', () =>
    server().get('/lang?cursor=jdfkdjfk').expect(400))

  it('/lang (GET, wrong property in cursor)', () =>
    server().get('/lang?cursor=bmFtZTphYWE=').expect(400))

  it('/lang (POST)', () =>
    server()
      .post('/lang')
      .set('Authorization', 'Bearer ' + accessToken)
      .send(aaa)
      .expect(201)
      .expect(({ body }) => expect(isAaa(body)).toBeTruthy))

  it('/lang (POST, 409)', async () => {
    await sendAaa()
    return server()
      .post('/lang')
      .set('Authorization', 'Bearer ' + accessToken)
      .send(aaa)
      .expect(409)
  })

  it('/lang (POST, 400, empty name)', () =>
    server()
      .post('/lang')
      .set('Authorization', 'Bearer ' + accessToken)
      .send({ ...aaa, name: ' ' })
      .expect(400)
      .expect(({ body }) =>
        expect(body.message).toContain(
          'name must be longer than or equal to 1 characters',
        ),
      ))

  it('/lang (POST, 400, invalid id)', () =>
    server()
      .post('/lang')
      .set('Authorization', 'Bearer ' + accessToken)
      .send({ ...aaa, id: '123' })
      .expect(400))

  it('/lang (POST, 400, id too short)', () =>
    server()
      .post('/lang')
      .set('Authorization', 'Bearer ' + accessToken)
      .send({ ...aaa, id: 'a' })
      .expect(400))

  it('/lang (POST, 400, id too long)', () =>
    server()
      .post('/lang')
      .set('Authorization', 'Bearer ' + accessToken)
      .send({ ...aaa, id: 'aaaaaaaaaaa' })
      .expect(400))

  it('/lang (POST, 400, name too long)', () =>
    server()
      .post('/lang')
      .set('Authorization', 'Bearer ' + accessToken)
      .send({ ...aaa, name: 'a'.repeat(100) })
      .expect(400))

  it('/lang/:id (PATCH)', async () => {
    await server()
      .post('/lang')
      .set('Authorization', 'Bearer ' + accessToken)
      .send({ ...aaa, name: 'b' })
      .expect(201)
    return server()
      .patch('/lang/aaa')
      .set('Authorization', 'Bearer ' + accessToken)
      .send({ name: 'aaa' })
      .expect(200)
      .expect((res) => expect(isAaa(res.body)).toBeTruthy)
  })

  it('/lang/:id (PATCH, 401)', async () => {
    const bbb = {
      username: 'bbb',
      password: 'dfjkhdfhd!1kjhhg',
    }
    await server().post('/user').send(bbb)
    const bbbAccessToken = (await server().post('/user/bbb/session').send(bbb))
      .body.accessToken
    await sendAaa()
    await server()
      .post('/lang/aaa/permissions/bbb')
      .set('Authorization', 'Bearer ' + accessToken)
      .send({ changeInfo: true })
    await server()
      .patch('/lang/aaa')
      .set('Authorization', 'Bearer ' + bbbAccessToken)
      .send({ id: 'bbb' })
      .expect(401)
    await server()
      .delete('/user/bbb')
      .set('Authorization', 'Bearer ' + bbbAccessToken)
      .send()
  })

  it('/lang/:id (PATCH, 404)', () =>
    server()
      .patch('/lang/aaa')
      .set('Authorization', 'Bearer ' + accessToken)
      .send({ name: 'aaa' })
      .expect(404))

  it('/lang/:id (PATCH, 204)', async () => {
    await sendAaa()
    return server()
      .patch('/lang/aaa')
      .set('Authorization', 'Bearer ' + accessToken)
      .send({ asdfgh: 'jkl' })
      .expect((res) =>
        expect(res.body.message).toBe('No valid parameters were provided.'),
      )
  })

  it('/lang/:id (PATCH, 409)', async () => {
    await sendAaa()
    await server()
      .post('/lang')
      .set('Authorization', 'Bearer ' + accessToken)
      .send({ ...aaa, id: 'aab' })
      .expect(201)
    return server()
      .patch('/lang/aab')
      .set('Authorization', 'Bearer ' + accessToken)
      .send({ id: 'aaa' })
      .expect(409)
  })

  it('/lang/:id (DELETE)', async () => {
    await sendAaa()
    return server()
      .delete('/lang/aaa')
      .set('Authorization', 'Bearer ' + accessToken)
      .expect(200)
  })

  it('/lang/:id (DELETE, 404)', () =>
    server()
      .delete('/lang/aaa')
      .set('Authorization', 'Bearer ' + accessToken)
      .expect(404))
})
