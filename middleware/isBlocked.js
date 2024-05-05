import User from "../models/userModel.js";

export const isBlocked = async (req, res, next) => {
    try {
        const user = await User.findOne({ _id: req.session._id });

        if (user) {
            if (!user.is_block) {
                next();
            } else {
                delete req.session._id;
                res.redirect("/login?blocked=true");
            }
        } else {
            next();
        }
    } catch (error) {
        console.error(error.message);
        next();
    }
}

