import express from "express";
import UserController from "../controller/UserController.js";
import { body, validationResult } from "express-validator";
import userController from "../controller/UserController.js";
import checkUserAuth from "../middleware/Auth_Middleware.js";
import OrderController from "../controller/OrderColtroller.js";

const route = express.Router();

// Route Level Middleware - To Protect Route
route.use("/changepassword", checkUserAuth);
route.use("/loggeduser", checkUserAuth);

// Protected Routes
route.post("/changepassword", UserController.changeUserPassword);
route.post("/loggeduser", UserController.loggedUser);

//Public Routes
route.post(
  "/createuser",
  [
    body("email").isEmail(),
    body("password")
      .isLength({ min: 5 })
      .withMessage("Password should be at least 5 characters long"),
  ],
  UserController.createDoc
);

route.post(
  "/login",
  [
    body("email").isEmail(),
    body("password")
      .isLength({ min: 5 })
      .withMessage("Password should be at least 5 characters long"),
  ],
  UserController.loginDoc
);

route.post("/foodData", userController.foodDoc);
route.post(
  "/send-reset-password-email",
  UserController.sendUserPasswordResetEmail
);
route.post("/reset-password/:id/:token", UserController.userPasswordReset);



// -------------------ORDER SECTION ROUTE-----------
route.post("/myOrderData", OrderController.myOrderDetails);

export default route;
