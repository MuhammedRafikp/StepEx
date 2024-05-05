import express from "express";

const wallet_route = express();

wallet_route.set("view engine", "ejs");
wallet_route.set("views", "./views/user");

import { isLogin, isLogout } from "../middleware/auth.js";
import { isBlocked } from "../middleware/isBlocked.js";
import { loadWallet, loadWalletHistory, loadAddMoney, addMoney, loadWithdrawMoney, WithdrawMoney, createRazorPayforAddMoney } from "../controllers/walletController.js";


wallet_route.get("/wallet", isBlocked, isLogin, loadWallet);

wallet_route.get("/wallet/add-money", isBlocked, isLogin, loadAddMoney);

wallet_route.post("/wallet/add-money-razorpay", isBlocked, isLogin, createRazorPayforAddMoney);

wallet_route.post("/wallet/add-money", isBlocked, isLogin, addMoney);

wallet_route.get("/wallet/withdraw-money", isBlocked, isLogin, loadWithdrawMoney);

wallet_route.post("/wallet/withdraw-money", isBlocked, isLogin, WithdrawMoney);

wallet_route.get("/wallet/wallet-history", isBlocked, isLogin, loadWalletHistory);


export default wallet_route;