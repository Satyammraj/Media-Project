import dns from "dns";
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

import dotenv from "dotenv";
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js"
import connectDB from "./db/index.js"

dotenv.config({
    path: "./.env"
})


connectDB( )
.then(()=>{
    app.on("error", (error) => {
            console.error("Error connecting", error)
            throw error
    })
    app.listen(process.nextTick.PORT|| 8000, ()=>{
        console.log(`Server is running at port:${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("Mongo db failed!!!",err);
})



/*
import express from "express";

const app = express();

;(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        app.on("error", (error) => {
            console.error("Error connecting to MongoDB:", error)
            throw error
        })
        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`)
        }
    } catch (error) {
        console.error("Error connecting to MongoDB:", error)
        throw error
    }
})()
    */