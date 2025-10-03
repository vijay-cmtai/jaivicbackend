const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const validator = require("validator");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

exports.registerUser = async (req, res) => {
  const {
    fullName,
    email,
    phone,
    password,
    role,
    organization,
    membershipPlan,
  } = req.body;

  if (!fullName || !email || !phone || !role || !password) {
    return res
      .status(400)
      .json({
        message: "Please fill all required fields, including password.",
      });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: "Please provide a valid email." });
  }

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res
        .status(400)
        .json({ message: "User with this email already exists." });
    }

    const user = await User.create({
      fullName,
      email,
      phone,
      password,
      role,
      organization: role === "advertiser" ? organization : undefined,
      membershipPlan:
        role === "advertiser" || role === "subscriber"
          ? membershipPlan
          : undefined,
    });

    if (user) {
      const token = generateToken(user._id);
      res.status(201).json({
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
        token,
        message: "Registration successful!",
      });
    } else {
      res.status(400).json({ message: "Invalid user data." });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide email and password." });
  }

  try {
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      const token = generateToken(user._id);
      res.json({
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
        token,
      });
    } else {
      res.status(401).json({ message: "Invalid email or password." });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
