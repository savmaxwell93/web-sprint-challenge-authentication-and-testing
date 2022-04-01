const db = require('../data/dbConfig');
const server = require('./server');
const request = require('supertest');

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