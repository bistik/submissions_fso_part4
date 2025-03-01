const config = require('./utils/config')
const express = require('express')
require('express-async-errors');
const cors = require('cors')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
require('express-async-errors')
const app = express()

app.use(cors())
app.use(express.json())

const mongoose = require('mongoose');
const loginRouter = require('./controllers/login');

mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connection to MongoDB:', error.message)
  })

app.use(middleware.requestLogger)
app.use('/api/login', loginRouter)
app.use(middleware.tokenExtractor)
app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app