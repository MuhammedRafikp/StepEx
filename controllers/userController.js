import User from "../models/userModel.js";
import OTP from "../models/otpModel.js";
import Address from "../models/addressModel.js";
import Cart from "../models/cartModel.js";
import Wishlist from "../models/wishlistModel.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import dotenv from 'dotenv';

dotenv.config();

const { APP_EMAIL_ID, APP_PASSWORD } = process.env;


const securePassword = async (password) => {
    try {
        const passwordHash = bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
}


const loadhome = async (req, res) => {
    try {
        const userId = req.session._id;
        const userData = await User.findOne({ _id: userId });
        const cart = await Cart.findOne({ user_id: userId }).populate('items.products');

        const cartItemCount = cart ? cart.items.length : 0;
        console.log(cartItemCount);
        res.render("home", { user: userData, cartCount: cartItemCount });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: error.message });
    }
}


const loadLogin = async (req, res) => {
    try {
        res.render("login");
    } catch (error) {
        console.log(error.message);
    }
}


const loadRegister = async (req, res) => {
    try {
        res.render('register');
    } catch (error) {
        console.log(error.message);
    }
}


const verfyLogin = async (req, res) => {
    try {

        const { email, password } = req.body;
        const userData = await User.findOne({ email: email });

        console.log(userData);

        if (!userData) {
            console.log('User not found !');
            return res.status(404).json({ message: "Email or Password is incorrect." });
        }


        if (userData.is_block) {
            console.log('User is blocked !');
            return res.status(403).json({ message: "You have been blocked" });
        }

        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            console.log("hello");

            if (passwordMatch) {
                req.session._id = userData._id;
                res.status(200).json({ success: true });

            } else {
                res.status(400).json({ success: false, message: "Incorrect Password." });
            }

        }

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: error.message });
    }
}


const loadResetPasswordLink = async (req, res) => {
    try {
        res.render('reset-password-link');
    } catch (error) {
        console.log(error.message);
    }
}

