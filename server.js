const http = require("http");
const url = require("url");
const fs = require("fs");

// server creation
http
  .createServer((request, response) => {
    // get the URL from the request
    let url = request.url;
    // creating a new URL object using the porivded 'url' string and the base URL
    (q = new URL(url, "http://localhost:8080")),
      // empty container to store the file path
      (filePath = "");

    //log both the request URL and tiemstampt to the log.txt
    fs.appendFile(
      "log.txt",
      "URL: " + url + "\nTimestamp: " + new Date() + "\n\n",
      (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Added to log.");
        }
      }
    );

    //check whether the pathname of q includes the words “documentation”
    if (q.pathname.includes("documentation")) {
      filePath = __dirname + "/documentation.html";
    } else {
      filePath = "index.html";
    }

    //use the readFile() function to grab the appropirate file;
    fs.readFile(filePath, (err, data) => {
      if (err) {
        throw err;
      }

      response.writeHead(200, { "Content-Type": "text/html" });
      response.write(data);
      response.end("Hello Node!\n");
    });
  })
  .listen(8080);

console.log("My first Node test server is running on Port 8080.");
