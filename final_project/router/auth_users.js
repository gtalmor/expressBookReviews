const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
  const allUsers = users.map(user => user.username);

  if (allUsers.includes(username)) {
    return true;
  }

  return false;
}

const authenticatedUser = (username, password) => { //returns boolean
  //write code to check if username and password match the one we have in records.
  if (!username || !password) {
    return false;
  }

  if (!isValid(username)) {
    return false;
  }

  const user = users.find(user => user.username === username);
  if (user.password === password) {
    return true;
  }

  return false;
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  if (authenticatedUser(username, password)) {
    const accessToken = jwt.sign({ data: username }, "access", { expiresIn: '1h' });
    req.session.authorization = { accessToken, username };
    return res.status(200).json({ message: "User logged in successfully" });
  } else {
    return res.status(400).json({ message: "Invalid username or password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.user.data;

  console.log(isbn, review, username);

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!review) {
    return res.status(400).json({ message: "Review is required" });
  }

  if (books[isbn].reviews[username]) {
    books[isbn].reviews[username] = review;
  } else {
    books[isbn].reviews[username] = review;
  }

  return res.status(200).json({ message: "Review added successfully" });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const username = req.user.data;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message: "Review not found" });
  }

  delete books[isbn].reviews[username];
  return res.status(200).json({ message: "Review deleted successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
