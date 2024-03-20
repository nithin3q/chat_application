import express from "express"
import ChatRoute from './Routes/ChatRoute.js'
import MessageRoute from './Routes/MessageRoute.js'
import AuthRoute from './Routes/AuthRoute.js'
import UserRoute from './Routes/UserRoute.js'
import cors from "cors"
import mongoose from "mongoose";
import bodyParser from "body-parser"

const app=express()
const PORT = process.env.PORT || 5000 

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.listen(PORT,()=>{
    console.log(`Listening at Port ${PORT}`)
})

mongoose.connect('mongodb://localhost/mern')
.then(()=>console.log('connection is successful'))
.catch((err)=> console.error('connection failed' ,err))

app.use('/chat', ChatRoute)
app.use('/auth',AuthRoute)
app.use('/message',MessageRoute)
app.use('/user',UserRoute)
