import express from "express";
const order_route = express();

order_route.set("view engine", "ejs");
order_route.set("views", "./views/user");

import { isLogin, isLogout } from "../middleware/auth.js";
import { isBlocked } from "../middleware/isBlocked.js";
import { laodOrders, loadOrderDetails, cancelOrder, returnOrder } from "../controllers/ordersController.js";


order_route.get("/orders", isBlocked, isLogin, laodOrders);

order_route.get("/order/order-details", isBlocked, isLogin, loadOrderDetails);

order_route.post("/orders/cancel-order", isBlocked, isLogin, cancelOrder);

order_route.post("/orders/return-order", isBlocked, isLogin, returnOrder);


export default order_route;