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

// const loadDashboard = async (req, res) => {
//     try {
//         let salesData = [];
//         const { timePeriod } = req.query;
//         let startDate, endDate;

//         switch (timePeriod) {
//             case 'today':
//                 startDate = new Date();
//                 startDate.setHours(0, 0, 0, 0);
//                 endDate = new Date();
//                 endDate.setHours(23, 59, 59, 999);
//                 break;
//             case 'this-week':
//                 startDate = new Date();
//                 startDate.setDate(startDate.getDate() - startDate.getDay()); 
//                 endDate = new Date(startDate);
//                 endDate.setDate(endDate.getDate() + 6); 
//                 break;
//             case 'this-month':
//                 startDate = new Date();
//                 startDate.setDate(1); 
//                 endDate = new Date();
//                 endDate.setDate(endDate.getDate() - 1); 
//                 break;
//             case 'this-year':
//                 startDate = new Date();
//                 startDate.setMonth(0, 1);
//                 endDate = new Date();
//                 endDate.setFullYear(startDate.getFullYear() + 1); 
//                 endDate.setDate(endDate.getDate() - 1); 
//                 break;
//             default:
//                 // For other cases or default, no need to set start and end dates
//                 break;
//         }

//         if (startDate && endDate) {
//             salesData = await Order.aggregate([
//                 { $match: { "date": { $gte: startDate, $lte: endDate } } },
//                 { $unwind: "$items" },
//                 { $match: { "items.status": { $nin: ["Cancelled", "Returned"] } } },
//                 {
//                     $lookup: {
//                         from: "products",
//                         localField: "items.product_id",
//                         foreignField: "_id",
//                         as: "productDetails"
//                     }
//                 },
//                 { $unwind: "$productDetails" },
//                 { $sort: { date: -1 } }
//             ]);
//         } else {
//             // Fetch default sales data
//             salesData = await Order.aggregate([
//                 { $unwind: "$items" },
//                 { $match: { "items.status": { $nin: ["Cancelled", "Returned"] } } },
//                 {
//                     $lookup: {
//                         from: "products",
//                         localField: "items.product_id",
//                         foreignField: "_id",
//                         as: "productDetails"
//                     }
//                 },
//                 { $unwind: "$productDetails" },
//                 { $sort: { date: -1 } }
//             ]);
//         }

//         console.log(bestSellingCategories, "mostSellingCategories")
//         res.render("dashboard", { sales: salesData});

//     } catch (error) {
//         console.log(error.message)
//     }
// }


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



// const loadDashboard = async (req, res) => {
//     try {
//         let salesData;
//         const { timePeriod } = req.query;
//         let startDate, endDate;
//         const today = new Date();
//         switch (timePeriod) {
//             case 'today':

//                 startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
//                 endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
//                 break;
//             case 'this-week':
//                 // startDate = new Date();
//                 // startDate.setDate(startDate.getDate() - startDate.getDay());
//                 // startDate.setHours(0, 0, 0, 0);
//                 // endDate = new Date(startDate);
//                 // endDate.setDate(endDate.getDate() + 6);
//                 // endDate.setHours(23, 59, 59, 999);

//                 startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);
//                 startDate.setHours(0, 0, 0, 0);
//                 endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
//                 endDate.setHours(23, 59, 59, 999);
//                 break;
//             case 'this-month':
//                 // startDate = new Date();
//                 // startDate.setDate(1);
//                 // startDate.setHours(0, 0, 0, 0);
//                 // endDate = new Date();
//                 // endDate.setMonth(startDate.getMonth() + 1, 0);
//                 // endDate.setHours(23, 59, 59, 999);

//                 startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29);
//                 endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
//                 break;
//             case 'this-year':
//                 startDate = new Date();
//                 startDate.setMonth(0, 1);
//                 startDate.setHours(0, 0, 0, 0);
//                 endDate = new Date();
//                 endDate.setMonth(12, 0);
//                 endDate.setHours(23, 59, 59, 999);
//                 break;
//             default:
//                 break;
//         }

//         if (startDate && endDate) {

//             console.log("startDate:", startDate, "endDate:", endDate);
//             // salesData = await Order.find({});
//             // salesData = await Order.aggregate([
//             //     { $unwind: "$items" },
//             //     { $match: { "items.status": { $nin: ["Cancelled", "Returned"] } } },
//             //     {
//             //         $lookup: {
//             //             from: "products",
//             //             localField: "items.product_id",
//             //             foreignField: "_id",
//             //             as: "productDetails"
//             //         }
//             //     },
//             //     { $unwind: "$productDetails" },
//             //     { $sort: { date: -1 } }
//             // ]);

