const express = require("express");
const mongoose = require("mongoose");
const { UserModel, TodoModel } = require("./db");
const { auth } = require("./auth");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const JWT_SECRET = "asdrty7654#!";

// Connect to MongoDB
mongoose
  .connect(
    "mongodb+srv://harshjhavats:o0BcZ1tnz9w1z9aJ@cluster0.buntc.mongodb.net/TodoMongotoo"
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const app = express();
app.use(express.json());

// Signup Route
app.post("/signup", async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await UserModel.create({
      email,
      password: hashedPassword,
      name,
    });

    res.status(201).json({
      message: "You are signed up successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: "Error signing up",
      error: error.message,
    });
  }
});

// Signin Route
app.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(403).json({
        message: "Incorrect credentials",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(403).json({
        message: "Incorrect credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user._id.toString(),
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Create a new Todo (Protected Route)
app.post("/todo", auth, async (req, res) => {
  try {
    const { title, done } = req.body;
    await TodoModel.create({
      userId: req.userId,
      title,
      done,
    });

    res.status(201).json({ message: "Todo created successfully" });
  } catch (error) {
    res.status(400).json({ message: "Failed to create todo" });
  }
});

// Get Todos for Authenticated User
app.get("/todos", auth, async (req, res) => {
  try {
    const todos = await TodoModel.find({ userId: req.userId });
    res.json({ todos });
  } catch (error) {
    res.status(400).json({ message: "Error retrieving todos" });
  }
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
