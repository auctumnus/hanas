import request from 'supertest'
import { INestApplication } from '@nestjs/common'
import { getRequestUrl, makeTestingApp } from './makeTestingApp'

const aaaLang = {
  id: 'aaa',
  name: 'aaaa',
  description: 'aaaaa',
}

const feminine = {
  name: 'Feminine',
  abbreviation: 'f',
}

describe('WordClassController (e2e)', () => {
  let app: INestApplication
  let accessTokenAaa: string
  let accessTokenBbb: string

  const server = request(getRequestUrl())

  beforeAll(async () => {
    app = await makeTestingApp()

    // test user login details
    const aaa = {
      username: 'aaa',
      password: 'ep1cpassword!!!!!!!!!!!',
    }
    const bbb = {
      username: 'bbb',
      password: 'ep2cpassword!!!!!!!!!!!',
    }
    // make user aaa
    await server.post('/user').send(aaa)
    accessTokenAaa = (await server.post('/user/aaa/session').send(aaa)).body
      .accessToken

    // make user bbb
    await server.post('/user').send(bbb)
    accessTokenBbb = (await server.post('/user/bbb/session').send(bbb)).body
      .accessToken

    // make lang aaa
    await server
      .post('/lang')
      .set('Authorization', 'Bearer ' + accessTokenAaa)
      .send(aaaLang)

    // make noun pos
    await server
      .post('/lang/aaa/word-class')
      .set('Authorization', 'Bearer ' + accessTokenAaa)
      .send(feminine)
  })

  afterAll(async () => {
    await app.close()
  })

  const baseTestName = '/lang/:id/word-class'
  const abbrTestName = '/lang/:id/word-class/:abbreviation'

  const base = '/lang/aaa/word-class'

  it(`${baseTestName} (GET, 200)`, () =>
    server
      .get(base)
      .send()
      .expect(200)
      .expect(({ body }) => expect(body[0].internal_id).toBeUndefined())
      .expect(({ body }) => expect(body[0].name).toBe('Feminine'))
      .expect(({ body }) => expect(body[0].abbreviation).toBe('f')))

  it(`${baseTestName} (POST, 401)`, () =>
    server.post(base).send().expect(401))

  it(`${baseTestName} (POST, 409)`, () =>
    server
      .post(base)
      .set('Authorization', 'Bearer ' + accessTokenAaa)
      .send(feminine)
      .expect(409))

  it(`${baseTestName} (POST, 201)`, () =>
    server
      .post(base)
      .set('Authorization', 'Bearer ' + accessTokenAaa)
      .send({
        name: 'Neutral',
        abbreviation: 'n',
      })
      .expect(201))

  it(`${abbrTestName} (GET, 404)`, () =>
    server
      .get(base + '/qwew')
      .send()
      .expect(404))

  it(`${abbrTestName} (GET, 200)`, () =>
    server
      .get(base + '/f')
      .send()
      .expect(200)
      .expect(({ body }) => expect(body.internal_id).toBeUndefined())
      .expect(({ body }) => expect(body.name).toBe('Feminine'))
      .expect(({ body }) => expect(body.abbreviation).toBe('f')))

  const patchContent = { name: 'Female' }
  it(`${abbrTestName} (PATCH, 401)`, () =>
    server
      .patch(base + '/f')
      .send(patchContent)
      .expect(401))
  it(`${abbrTestName} (PATCH, 404)`, () =>
    server
      .patch(base + '/qwew')
      .set('Authorization', 'Bearer ' + accessTokenAaa)
      .send(patchContent)
      .expect(404))
  it(`${abbrTestName} (PATCH, 409)`, () =>
    server
      .patch(base + '/f')
      .set('Authorization', 'Bearer ' + accessTokenAaa)
      .send({ abbreviation: 'n' })
      .expect(409))
  it(`${abbrTestName} (PATCH, 200)`, () =>
    server
      .patch(base + '/f')
      .set('Authorization', 'Bearer ' + accessTokenAaa)
      .send(patchContent)
      .expect(200)
      .expect(({ body }) => expect(body.name).toBe(patchContent.name)))
  it(`${abbrTestName} (DELETE, 401)`, () =>
    server
      .delete(base + '/f')
      .send()
      .expect(401))

  it(`${abbrTestName} (DELETE, 404)`, () =>
    server
      .delete(base + '/rhej')
      .set('Authorization', 'Bearer ' + accessTokenAaa)
      .send()
      .expect(404))

  it(`${abbrTestName} (DELETE, 200)`, () =>
    server
      .delete(base + '/n')
      .set('Authorization', 'Bearer ' + accessTokenAaa)
      .send()
      .expect(200))
})
