const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const uuid = require("uuid");

//for every incoming request, if it contains JSON data in the body, parse that JSON data
app.use(bodyParser.json());

//log all requests with morgan
app.use(morgan("common"));

let topMovies = [
  {
    title: "Titanic",
    director: {
      name: "James Cameron",
      bio: "James Cameron is a Canadian filmmaker and environmentalist. He is best known for directing blockbuster films such as 'Avatar', 'Titanic', and 'Terminator'. Cameron's films often feature groundbreaking visual effects and themes of environmentalism.",
      birth: "August 16, 1954",
    },
    description:
      "A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the luxurious, ill-fated R.M.S. Titanic.",
    genre: {
      name: "Romance, Drama",
      description:
        "Focuses on the tragic love story amidst a historical event.",
    },
    imageUrl: "https://example.com/titanic.jpg",
    featured: true,
  },
  {
    title: "The Theory of Everything",
    director: {
      name: "James Marsh",
      bio: "James Marsh is a British film director known for his work in documentary and biographical films. He won an Academy Award for Best Documentary Feature for 'Man on Wire' in 2009.",
      birth: "April 30, 1963",
    },
    description:
      "A look at the relationship between the famous physicist Stephen Hawking and his wife.",
    genre: {
      name: "Biography, Drama, Romance",
      description:
        "Explores the life of Stephen Hawking and his personal struggles.",
    },
    imageUrl: "https://example.com/theory_of_everything.jpg",
    featured: false,
  },
  {
    title: "Inception",
    director: {
      name: "Christopher Nolan",
      bio: "Christopher Nolan is a British-American filmmaker known for his complex narratives and innovative filmmaking techniques. He has directed critically acclaimed films such as 'Memento', 'The Dark Knight Trilogy', and 'Inception'.",
      birth: "July 30, 1970",
    },
    description:
      "A thief who enters the dreams of others to steal their secrets gets a chance to redeem himself.",
    genre: {
      name: "Action, Adventure, Sci-Fi",
      description:
        "Blends action and science fiction in a mind-bending narrative.",
    },
    imageUrl: "https://example.com/inception.jpg",
    featured: true,
  },
  {
    title: "The Godfather",
    director: {
      name: "Francis Ford Coppola",
      bio: "Francis Ford Coppola is an American film director, producer, and screenwriter. He is best known for directing the 'Godfather' trilogy and 'Apocalypse Now'. Coppola has won multiple Academy Awards throughout his career.",
      birth: "April 7, 1939",
    },
    description:
      "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
    genre: {
      name: "Crime, Drama",
      description:
        "Explores the dynamics of power and family in organized crime.",
    },
    imageUrl: "https://example.com/godfather.jpg",
    featured: false,
  },
];

let users = [
  {
    id: 1,
    name: "Alice",
    favoriteMovies: ["Inception", "The Shawshank Redemption", "Interstellar"],
  },
  {
    id: 2,
    name: "Bob",
    favoriteMovies: ["The Godfather", "Pulp Fiction", "The Dark Knight"],
  },
];

// GET request (READ)

//Return a list of ALL movies to the user
app.get("/movies", (request, response) => {
  response.status(200).json(topMovies);
});

//Return data (description, genre, director, image URL, whether it’s featured or not) about a single movie by title to the user
app.get("/movies/:title", (request, response) => {
  const { title } = request.params;
  const movie = topMovies.find((movie) => movie.title === title);
  if (movie) {
    response.status(200).json(movie);
  } else {
    response.status(400).send("Movie not found");
  }
});

//Return data about a genre (description) by name/title
app.get("/movies/genre/:genreName", (request, response) => {
  const { genreName } = request.params;
  // console.log(genreName);
  const genre = topMovies.find((movie) => {
    return movie.genre.name.includes(genreName);
  }).genre;
  // console.log(genre);

  if (genre) {
    response.status(200).json(genre);
  } else {
    response.status(400).send("No such a genre");
  }
});

//Return data about a director
app.get("/movies/directors/:directorName", (request, response) => {
  const { directorName } = request.params;
  const movie = topMovies.find((movie) => movie.director.name === directorName);

  if (movie) {
    response.status(200).json(movie.director);
  } else {
    response.status(400).send("No such a director");
  }
});

//POST requests (CREATE)

//Allow new users to register
app.post("/users", (request, response) => {
  const newUser = request.body;
  console.log(newUser);

  if (newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    response.status(201).json(newUser);
  } else {
    response.status(400).send("Users needs names");
  }
});

// update users favourite movie
app.post("/users/:id/:movieTitle", (request, response) => {
  const { id, movieTitle } = request.params;

  let user = users.find((user) => user.id == id);

  if (user) {
    user.favoriteMovies.push(movieTitle);
    response.status(200).json("Movie title has been added");
  } else {
    response.status(400).send("User not found");
  }
});

//PUT requests (UPDATE)

//Allow users to update their user info
app.put("/users/:id", (request, response) => {
  const { id } = request.params;
  const updatedUser = request.body;

  let user = users.find((user) => user.id == id);

  if (user) {
    user.name = updatedUser.name;
    response.status(200).json(user);
  } else {
    response.status(400).send("User not found");
  }
});

//DELETE requests

//Allow users to remove a movie from their list of favorites
app.delete("/users/:id/:movieTitle", (request, response) => {
  const { id, movieTitle } = request.params;

  let user = users.find((user) => user.id == id);

  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter(
      (title) => title !== movieTitle
    );
    response
      .status(200)
      .json(`${movieTitle} has been removed from user ${id} array`);
  } else {
    response.status(400).send("User not found");
  }
});

//Allow existing users to deregister
app.delete("/users/:id", (request, response) => {
  const { id } = request.params;

  let user = users.find((user) => user.id == id);

  if (user) {
    users = users.filter((user) => user.id != id);
    response.status(200).json(`user ${id} has been deleted`);
  } else {
    response.status(400).send("User not found");
  }
});

// This works but we can also use express.static to serve static files
// app.get("/documentation", (req, res) => {
// console.log("Hello documentation");
// res.sendFile("public/documentation.html", { root: __dirname });
// });

// serving static files
app.use(express.static("public"));

// handling error
app.use((error, request, response, next) => {
  console.log("ERR: ", error.stack);
});

app.listen(8080, () => {
  console.log("Your app is listening on port 8080.");
});
