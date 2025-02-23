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



module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}