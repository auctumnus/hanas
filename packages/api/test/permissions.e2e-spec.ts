import * as request from 'supertest'
import { makeTestingApp } from './makeTestingApp'
import { INestApplication } from '@nestjs/common'

const aaaLang = {
  id: 'aaa',
  name: 'aaaa',
  description: 'aaaaa',
}

describe('LangPermissionsController (e2e)', () => {
  let app: INestApplication
  let accessTokenAaa: string
  let accessTokenBbb: string

  const server = () => request(app.getHttpServer())

  beforeAll(async () => {
    app = await makeTestingApp()

    await app.init()
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
    await server().post('/user').send(aaa)
    accessTokenAaa = (await server().post('/user/aaa/session').send(aaa)).body
      .accessToken

    // make user bbb
    await server().post('/user').send(bbb)
    accessTokenBbb = (await server().post('/user/bbb/session').send(bbb)).body
      .accessToken

    // make lang aaa
    await server()
      .post('/lang')
      .set('Authorization', 'Bearer ' + accessTokenAaa)
      .send(aaaLang)
  })

  afterAll(async () => {
    await server()
      .delete('/lang/aaa')
      .set('Authorization', 'Bearer ' + accessTokenAaa)
      .send()
    await server()
      .delete('/user/aaa')
      .set('Authorization', 'Bearer ' + accessTokenAaa)
      .send()
    await server()
      .delete('/user/bbb')
      .set('Authorization', 'Bearer ' + accessTokenBbb)
      .send()
    await app.close()
  })

  const baseTestName = '/lang/:id/permissions'
  const userTestName = '/lang/:id/permissions/:username'

  const base = '/lang/aaa/permissions'
  const aaaPermissions = '/lang/aaa/permissions/aaa'
  const bbbPermissions = '/lang/aaa/permissions/bbb'

  it(`${baseTestName} (GET, 401)`, () => server().get(base).expect(401))

  it(`${baseTestName} (GET, 403)`, () =>
    server()
      .get(base)
      .set('Authorization', 'Bearer ' + accessTokenBbb)
      .expect(403))

  it(`${baseTestName} (GET, 200)`, () =>
    server()
      .get(base)
      .set('Authorization', 'Bearer ' + accessTokenAaa)
      .expect(200))

  it(`${baseTestName} (POST, 405)`, () =>
    server().post(base).send({ changeWords: true }).expect(405))

  it(`${userTestName} (GET, 401)`, () =>
    server().get(aaaPermissions).expect(401))

  it(`${userTestName} (GET, 403)`, () =>
    server()
      .get(aaaPermissions)
      .set('Authorization', 'Bearer ' + accessTokenBbb)
      .expect(403))

  it(`${userTestName} (GET, 200 w/ changePermissions)`, () =>
    server()
      .get(aaaPermissions)
      .set('Authorization', 'Bearer ' + accessTokenAaa)
      .expect(200))

  it(`${userTestName} (GET, 200, own perms)`, async () => {
    await server()
      .post(bbbPermissions)
      .set('Authorization', 'Bearer ' + accessTokenAaa)
      .send({ changeWords: true })
    await server()
      .get(bbbPermissions)
      .set('Authorization', 'Bearer ' + accessTokenBbb)
      .expect(200)
    await server()
      .delete(bbbPermissions)
      .set('Authorization', 'Bearer ' + accessTokenAaa)
      .send()
  })

  it(`${userTestName} (POST, 401)`, () =>
    server().post(aaaPermissions).send({ changeWords: true }).expect(401))

  it(`${userTestName} (POST, 403)`, () =>
    server()
      .post(aaaPermissions)
      .set('Authorization', 'Bearer ' + accessTokenBbb)
      .send({ changeWords: true })
      .expect(403))

  it(`${userTestName} (POST, 201)`, () =>
    server()
      .post(bbbPermissions)
      .set('Authorization', 'Bearer ' + accessTokenAaa)
      .send({ changeWords: true })
      .expect(201)
      .expect(({ body }) => body.changeWords === true)
      .expect(({ body }) => body.user.username === 'bbb'))

  it(`${userTestName} (PATCH, 401)`, () =>
    server().patch(bbbPermissions).send({ changeInfo: true }).expect(401))

  it(`${userTestName} (PATCH, 403)`, () =>
    server()
      .patch(bbbPermissions)
      .set('Authorization', 'Bearer ' + accessTokenBbb)
      .send({ changeInfo: true })
      .expect(403))

  it(`${userTestName} (PATCH, 200)`, () =>
    server()
      .patch(bbbPermissions)
      .set('Authorization', 'Bearer ' + accessTokenAaa)
      .send({ changeInfo: true })
      .expect(({ body }) => body.changeWords === true)
      .expect(({ body }) => body.changeWords === true)
      .expect(({ body }) => body.user.username === 'bbb'))

  it(`${userTestName} (DELETE, 401)`, () =>
    server().delete(bbbPermissions).expect(401))

  it(`${userTestName} (DELETE, 403)`, () =>
    server()
      .delete(bbbPermissions)
      .set('Authorization', 'Bearer ' + accessTokenBbb)
      .expect(403))

  it(`${userTestName} (DELETE, 200)`, () =>
    server()
      .delete(bbbPermissions)
      .set('Authorization', 'Bearer ' + accessTokenAaa)
      .expect(200))

  it(`${userTestName} (assigning permissions)`, async () => {
    await server()
      .post(bbbPermissions)
      .set('Authorization', 'Bearer ' + accessTokenAaa)
      .send({ changePermissions: true })
    await server().post('/user').send({
      username: 'ccc',
      password: '23j4h1!kjdfhjdk',
    })
    const accessTokenCcc = (
      await server().post('/user/ccc/session').send({
        username: 'ccc',
        password: '23j4h1!kjdfhjdk',
      })
    ).body.accessToken
    await server()
      .post('/lang/aaa/permissions/ccc')
      .set('Authorization', 'Bearer ' + accessTokenBbb)
      .send({ changeId: true })
      .expect(400)
    await server()
      .post('/lang/aaa/permissions/ccc')
      .set('Authorization', 'Bearer ' + accessTokenAaa)
      .send({ changeWords: true })
      .expect(201)
    await server()
      .patch('/lang/aaa/permissions/ccc')
      .set('Authorization', 'Bearer ' + accessTokenBbb)
      .send({ changeWords: false })
      .expect(400)
    await server()
      .delete('/user/ccc')
      .set('Authorization', 'Bearer ' + accessTokenCcc)
      .send()
      .expect(200)
  })
  it(`${userTestName} (transferring ownership)`, async () => {
    await server()
      .patch(bbbPermissions)
      .set('Authorization', 'Bearer ' + accessTokenAaa)
      .send({ owner: true })
      .expect(200)
    const [aaa, bbb] = (
      await server()
        .get('/lang/aaa/permissions')
        .set('Authorization', 'Bearer ' + accessTokenAaa)
        .send()
    ).body
    expect(aaa.owner).toBeFalsy()
    expect(bbb.owner).toBeTruthy()
    expect(bbb.changeId).toBeTruthy()
    expect(bbb.changeInfo).toBeTruthy()
    expect(bbb.changePermissions).toBeTruthy()
    expect(bbb.changeWords).toBeTruthy()
    expect(aaa.changeId).toBeTruthy()
    expect(aaa.changeInfo).toBeTruthy()
    expect(aaa.changePermissions).toBeTruthy()
    expect(aaa.changeWords).toBeTruthy()
  })
})
