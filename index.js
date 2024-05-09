const express = require('express');
const cors = require('cors');
const app = express()
const port = process.env.PORT || 3000

// midldle
app.use(express.json())
app.use(cors())


app.get("/", (req, res)=>{
    res.send("data will come here")
})
app.get("/developer", (req, res)=>{
    res.send("I am Merajul Islam Sojb. and I'm the developer")
})

app.listen(port, ()=>{
    console.log(`This sever is running on port no: ${port}`);
})