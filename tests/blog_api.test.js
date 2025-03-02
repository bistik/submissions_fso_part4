const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')

const api = supertest(app)

beforeEach(async () => {
  await User.deleteMany({})
  await Blog.deleteMany({})
  const passwordHash = await bcrypt.hash('password', 10)
  const user = new User({ username: 'user', name: 'user', passwordHash })
  const blog1 = new Blog({ title: 'First blog', author: 'Author 1', url: 'http://example.com/1', likes: 1 })
  blog1.user = user
  user.blogs = [blog1]
  await user.save()
  await blog1.save()

  const blog2 = new Blog({ title: 'Second blog', author: 'Author 2', url: 'http://example.com/2', likes: 2 })
  blog2.user = user
  user.blogs.push(blog2)
  await user.save()
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

  const loginResponse = await api
    .post('/api/login')
    .send({ username: 'user', password: 'password' })
    .expect(200)
    .expect('Content-Type', /application\/json/)

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${loginResponse.body.token}`)
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

  const loginResponse = await api
    .post('/api/login')
    .send({ username: 'user', password: 'password' })
    .expect(200)
    .expect('Content-Type', /application\/json/)
  
  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${loginResponse.body.token}`)
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

  const loginResponse = await api
    .post('/api/login')
    .send({ username: 'user', password: 'password' })
    .expect(200)
    .expect('Content-Type', /application\/json/)

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${loginResponse.body.token}`)
    .send(newBlog)
    .expect(400)
})

test('a blog without url returns 400', async () => {
  const newBlog = {
    title: 'Blog without url',
    author: 'Author without url',
    likes: 1
  }

  const loginResponse = await api
    .post('/api/login')
    .send({ username: 'user', password: 'password' })
    .expect(200)
    .expect('Content-Type', /application\/json/)

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${loginResponse.body.token}`)
    .send(newBlog)
    .expect(400)
})

test('a blog can be deleted', async () => {
  const response = await api.get('/api/blogs')
  const blogToDelete = response.body[0]

  const loginResponse = await api
    .post('/api/login')
    .send({ username: 'user', password: 'password' })
    .expect(200)
    .expect('Content-Type', /application\/json/)

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .set('Authorization', `Bearer ${loginResponse.body.token}`)
    .expect(204)

  const blogsAtEnd = await api.get('/api/blogs')
  assert.strictEqual(blogsAtEnd.body.length, 1)
  const titles = blogsAtEnd.body.map(r => r.title)
  assert.ok(!titles.includes(blogToDelete.title))
})

test('a blog can be updated', async () => {
  const response = await api.get('/api/blogs')
  const blogToUpdate = response.body[0]

  const loginResponse = await api
    .post('/api/login')
    .send({ username: 'user', password: 'password' })
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const updatedBlog = { ...blogToUpdate, likes: 10 }

  await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .set('Authorization', `Bearer ${loginResponse.body.token}`)
    .send(updatedBlog)
    .expect(200)

  const blogsAtEnd = await api.get('/api/blogs')
  const updatedBlogAtEnd = blogsAtEnd.body.find(blog => blog.id === blogToUpdate.id)
  assert.strictEqual(updatedBlogAtEnd.likes, 10)
})

after(async () => {
  await mongoose.connection.close()
})