const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const api = supertest(app)

beforeEach(async () => {
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('password123', 10)
  const user = new User({ username: 'testuser', name: 'testuser', passwordHash })

  await user.save()
})

describe('Login API tests', () => {
  test('successful login returns a token', async () => {
    const loginDetails = {
      username: 'testuser',
      password: 'password123'
    }

    const response = await api
      .post('/api/login')
      .send(loginDetails)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.ok(response.body.token)
  })

  test('login fails with wrong password', async () => {
    const loginDetails = {
      username: 'testuser',
      password: 'wrongpassword'
    }

    const response = await api
      .post('/api/login')
      .send(loginDetails)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    assert.ok(response.body.error)
    assert.ok(response.body.error.includes('invalid username or password'))
  })

  test('login fails with non-existing user', async () => {
    const loginDetails = {
      username: 'nonexistinguser',
      password: 'password123'
    }

    const response = await api
      .post('/api/login')
      .send(loginDetails)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    assert.ok(response.body.error)
    assert.ok(response.body.error.includes('invalid username or password'))
  })
})

after(async () => {
  await mongoose.connection.close()
})