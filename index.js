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

    const galleryCollection = client
      .db("RestaurantDB")
      .collection("allGallery");

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


      app.get("/myaddedfoods/:email", async (req, res)=>{
        console.log(req.params.email);
        const result = await foodsCollection
        .find({ email: req.params.email })
        .toArray();
        console.log(result);
        res.send(result)
      })


      app.post("/allFoods" , async (req, res)=>{
        const newFood = req.body
        const result = await foodsCollection.insertOne(newFood)
        res.send(result)
      })

      app.put("/updateCard/:id", async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const options = { upsert: true };
        const updatedCard = req.body;
        const updateCard = {
          $set: {
            quantity: updatedCard.quantity,
            price: updatedCard.price,
            photo_url: updatedCard.photo_url,
            food_origin: updatedCard.food_origin,
            food_name: updatedCard.food_name,
            food_category: updatedCard.food_category,
            description: updatedCard.description,
          },
        };
        const result = await foodsCollection.updateOne(
          filter,
          updateCard,
          options
        );
        res.send(result);
      });

      app.delete("/delete/:id", async (req, res) => {
        const id = req.params.id;
        const qurey = { _id: new ObjectId(id) };
        const result = await foodsCollection.deleteOne(qurey);
        res.send(result);
      });


      // for pagination
      app.get("/allFoodsForPagination",async (req, res)=>{
        const size = parseInt(req.query.size)
        const page =parseInt(req.query.page) - 1
        const filter = req.query.filter
        const sort =req.query.sort
        const search = req.query.search
        console.log(search);

        let query = {
          food_name :{$regex : search, $options: "i"}
        }
        if (filter) {
          // query = {...query, food_category : filter}
          query.food_category = filter
        }

        let option = {}
        if (sort) {
          option = {sort : {price: sort==="low" ? 1 : -1} }
        }
        const result =await foodsCollection.find(query , option).skip(size*page).limit(size).toArray()
        res.send(result)
      })



      // data count 
      app.get("/allFoodsCont",async (req, res)=>{
        const filter = req.query.filter
        const search = req.query.search
        console.log(filter);
        

        let query = {
          food_name :{$regex : search, $options: "i"}
        }
        if (filter) {
          // query = {...query, food_category : filter}
          query.food_category = filter
        }
        const count =await foodsCollection.countDocuments(query)
        res.send({count})
      })


        // gallerycolleciton functions

      app.get("/gallery", async (req, res)=>{
        const cursor = galleryCollection.find()
        const result = await cursor.toArray()
        res.send(result)
      })
  
      app.post("/gallery",async (req, res)=>{
        const newGallery = req.body
        console.log(newGallery);
        const result = await galleryCollection.insertOne(newGallery);
      res.send(result);
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