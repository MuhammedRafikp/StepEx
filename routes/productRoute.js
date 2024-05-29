import express from "express";
const products_route = express();

import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

products_route.set("view engine", "ejs");
products_route.set("views", "./views/admin");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/uploads/productImages'));
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '-' + file.originalname;
        cb(null, name);
    }
});

import { isLogin, isLogout } from "../middleware/adminAuth.js"
import { loadProducts, loadAddProduct, addProduct, unlistProduct, loadUnlsitedProducts, retrieveProduct, loadEditProduct, editProduct } from "../controllers/productController.js";

const upload = multer({ storage: storage }).array('images', 5);


products_route.get("/products", isLogin, loadProducts);

products_route.get("/products/add-product", isLogin, loadAddProduct);

products_route.post("/products/add-product", isLogin, upload, addProduct);

products_route.get("/products/unlisted-products", isLogin, loadUnlsitedProducts);

products_route.post("/products/unlist-product", isLogin, unlistProduct);

products_route.post("/products/retrieve-product", isLogin, retrieveProduct)

products_route.get("/products/edit-product", isLogin, loadEditProduct);

products_route.post("/products/edit-product", isLogin, upload, editProduct);


export default products_route;
