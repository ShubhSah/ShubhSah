const express = require("express");
const cors = require("cors");
require("dotenv").config();

// 🔥 ERROR HANDLING (TOP ME)
process.on("uncaughtException", (err) => {
  console.log("Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.log("Unhandled Rejection:", err);
});

const db = require("./db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express();

// ✅ CORS
app.use(cors({
  origin: "*",
}));

app.use(express.json());

// 🔐 Middleware
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

// 🏠 ROOT ROUTE (IMPORTANT)
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// 🧪 TEST ROUTE (DEBUG KE LIYE)
app.get("/test", (req, res) => {
  res.send("Test working ✅");
});

// 📝 REGISTER
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).send("All fields required ❌");
    }

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

// 🔑 LOGIN
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

// 🔐 PROTECTED
app.get("/dashboard", verifyToken, (req, res) => {
  res.send(`Welcome ${req.user.email} 🎉`);
});

// 📊 USERS
app.get("/users", (req, res) => {
  db.query("SELECT id, name, email FROM users", (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send("DB error ❌");
    }
    res.json(result);
  });
});

// ➕ ADD
app.post("/add-user", (req, res) => {
  const { name, email } = req.body;

  db.query(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    [name, email, "123"],
    (err) => {
      if (err) {
        console.log(err);
        return res.status(500).send("DB error ❌");
      }
      res.send("User Added ✅");
    }
  );
});

// ❌ DELETE
app.delete("/delete-user/:id", (req, res) => {
  db.query("DELETE FROM users WHERE id=?", [req.params.id], (err) => {
    if (err) {
      console.log(err);
      return res.status(500).send("DB error ❌");
    }
    res.send("User Deleted ✅");
  });
});

// ✏️ UPDATE
app.put("/update-user/:id", (req, res) => {
  const { name, email } = req.body;

  db.query(
    "UPDATE users SET name=?, email=? WHERE id=?",
    [name, email, req.params.id],
    (err) => {
      if (err) {
        console.log(err);
        return res.status(500).send("DB error ❌");
      }
      res.send("User Updated ✅");
    }
  );
});

// 🚀 SERVER START
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});