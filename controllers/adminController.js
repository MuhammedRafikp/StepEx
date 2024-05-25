import Admin from "../models/adminModel.js";
import User from "../models/userModel.js";
import Order from "../models/orderModel.js";
import products from "../models/productOfferModel.js";
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

        const { timePeriod } = req.query;
        let startDate, endDate;

        console.log(timePeriod);
        let timePeriods = ["Today", "Last Week", "Last Month", "This Year"]
        let currentPeriod = timePeriod;
        // Initialize the start and end dates based on the selected time period
        const currentDate = new Date();
        if (!timePeriod || timePeriod === 'Today') {
            startDate = new Date(currentDate.setHours(0, 0, 0, 0));
            endDate = new Date(currentDate.setHours(23, 59, 59, 999));
            currentPeriod = "Today";

        } else if (timePeriod === 'Last Week') {
            const firstDayOfWeek = currentDate.getDate() - currentDate.getDay();
            startDate = new Date(currentDate.setDate(firstDayOfWeek));
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(currentDate.setDate(firstDayOfWeek + 6));
            endDate.setHours(23, 59, 59, 999);
        } else if (timePeriod === 'Last Month') {
            startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        } else if (timePeriod === 'This Year') {
            startDate = new Date(currentDate.getFullYear(), 0, 1);
            endDate = new Date(currentDate.getFullYear(), 11, 31);
        }

        // Fetch sales data within the date range and excluding cancelled and returned statuses
        const salesData = await Order.find({
            date: { $gte: startDate, $lte: endDate },
            'items.status': { $nin: ["Cancelled", "Returned"] }
        });

        // Initialize xValues and yValues arrays
        let xValues = [];
        let yValues = [];

        if (!timePeriod || timePeriod === 'Today') {
            xValues.push(currentDate.getDate());
            yValues.push(salesData.reduce((total, order) => total + order.totalAmount, 0));

        } else if (timePeriod === 'Last Week' || timePeriod === 'Last Month') {
            const daysInPeriod = (timePeriod === 'Last Week') ? 7 : new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
            for (let i = 0; i < daysInPeriod; i++) {
                const currentPeriodDate = new Date(startDate);
                currentPeriodDate.setDate(startDate.getDate() + i);
                xValues.push(currentPeriodDate.getDate());
                const totalAmount = salesData.filter(order => new Date(order.date).getDate() === currentPeriodDate.getDate())
                    .reduce((total, order) => total + order.totalAmount, 0);
                yValues.push(totalAmount);
            }
        } else if (timePeriod === 'This Year') {
            for (let i = 0; i < 12; i++) {
                const currentMonth = new Date(currentDate.getFullYear(), i, 1);
                xValues.push(currentMonth.toLocaleString('default', { month: 'short' }));
                const totalAmount = salesData.filter(order => new Date(order.date).getMonth() === i)
                    .reduce((total, order) => total + order.totalAmount, 0);
                yValues.push(totalAmount);
            }
        }

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
            { $limit: 3 }, // Limit to top 5 most selling products
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


        console.log("xValues:", xValues, "yValues:", yValues);

        res.render("dashboard", {
            xValues: JSON.stringify(xValues),
            yValues: JSON.stringify(yValues),
            products: bestSellingProducts,
            categories: bestSellingCategories,
            timePeriods,
            currentPeriod,
        });

    } catch (error) {
        console.log(error.message);
    }
};


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