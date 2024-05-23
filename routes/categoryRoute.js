import express from "express";
const category_route = express();

import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url'; // Import fileURLToPath function

const __filename = fileURLToPath(import.meta.url); // Convert module URL to filename
const __dirname = path.dirname(__filename);

category_route.set("view engine", "ejs");
category_route.set("views","./views/admin");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/uploads/categoryImages'))
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '-' + file.originalname;
        cb(null, name);
    }
});

import { isLogin, isLogout } from "../middleware/adminAuth.js"
import { loadCategory, loadAddCategory, loadEditCategory, addCategory, loadUnlistedCategories, unlistCategory, retrieveCategory, editCategory } from "../controllers/categoryController.js"

const upload = multer({ storage: storage });


category_route.get("/categories", isLogin, loadCategory);

category_route.get("/categories/add-category", isLogin, loadAddCategory);

category_route.post("/categories/add-category", upload.single('image'), isLogin, addCategory);

category_route.get("/categories/unlisted-categories", isLogin, loadUnlistedCategories);

category_route.post("/categories/unlist-category", isLogin, unlistCategory);

category_route.post("/categories/unlisted-categories/retrieve-category", isLogin, retrieveCategory);

category_route.get("/categories/edit-category", isLogin, loadEditCategory);

category_route.post("/categories/edit-category", upload.single('image'), isLogin, editCategory);


export default category_route;
