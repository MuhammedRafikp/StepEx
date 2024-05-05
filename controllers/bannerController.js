import User from "../models/userModel.js";

const loadBanners = async (req, res) => {
    try {
        const id = req.session._id;
        const userData = await User.findOne({ _id: id });
        res.render("banners", { user: userData });
    } catch (error) {
        console.error(error);
    }
}

export {
    loadBanners,
}