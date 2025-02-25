const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  const blog1 = new Blog({ title: 'First blog', author: 'Author 1', url: 'http://example.com/1', likes: 1 })
  const blog2 = new Blog({ title: 'Second blog', author: 'Author 2', url: 'http://example.com/2', likes: 2 })
  await blog1.save()
  await blog2.save()
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('a valid blog can be added', async () => {
  const newBlog = {
    title: 'New blog',
    author: 'New Author',
    url: 'http://example.com/new',
    likes: 3
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')
  const titles = response.body.map(r => r.title)

  assert.strictEqual(response.body.length, 3)
  assert.ok(titles.includes('New blog'))
})

test('a blog without likes defaults to zero', async () => {
  const newBlog = {
    title: 'Blog without likes',
    author: 'Author without likes',
    url: 'http://example.com/nolikes'
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')
  const addedBlog = response.body.find(blog => blog.title === 'Blog without likes')

  assert.strictEqual(addedBlog.likes, 0)
})

test('there are two blogs', async () => {
  const response = await api.get('/api/blogs')
  assert.strictEqual(response.body.length, 2)
})

test('each blog has an id property', async () => {
  const response = await api.get('/api/blogs')
  response.body.forEach(blog => {
    assert.ok(blog.id)
  })
})

test('a blog without title returns 400', async () => {
  const newBlog = {
    author: 'Author without title',
    url: 'http://example.com/notitle',
    likes: 1
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)
})

test('a blog without url returns 400', async () => {
  const newBlog = {
    title: 'Blog without url',
    author: 'Author without url',
    likes: 1
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)
})

after(async () => {
  await mongoose.connection.close()
})