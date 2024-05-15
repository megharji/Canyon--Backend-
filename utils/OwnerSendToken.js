exports.Ownersendtoken = (owner, statusCode, res) => {
    const Ownertoken = owner.getjwttoken();
    const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        secure: true,
        sameSite: "None"
    };

    res.cookie("jwt", Ownertoken, options);
    res.status(statusCode).json({ success: true, id: owner._id, Ownertoken });
};
