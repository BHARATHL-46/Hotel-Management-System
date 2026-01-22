const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            console.log(`Authorization Failed: User=${req.user ? req.user.email : 'None'}, Role=${req.user ? req.user.role : 'None'}, Required roles=[${roles}]`);
            return res.status(403).json({
                message: `User role ${req.user ? req.user.role : 'Unknown'} is not authorized to access this route`
            });
        }
        next();
    };
};

module.exports = { authorize };
