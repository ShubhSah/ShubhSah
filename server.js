const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express();

// ✅ CORS (important)
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// 🔐 Middleware (Protected Route)
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).send("Access denied ❌");
  }

  jwt.verify(token, process.env.JWT_SECRET || "secretkey", (err, decoded) => {
    if (err) {
      return res.status(403).send("Invalid token ❌");
    }

    req.user = decoded;
    next();
  });
};

// 🏠 HOME ROUTE
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// 📝 REGISTER API
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).send("All fields required ❌");
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";

    db.query(sql, [name, email, hashedPassword], (err) => {
      if (err) {
        console.log(err);
        return res.status(500).send("DB error ❌");
      }
      res.send("User Registered ✅");
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error ❌");
  }
});

// 🔑 LOGIN API
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send("DB error ❌");
    }

    if (result.length === 0) {
      return res.status(404).send("User not found ❌");
    }

    const isMatch = await bcrypt.compare(password, result[0].password);

    if (isMatch) {
      const token = jwt.sign(
        { id: result[0].id, email: result[0].email },
        process.env.JWT_SECRET || "secretkey",
        { expiresIn: "1h" }
      );

      res.json({
        message: "Login successful ✅",
        token: token,
      });
    } else {
      res.status(401).send("Wrong password ❌");
    }
  });
});

// 🔐 PROTECTED ROUTE
app.get("/dashboard", verifyToken, (req, res) => {
  res.send(`Welcome ${req.user.email} 🎉`);
});

// 📊 GET USERS
app.get("/users", (req, res) => {
  const sql = "SELECT id, name, email FROM users";

  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send("DB error ❌");
    }
    res.json(result);
  });
});

// ➕ ADD USER
app.post("/add-user", (req, res) => {
  const { name, email } = req.body;

  const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";

  db.query(sql, [name, email, "123"], (err) => {
    if (err) {
      console.log(err);
      return res.status(500).send("DB error ❌");
    }
    res.send("User Added ✅");
  });
});

// ❌ DELETE USER
app.delete("/delete-user/:id", (req, res) => {
  const id = req.params.id;

  const sql = "DELETE FROM users WHERE id=?";

  db.query(sql, [id], (err) => {
    if (err) {
      console.log(err);
      return res.status(500).send("DB error ❌");
    }
    res.send("User Deleted ✅");
  });
});

// ✏️ UPDATE USER
app.put("/update-user/:id", (req, res) => {
  const id = req.params.id;
  const { name, email } = req.body;

  const sql = "UPDATE users SET name=?, email=? WHERE id=?";

  db.query(sql, [name, email, id], (err) => {
    if (err) {
      console.log(err);
      return res.status(500).send("DB error ❌");
    }
    res.send("User Updated ✅");
  });
});

// 🚀 SERVER START (IMPORTANT FIX)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});