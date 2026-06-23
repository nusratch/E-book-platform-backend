const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// CORS
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pcz5eav.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    await client.connect();

    const database = client.db("ebookPlatform");

    const ebooksCollection = database.collection("ebooks");
    const usersCollection = database.collection("users");

    console.log("MongoDB Connected Successfully");

    // JWT
    app.post("/jwt", async (req, res) => {
      const user = req.body;

      const token = jwt.sign(user, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.send({ token });
    });

    // Add User
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

    // Get User By Email
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

    // Get All Ebooks
    app.get("/ebooks", async (req, res) => {
      const result = await ebooksCollection.find().toArray();
      res.send(result);
    });

    // Get Single Ebook
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