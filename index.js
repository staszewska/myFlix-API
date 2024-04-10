const express = require("express");
const app = express();
const morgan = require("morgan");

app.use(morgan("common"));

let topMovies = [
  {
    title: "Titanic",
    director: "James Cameron",
  },
  {
    title: "The Theory of Everything",
    director: "James Marsh",
  },
  {
    title: "Inception",
    director: "Christopher Nolan",
  },
  {
    title: "The Godfather",
    director: "Francis Ford Coppola",
  },
];

// GET request

app.get("/movies", (req, res) => {
  res.json(topMovies);
});

app.get("/", (req, res) => {
  res.send("Welcome to my app :)");
});

//log all requests with morgan

app.get("/secreturl", (req, res) => {
  res.send("This is a secret url with super top-secret content.");
});

// This works but we can also use express.static to serve static files
// app.get("/documentation", (req, res) => {
// console.log("Hello documentation");
// res.sendFile("public/documentation.html", { root: __dirname });
// });

// serving static files
app.use(express.static("public"));

app.listen(8080, () => {
  console.log("Your app is listening on port 8080.");
});
