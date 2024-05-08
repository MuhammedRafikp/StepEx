import express from "express";

const coupon_route = express();

coupon_route.set("view engine", "ejs");
coupon_route.set("views", "./views/admin");

import { isLogin, isLogout } from "../middleware/auth.js";
import { isBlocked } from "../middleware/isBlocked.js";
import { loadCoupons, loadAddCoupon, addCoupon, loadEditCoupon, editCoupon, deleteCoupon, activateCoupon, deactivateCoupon } from "../controllers/couponController.js";


coupon_route.get("/coupons", isLogin, loadCoupons);

coupon_route.get("/coupons/add-coupon", isLogin, loadAddCoupon);

coupon_route.post("/coupons/add-coupon", isLogin, addCoupon);

coupon_route.get("/coupons/edit-coupon", isLogin, loadEditCoupon);

coupon_route.post("/coupons/edit-coupon", isLogin, editCoupon);

coupon_route.patch("/coupons/activate-coupon", isLogin, activateCoupon);

coupon_route.patch("/coupons/deactivate-coupon", isLogin, deactivateCoupon);

coupon_route.delete("/coupons/delete-coupon", isLogin, deleteCoupon);


export default coupon_route;