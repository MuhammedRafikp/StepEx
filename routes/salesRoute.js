import express from "express";

const sales_route = express();

sales_route.set("view engine", "ejs");
sales_route.set("views", "./views/admin");

import { isLogin, isLogout } from "../middleware/adminAuth.js";
import { isBlocked } from "../middleware/isBlocked.js";
import { loadSales } from "../controllers/salesController.js";


sales_route.get("/sales", loadSales);


export default sales_route;