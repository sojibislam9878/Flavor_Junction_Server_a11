const express = require('express');
const cors = require('cors');
const cookieParser = require("cookie-parser")
const jwt = require("jsonwebtoken")
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express()
const port = process.env.PORT || 3000

// midldle
app.use(express.json())
app.use(cookieParser())
app.use(cors({
  origin:[
    "http://localhost:5173"
  ], 
  credentials:true
}))


const verify = (req, res, next)=>{
  const token = req?.cookies?.token
  if (!token) {
    return res.status(401).send({message: "unauthorized access"})
  }
  jwt.verify(token, process.env.ACC_TOKEN_SECRET, (err,decoded)=>{
    if (err) {
      return res.status(401).send({message: "unauthorized access"})
    }
    req.user = decoded;
    next()

  })
}

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

    const purchaseFoodsCollection = client
      .db("RestaurantDB")
      .collection("purchaseFoods");

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


      app.get("/myaddedfoods/:email", verify,  async (req, res)=>{
        console.log("owner info", req.user.email);
        console.log("requit info", req.params.email);
        // if (req.user.email !== req.params.email) {
        //   return console.log("cor tumi");
          
        // }
        if (req.user.email !== req.params.email) {
          return res.status(403).send({message: "forbidden access"})
        }

        const result = await foodsCollection
        .find({ email: req.params.email })
        .toArray();
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



      // purchase foods related api 

      app.post("/purchaseFoods", async (req, res)=>{
        const purchaseFood = req.body
        console.log(purchaseFood);
        const result = await purchaseFoodsCollection.insertOne(purchaseFood)
        res.send(result)
      })


      app.get("/purchaseFoods/:email", async (req, res)=>{
        // const email= req.params.email
        const result =await purchaseFoodsCollection.find({buyerEmail: req.params.email}).toArray()
        // console.log(result);
        res.send(result)
      })

      // jwt related api 
      app.post("/jwt", async(req, res) =>{
        const user =req.body
        const token = jwt.sign(user, process.env.ACC_TOKEN_SECRET, {expiresIn: '1h'})
        res
        .cookie("token" , token, {
          httpOnly: true, 
          secure:true,
          sameSite:"none"
        })
        .send({success: true})

      })


      app.post("/logout", async (req, res)=>{
        const user =req.body
        console.log(user);
        res.clearCookie("token", {maxAge:0}).send({success:true})
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