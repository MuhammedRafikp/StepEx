import express from "express";
const address_route = express();

address_route.set("view engine", "ejs");
address_route.set("views", "./views/user");

import { isLogin, isLogout } from "../middleware/auth.js";
import { isBlocked } from "../middleware/isBlocked.js";
import { loadAddress, addAddress, editAddress, removeAddress } from "../controllers/addressController.js";

address_route.get("/address", isBlocked, isLogin, loadAddress);

address_route.post("/address/add-address", isBlocked, isLogin, addAddress);

address_route.post("/address/remove-address", isBlocked, isLogin, removeAddress);

address_route.patch("/address/edit-address", isBlocked, isLogin, editAddress);


export default address_route;
