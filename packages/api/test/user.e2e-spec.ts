import request from 'supertest'
import { getRequestUrl, makeTestingApp } from './makeTestingApp'
import { INestApplication } from '@nestjs/common'
import { readFile } from 'fs/promises'
import fetch from 'node-fetch'
import { imageSize } from 'image-size'

describe('UserController (e2e)', () => {
  let app: INestApplication
  let aaaAccessToken: string
  let aaa = {
    username: 'aaa',
    password: 'ep7cpahsgpasd@#!@#@#$'
  }
  const server = request(getRequestUrl())
  let pfp400px: Buffer

  beforeAll(async () => {
    app = await makeTestingApp()
    
    await server.post('/user').send(aaa).expect(201)
    aaaAccessToken = (await server.post('/user/aaa/session').send(aaa)).body.accessToken
    pfp400px = await readFile('test/media/pfp-400px.png')
  })

  afterAll(async () => {
    await app.close()
  })

  it('/user (GET)', async () =>
    server
      .get('/user')
      .send()  
      .expect(200))

  it('/user/:id (GET)', async () => 
    server
      .get('/user/aaa')
      .send()
      .expect(200))

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

  it('/user (PATCH)', async () => {
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

  it('/user/:id/profile-picture (GET)', () => 
    server
      .get('/user/aaa/profile-picture')
      .send()
      .expect(200))

  it('/user/:id/profile-picture (POST)', () =>
    server
      .post('/user/aaa/profile-picture')
      .set('Authorization', 'Bearer ' + aaaAccessToken)
      .attach('profile-picture', pfp400px, 'pfp400px.png')
      .expect(201)
      .expect(async ({ body }) => {
        const { profile_picture } = body
        const pfp = await (await fetch(profile_picture)).buffer()
        const { width, height } = imageSize(pfp)
        expect(width).toBe(400)
        expect(height).toBe(400)
      }))
  
  it('/user/:id/profile-picture (PATCH)', () =>
    server
      .patch('/user/aaa/profile-picture')
      .set('Authorization', 'Bearer ' + aaaAccessToken)
      .attach('profile-picture', 'test/media/pfp-500px.png')
      .expect(200)
      .expect(async ({body}) => {
        const { profile_picture } = body
        const pfp = await(await fetch(profile_picture)).buffer()
        const { width, height } = imageSize(pfp)
        expect(width).toBe(400)
        expect(height).toBe(400)
      }))

  it('/user/:id/profile-picture (PATCH, weird size)', () =>
    server
      .patch('/user/aaa/profile-picture')
      .set('Authorization', 'Bearer ' + aaaAccessToken)
      .attach('profile-picture', 'test/media/pfp-weird-size.png')
      .expect(200)
      .expect(async ({body}) => {
        const { profile_picture } = body
        const pfp = await(await fetch(profile_picture)).buffer()
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
})
