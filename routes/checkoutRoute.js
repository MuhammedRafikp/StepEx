import express from "express";
const checkout_route = express();

checkout_route.set("view engine", "ejs");
checkout_route.set("views", "./views/user");

import { isLogin, isLogout } from "../middleware/auth.js";
import { isBlocked } from "../middleware/isBlocked.js";
import { loadCheckout, proceedToCheckout, loadPayment, selectAddressForCheckout, confirmOrder, loadOrderPlaced, createRazorPay,applyCoupon } from "../controllers/checkoutController.js";

checkout_route.post("/proceed-to-checkout", proceedToCheckout);

checkout_route.get("/checkout-details", isBlocked, isLogin, loadCheckout);

checkout_route.post("/selectAddressForCheckout", isBlocked, isLogin, selectAddressForCheckout);

checkout_route.post("/checkout/apply-coupon",applyCoupon);

checkout_route.get("/checkout-payment", isBlocked, isLogin, loadPayment);

checkout_route.post("/razorpay", isBlocked, isLogin, createRazorPay);

checkout_route.post("/order-confirm-order", isBlocked, isLogin, confirmOrder);

checkout_route.get("/order-placed", isBlocked, isLogin, loadOrderPlaced);


export default checkout_route;