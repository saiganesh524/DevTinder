const express = require("express");
const User = require("../models/user");
const { validateSignUpData } = require("../utils/validation");
const bcrypt = require("bcrypt");

const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  try {
    // Validation of data
    validateSignUpData(req);

    const { firstName, lastName, emailId, password } = req.body;

    // Encrypt the Password
    const encryptedPassword = await bcrypt.hash(password, 10);
    // console.log(encryptedPassword);

    // Creating new instance of the User model
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: encryptedPassword,
    });

    const savedUser = await user.save();
    const token = await savedUser.getJWT();

    res.cookie("Token", token);

    res.json({ message: "User registered successfully!", data: savedUser });
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("Invalid Credentials");
    }

    const isPasswordValid = await user.validatePassword(password);

    if (isPasswordValid) {
      const token = await user.getJWT();

      // Add the token to the cookie and send the response back
      res.cookie("Token", token);
      res.send(user);
    } else {
      throw new Error("Invalid Credentials");
    }
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

authRouter.post("/logout", async (req, res) => {
  res
    .cookie("Token", null, {
      expires: new Date(Date.now()),
    })
    .send("Logged out successfully");
});

module.exports = authRouter;
