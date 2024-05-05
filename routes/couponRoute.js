import express from "express";

const coupon_route = express();

coupon_route.set("view engine", "ejs");
coupon_route.set("views", "./views/admin");

import { isLogin, isLogout } from "../middleware/auth.js";
import { isBlocked } from "../middleware/isBlocked.js";
import { loadCoupons, loadAddCoupon, addCoupon, loadEditCoupon, editCoupon, deleteCoupon,activateCoupon,deactivateCoupon } from "../controllers/couponController.js";


coupon_route.get("/coupons", loadCoupons);

coupon_route.get("/coupons/add-coupon", loadAddCoupon);

coupon_route.post("/coupons/add-coupon", addCoupon);

coupon_route.get("/coupons/edit-coupon", loadEditCoupon);

coupon_route.post("/coupons/edit-coupon",editCoupon);

coupon_route.patch("/coupons/activate-coupon",activateCoupon);

coupon_route.patch("/coupons/deactivate-coupon",deactivateCoupon);

coupon_route.delete("/coupons/delete-coupon",deleteCoupon);


export default coupon_route;