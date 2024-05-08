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
        let salesData = await Order.find({});
        const deliveredOrders = salesData.filter(order => order.items.some(item => item.status === 'Delivered'));
        
        const totalSalesCount = deliveredOrders.length;
        console.log(totalSalesCount)
        let totalRevenue = 0;
        deliveredOrders.forEach(order => {
            order.items.forEach(item => {
                totalRevenue += parseFloat(item.price) * parseInt(item.quantity);
            });
        });
        const users = await User.find({});
        
       
        const totalUsersCount = users.length;
        res.render("dashboard",{ totalSalesCount, totalRevenue,totalUsersCount });

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