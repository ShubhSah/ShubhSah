const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./db");
const jwt = require("jsonwebtoken");  //proof of login(token)

//APP SETUP
const app = express();
app.use(cors());
app.use(express.json());

//MIDDLWARE (PROTECTED ROUTE)
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.send("Access denied ❌");
  }

  jwt.verify(token, "secretkey", (err, decoded) => {
    if (err) {
      return res.send("Invalid token ❌");
    }

    req.user = decoded; // user info save
    next(); // aage jaane do
  });
};


//ROUTES
//HOME ROUTE
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

//REGISTER API
const bcrypt = require("bcrypt");    //password hashing 
app.post("/register", async(req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.send("All fields required ❌");
  }


  const hashedPassword = await bcrypt.hash(password,10);

  const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";

  db.query(sql, [name, email, hashedPassword], (err, result) => {
    if (err) {
      return res.send(err);
    }
    res.send("User Registered ✅");
  });
});


//LOGIN API
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async(err, result) => {
    if (err) {
      return res.send(err);
    }

    // user not found
    if (result.length === 0) {
      return res.send("User not found ❌");
    }

    const isMatch = await bcrypt.compare(password,result[0].password);

    // password check
    if (isMatch) {
      const token = jwt.sign(
        { id: result[0].id,email: result[0].email},"secretkey",{ expiresIn: "1h" });  
      res.send({
        message:"Login successful ✅",
        token: token,
      });
    } else {
      res.send("Wrong password ❌");
    }
  });
});

//PROTECTED ROUTE
app.get("/dashboard", verifyToken, (req, res) => {
  res.send(`Welcome ${req.user.email} 🎉`);
});


//API
app.get("/users", (req, res) => {
  const sql = "SELECT id, name, email FROM users";

  db.query(sql, (err, result) => {
    if (err) return res.send(err);
    res.json(result);
  });
});

//POST API
app.post("/add-user", (req, res) => {
  const { name, email } = req.body;

  const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";

  db.query(sql, [name, email, "123"], (err) => {
    if (err) return res.send(err);
    res.send("User Added ✅");
  });
});

//DELETE API
app.delete("/delete-user/:id", (req, res) => {
  const id = req.params.id;

  const sql = "DELETE FROM users WHERE id=?";

  db.query(sql, [id], (err) => {
    if (err) return res.send(err);
    res.send("User Deleted ✅");
  });
});

//UPDATE SERVER
app.put("/update-user/:id", (req, res) => {
  const id = req.params.id;
  const { name, email } = req.body;

  const sql = "UPDATE users SET name=?, email=? WHERE id=?";

  db.query(sql, [name, email, id], (err) => {
    if (err) return res.send(err);
    res.send("User Updated ✅");
  });
});

//SERVER START
app.listen(5000, () => {
  console.log("Server running on port 5000");
});

