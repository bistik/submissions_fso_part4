const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')

const api = supertest(app)

beforeEach(async () => {
  await User.deleteMany({})
  const user1 = new User({ username: 'user1', name: 'User One', password: 'password1' })
  const user2 = new User({ username: 'user2', name: 'User Two', password: 'password2' })
  await user1.save()
  await user2.save()
})

describe('user validation tests', () => {
  test('invalid username length', async () => {
    const newUser = {
      username: 'us',
      name: 'Invalid User',
      password: 'password123'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    assert(result.body.error.includes('is shorter than the minimum allowed length'))
  })

  test('unique username', async () => {
    const newUser = {
      username: 'user1',
      name: 'Duplicate User',
      password: 'password123'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(result.body.error, 'expected `username` to be unique')
  })

  test('minimum password length', async () => {
    const newUser = {
      username: 'validuser',
      name: 'Valid User',
      password: 'pw'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    assert(result.body.error.includes('Password must be at least 3 characters long'))
  })
})

test('valid user creation', async () => {
  const newUser = {
    username: 'uniqueuser',
    name: 'Unique User',
    password: 'password123'
  }

  const result = await api
    .post('/api/users')
    .send(newUser)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(result.body.username, newUser.username)
  assert.strictEqual(result.body.name, newUser.name)
})

after(async () => {
  await mongoose.connection.close()
})
