import dns from "dns";
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import dotenv from "dotenv";

dotenv.config({
    path: "./.env"
});

const { default: connectDB } = await import("./db/index.js");
const { app } = await import("./app.js");

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