import User from "../models/userModel.js";
import Cart from "../models/cartModel.js";
import Address from "../models/addressModel.js";
import Product from "../models/productsModel.js";
import Order from "../models/orderModel.js";
import Wallet from "../models/walletModel.js";
import Coupon from "../models/couponModel.js";
import Razorpay from "razorpay";
import dotenv from 'dotenv';

dotenv.config();

const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;

const razorpay = new Razorpay({
    key_id: RAZORPAY_ID_KEY,
    key_secret: RAZORPAY_SECRET_KEY
});


const loadCheckout = async (req, res) => {

    try {
        const userId = req.session._id;
        const userData = await User.findOne({ _id: userId });

        const address = await Address.findOne({ user_id: userId });
        const cartData = await Cart.findOne({ user_id: userId }).populate('items.products');
        const cartItemCount = cartData ? cartData.items.length : 0;

        let totalAmount = 0;
        if (cartData) {
            for (const item of cartData.items) {

                totalAmount += item.products.offer_price * item.quantity;
            }
        }

        const validCoupons = await Coupon.find({
            min_price: { $lte: totalAmount },
            validity: { $gte: new Date() }, // Check for validity
            is_active: true // Check if coupon is active
        });
        console.log(validCoupons);

        res.render("checkout-details", { user: userData, address: address, cart: cartData, coupons: validCoupons, totalAmount, cartCount: cartItemCount, req });

    } catch (error) {
        console.log(error.message);
    }
}


const proceedToCheckout = async (req, res) => {
    try {
        console.log("proceedToCheckout");
        const userId = req.session._id;
        const cartData = await Cart.findOne({ user_id: userId }).populate('items.products');

        let outOfStockProducts = [];
        let maxStockExceed = [];
        if (cartData) {
            for (const item of cartData.items) {
                console.log(item.quantity)
                const product = item.products;
                if (product.quantity <= 0) {
                    outOfStockProducts.push(product.name);
                } else if (product.quantity < item.quantity) {
                    maxStockExceed.push(product.name);
                }
            }
        }

        if (outOfStockProducts.length > 0) {
            res.status(400).json({ message: 'Few items are unavailable for checkout.Please remove them before proceeding to checkout.' });
        } else if (maxStockExceed.length > 0) {
            res.status(400).json({ message: 'Few items are exceed maximum quantity.Please reduce the quantity before proceeding to checkout.' });
        } else {
            delete req.session.discount;
            res.status(200).json();
        }

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: error.message });
    }
}


const selectAddressForCheckout = async (req, res) => {
    try {
        req.session.addressIndex = req.body.addressIndex;
        const userId = req.session._id;
        const cartData = await Cart.findOne({ user_id: userId }).populate('items.products');

        let outOfStockProducts = [];
        let maxStockExceed = [];
        if (cartData) {
            for (const item of cartData.items) {
                console.log(item.quantity)
                const product = item.products;
                if (product.quantity <= 0) {
                    outOfStockProducts.push(product.name);
                } else if (product.quantity < item.quantity) {
                    maxStockExceed.push(product.name);
                }
            }
        }

        if (outOfStockProducts.length > 0) {
            res.status(400).json({ message: 'Few items are unavailable for checkout.Please remove them before continue.' });
        } else if (maxStockExceed.length > 0) {
            res.status(400).json({ message: 'Few items are exceed maximum quantity.Please reduce the quantity before continue.' });
        } else {
            res.status(200).json({ success: true });
        }

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: error.message });
    }
}


const applyCoupon = async (req, res) => {
    try {
        console.log("apply coupon");
        const { couponCode } = req.body;
        const coupon = await Coupon.findOne({ coupon_code: couponCode });
        req.session.discount = coupon.discount;
        console.log("discount:", req.session.discount);
        res.status(200).json({ success: true });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: error.message });
    }
}

const removeCoupon = async (req, res) => {
    try {
        delete req.session.discount;
        res.status(200).json({ success: true });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: error.message });
    }
}


const loadPayment = async (req, res) => {
    try {
        const userId = req.session._id;
        const userData = await User.findOne({ _id: userId });

        const addressData = await Address.findOne({ user_id: userId });
        const cartData = await Cart.findOne({ user_id: userId }).populate('items.products');
        const cartItemCount = cartData ? cartData.items.length : 0;
        const walletData = await Wallet.findOne({ user_id: userId });
        let totalAmount = 0;

        if (cartData) {
            for (const item of cartData.items) {
                totalAmount += item.products.offer_price * item.quantity;
            }
        }
        // console.log(typeof(item.products.price ));
        console.log(addressData.address[req.session.addressIndex]);
        res.render("checkout-payment", { user: userData, address: addressData.address[req.session.addressIndex], totalAmount: totalAmount, wallet: walletData, cartCount: cartItemCount, razorpaykey: RAZORPAY_ID_KEY, req });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: error.message });
    }
}


const generateOrderID = () => {
    const min = 10000000;
    const max = 99999999;
    return Math.floor(Math.random() * (max - min + 1) + min);
}

