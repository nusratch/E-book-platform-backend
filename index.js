const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

app.use(express.json());

const uri = MONGO_URI;
console.log("MONGO_URI Exists:", !!process.env.MONGO_URI);

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.send("Ebook Platform Server Running");
});

async function run() {
  try {
    console.log("Connecting MongoDB...");

    await client.connect();

    console.log("MongoDB Connected Successfully");

    const database = client.db("ebookPlatform");

    const ebooksCollection = database.collection("ebooks");
    const usersCollection = database.collection("users");

    console.log("Collections Ready");

    app.post("/jwt", async (req, res) => {
      try {
        const user = req.body;

        const token = jwt.sign(user, process.env.JWT_SECRET, {
          expiresIn: "7d",
        });

        res.send({ token });
      } catch (error) {
        console.log("POST /jwt Error:", error);

        res.status(500).send({
          message: "Server Error",
        });
      }
    });

    app.post("/users", async (req, res) => {
      try {
        const user = req.body;

        const existingUser = await usersCollection.findOne({
          email: user.email,
        });

        if (existingUser) {
          return res.status(400).send({
            message: "User already exists",
          });
        }

        const result = await usersCollection.insertOne(user);

        res.send(result);
      } catch (error) {
        console.log("POST /users Error:", error);

        res.status(500).send({
          message: "Server Error",
        });
      }
    });

    app.get("/users/:email", async (req, res) => {
      try {
        const email = req.params.email;

        const result = await usersCollection.findOne({
          email,
        });

        res.send(result);
      } catch (error) {
        console.log("GET /users/:email Error:", error);

        res.status(500).send({
          message: "Server Error",
        });
      }
    });

    app.get("/ebooks", async (req, res) => {
      try {
        console.log("GET /ebooks hit");

        const result = await ebooksCollection.find().toArray();

        res.send(result);
      } catch (error) {
        console.log("GET /ebooks Error:", error);

        res.status(500).send({
          message: "Server Error",
          error: error.message,
        });
      }
    });

    app.get("/ebooks/:id", async (req, res) => {
      try {
        const id = req.params.id;

        if (!ObjectId.isValid(id)) {
          return res.status(400).send({
            message: "Invalid ebook id",
          });
        }

        const result = await ebooksCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!result) {
          return res.status(404).send({
            message: "Ebook not found",
          });
        }

        res.send(result);
      } catch (error) {
        console.log("GET /ebooks/:id Error:", error);

        res.status(500).send({
          message: "Server Error",
        });
      }
    });

    console.log("All Routes Loaded Successfully");
  } catch (error) {
    console.log("MongoDB Connection Error:", error);
  }
}

run().catch(console.dir);

if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

module.exports = app;