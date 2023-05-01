const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        res.status(400).json({ message: "All fields are mandatory!" });
        return;
    }
    const userAvailable = await User.findOne({ email });
    if (userAvailable) {
        res.status(400).json({ message: "User already registered !" });
        return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
        username,
        email,
        password: hashedPassword,
    });
    console.log(`User created ${user}`);
    if (user) {
        res.status(201).json({ text: "Success register !", });
    } else {
        res.status(400);
        throw new Error("User data is not valid");
    }
});

const loginUser = asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: "All fields are mandatory!" });
            return;
        }
        const user = await User.findOne({ email });
        // compare password with hashedpassword
        if (user && (await bcrypt.compare(password, user.password))) {
            const token = jwt.sign(
                {
                    user: {
                        username: user.username,
                        email: user.email,
                        id: user.id,
                    },
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: "15m" }
            );
            // Send the token in a cookie
            res.cookie('token', token, { httpOnly: true, secure: true });
            res.status(200).json({ token });
        } else {
            res.status(401);
            throw new Error("Email or password is not valid");
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const currentUser = asyncHandler(async (req, res) => {
    res.json(req.user);
});

// const logout = async (req, res) => {
//     // const token = req.headers.authorization.split(" ")[1];
//     // req.logout();
//     res.status(200).json({ message: "Logout Successful!" });
// }

// const logout = asyncHandler(async (req, res) => {
//     try {
//         // Clear the token cookie
//         res.clearCookie('token', { httpOnly: true, secure: true });
//         res.status(200).json({ message: "Logout successful" });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });

// const logout = asyncHandler(async (req, res) => {
//     try {
//         // Clear the token cookie
//         res.clearCookie('token', {
//             httpOnly: true,
//             secure: true,
//             expires: new Date(0)
//         });
//         res.status(200).json({ message: "Logout successful" });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });

module.exports = { registerUser, loginUser, currentUser };