const confirmOrder = async (req, res) => {

    try {

        console.log("confirm order");

        const { paymentMethod, paymentStatus } = req.body;
        const userId = req.session._id;
        const addressIndex = req.session.addressIndex;

        const addressData = await Address.findOne({ user_id: userId });
        const orderId = generateOrderID();
        const cartData = await Cart.findOne({ user_id: userId }).populate('items.products');

        const orders = await Order.findOne({ user: userId });
        let flag = 0;

        if (!orders) {
            flag = 1;
        }
        console.log("flag", flag)

        let outOfStockProducts = [];
        let maxStockExceed = [];
        if (cartData) {
            for (const item of cartData.items) {
                console.log(item.quantity)
                const product = item.products;

                if (product.quantity <= 0) {
                    outOfStockProducts.push(product.name);

                } else if (product.quantity < item.quantity) {
                    maxStockExceed.push(product.name);
                }
            }
        }

        if (outOfStockProducts.length > 0) {
            res.status(400).json({ message: 'Few items are unavailable for checkout.Please remove them before continue.' });
        } else if (maxStockExceed.length > 0) {
            res.status(400).json({ message: 'Few items are exceed maximum quantity.Please reduce the quantity before continue.' });
        } else {

            let totalAmount = 0;
            let discount = 0;
            const items = [];

            for (const item of cartData.items) {
                const product = await Product.findById(item.products);

                const itemDetails = {
                    product_id: item.products,
                    name: product.name,
                    price: product.offer_price,
                    category: product.category,
                    gender: product.gender,
                    brand: product.brand,
                    imageUrl: product.images[0],
                    quantity: item.quantity,
                };

                items.push(itemDetails);
                totalAmount += product.offer_price * item.quantity;
                product.quantity -= item.quantity;
                await product.save();
            }

            totalAmount = req.session.discount ? totalAmount - (totalAmount * (req.session.discount / 100)) : totalAmount;
            discount = req.session.discount ? totalAmount * (req.session.discount / 100) : discount;

            await Cart.findOneAndUpdate({ user_id: userId }, { items: [] });

            const newOrder = new Order({
                user: userId,
                orderId: orderId,
                totalAmount: totalAmount,
                discount: discount,
                items: items,
                address: addressData.address[addressIndex],
                payment_method: paymentMethod,
                payment_status: paymentStatus
            });

            await newOrder.save();
            delete req.session.discount;

            //for wallet history
            if (paymentMethod === "Wallet") {

                const wallet = await Wallet.findOne({ user_id: userId });
                const amount = totalAmount;
                const previousBalance = wallet.balance;
                const updatedBalance = previousBalance - amount;
                wallet.balance = updatedBalance;

                const transaction = {
                    amount: parseFloat(amount),
                    transaction_type: 'debit',
                    previous_balance: previousBalance
                };

                wallet.history.push(transaction);

                await wallet.save();
            }

            //referral cashback for refferal person
            if (flag === 1) {

                const userData = await User.findOne({ _id: userId });
                console.log("referredCode:", userData);
                const refferedUserData = await User.findOne({ referral_code: userData.referred_code });
                console.log("refferedUserId:", refferedUserData);

                const wallet = await Wallet.findOne({ user_id: refferedUserData._id });
                console.log("wallet:", wallet);

                const amount = 100;
                const previousBalance = wallet.balance;
                const updatedBalance = previousBalance + amount;
                wallet.balance = updatedBalance;

                const transaction = {
                    amount: parseFloat(amount),
                    transaction_type: 'Referral cashback',
                    previous_balance: previousBalance
                };

                wallet.history.push(transaction);

                await wallet.save();
            }

            //referral cashback for reffered person
            if (flag === 1) {
                let wallet = await Wallet.findOne({ user_id: userId });
                console.log(userId)
                if (!wallet) {

                    wallet = new Wallet({
                        user_id: userId,
                        balance: 0,
                        history: []
                    });
                }

                const amount = 25;
                const previousBalance = wallet.balance;
                const updatedBalance = previousBalance + amount;
                wallet.balance = updatedBalance;

                const transaction = {
                    amount: parseFloat(amount),
                    transaction_type: 'Referal cashback',
                    previous_balance: previousBalance
                };

                wallet.history.push(transaction);

                await wallet.save();
            }

            res.status(200).json({ success: true });
        }

        console.log("paymentMethod : ",paymentMethod);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: error.message });
    }
}


const generatereceiptID = () => {
    const min = 10000000;
    const max = 99999999;
    return Math.floor(Math.random() * (max - min + 1) + min);
}

const createRazorPay = async (req, res) => {
    try {
        console.log(razorpay.key_id, razorpay.key_secret);
        const userId = req.session._id;
        const cartData = await Cart.findOne({ user_id: userId }).populate('items.products');
        let totalAmount = 0;

        if (cartData) {
            for (const item of cartData.items) {
                totalAmount += item.products.price * item.quantity;
            }
        }

        const receiptID = generatereceiptID();

        const order = await razorpay.orders.create({
            amount: totalAmount * 100,
            currency: 'INR',
            receipt: `${receiptID}`,
            payment_capture: 1
        });

        res.status(200).json({ success: true, order });
    } catch (error) {
        console.error(error, "error");
        res.status(500).json({ success: false, message: 'Failed to create Razorpay order' });
    }
};



const loadOrderPlaced = async (req, res) => {
    try {
        const { status } = req.query;
        const userId = req.session._id;
        const userData = await User.findOne({ _id: userId });
        const cartData = await Cart.findOne({ user_id: userId }).populate('items.products');
        const cartItemCount = cartData ? cartData.items.length : 0;
        res.render("order-placed", { user: userData, cartCount: cartItemCount, status });

    } catch (error) {
        console.error(error.message)
        res.status(500).json({});
    }
}


export {
    loadCheckout,
    proceedToCheckout,
    applyCoupon,
    removeCoupon,
    selectAddressForCheckout,
    loadPayment,
    confirmOrder,
    loadOrderPlaced,
    createRazorPay
}