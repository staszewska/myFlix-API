require("dotenv").config();

const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const uuid = require("uuid");
const { check, validationResult } = require("express-validator");

const mongoose = require("mongoose");
const Models = require("./models.js");

const Movies = Models.Movie;
const Users = Models.User;

// For local MongoDB
// mongoose.connect("mongodb://localhost:27017/cfDB", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//app uses cors; it will set the application to allow requests from all origins;
const cors = require("cors");
app.use(cors());

//for every incoming request, if it contains JSON data in the body, parse that JSON data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//import auth.js
let auth = require("./auth")(app);

//require Passport module and import passport.js file
const passport = require("passport");
require("./passport");

//log all requests with morgan
app.use(morgan("common"));

app.get("/", async (request, response) => {
  response.send("Welcome to myFlix API");
});

// GET request (READ)

//Return a list of ALL movies to the user
app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  async (request, response) => {
    await Movies.find()
      .then((movies) => {
        response.status(201).json(movies);
      })
      .catch((error) => {
        console.error(error);
        response.status(500).send("Error: " + error);
      });
  }
);

//Return data (description, genre, director, image URL, whether it’s featured or not) about a single movie by title to the user
app.get(
  "/movies/:title",
  passport.authenticate("jwt", { session: false }),
  async (request, response) => {
    // console.log("Title is: ", request.params.title);
    await Movies.findOne({ Title: request.params.title })
      .then((movie) => {
        response.json(movie);
      })
      .catch((error) => {
        response.status(500).send("Error: " + error);
      });
  }
);

//Return data about a genre (description) by name/title
app.get(
  "/movies/genre/:genreName",
  passport.authenticate("jwt", { session: false }),
  async (request, response) => {
    const genreName = request.params.genreName;

    await Movies.findOne({ "Genre.Name": genreName })

      .then((movie) => {
        response.json(movie.Genre);
      })

      .catch((error) => {
        response.status(500).send("Error: " + error);
      });
  }
);

//Return data about a director
app.get(
  "/movies/directors/:directorName",
  passport.authenticate("jwt", { session: false }),
  async (request, response) => {
    const directorName = request.params.directorName;

    await Movies.findOne({ "Director.Name": directorName })

      .then((movie) => {
        response.json(movie.Director);
      })

      .catch((error) => {
        response.status(500).send("Error: " + error);
      });
  }
);

//GET USER

app.get(
  "/users/:userId",
  passport.authenticate("jwt", { session: false }),
  async (request, response) => {
    const userId = request.params.userId;
    console.log(userId);

    try {
      const user = await Users.findOne({ _id: userId });
      response.json(user);
    } catch (error) {
      response.status(500).send("Error: " + error);
    }
  }
);

// app.get(
//   "/users/:userId",
//   passport.authenticate("jwt", { session: false }),
//   (request, response) => {
//     console.log("ID is: ", request.params.userId);
//     Users.findOne({ _id: request.params.userId })
//       .then((user) => {
//         response.json(user);
//       })
//       .catch((error) => {
//         response.status(500).send("Error: " + error);
//       });
//   }
// );

//POST requests (CREATE)

//Allow new users to register
app.post(
  "/users",
  //validation
  check("Name", "Name is required").isLength({ min: 5 }),
  [
    check(
      "Name",
      "Name contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  async (request, response) => {
    // check the validation object for errors
    let errors = validationResult(request);

    if (!errors.isEmpty()) {
      return response.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(request.body.Password);
    await Users.findOne({ Name: request.params.name })
      .then((user) => {
        if (user) {
          return response
            .status(400)
            .send(request.body.name + "already exists");
        } else {
          Users.create({
            Name: request.body.Name,
            Password: hashedPassword,
            Email: request.body.Email,
            Birthday: new Date(request.body.Birthday),
            Country: request.body.Country,
            Gender: request.body.Gender,
          })
            .then((user) => {
              console.log("success");
              response.status(200).json(user);
            })
            .catch((error) => {
              response.status(500).send("Error: " + error);
            });
        }
      })
      .catch((error) => {
        response.status(500).send("Error: " + error);
      });
  }
);

//PUT requests (UPDATE)

//Allow users to update their user info
app.put(
  "/users/:name",
  //validation
  check("Name", "Name is required").isLength({ min: 5 }),
  [
    check(
      "Name",
      "Name contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  passport.authenticate("jwt", { session: false }),
  async (request, response) => {
    // check the validation object for errors
    let errors = validationResult(request);

    if (!errors.isEmpty()) {
      return response.status(422).json({ errors: errors.array() });
    }
    console.log("request.user.Name", request.user.Name);
    console.log("request.params.name", request.params.name);

    // CONDITION TO CHECK ADDED HERE
    if (request.user.id !== request.body._id) {
      return response.status(400).send("Permission denied");
    }

    // CONDITION ENDS
    try {
      const updatedUser = await Users.findOneAndUpdate(
        { _id: request.body._id },
        {
          $set: {
            Name: request.body.Name,
            Email: request.body.Email,
            Birthday: request.body.Birthday,
            Country: request.body.Country,
            Gender: request.body.Gender,
          },
        },
        { new: true }
      );

      console.log("updated", updatedUser);
      response.json(updatedUser);
    } catch (error) {
      response(500).send("Error: " + error);
    }
  }
);

// update users favorite movie
app.put(
  "/users/:name/movies/:movieID",
  passport.authenticate("jwt", { session: false }),
  async (request, response) => {
    // CONDITION TO CHECK ADDED HERE
    if (request.user.Name !== request.params.name) {
      return response.status(400).send("Permission denied");
    }

    await Users.findOneAndUpdate(
      { Name: request.params.name },

      {
        $push: { favoriteMovies: request.params.movieID },
      },
      { new: true }
    )

      .then((updatedUser) => {
        response.json(updatedUser);
      })

      .catch((error) => {
        response.status(500).send("Error: " + error);
      });
  }
);

//DELETE requests

//Allow users to remove a movie from their list of favorites
app.delete(
  "/users/:name/movies/:movieID",
  passport.authenticate("jwt", { session: false }),
  async (request, response) => {
    // CONDITION TO CHECK ADDED HERE
    if (request.user.Name !== request.params.name) {
      return response.status(400).send("Permission denied");
    }

    await Users.findOneAndUpdate(
      { Name: request.params.name },
      {
        $pull: { favoriteMovies: request.params.movieID },
      },
      { new: true }
    )

      .then((updatedUser) => {
        response.json(updatedUser);
      })

      .catch((error) => {
        response.status(500).send("Error: " + error);
      });
  }
);

//Allow existing users to deregister
app.delete(
  "/users/:name",
  passport.authenticate("jwt", { session: false }),
  async (request, response) => {
    // CONDITION TO CHECK ADDED HERE
    if (request.user.id !== request.body._id) {
      return response.status(400).send("Permission denied");
    }

    console.log("Name is: ", request.params.name);
    await Users.findOneAndDelete({ _id: request.body._id })

      .then((user) => {
        if (!user) {
          response.status(400).send(request.params.name + " was not found");
        } else {
          response.status(200).send(request.params.name + " was deleted");
        }
      })

      .catch((error) => {
        response.status(500).send("Error: " + error);
      });
  }
);

// This works but we can also use express.static to serve static files
// app.get("/documentation", (req, res) => {
// console.log("Hello documentation");
// res.sendFile("public/documentation.html", { root: __dirname });
// });

// serving static files
app.use(express.static("public"));

// handling error
app.use((error, request, response, next) => {
  console.log("ERR: " + error.stack);
});

console.log(process.env.PORT);

const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
