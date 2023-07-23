const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const obj = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

//get data
app.get("/movies/", async (request, response) => {
  let getMoviesQuery = `
            SELECT 
                *
            FROM
             movie;`;
  let moviesArray = await db.all(getMoviesQuery);
  response.send(moviesArray.map((eachMovie) => obj(eachMovie)));
});

//post data
app.post("/movies/", async (request, response) => {
  const movieData = request.body;
  const { directorId, movieName, leadActor } = movieData;
  const getPlayerQuery = `
            INSERT INTO
             movie(director_id, movie_name, lead_actor)
           VALUES(
                ${directorId},
                '${movieName}',
                '${leadActor}'
           );`;
  const dbResponse = await db.run(getPlayerQuery);
  const movieId = dbResponse.lastID;
  response.send("Movie Successfully Added");
});

/*get player

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getBookQuery = `
    SELECT
      *
    FROM
      cricket_team
    WHERE
      player_id = ${playerId};`;
  const book = await db.get(getBookQuery);
  response.send({
    playerId: book.player_id,
    playerName: book.player_name,
    jerseyNumber: book.jersey_number,
    role: book.role,
  });
});

//update player

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const Data = request.body;
  const { playerName, jerseyNumber, role } = Data;
  const updateBookQuery = `
    UPDATE
      cricket_team
    SET
      player_name='${playerName}',
      jersey_number=${jerseyNumber},
      role='${role}'
    WHERE
      player_id = ${playerId};`;
  await db.run(updateBookQuery);
  response.send("Player Details Updated");
});

//delete player

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteBookQuery = `
    DELETE FROM
      cricket_team
    WHERE
       player_id = ${playerId};`;
  await db.run(deleteBookQuery);
  response.send("Player Removed");
});

module.exports = app;
