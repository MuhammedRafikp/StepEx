import express from "express";

const user_route = express();


user_route.set("view engine", "ejs");
user_route.set("views", "./views/user");

import { isLogin, isLogout } from "../middleware/auth.js";
import { isBlocked } from "../middleware/isBlocked.js";
import { loadhome, loadLogin, loadRegister, verfyLogin, loadResetPasswordLink, verifyResetPasswordEmail, resetPassword, sendOTP, verifyOTP, resendOTP, logout, loadProfile, editUser, changePassword, loadResetPassword,loadError404,loadError500 } from "../controllers/userController.js";


user_route.get("/", isBlocked, loadhome);

user_route.get("/login", isLogout, loadLogin);

user_route.get("/reset-password-link", loadResetPasswordLink);

user_route.post("/reset-password-link", verifyResetPasswordEmail);

user_route.get("/reset-password", loadResetPassword);

user_route.post("/reset-password", resetPassword);

user_route.get("/register", isLogout, loadRegister);

user_route.post("/register", isLogout, sendOTP);

user_route.post("/verify-otp", isLogout, verifyOTP);

user_route.post("/resend-otp", isLogout, resendOTP);

user_route.post("/login", isLogout, verfyLogin);

user_route.get("/logout", isLogin, logout);

user_route.get("/profile", isBlocked, isLogin, loadProfile);

user_route.post("/edit-user", isBlocked, isLogin, editUser);

user_route.post("/change-password", isBlocked, isLogin, changePassword);

user_route.get("/error-404",loadError404);

user_route.get("/error-500",loadError500);


export default user_route;