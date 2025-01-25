const express = require("express");
const mongoose = require("mongoose");
const { UserModel, TodoModel } = require("./db");
const { auth, JWT_SECRET } = require("./auth");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect("your-mongodb-connection-string-here")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Signup Route
app.post("/signup", async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await UserModel.create({ email, password: hashedPassword, name });

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(400).json({ error: "Error creating user" });
  }
});

// Signin Route
app.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(403).json({ message: "Incorrect credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(403).json({ message: "Incorrect credentials" });
    }

    const token = jwt.sign({ id: user._id.toString() }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Create a new Todo (protected route)
app.post("/todo", auth, async (req, res) => {
  try {
    const { title, description, done } = req.body;

    const todo = await TodoModel.create({
      userId: req.userId,
      title,
      description,
      done,
    });

    res.status(201).json({ message: "Todo created", todo });
  } catch (error) {
    res.status(400).json({ error: "Error creating todo" });
  }
});

// Get all Todos for the logged-in user (protected route)
app.get("/todos", auth, async (req, res) => {
  try {
    const todos = await TodoModel.find({ userId: req.userId });
    res.json({ todos });
  } catch (error) {
    res.status(400).json({ error: "Error fetching todos" });
  }
});

// Start server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
