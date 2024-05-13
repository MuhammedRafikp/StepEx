import Admin from "../models/adminModel.js";
import User from "../models/userModel.js";
import Order from "../models/orderModel.js";
import bcrypt from "bcrypt";


const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash;
    } catch (error) {
        console.log(error.message)
    }
}


const loadLogin = async (req, res) => {
    try {
        res.render("login")
    } catch (error) {
        console.log(error.message)
    }
}


const loadDashboard = async (req, res) => {
    try {
        const salesData = await Order.aggregate([
            { $unwind: "$items" },
            { $match: { "items.status": { $nin: ["Cancelled", "Returned"] } } },
            {
                $lookup: {
                    from: "products",
                    localField: "items.product_id",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },
            { $sort: { date: -1 } }
        ]);

        const bestSellingProducts = await Order.aggregate([
            { $unwind: "$items" },
            { $match: { "items.status": { $nin: ["Cancelled", "Returned"] } } },
            {
                $group: {
                    _id: "$items.product_id",
                    totalQuantitySold: { $sum: 1 } // Summing the quantity
                }
            },
            { $sort: { totalQuantitySold: -1 } },
            { $limit: 4 }, // Limit to top 5 most selling products
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" } // Unwind to get the product details
        ]);


        const bestSellingCategories = await Order.aggregate([
            { $unwind: "$items" },
            { $match: { "items.status": { $nin: ["Cancelled", "Returned"] } } },
            {
                $group: {
                    _id: "$items.category",
                    totalQuantitySold: { $sum: 1 } // Summing the quantity
                }
            },
            { $sort: { totalQuantitySold: -1 } },
            { $limit: 2 }, // Limit to top 5 most selling products
            {
                $lookup: {
                    from: "categories",
                    localField: "_id",
                    foreignField: "_id",
                    as: "categoryDetails"
                }
            },
            { $unwind: "$categoryDetails" } // Unwind to get the product details
        ]);

        // const totalSalesCount = deliveredOrders.length;
        // console.log(totalSalesCount)
        // let totalRevenue = 0;

        // deliveredOrders.forEach(order => {
        //     order.items.forEach(item => {
        //         totalRevenue += parseFloat(item.price) * parseInt(item.quantity);
        //     });
        // });

        const users = await User.find({});
        const totalUsersCount = users.length;
        console.log(salesData)
        // console.log(mostSellingProducts, "mostSellingProducts")
        console.log(bestSellingCategories, "mostSellingCategories")
        res.render("dashboard", { sales: salesData, products: bestSellingProducts, categories: bestSellingCategories });

    } catch (error) {
        console.log(error.message)
    }
}


const verfyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const adminData = await Admin.findOne({ email: email });

        if (adminData) {
            if (password == adminData.password) {
                req.session.admin_id = adminData._id;
                res.redirect("/admin/dashboard");
            } else {
                res.render('login', { message: "Email or Password is incorrect." })
            }

        } else {
            res.render('login', { message: "Email or Password is incorrect." })
        }

    } catch (error) {
        console.log(error.message);
    }
}


const loadUsers = async (req, res) => {
    try {
        const page = req.query.page || 1;
        const limit = 10;
        const skip = (page - 1) * limit;
        const users = await User.find({}).skip(skip).limit(limit);
        const totalUsers = await User.countDocuments({});

        const totalPages = Math.ceil(totalUsers / limit);

        res.render("users", { users, totalPages, currentPage: page })
    } catch (error) {

        console.error('Error fetching users:', error);

    }
};


const blockUser = async (req, res) => {
    try {
        const id = req.query.id;
        console.log(id)
        await User.updateOne(
            { _id: id },
            { $set: { is_block: 1 } }
        );

        res.redirect("/admin/user-management");
    } catch (error) {
        console.log(error.message)
    }
}


const unBlockUser = async (req, res) => {
    try {
        const id = req.query.id;
        console.log(id)

        await User.updateOne(
            { _id: id },
            { $set: { is_block: 0 } }
        );
        res.redirect("/admin/user-management");
    } catch (error) {
        console.log(error.message)
    }
}


const logout = async (req, res) => {
    try {
        delete req.session.admin_id;
        res.redirect("/admin");

    } catch (error) {
        console.log(error.message)
    }
}



export {
    securePassword,
    loadLogin,
    loadDashboard,
    verfyLogin,
    loadUsers,
    blockUser,
    unBlockUser,
    logout
}