const sentResetLink = async (username, email, token) => {
    console.log(APP_EMAIL_ID, APP_PASSWORD)

    try {
        let transporter = nodemailer.createTransport({
            service: "gmail",
            host: 'smtp.gmail.com',
            port: 587,
            secure: true,
            auth: {
                user: APP_EMAIL_ID,
                pass: APP_PASSWORD
            }
        });

        const mailOptions = {
            from: APP_EMAIL_ID,
            to: email,
            subject: "Password Reset Request",
            html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
            <h1 style="color: #3498db; text-align: center;">StepEx</h1>
            <h5 style="text-align: center; font-size: 18px;">Hi ${username},</h5>
            <p style="text-align: center; font-size: 16px;">We have received a request to reset your password.If this wasn't initiated by you, please ignore this email.</p>
            <p style="text-align: center; font-size: 16px;">To reset your password, click the link below:</p>
            <p style="text-align: center; font-size: 16px;"><a href='http://localhost:3000/reset-password?token=${token}' style="color: #2ecc71; text-decoration: none;">Reset Your Password</a></p>
            <p style="text-align: center; font-size: 16px;">This link will expire in 1 hour for security reasons.</p>
            <p style="text-align: center; font-size: 16px;">If you did not request a password reset or have any concerns, please contact our support team immediately.</p>
            <p style="text-align: center; font-size: 16px; margin: 20px 0;">Best regards,<br>StepEx</p>
          </div>
        `,
        };

        await transporter.sendMail(mailOptions);

    } catch (error) {
        console.log(error);
    }
};


const generateVerificationToken = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const verifyResetPasswordEmail = async (req, res) => {
    try {
        const { email } = req.body;
        console.log(email);
        const userData = await User.findOne({ email: email });

        if (!userData) {
            return res.status(404).json({ message: 'User not found !' });
        }

        const token = generateVerificationToken();

        await User.updateOne(
            { email: email },
            { $set: { token: token } }
        );

        sentResetLink(userData.name, userData.email, token);

        res.status(200).json({ success: true });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: error.message });
    }
};


const loadResetPassword = async (req, res) => {
    try {
        const { token } = req.query;
        console.log(token);
        const userData = await User.findOne({ token: token });
        console.log(userData);
        res.render("reset-password", { userId: userData._id });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: error.message });
    }
}


const resetPassword = async (req, res) => {
    try {
        const { userId, newPassword } = req.body;
        console.log(newPassword, userId);

        const password = await securePassword(newPassword);
        await User.findByIdAndUpdate({ _id: userId }, { $set: { password: password } });

        res.status(200).json({ success: true, message: "Your Password has been updated successfully!" })

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: error.message });
    }
}


const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000);
};

const sendOTP = async (req, res) => {
    try {

        const { email } = req.body;

        const existingUserWithEmail = await User.findOne({ email: email });

        if (existingUserWithEmail) {

            res.render("register", { email: req.body.email, name: req.body.name, mobile: req.body.mno, message: "User with the same email address already exists" });

        } else {

            const Otp = generateOTP();
            console.log(Otp)
            const spassword = await securePassword(req.body.password);

            req.session.name = req.body.name;
            req.session.email = req.body.email;
            req.session.mobile = req.body.mno;
            req.session.password = spassword;
            req.session.otpExpiration = Date.now() + 30000;
            console.log(req.session.otpExpiration)

            const otp = new OTP({
                email: req.session.email,
                OTP: Otp
            });

            const otpData = await otp.save()

            let transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: APP_EMAIL_ID,
                    pass: APP_PASSWORD
                }
            });

            let mailOptions = {
                from: '"Rafi" <rafikp@gmail.com>',
                to: req.session.email,
                subject: "Verify ",
                // text: 'Hello world?',
                html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="text-align: center; color:#3498db;">OTP Verification</h2>
                <p style="text-align: center;">Please use the following OTP to verify your email:</p>
                <div style="text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 20px;color: #2ecc71;"> ${Otp}</div>
                <p style="text-align: center;">This OTP is valid for 2 minutes.</p>
                <p style="text-align: center;">If you did not request this OTP, please ignore this message.</p>
                <p style="text-align: center;">Best regards,<br>StepEx</p>
              </div>`


            };

            await transporter.sendMail(mailOptions);

            res.render("verify-otp", { otpExpiration: req.session.otpExpiration });
        }

    } catch (error) {
        console.error(error);

    }
};


