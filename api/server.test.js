const db = require('../data/dbConfig');
const server = require('./server');
const request = require('supertest');

const User = require('./users/users-model');

test('sanity', () => {
  expect(true).toBe(false)
})
