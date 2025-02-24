const _ = require('lodash')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((prev, {likes}) => {
    return prev + likes
  }, 0)
}

const favoriteBlog = (blogs) => {
  const favorite = blogs.reduce((prev, current) => {
    return (prev && prev.likes > current.likes) ? prev : current
  })
  favorite.id = favorite._id.toString()
  delete favorite._id
  delete favorite.__v

  return favorite
}

const mostBlogs = (blogs) => {
  const authors = _.countBy(blogs, (blog) => blog.author)
  const tally = Object.keys(authors).map((author) => { return { author: author, blogs: authors[author]} })
  return _.maxBy(tally, 'author')
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs
}