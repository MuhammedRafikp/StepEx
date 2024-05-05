import express from "express";
const shop_route = express();

shop_route.set("view engine", "ejs");
shop_route.set("views", "./views/user");

import { isBlocked } from "../middleware/isBlocked.js";
import { loadShop, loadSingleProduct } from "../controllers/shopController.js"


shop_route.get("/shop", isBlocked, loadShop);

shop_route.get("/shop/single", isBlocked, loadSingleProduct);


export default shop_route;