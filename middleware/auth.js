
export const isLogin = async (req, res, next) => {

    try {
        if (req.session._id) {
            next();
        } else {
            res.redirect('/')
        }

    } catch (error) {
        console.log(error.message);
    }
}

export const isLogout = async (req, res, next) => {

    try {
        if (req.session._id) {
            res.redirect('/');
        } else {
            next();
        }

    } catch (error) {
        console.log(error.message);
    }
}

