import mongoose from "mongoose";
mongoose.connect("mongodb://127.0.0.1:27017/mydb");

import express from "express";
import session from "express-session";
import { sessionSecret } from "./config/config.js";

const app = express();

app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true
}));

app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache');
    next();
});

import adminRoute from "./routes/adminRoute.js";
import CategoryRoute from "./routes/categoryRoute.js";
import productRoute from "./routes/productRoute.js";
import adminOrderRoute from "./routes/adminOrderRoute.js";
import offerRoute from "./routes/offerRoute.js";
import couponRoute from "./routes/couponRoute.js";
import bannerRoute from "./routes/bannerRoute.js";
import salesRoute from "./routes/salesRoute.js";

import userRoute from "./routes/userRoute.js";
import shopRoute from "./routes/shopeRoute.js";
import cartRoute from "./routes/cartRoute.js";
import wishlistRoute from "./routes/wishlistRoute.js";
import addressRoute from "./routes/addressRoute.js";
import checkoutRoute from "./routes/checkoutRoute.js";
import orderRoute from "./routes/orderRoute.js";
import walletRoute from "./routes/walletRoute.js";


app.use(express.static('public'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/admin", adminRoute);
app.use("/admin", productRoute);
app.use("/admin", CategoryRoute);
app.use("/admin", adminOrderRoute);
app.use("/admin", offerRoute);
app.use("/admin", couponRoute);
app.use("/admin", bannerRoute);
app.use("/admin", salesRoute);

app.use("/", userRoute);
app.use("/", shopRoute);
app.use("/", cartRoute);
app.use("/", wishlistRoute);
app.use("/", addressRoute);
app.use("/", checkoutRoute);
app.use("/", orderRoute);
app.use("/", walletRoute);

app.listen(3000, () => {
    console.log("server is running on port 3000");
});
