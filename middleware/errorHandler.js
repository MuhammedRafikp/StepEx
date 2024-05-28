export const errorHandler = (error, req, res, next) => {
    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error';
    console.log("statusCode:",error.statusCode);

    res.status(error.statusCode).render('user/error-500', {
        status: error.statusCode,
        message: error.message
    });
};