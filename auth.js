const jwtSecret = "your_jwt_secret";

const jwt = require("jsonwebtoken"),
  passport = require("passport");

require("./passport");

let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Name,
    expiresIn: "7d",
    algorithm: "HS256",
  });
};

//POST login.

module.exports = (router) => {
  router.post("/login", (request, response) => {
    passport.authenticate("local", { session: false }, (error, user, info) => {
      console.log(user);

      const userWithoutPassword = { ...user._doc };
      delete userWithoutPassword.Password;
      // console.log("after: ", userWithoutPassword);

      if (error || !user) {
        return response.status(400).json({
          message: "Something is not right",
          user: user,
        });
      }

      request.login(user, { session: false }, (error) => {
        if (error) {
          response.send(error);
        }
        let token = generateJWTToken(user.toJSON());
        return response.json({ user: userWithoutPassword, token });
      });
    })(request, response);
  });
};
