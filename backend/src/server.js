import "dotenv/config";
import http from "http";

import {app} from "./app.js";
import connectDB from "./db/index.js";

const server = http.createServer(app);



connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})