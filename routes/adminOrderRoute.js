import express from "express";
const admin_order_route = express();

admin_order_route.set("view engine", "ejs");
admin_order_route.set("views", "./views/admin");

import { isLogin, isLogout } from "../middleware/adminAuth.js";
import{loadAdminOrders,loadAdminOrderDetails,changeOrderStatus,approveReturn,declineReturn} from "../controllers/ordersController.js";

admin_order_route.get("/orders",isLogin,loadAdminOrders);

admin_order_route.get("/orders/order-details",isLogin,loadAdminOrderDetails)

admin_order_route.post("/orders/order-details/change-status",isLogin,changeOrderStatus);

admin_order_route.post("/orders/order-details/return-approve",isLogin,approveReturn);

admin_order_route.post("/orders/order-details/return-decline",isLogin,declineReturn);


export default admin_order_route;