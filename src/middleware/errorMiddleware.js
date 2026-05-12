const errorHandler = (err,req,res,next) => {

    const statusCode = err.statusCode;

    res.status(statusCode).json({
        success : false,
        message : err.message,
        data : null,
        error : process.env.NODE_ENV === "development" ? err.stack : null
    });
};

module.exports = errorHandler;
