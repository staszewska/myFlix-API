# myFlix Web Application - Server-Side Component

Welcome to myFlix, a web application that provides users with access to information about different movies, directors, and genres. This repository contains the server-side component of the myFlix application, built using the MERN (MongoDB, Express, and Node.js) stack.

## Features

- Return a list of ALL movies to the user
- Return data about a single movie by title to the user
- Return data about a genre by name
- Return data about a director by name
- Allow new users to register
- Allow users to update their user info
- Allow users to add a movie to their list of favorites
- Allow users to remove a movie from their list of favorites
- Allow existing users to deregister

## Deployment

The API source code is deployed to **Heroku** and is publicly accessible. [myFlix API Documentation](https://movies-api-ms-b2173cbfa01b.herokuapp.com/documentation.html).

## Technical Overview

The server-side component of the myFlix application is built using **Node.js** and **Express** for the API, **MongoDB** for the database, and **Mongoose** for modeling the business logic. The API follows REST architecture and provides movie information in JSON format. It includes user authentication and authorization, as well as data validation logic and security measures.

## Testing

The API has been tested using **Postman**.
