import express from "express";

import { isLogin, isLogout } from "../middleware/adminAuth.js";

import { loadSales } from "../controllers/salesController.js";

const sales_route = express();

sales_route.set("view engine", "ejs");
sales_route.set("views", "./views/admin");

sales_route.get("/sales", isLogin, loadSales);

export default sales_route;