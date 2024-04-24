require("dotenv").config();

const config = require("./config.json");
const mongoose = require("mongoose");
const User = require("./models/user.models.js");
const Note = require("./models/note.model.js");
mongoose.connect(config.connectionString);

const express = require("express");
const cors = require("cors");

const app = express();

const jwt = require("jsonwebtoken");
const authenticationToken = require("./utilities.js");
const authenticateToken = require("./utilities.js");

app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);
app.get("/", (req, res) => {
  res.json({
    data: "hello",
  });
});

app.post("/create-account", async (req, res) => {
  const { fullName, email, password } = req.body;
  if (!fullName) {
    return res
      .status(404)
      .json({ error: true, message: "full name is required" });
  }
  if (!email) {
    return res.status(404).json({ error: true, message: "email  is required" });
  }
  if (!password) {
    return res
      .status(404)
      .json({ error: true, message: "password is required" });
  }

  const isUser = await User.findOne({ email });
  if (isUser) {
    return res
      .status(404)
      .json({ error: true, message: "User already exists" });
  }

  const user = new User({
    fullName,
    email,
    password,
  });

  await user.save();

  const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECERT, {
    expiresIn: "30m",
  });

  return res.json({
    error: false,
    user,
    accessToken,
    message: "Registration Successfull",
  });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  if (!password) {
    return res.status(400).json({ message: "password is required" });
  }

  const userInfo = await User.findOne({ email: email });

  if (!userInfo) {
    return res.status(400).json({ message: "User Not found" });
  }
  if (userInfo.email == email && userInfo.password == password) {
    const user = { user: userInfo };
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECERT, {
      expiresIn: "300m",
    });
    return res.json({
      error: false,
      message: "Login Successful",
      email,
      accessToken,
    });
  } else {
    return res.status(400).json({
      error: true,
      message: "Invalid Credentials",
    });
  }
});

app.get("/get-user", authenticationToken, async (req, res) => {
  const { user } = req.user;
  console.log(user);
  const isUser = await User.findOne({ _id: user._id });
  console.log(isUser);
  if (!isUser) {
    return res.status(401);
  }

  return res.json({
    fullName: isUser.fullName,
    email: isUser.email,
    user: isUser,
    message: "",
  });
});

//Add Note
app.post("/add-note", authenticationToken, async (req, res) => {
  const { title, tags, content } = req.body;
  const user = req.user;
  if (!title) {
    return res.status(400).json({ message: "title is required" });
  }

  if (!content) {
    return res.status(400).json({ message: "content is required" });
  }

  try {
    const note = new Note({
      title,
      content,
      tags: tags || [],
      userId: user._id,
    });
    await note.save();
    return res.json({
      error: false,
      note,
      message: "Note added Successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: "Internal Sever error",
    });
  }
});

app.put("/edit-note/:noteId", authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;
  const { title, content, tags, isPinned } = req.body;
  const user = req.user;
  //console.log(user);

  if (!title && !content && !tags) {
    res.status(400).json({ error: true, msg: "no changes provided" });
  }

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });
    console.log(note);
    if (!note) {
      return res.status(404).json({
        error: true,
        msg: "Note not found",
      });
    }
    if (title) {
      note.title = title;
    }
    if (content) note.content = content;

    if (tags) note.tags = tags;
    if (isPinned) note.isPinned = isPinned;

    await note.save();

    return res.status(200).json({
      error: false,
      note,
      message: "Note Updated Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

app.get("/get-all-notes", authenticateToken, async (req, res) => {
  const user = req.user;

  try {
    const notes = await Note.find({ userId: user._id }).sort({ isPinned: -1 });
    return res.json({
      error: false,
      notes,
      message: "All notes recieved",
    });
  } catch (error) {
    return res.json({
      error: true,
      message: "unable to send the notes",
    });
  }
});

app.delete("/delete-note/:noteId", authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;
  const user = req.user;
  // console.log(noteId);
  // console.log(user);
  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });
    //console.log(note);
    if (!note) res.status(404).json({ error: true, message: "Note not Found" });

    await Note.deleteOne({ _id: noteId, userId: user._id });
    return res.json({
      error: false,
      message: "Note deleted successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "Internal Server error " });
  }
});
app.put("/update-isPinned/:noteId", authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;
  const { isPinned } = req.body;
  const user = req.user;
  console.log(user);

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });
    console.log(note);
    if (!note) {
      return res.status(404).json({
        error: true,
        msg: "Note not found",
      });
    }

    note.isPinned = isPinned;

    await note.save();

    return res.status(200).json({
      error: false,
      note,
      message: "Note Updated Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

//Search notes
app.get("/search-note/", authenticateToken, async (req, res) => {
  const { user } = req.user;
  const { query } = req.query;
  //console.log(user);
  console.log(query);

  if (!query) {
    return res
      .status(400)
      .json({ error: true, message: "search query is required " });
  }

  try {
    const matchingNotes = await Note.find({
      userId: user._id,
      $or: [
        { title: { $regex: new RegExp(query, "i") } },
        { content: { $regex: new RegExp(query, "i") } },
      ],
    });
    console.log(matchingNotes);
    return res.json({
      error: false,
      notes: matchingNotes,
      message: "Notes matching the search query",
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: "Internal Sever Error ",
    });
  }
});

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server started at ${PORT}`);
});
module.exports = app;
