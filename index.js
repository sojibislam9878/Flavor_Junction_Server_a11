const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express()
const port = process.env.PORT || 3000

// midldle
app.use(express.json())
app.use(cors())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lb51cqq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    // Connect the client to the server	(optional starting in v4.7)
    
    const foodsCollection = client
      .db("RestaurantDB")
      .collection("allFoods");

      app.get("/allFoods",async (req, res)=>{
        const cursor = foodsCollection.find()
        const result = await cursor.toArray()
        res.send(result)
      })


      app.get("/singleFood/:id",async (req, res)=>{
        const id = req.params.id
        console.log(id);
        // const qurey = { _id: new ObjectId(id) };
        const result =await foodsCollection.findOne({_id: new ObjectId(id)})
        // const result = await cursor.toArray()
        console.log(result);
        res.send(result)

      })
  


    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get("/", (req, res)=>{
    res.send("data will come here")
})

app.listen(port, ()=>{
    console.log(`This sever is running on port no: ${port}`);
})