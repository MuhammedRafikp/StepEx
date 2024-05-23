import express from "express";
const admin_route = express();

admin_route.set("view engine", "ejs");
admin_route.set("views", "./views/admin");

import { isLogin, isLogout } from "../middleware/adminAuth.js"
import { loadLogin, verfyLogin, loadDashboard, loadUsers, blockUser, unBlockUser, logout } from "../controllers/adminController.js";


admin_route.get("/", isLogout, loadLogin);

admin_route.post("/", isLogout, verfyLogin);

admin_route.get("/dashboard",  loadDashboard);

admin_route.get("/logout", isLogin, logout);

admin_route.get('/user-management', isLogin, loadUsers);

admin_route.post('/user-management/block-user', isLogin, blockUser);

admin_route.post('/user-management/unblock-user',isLogin, unBlockUser);


export default admin_route;
