import userModel from "../models/UserModels.js";
import bcrypt, { compare } from "bcrypt";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import transporter from "../config/EmailConfig.js";
dotenv.config();

class userController {
  static createDoc = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, email, password, confirm_password, location } = req.body;

      if (password !== confirm_password) {
        return res
          .status(400)
          .json({ error: "Password and Confirm Password must be the same" });
      }

      //----------password hashing-------------
      const salt = await bcrypt.genSalt(10);
      const hashpassword1 = await bcrypt.hash(password, salt);

      const doc = new userModel({
        name: name,
        email: email,
        password: hashpassword1,
        location: location,
      });
      //saving doc
      const result = await doc.save();

      return res.status(201).json({ success: "UserCreation success" });
    } catch (error) {
      return res
        .status(500)
        .json({ error: "An error occurred while creating the document" });
    }
  };

  //------------------------LOGIN------------------------------

  static loginDoc = async (req, res) => {
    try {
      const userEmail = req.body.email;
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const result = await userModel.findOne({ email: userEmail });
      if (!result) {
        return res
          .status(400)
          .json({ errors: "try login with correct credintials" });
      }
      // -----------------bcrypt password compare------------------

      const pwdCompare = await bcrypt.compare(
        req.body.password,
        result.password
      );

      if (!pwdCompare) {
        return res.status(400).json({ errors: "incorrect password" });
      } else {
        //  ----------GENERATE JWT TOKEN--------------
        const authToken = jwt.sign(
          { userID: result._id },
          process.env.JWT_SECRET_KEY,
          { expiresIn: "5d" }
        );

        return res.json({ success: true, authToken: authToken });
      }
    } catch (error) {
      res
        .status(500)
        .json({ error: "An error occurred during login", success: false });
    }
  };

  // -----------------FOOD-DATA-------------------------

  static foodDoc = async (req, res) => {
    try {
      res.send([global.food_items, global.foodCategory]);
    } catch (error) {
      res.send("server error");
    }
  };

  //----------------changeUserPassword-------------------------------

  static changeUserPassword = async (req, res) => {
    const { password, password_confirmation } = req.body;
    if (password && password_confirmation) {
      if (password !== password_confirmation) {
        res.send({
          status: "failed",
          message: "New Password and Confirm New Password doesn't match",
        });
      } else {
        const salt = await bcrypt.genSalt(10);
        const newHashPassword = await bcrypt.hash(password, salt);
        await userModel.findByIdAndUpdate(req.user._id, {
          $set: { password: newHashPassword },
        });
        res.send({
          status: "success",
          message: "Password changed succesfully",
        });
      }
    } else {
      res.send({ status: "failed", message: "All Fields are Required" });
    }
  };

  // -------------------loggedUser-Details-----------------------------
  static loggedUser = async (req, res) => {
    res.send({ user: req.user });
  };

  // ----------------Reset password by email------------------
  static sendUserPasswordResetEmail = async (req, res) => {
    const { email } = req.body;
    if (email) {
      const user = await userModel.findOne({ email: email });
      if (user) {
        const secret = user._id + process.env.JWT_SECRET_KEY;
        const userName = user.name;
        const token = jwt.sign({ userID: user._id }, secret, {
          expiresIn: "15m",
        });
        const link = `http://127.0.0.1:3000/user/reset/${user._id}/${token}`;

        // Send Email

        let info = await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: user.email,
          subject: "goFood- Password Reset Link",
          html: `
          Hi ${userName},
          
          There was a request to change your password!
          
          If you did not make this request then please ignore this email.
          
          Otherwise, please click this link to change your password:<a href=${link}>Click Here</a>`,
        });
        res.send({
          status: "success",
          message: "Password Reset Email Sent... Please Check Your Email",
        });
      } else {
        res.send({ status: "failed", message: "Email doesn't exists" });
      }
    } else {
      res.send({ status: "failed", message: "Email Field is Required" });
    }
  };

  // ---------------------userPasswordReset------------------------
  static userPasswordReset = async (req, res) => {
    const { password, password_confirmation } = req.body;
    const { id, token } = req.params;
    const user = await userModel.findById(id);
    const new_secret = user._id + process.env.JWT_SECRET_KEY;
    try {
      jwt.verify(token, new_secret);
      if (password && password_confirmation) {
        if (password !== password_confirmation) {
          res.send({
            status: "failed",
            message: "New Password and Confirm New Password doesn't match",
          });
        } else {
          const salt = await bcrypt.genSalt(10);
          const newHashPassword = await bcrypt.hash(password, salt);
          await userModel.findByIdAndUpdate(user._id, {
            $set: { password: newHashPassword },
          });
          res.send({
            status: "success",
            message: "Password Reset Successfully",
          });
        }
      } else {
        res.send({ status: "failed", message: "All Fields are Required" });
      }
    } catch (error) {
      res.send({ status: "failed", message: "Invalid Token" });
    }
  };
}

export default userController;
