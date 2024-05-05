import express from "express";
const cart_route = express();

cart_route.set("view engine", "ejs");
cart_route.set("views", "./views/user");

import { isLogin, isLogout } from "../middleware/auth.js";
import { isBlocked } from "../middleware/isBlocked.js";
import { loadCart, addToCart, updateCartQuantity, removeProductFromCart} from "../controllers/cartController.js";


cart_route.get("/cart", isBlocked, isLogin, loadCart);

cart_route.post("/add-to-cart", isBlocked, isLogin, addToCart);

cart_route.post("/cart/update-quantity", isBlocked, isLogin, updateCartQuantity);

cart_route.delete("/cart/remove-product", isBlocked, isLogin, removeProductFromCart);


export default cart_route;