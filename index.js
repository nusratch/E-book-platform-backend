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

const uri = process.env.MONGO_URI;

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
    await client.db("admin").command({ ping: 1 });

    console.log("MongoDB Connected Successfully");

    const database = client.db("ebookPlatform");

    const ebooksCollection = database.collection("ebooks");
    const usersCollection = database.collection("users");
    const purchasesCollection = database.collection("purchases");
    const bookmarksCollection = database.collection("bookmarks");
    const transactionsCollection = database.collection("transactions");

    console.log("Collections Ready");

    app.post("/jwt", async (req, res) => {
      try {
        const token = jwt.sign(req.body, process.env.JWT_SECRET, {
          expiresIn: "7d",
        });

        res.send({ token });
      } catch (error) {
        console.log(error);

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
        console.log(error);

        res.status(500).send({
          message: "Server Error",
        });
      }
    });

    app.get("/users/:email", async (req, res) => {
      try {
        const result = await usersCollection.findOne({
          email: req.params.email,
        });

        res.send(result);
      } catch (error) {
        console.log(error);

        res.status(500).send({
          message: "Server Error",
        });
      }
    });
app.post("/bookmarks", async (req, res) => {
      try {
        const bookmark = req.body;

        const existing = await bookmarksCollection.findOne({
          email: bookmark.email,
          ebookId: bookmark.ebookId,
        });

        if (existing) {
          return res.status(400).send({
            message: "Already bookmarked",
          });
        }

        const result = await bookmarksCollection.insertOne(bookmark);

        res.send(result);
      } catch (error) {
        console.log(error);

        res.status(500).send({
          message: "Server Error",
        });
      }
    });

    app.get("/bookmarks/:email", async (req, res) => {
      try {
        const result = await bookmarksCollection
          .find({
            email: req.params.email,
          })
          .toArray();

        res.send(result);
      } catch (error) {
        console.log(error);

        res.status(500).send({
          message: "Server Error",
        });
      }
    });

    app.delete("/bookmarks/:id", async (req, res) => {
      try {
        const result = await bookmarksCollection.deleteOne({
          _id: new ObjectId(req.params.id),
        });

        res.send(result);
      } catch (error) {
        console.log(error);

        res.status(500).send({
          message: "Server Error",
        });
      }
    });

    app.post("/purchases", async (req, res) => {
      try {
        const purchase = req.body;

        const existing = await purchasesCollection.findOne({
          email: purchase.email,
          ebookId: purchase.ebookId,
        });

        if (existing) {
          return res.status(400).send({
            message: "Already purchased",
          });
        }

        const result = await purchasesCollection.insertOne({
          ...purchase,
          purchaseDate: new Date(),
          status: "Purchased",
        });

        res.send(result);
      } catch (error) {
        console.log(error);

        res.status(500).send({
          message: "Server Error",
        });
      }
    });

    app.get("/purchases/:email", async (req, res) => {
      try {
        const result = await purchasesCollection
          .find({
            email: req.params.email,
          })
          .sort({
            purchaseDate: -1,
          })
          .toArray();

        res.send(result);
      } catch (error) {
        console.log(error);

        res.status(500).send({
          message: "Server Error",
        });
      }
    });

    app.post("/transactions", async (req, res) => {
      try {
        const result = await transactionsCollection.insertOne({
          ...req.body,
          date: new Date(),
        });

        res.send(result);
      } catch (error) {
        console.log(error);

        res.status(500).send({
          message: "Server Error",
        });
      }
    });

    app.get("/transactions", async (req, res) => {
      try {
        const result = await transactionsCollection
          .find()
          .sort({
            date: -1,
          })
          .toArray();

        res.send(result);
      } catch (error) {
        console.log(error);

        res.status(500).send({
          message: "Server Error",
        });
      }
    });

    app.get("/sales/:writer", async (req, res) => {
      try {
        const result = await purchasesCollection
          .find({
            writer: req.params.writer,
          })
          .sort({
            purchaseDate: -1,
          })
          .toArray();

        res.send(result);
      } catch (error) {
        console.log(error);

        res.status(500).send({
          message: "Server Error",
        });
      }
    });

    app.post("/ebooks", async (req, res) => {
      try {
        const ebook = {
          ...req.body,
          createdAt: new Date(),
          status: "available",
        };

        const result = await ebooksCollection.insertOne(ebook);

        res.send(result);
      } catch (error) {
        console.log(error);

        res.status(500).send({
          message: "Server Error",
        });
      }
    });

    app.get("/ebooks", async (req, res) => {
      try {
        const result = await ebooksCollection
          .find()
          .sort({
            createdAt: -1,
          })
          .toArray();

        res.send(result);
      } catch (error) {
        console.log(error);

        res.status(500).send({
          message: "Server Error",
        });
      }
    });

    app.get("/writer/:email", async (req, res) => {
      try {
        const result = await ebooksCollection
          .find({
            writerEmail: req.params.email,
          })
          .sort({
            createdAt: -1,
          })
          .toArray();

        res.send(result);
      } catch (error) {
        console.log(error);

        res.status(500).send({
          message: "Server Error",
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
        console.log(error);

        res.status(500).send({
          message: "Server Error",
        });
      }
    });

    app.put("/ebooks/:id", async (req, res) => {
      try {
        const id = req.params.id;

        const result = await ebooksCollection.updateOne(
          {
            _id: new ObjectId(id),
          },
          {
            $set: req.body,
          }
        );

        res.send(result);
      } catch (error) {
        console.log(error);

        res.status(500).send({
          message: "Server Error",
        });
      }
    });

    app.delete("/ebooks/:id", async (req, res) => {
      try {
        const result = await ebooksCollection.deleteOne({
          _id: new ObjectId(req.params.id),
        });

        res.send(result);
      } catch (error) {
        console.log(error);

        res.status(500).send({
          message: "Server Error",
        });
      }
    });

    app.patch("/ebooks/:id/sold", async (req, res) => {
      try {
        const result = await ebooksCollection.updateOne(
          {
            _id: new ObjectId(req.params.id),
          },
          {
            $set: {
              status: "sold",
            },
          }
        );

        res.send(result);
      } catch (error) {
        console.log(error);

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