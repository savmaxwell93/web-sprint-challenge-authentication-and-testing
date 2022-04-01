const db = require('../data/dbConfig');
const server = require('./server');
const request = require('supertest');
const bcrypt = require('bcryptjs');

const User = require('./users/users-model');

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
})
beforeEach(async () => {
  await db('users').truncate();
})
afterAll(async () => {
  await db.destroy();
})

test('sanity', () => {
  expect(true).toBe(true)
})

test('test users-model', async () => {
  let result;

  //findAll
  result = await User.findAll();
  expect(result).toHaveLength(0)

  //add
  result = await User.add({ username: 'testname', password: '1234'});
  expect(result).toEqual({ username: 'testname', password: '1234', id: 1 });
  result = await User.findAll();
  expect(result).toHaveLength(1);

  //findById
  result = await User.findById(2);
  expect(result).not.toBeDefined();
  result = await User.findById(1);
  expect(result).toHaveProperty('username', 'testname')

  //findBy
  result = await User.findBy({ username: 'testname'})

})
describe('[POST] /api/auth/register', () => {
  test('responds with the correct message on missing credentials', async () => {
    let res
    res = await request(server).post('/api/auth/register').send({ username: 'test'})
    expect(res.status).toBe(404)
    expect(res.body.message).toMatch(/username and password required/i)

    res = await request(server).post('/api/auth/register').send({ password: 'test'})
    expect(res.status).toBe(404)
    expect(res.body.message).toMatch(/username and password required/i)
  })
  test('responds with the correct status and message when username is taken', async () => {
    await request(server).post('/api/auth/register').send({ username: 'test', password: '1234'})
    const res = await request(server).post('/api/auth/register').send({ username: 'test', password: '1234'})
    expect(res.status).toBe(422)
    expect(res.body.message).toMatch(/username taken/i)
  })
  test('saves the user with a bcrypted password instead of plain text', async () => {
    await request(server).post('/api/auth/register').send({ username: 'test', password: '1234'})
    const res = await User.findById(1)
    expect(bcrypt.compareSync('1234', res.password)).toBeTruthy()
    
  })
})

describe('[POST] /api/auth/login', () => {
  test('responds with the correct message on valid credentials', async () => {
    await request(server).post('/api/auth/register').send({ username: 'test', password: '1234'})
    const res = await request(server).post('/api/auth/login').send({ username: 'test', password: '1234'})
    expect(res.body.message).toMatch(/welcome, test/i)
  })
  test('responds with the correct status and message on invalid credentials', async () => {
    let res
    await request(server).post('/api/auth/register').send({ username: 'test', password: '1234'})
    res = await request(server).post('/api/auth/login').send({ username: 'testing', password: '1234'})
    expect(res.body.message).toMatch(/invalid credentials/i)

    res = await request(server).post('/api/auth/login').send({ username: 'test', password: '12345'})
    expect(res.body.message).toMatch(/invalid credentials/i)
  })
})

describe('[GET] /api/jokes', () => {
  test('responds with the correct message on no token', async () => {
    const res = await request(server).get('/api/jokes')
    expect(res.body.message).toMatch(/token required/i)
  })
  test('responds with the correct message on invalid token', async () => {
    const res = await request(server).get('/api/jokes').set('Authorization', 'not the right token')
    expect(res.body.message).toMatch(/token invalid/i)
  })
  test('responds with list of jokes when token is valid', async () => {
    await request(server).post('/api/auth/register').send({ username: 'test', password: '1234'})
    let res = await request(server).post('/api/auth/login').send({ username: 'test', password: '1234'})
    res = await request(server).get('/api/jokes').set('Authorization', res.body.token)
    expect(res.body).toMatchObject([
      {
        "id": "0189hNRf2g",
        "joke": "I'm tired of following my dreams. I'm just going to ask them where they are going and meet up with them later."
      },
      {
        "id": "08EQZ8EQukb",
        "joke": "Did you hear about the guy whose whole left side was cut off? He's all right now."
      },
      {
        "id": "08xHQCdx5Ed",
        "joke": "Why didn’t the skeleton cross the road? Because he had no guts."
      },
    ])
  })
})