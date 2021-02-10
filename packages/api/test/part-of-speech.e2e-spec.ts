import request from 'supertest'
import { INestApplication } from '@nestjs/common'
import { makeTestingApp, getRequestUrl } from './makeTestingApp'

const aaaLang = {
  id: 'aaa',
  name: 'aaaa',
  description: 'aaaaa',
}

const noun = {
  name: 'Noun',
  abbreviation: 'n',
}

describe('PartOfSpeechController (e2e)', () => {
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
      .post('/lang/aaa/part-of-speech')
      .set('Authorization', 'Bearer ' + accessTokenAaa)
      .send(noun)
  })

  afterAll(async () => {
    await app.close()
  })

  const baseTestName = '/lang/:id/part-of-speech'
  const abbrTestName = '/lang/:id/part-of-speech/:abbreviation'

  const base = '/lang/aaa/part-of-speech'

  it(`${baseTestName} (GET, 200)`, () =>
    server
      .get(base)
      .send()
      .expect(200)
      .expect(({ body }) => expect(body[0].internal_id).toBeUndefined())
      .expect(({ body }) => expect(body[0].name).toBe('Noun'))
      .expect(({ body }) => expect(body[0].abbreviation).toBe('n')))

  it(`${baseTestName} (POST, 401)`, () =>
    server.post(base).send().expect(401))

  it(`${baseTestName} (POST, 409)`, () =>
    server
      .post(base)
      .set('Authorization', 'Bearer ' + accessTokenAaa)
      .send(noun)
      .expect(409))

  it(`${baseTestName} (POST, 201)`, () =>
    server
      .post(base)
      .set('Authorization', 'Bearer ' + accessTokenAaa)
      .send({
        name: 'Verb',
        abbreviation: 'v',
      })
      .expect(201))

  it(`${abbrTestName} (GET, 404)`, () =>
    server
      .get(base + '/qwew')
      .send()
      .expect(404))

  it(`${abbrTestName} (GET, 200)`, () =>
    server
      .get(base + '/n')
      .send()
      .expect(200)
      .expect(({ body }) => expect(body.internal_id).toBeUndefined())
      .expect(({ body }) => expect(body.name).toBe('Noun'))
      .expect(({ body }) => expect(body.abbreviation).toBe('n')))

  const patchContent = { name: 'Nominal' }
  it(`${abbrTestName} (PATCH, 401)`, () =>
    server
      .patch(base + '/n')
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
      .patch(base + '/n')
      .set('Authorization', 'Bearer ' + accessTokenAaa)
      .send({ abbreviation: 'v' })
      .expect(409))
  it(`${abbrTestName} (PATCH, 200)`, () =>
    server
      .patch(base + '/n')
      .set('Authorization', 'Bearer ' + accessTokenAaa)
      .send(patchContent)
      .expect(200)
      .expect(({ body }) => expect(body.name).toBe(patchContent.name)))
  it(`${abbrTestName} (DELETE, 401)`, () =>
    server
      .delete(base + '/n')
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
      .delete(base + '/v')
      .set('Authorization', 'Bearer ' + accessTokenAaa)
      .send()
      .expect(200))
})