const resendOTP = async (req, res) => {
    try {
        const Otp = generateOTP();
        console.log(Otp);
        console.log(req.session.otpExpiration)
        const otp = new OTP({
            email: req.session.email,
            OTP: Otp
        });
        const otpData = await otp.save()

        let transporter = nodemailer.createTransport({
            service: "gmail",
            host: 'smtp.gmail.com',
            port: 587,
            secure: true,
            auth: {
                user: 'rafikpmty@gmail.com',
                pass: 'gxbwbnicdhrdkcsi'
            }
        });


        let mailOptions = {
            from: '"Rafi" <rafikp@gmail.com>',
            to: req.session.email,
            subject: 'Hello ✔',
            text: 'Hello world?',
            html: `<b>Your OTP is : ${Otp}</b>`
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'OTP sent successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
}


const verifyOTP = async (req, res) => {
    try {
        const { otp } = req.body;
        const { email } = req.session;
        const otpData = await OTP.findOne({ email: email, OTP: otp });

        if (otpData) {
            if (otpData.OTP == otp) {

                const user = new User({
                    name: req.session.name,
                    email: req.session.email,
                    mobile: req.session.mobile,
                    password: req.session.password,
                    is_block: 0
                });
                await user.save();
                delete req.session.name;
                delete req.session.email;
                delete req.session.mobile;
                delete req.session.password;

                res.render("login", { message: "Registration successful..!" });

            } else {

                res.render("verify-otp", { message: "Entered OTP is wrong!" });
            }
        } else {
            res.render("verify-otp", { message: "Entered OTP is wrong!" });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};


const logout = async (req, res) => {
    try {

        delete req.session._id;
        // console.log(req.session._id, )
        res.redirect("/")
    } catch (error) {
        console.error(error);
    }
}


const loadProfile = async (req, res) => {
    try {
        const userId = req.session._id;
        const userData = await User.findOne({ _id: userId });
        const cart = await Cart.findOne({ user_id: userId }).populate('items.products');

        const cartItemCount = cart ? cart.items.length : 0;

        res.render("userProfile", { user: userData, cartCount: cartItemCount });
    } catch (error) {
        console.error(error);
    }
}


const editUser = async (req, res) => {
    try {
        const userId = req.session._id;
        const { name, mobile } = req.body;
        console.log(name, "edit");

        await User.findByIdAndUpdate(
            { _id: userId },
            { $set: { name: name, mobile: mobile } }
        )

        res.status(200).json({ message: 'User information updated successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error.' }); // Send error response
    }
};


const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        // console.log(currentPassword,newPassword,"hello pswrd");
        const userId = req.session._id;

        const userData = await User.findOne({ _id: userId });
        const passwordMatch = await bcrypt.compare(currentPassword, userData.password);

        // console.log(userData.password);

        if (passwordMatch) {

            const password = await securePassword(newPassword);
            await User.findByIdAndUpdate({ _id: userId }, { $set: { password: password } });
            res.status(200).json({ message: "Your Password has been updated successfully!" })
        } else {
            res.status(400).json({ message: "Invalid Password" });
        }

    } catch (error) {

        console.error(error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};


// const loadWishlist = async (req, res) => {
//     try {
//         const userId = req.session._id;
//         const userData = await User.findOne({ _id: userId });
//         const cart = await Cart.findOne({ user_id: userId }).populate('items.products');
//         const cartItemCount = cart ? cart.items.length : 0;

//         const wishlistData = await Wishlist.findOne({ user_id: userId }).populate("items.product_id");

//         res.render("wishlist", { user: userData, wishlist: wishlistData, cartCount: cartItemCount });

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Internal server error.' });

//     }
// }

// const addToWishlist = async (req, res) => {
//     try {
//         const { productId } = req.body;
//         const userId = req.session._id;
//         const wishlist = await Wishlist.findOne({ user_id: userId });

//         if (wishlist) {
//             const existingWishlistItem = await Wishlist.findOne({ user_id: userId, 'items.product_id': productId });
//             if (existingWishlistItem) {
//                 return res.status(200).json({ success: false, message: 'Product already in wishlist' });
//             } else {
//                 await Wishlist.findOneAndUpdate(
//                     { user_id: userId },
//                     { $push: { items: { product_id: productId } } },
//                     { new: true }
//                 );
//                 res.status(200).json({ success: true, message: "Product added to Wishlist successfully" });
//             }

//         } else {

//             const newWishlistItem = new Wishlist({
//                 user_id: userId,
//                 items: [{ product_id: productId }]
//             });
//             await newWishlistItem.save();
//             res.status(200).json({ success: true, message: "Product added to Wishlist successfully" });
//         }

//         console.log(productId);
//     } catch (error) {
//         console.error(error.message);
//         res.status(500).json({ error: 'Internal server error.' });
//     }
// }


// const removeProductFromWishlist = async (req, res) => {
//     try {
//         const { productId } = req.body;
//         console.log(productId);
//         const userId = req.session._id;
//         await Wishlist.findOneAndUpdate(
//             { user_id: userId },
//             { $pull: { items: { product_id: productId } } }
//         );
//         res.status(200).json({ message: 'Product removed from wishlist successfully' });

//     } catch (error) {
//         console.error(error.message);
//         res.status(500).json({ error: 'Internal server error.' });
//     }
// }


export {
    loadhome,
    loadLogin,
    loadRegister,
    verfyLogin,
    loadResetPasswordLink,
    verifyResetPasswordEmail,
    loadResetPassword,
    resetPassword,
    sendOTP,
    resendOTP,
    verifyOTP,
    logout,
    loadProfile,
    editUser,
    changePassword,
    
}