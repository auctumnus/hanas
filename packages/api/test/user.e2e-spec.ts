import request from 'supertest'
import { getRequestUrl, makeTestingApp } from './makeTestingApp'
import { INestApplication } from '@nestjs/common'
import fetch from 'node-fetch'
import { imageSize } from 'image-size'

describe('UserController (e2e)', () => {
  let app: INestApplication
  let aaaAccessToken: string
  let aaa = {
    username: 'aaa',
    password: 'ep7cpahsgpasd@#!@#@#$',
  }
  let otherUser = {
    username: 'sdkj',
    password: '32lkj42!@$!(*@#',
  }
  let otherAccessToken: string
  const server = request(getRequestUrl())

  beforeAll(async () => {
    app = await makeTestingApp()

    await server.post('/user').send(aaa).expect(201)
    aaaAccessToken = (await server.post('/user/aaa/session').send(aaa)).body
      .accessToken

    await server.post('/user').send(otherUser).expect(201)
    otherAccessToken = (await server.post('/user/sdkj/session').send(otherUser))
      .body.accessToken
  })

  afterAll(async () => {
    await app.close()
  })

  it('/user (GET)', () => server.get('/user').send().expect(200))

  it('/user/:id (GET)', () => server.get('/user/aaa').send().expect(200))

  it('/user/:id (GET, 404)', () => server.get('/user/mm').send().expect(404))

  it('/user (POST)', async () => {
    await server
      .post('/user')
      .send({
        username: 'user',
        password: 'ep1cpassword!!!!!!!!!!!',
      })
      .expect(201)
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

  it('/user (POST, 400, no password)', async () =>
    server.post('/user').send({ username: 'fdk' }).expect(400))

  it('/user/:id (PATCH)', async () => {
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

  it('/user/:id (PATCH, 401)', async () =>
    server.patch('/user/aaa').send().expect(401))
  it('/user/:id (PATCH, 403)', async () =>
    server
      .patch('/user/aaa')
      .set('Authorization', 'Bearer ' + otherAccessToken)
      .send()
      .expect(403))
  it('/user/:id (PATCH, 404)', async () =>
    server
      .patch('/user/sdfkj')
      .set('Authorization', 'Bearer ' + otherAccessToken)
      .send()
      .expect(404))

  it('/user/:id/profile-picture (GET)', () =>
    server.get('/user/aaa/profile-picture').send().expect(200))

  it('/user/:id/profile-picture (GET, 404)', () =>
    server.get('/user/sdlf/profile-picture').send().expect(404))

  it('/user/:id/profile-picture (POST)', () =>
    server
      .post('/user/aaa/profile-picture')
      .set('Authorization', 'Bearer ' + aaaAccessToken)
      .attach('profile-picture', 'test/media/pfp-400px.png')
      .expect(201)
      .expect(async ({ body }) => {
        const { profile_picture } = body
        const pfp = await (await fetch(profile_picture)).buffer()
        const { width, height } = imageSize(pfp)
        expect(width).toBe(400)
        expect(height).toBe(400)
      }))

  it('/user/:id/profile-picture (POST, no image)', () =>
    server
      .post('/user/aaa/profile-picture')
      .set('Authorization', 'Bearer ' + aaaAccessToken)
      .send()
      .expect(400))

  it('/user/:id/profile-picture (POST, 401)', () =>
    server.post('/user/bbb/profile-picture').send().expect(401))

  it('/user/:id/profile-picture (POST, 403)', () =>
    server
      .post('/user/aaa/profile-picture')
      .set('Authorization', 'Bearer ' + otherAccessToken)
      .send()
      .expect(403))

  it('/user/:id/profile-picture (POST, 404)', () =>
    server
      .post('/user/bbb/profile-picture')
      .set('Authorization', 'Bearer ' + aaaAccessToken)
      .send()
      .expect(404))

  it('/user/:id/profile-picture (PATCH)', () =>
    server
      .patch('/user/aaa/profile-picture')
      .set('Authorization', 'Bearer ' + aaaAccessToken)
      .attach('profile-picture', 'test/media/pfp-500px.png')
      .expect(200)
      .expect(async ({ body }) => {
        const { profile_picture } = body
        const pfp = await (await fetch(profile_picture)).buffer()
        const { width, height } = imageSize(pfp)
        expect(width).toBe(400)
        expect(height).toBe(400)
      }))

  it('/user/:id/profile-picture (PATCH, 401)', () =>
    server.patch('/user/bbb/profile-picture').send().expect(401))

  it('/user/:id/profile-picture (PATCH, 403)', () =>
    server
      .patch('/user/aaa/profile-picture')
      .set('Authorization', 'Bearer ' + otherAccessToken)
      .send()
      .expect(403))

  it('/user/:id/profile-picture (PATCH, 404)', () =>
    server
      .patch('/user/bbb/profile-picture')
      .set('Authorization', 'Bearer ' + aaaAccessToken)
      .send()
      .expect(404))

  it('/user/:id/profile-picture (PATCH, weird size)', () =>
    server
      .patch('/user/aaa/profile-picture')
      .set('Authorization', 'Bearer ' + aaaAccessToken)
      .attach('profile-picture', 'test/media/pfp-weird-size.png')
      .expect(200)
      .expect(async ({ body }) => {
        const { profile_picture } = body
        const pfp = await (await fetch(profile_picture)).buffer()
        const { width, height } = imageSize(pfp)
        expect(width).toBe(400)
        expect(height).toBe(400)
      }))

  it('/user/:id/profile-picture (DELETE)', () =>
    server
      .delete('/user/aaa/profile-picture')
      .set('Authorization', 'Bearer ' + aaaAccessToken)
      .send()
      .expect(200))

  it('/user/:id/profile-picture (DELETE, 401)', () =>
    server.delete('/user/aaa/profile-picture').send().expect(401))

  it('/user/:id/profile-picture (DELETE, 403)', () =>
    server
      .delete('/user/aaa/profile-picture')
      .set('Authorization', 'Bearer ' + otherAccessToken)
      .send()
      .expect(403))

  it('/user/:id/profile-picture (DELETE, 404)', () =>
    server
      .delete('/user/skdjf/profile-picture')
      .set('Authorization', 'Bearer ' + otherAccessToken)
      .send()
      .expect(404))
  // banner
  it('/user/:id/banner (GET)', () =>
    server.get('/user/aaa/banner').send().expect(200))

  it('/user/:id/banner (GET, 404)', () =>
    server.get('/user/sdlf/banner').send().expect(404))

  it('/user/:id/banner (POST)', () =>
    server
      .post('/user/aaa/banner')
      .set('Authorization', 'Bearer ' + aaaAccessToken)
      .attach('banner', 'test/media/banner-1500x500px.png')
      .expect(201)
      .expect(async ({ body }) => {
        const { banner } = body
        const bannerBuffer = await (await fetch(banner)).buffer()
        const { width, height } = imageSize(bannerBuffer)
        expect(width).toBe(1500)
        expect(height).toBe(500)
      }))

  it('/user/:id/banner (POST, no image)', () =>
    server
      .post('/user/aaa/banner')
      .set('Authorization', 'Bearer ' + aaaAccessToken)
      .send()
      .expect(400))

  it('/user/:id/banner (POST, 401)', () =>
    server.post('/user/bbb/banner').send().expect(401))

  it('/user/:id/banner (POST, 403)', () =>
    server
      .post('/user/aaa/banner')
      .set('Authorization', 'Bearer ' + otherAccessToken)
      .send()
      .expect(403))

  it('/user/:id/banner (POST, 404)', () =>
    server
      .post('/user/bbb/banner')
      .set('Authorization', 'Bearer ' + aaaAccessToken)
      .send()
      .expect(404))

  it('/user/:id/banner (PATCH)', () =>
    server
      .patch('/user/aaa/banner')
      .set('Authorization', 'Bearer ' + aaaAccessToken)
      .attach('banner', 'test/media/banner-1500x600px.png')
      .expect(200)
      .expect(async ({ body }) => {
        const { banner } = body
        const bannerBuffer = await (await fetch(banner)).buffer()
        const { width, height } = imageSize(bannerBuffer)
        expect(width).toBe(1500)
        expect(height).toBe(500)
      }))

  it('/user/:id/banner (PATCH, 401)', () =>
    server.patch('/user/bbb/banner').send().expect(401))

  it('/user/:id/banner (PATCH, 403)', () =>
    server
      .patch('/user/aaa/banner')
      .set('Authorization', 'Bearer ' + otherAccessToken)
      .send()
      .expect(403))

  it('/user/:id/banner (PATCH, 404)', () =>
    server
      .patch('/user/bbb/banner')
      .set('Authorization', 'Bearer ' + aaaAccessToken)
      .send()
      .expect(404))

  it('/user/:id/banner (PATCH, weird size)', () =>
    server
      .patch('/user/aaa/banner')
      .set('Authorization', 'Bearer ' + aaaAccessToken)
      .attach('banner', 'test/media/banner-weird-size.png')
      .expect(200)
      .expect(async ({ body }) => {
        const { banner } = body
        const bannerBuffer = await (await fetch(banner)).buffer()
        const { width, height } = imageSize(bannerBuffer)
        expect(width).toBe(1500)
        expect(height).toBe(500)
      }))

  it('/user/:id/banner (DELETE)', () =>
    server
      .delete('/user/aaa/banner')
      .set('Authorization', 'Bearer ' + aaaAccessToken)
      .send()
      .expect(200))

  it('/user/:id/banner (DELETE, 401)', () =>
    server.delete('/user/aaa/banner').send().expect(401))

  it('/user/:id/banner (DELETE, 403)', () =>
    server
      .delete('/user/aaa/banner')
      .set('Authorization', 'Bearer ' + otherAccessToken)
      .send()
      .expect(403))

  it('/user/:id/banner (DELETE, 404)', () =>
    server
      .delete('/user/skdjf/banner')
      .set('Authorization', 'Bearer ' + otherAccessToken)
      .send()
      .expect(404))
})
