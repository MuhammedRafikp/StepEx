import express from "express";

const banner_route=express();

banner_route.set("view engine","ejs");
banner_route.set("views", "./views/admin");

import { isLogin, isLogout } from "../middleware/auth.js";
import { isBlocked } from "../middleware/isBlocked.js";
import {loadBanners} from "../controllers/bannerController.js";


// banner_route.get("/banners",loadBanners);


export default banner_route;