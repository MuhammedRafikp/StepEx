import express from "express";

const offer_route = express();

offer_route.set("view engine", "ejs");
offer_route.set("views", "./views/admin");

import { isLogin, isLogout } from "../middleware/auth.js";
import { isBlocked } from "../middleware/isBlocked.js";
import { loadCategoryOffers, loadAddCategoryOffer, addCategoryOffer, loadEditCategoryOffer, editCategoryOffer, deleteCategoryOffer, loadProductOffers, loadAddProductOffer, addProductOffer, loadEditProductOffer, editProductOffer, deleteProductOffer } from "../controllers/offerController.js";


offer_route.get("/offers-category", loadCategoryOffers);

offer_route.get("/offers-category/add-offer", loadAddCategoryOffer);

offer_route.post("/offers-category/add-offer", addCategoryOffer);

offer_route.get("/offers-category/edit-offer", loadEditCategoryOffer);

offer_route.post("/offers-category/edit-offer", editCategoryOffer);

offer_route.delete("/offers-category/delete-offer", deleteCategoryOffer);

offer_route.get("/offers-product", loadProductOffers);

offer_route.get("/offers-product/add-offer", loadAddProductOffer);

offer_route.post("/offers-product/add-offer", addProductOffer);

offer_route.get("/offers-product/edit-offer", loadEditProductOffer);

offer_route.post("/offers-product/edit-offer",editProductOffer);

offer_route.delete("/offers-product/delete-offer", deleteProductOffer);


export default offer_route;