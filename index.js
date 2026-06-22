const { MongoClient, ServerApiVersion } = require("mongodb");

const express = require("express");
const cors = require("cors");
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
  

    console.log("MongoDB Connected Successfully");

  
    app.get("/ebooks", async (req, res) => {
      const result = await ebooksCollection.find().toArray();
      res.send(result);
    });

  } catch (error) {
    console.log(error);
  }
}

run();

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});