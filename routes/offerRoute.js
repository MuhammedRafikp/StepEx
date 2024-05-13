import express from "express";

const offer_route = express();

offer_route.set("view engine", "ejs");
offer_route.set("views", "./views/admin");

import { isLogin, isLogout } from "../middleware/adminAuth.js";
import { isBlocked } from "../middleware/isBlocked.js";
import { loadCategoryOffers, loadAddCategoryOffer, addCategoryOffer, loadEditCategoryOffer, editCategoryOffer, deleteCategoryOffer, loadProductOffers, loadAddProductOffer, addProductOffer, loadEditProductOffer, editProductOffer, deleteProductOffer } from "../controllers/offerController.js";


offer_route.get("/offers-category", isLogin, loadCategoryOffers);

offer_route.get("/offers-category/add-offer", isLogin, loadAddCategoryOffer);

offer_route.post("/offers-category/add-offer", isLogin, addCategoryOffer);

offer_route.get("/offers-category/edit-offer", isLogin, loadEditCategoryOffer);

offer_route.post("/offers-category/edit-offer", isLogin, editCategoryOffer);

offer_route.delete("/offers-category/delete-offer", isLogin, deleteCategoryOffer);

offer_route.get("/offers-product", isLogin, loadProductOffers);

offer_route.get("/offers-product/add-offer", isLogin, loadAddProductOffer);

offer_route.post("/offers-product/add-offer", isLogin, addProductOffer);

offer_route.get("/offers-product/edit-offer", isLogin, loadEditProductOffer);

offer_route.post("/offers-product/edit-offer", isLogin, editProductOffer);

offer_route.delete("/offers-product/delete-offer", isLogin, deleteProductOffer);


export default offer_route;