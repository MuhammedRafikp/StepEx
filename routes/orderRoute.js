import express from "express";
const order_route = express();

order_route.set("view engine", "ejs");
order_route.set("views", "./views/user");

import { isLogin, isLogout } from "../middleware/auth.js";
import { isBlocked } from "../middleware/isBlocked.js";
import { laodOrders, loadOrderDetails, cancelOrder, returnOrder, orderRepaymentRazorPpay, orderRepayment } from "../controllers/ordersController.js";


order_route.get("/orders", isBlocked, isLogin, laodOrders);

order_route.get("/order/order-details", isBlocked, isLogin, loadOrderDetails);

order_route.post("/orders/cancel-order", isBlocked, isLogin, cancelOrder);

order_route.post("/orders/return-order", isBlocked, isLogin, returnOrder);

order_route.post("/orders/make-repayment-razorpay",isBlocked, isLogin, orderRepaymentRazorPpay);

order_route.post("/orders/make-repayment",isBlocked, isLogin, orderRepayment);


export default order_route;