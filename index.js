const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pcz5eav.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.use(cors());
app.use(express.json());

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

    app.post("/jwt", async (req, res) => {
      const user = req.body;

      const token = jwt.sign(
        user,
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      res.send({ token });
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
        console.log(error);

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
        console.log(error);

        res.status(500).send({
          message: "Server Error",
        });
      }
    });

    app.get("/ebooks", async (req, res) => {
      const result = await ebooksCollection.find().toArray();
      res.send(result);
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
        console.log(error);

        res.status(500).send({
          message: "Server Error",
        });
      }
    });
  } catch (error) {
    console.log(error);
  }
}

run();

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});