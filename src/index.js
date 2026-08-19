import dns from "dns";
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: "./.env"
});

connectDB()
    .then(() => {
        app.on("error", (error) => {
            console.error("Error connecting", error);
            throw error;
        });

        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running at port: ${process.env.PORT || 8000}`);
        });
    })
    .catch((err) => {
        console.log("Mongo db failed!!!", err);
    });