//             salesData = await Order.aggregate([
//                 {
//                     $match: {
//                         date: { $gt: startDate, $lt: endDate }
//                     }
//                 },
//                 { $unwind: "$items" },
//                 { $match: { "items.status": { $nin: ["Cancelled", "Returned"] } } },
//                 {
//                     $lookup: {
//                         from: "products",
//                         localField: "items.product_id",
//                         foreignField: "_id",
//                         as: "productDetails"
//                     }
//                 },
//                 { $unwind: "$productDetails" },
//                 { $sort: { date: -1 } }
//             ]);


//         } else {
//             salesData = await Order.aggregate([
//                 { $unwind: "$items" },
//                 { $match: { "items.status": { $nin: ["Cancelled", "Returned"] } } },
//                 { $group: { _id: null, totalAmount: { $sum: "$items.price" } } }
//             ]);
//         }

//         console.log("salesData:", salesData);


//         let xValues = [];
//         let yValues = [];

//         if (timePeriod === 'today') {
//             xValues = [new Date().toLocaleDateString()];
//             yValues = salesData.map(data => data.totalAmount);
//         } else if (timePeriod === 'this-week') {
//             const startOfWeek = new Date(startDate);
//             for (let i = 0; i < 7; i++) {
//                 const currentDate = new Date(startOfWeek);
//                 currentDate.setDate(startOfWeek.getDate() + i);
//                 xValues.push(currentDate.getDate()); // Push only the day of the month (DD)
//             }
//             yValues = Array(7).fill(0);
//             salesData.forEach(data => {
//                 const dayIndex = new Date(data._id).getDay();
//                 yValues[dayIndex] += data.totalAmount;
//             });

//         } else if (timePeriod === 'this-month') {
//             const daysInMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
//             for (let i = 1; i <= daysInMonth; i++) {
//                 xValues.push(i); // Push only the day of the month (DD)
//             }
//             yValues = Array(daysInMonth).fill(0);
//             salesData.forEach(data => {
//                 const date = new Date(data._id).getDate();
//                 yValues[date - 1] += data.totalAmount;
//             });
//         } else if (timePeriod === 'this-year') {
//             xValues = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
//             yValues = Array(12).fill(0);
//             salesData.forEach(data => {
//                 const month = new Date(data._id).getMonth();
//                 yValues[month] += data.totalAmount;
//             });
//         }

//         console.log("xValues:", xValues, "yValues:", yValues);

//         const bestSellingProducts = await Order.aggregate([
//             { $unwind: "$items" },
//             { $match: { "items.status": { $nin: ["Cancelled", "Returned"] } } },
//             {
//                 $group: {
//                     _id: "$items.product_id",
//                     totalQuantitySold: { $sum: 1 } // Summing the quantity
//                 }
//             },
//             { $sort: { totalQuantitySold: -1 } },
//             { $limit: 4 }, // Limit to top 5 most selling products
//             {
//                 $lookup: {
//                     from: "products",
//                     localField: "_id",
//                     foreignField: "_id",
//                     as: "productDetails"
//                 }
//             },
//             { $unwind: "$productDetails" } // Unwind to get the product details
//         ]);


//         const bestSellingCategories = await Order.aggregate([
//             { $unwind: "$items" },
//             { $match: { "items.status": { $nin: ["Cancelled", "Returned"] } } },
//             {
//                 $group: {
//                     _id: "$items.category",
//                     totalQuantitySold: { $sum: 1 } // Summing the quantity
//                 }
//             },
//             { $sort: { totalQuantitySold: -1 } },
//             { $limit: 2 }, // Limit to top 5 most selling products
//             {
//                 $lookup: {
//                     from: "categories",
//                     localField: "_id",
//                     foreignField: "_id",
//                     as: "categoryDetails"
//                 }
//             },
//             { $unwind: "$categoryDetails" } // Unwind to get the product details
//         ]);



//         // console.log(bestSellingCategories, "mostSellingCategories")
//         res.render("dashboard", {
//             sales: salesData,
//             xValues: xValues,
//             yValues: yValues, products: bestSellingProducts, categories: bestSellingCategories
//         });

//     } catch (error) {
//         console.log(error.message)
//     }
// }


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