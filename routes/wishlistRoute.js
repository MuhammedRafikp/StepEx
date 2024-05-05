import express from "express";
const wishlist_route = express();

wishlist_route.set("view engine", "ejs");
wishlist_route.set("views", "./views/user");

import { isLogin, isLogout } from "../middleware/auth.js";
import { isBlocked } from "../middleware/isBlocked.js";
import { loadWishlist, addToWishlist, removeProductFromWishlist } from "../controllers/wishlistController.js"

wishlist_route.get("/wishlist", isBlocked, isLogin, loadWishlist);

wishlist_route.post("/add-to-wishlist", isBlocked, isLogin, addToWishlist);

wishlist_route.post("/wishlist/remove-product", isBlocked, isLogin, removeProductFromWishlist);


export default wishlist_route;