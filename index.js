const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("my bistro server is running");
});

const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0fn8ke9.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const menuCollection = client.db('bistroDb').collection('menu'); 
    const userCollection = client.db('bistroDb').collection('users'); 
    const reviewsCollection = client.db('bistroDb').collection('reviews'); 
    const cartCollection = client.db('bistroDb').collection('carts'); 

    // user related API 

    app.get('/users', async(req, res) => {
      const result = await userCollection.find().toArray(); 
      res.send(result); 
    })

    app.post('/users', async(req, res) => {
      const user = req.body; 

      const query = {email: user.email}
      const existingUser = await userCollection.findOne(query); 
      if(existingUser){
        return res.send({message: 'User already exist', insertedId: null})
      }

      const result = await userCollection.insertOne(user); 
      res.send(result);
    })

    app.get('/menu', async(req, res) => {
        const result = await menuCollection.find().toArray(); 
        res.send(result); 
    })
    app.get('/reviews', async(req, res) => {
        const result = await reviewsCollection.find().toArray(); 
        res.send(result); 
    })

    // storing each cart data to the database

    app.get('/carts', async(req, res) => {
      const email = req.query.email; 
      const query = {email : email}
      const result = await cartCollection.find(query).toArray(); 
      res.send(result); 
    })

    app.post('/carts', async(req, res) => {
      const cartItem = req.body; 
      const result = await cartCollection.insertOne(cartItem); 
      res.send(result)
    })

    // deleting an item from someone's cart

    app.delete('/carts/:id', async(req, res) => {
      const id = req.params.id; 
      const query = {_id : new ObjectId(id)}
      const result = await cartCollection.deleteOne(query); 
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`my bistro is running from port: ${port}`);
});
