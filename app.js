const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const app = express()
app.use(express.json())
const db_path = path.join(__dirname, 'moviesData.db')
let db = null

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: db_path,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Started!!!')
    })
  } catch (e) {
    console.log(e.message)
    process.exit(1)
  }
}
initializeDbAndServer()

const updatedResponseObject = eachObject => {
  return {
    movieId: eachObject.movie_id,
    directorId: eachObject.director_id,
    movieName: eachObject.movie_name,
    leadActor: eachObject.lead_actor,
  }
}

//API 1
app.get('/movies/', async (request, response) => {
  const query = `
    SELECT movie_name
    FROM movie;
    `
  const query_result = await db.all(query)
  response.send(query_result.map(items => updatedResponseObject(items)))
})

//API 2
app.post('/movies/', async (request, response) => {
  const request_body = request.body
  const {directorId, movieName, leadActor} = request_body
  const query = `
    INSERT INTO
      movie(director_id,movie_name,lead_actor)
    VALUES(
      ${directorId},
      '${movieName}',
      '${leadActor}'
    );
  `
  const query_result = await db.run(query)
  response.send('Movie Successfully Added')
})

//API 3
app.get('/movies/:movieId/', async (request, response) => {
  const movie_id = request.params
  const {movieId} = movie_id
  const query = `
    SELECT
      *
    FROM
     movie
    WHERE 
      movie_id = ${movieId};
  `
  const query_result = await db.get(query)
  response.send(updatedResponseObject(query_result))
})

//API 4
app.put('/movies/:movieId/', async (request, response) => {
  const movie_id = request.params
  const {movieId} = movie_id
  const request_body = request.body
  const {directorId, movieName, leadActor} = request_body
  const query = `
    UPDATE
      movie
    SET
      director_id = ${directorId},
      movie_name = '${movieName}',
      lead_actor = '${leadActor}'
    WHERE
      movie_id = ${movieId};
  `
  const query_result = await db.get(query)
  response.send('Movie Details Updated')
})

//API 5
app.delete('/movies/:movieId/', async (request, response) => {
  const movie_id = request.params
  const {movieId} = movie_id
  const query = `
  DELETE FROM
    movie
  WHERE 
    movie_id = ${movieId};
  `
  const query_result = await db.run(query)
  response.send('Movie Removed')
})

const updatedResponseObject2 = eachObject => {
  return {
    directorId: eachObject.director_id,
    directorName: eachObject.director_name,
  }
}

//API 6
app.get('/directors/', async (request, response) => {
  const query = `
    SELECT *
    FROM director;
    `
  const query_result = await db.all(query)
  response.send(query_result.map(items => updatedResponseObject2(items)))
})

//API 7
app.get('/directors/:directorId/movies/', async (request, response) => {
  const director_Id = request.params
  const {directorId} = director_Id
  const query = `
    SELECT
      movie_name as movieName
    FROM
     director Natural Join movie
    WHERE 
      director_id = ${directorId};
  `
  const query_result = await db.all(query)
  console.log(query_result)
  response.send(query_result)
})

module.exports = app
