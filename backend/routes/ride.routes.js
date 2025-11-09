const express = require("express");
const router = express.Router();
const { body, query } = require("express-validator");
const rideController = require("../controllers/ride.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.post(
  "/create",
  authMiddleware.authUser,
  body("pickup")
    .isString()
    .isLength({ min: 3 })
    .withMessage("invalid pickup address"),
  body("destination")
    .isString()
    .isLength({ min: 3 })
    .withMessage("invalid destination address"),
  // vehicleType validation is handled inside controller to accept common client variants

  rideController.createRide
);

router.get(
  "/get-fare",
  authMiddleware.authUser,
  query("pickup").isString().isLength({ min: 3 }).withMessage("invalid pickup"),
  query("destination")
    .isString()
    .isLength({ min: 3 })
    .withMessage("invalid destination"),
  rideController.getFare
);

router.post(
  "/confirm",
  authMiddleware.authCaptain,
  body("rideId").isMongoId().withMessage("invalid rideId"),
  rideController.confirmRide
);

router.get(
  "/start-ride",
  authMiddleware.authCaptain,
  query("rideId").isMongoId().withMessage("invalid rideId"),
  query("otp").isLength({ min: 6, max: 6 }).withMessage("invalid otp"),
  rideController.startRide
);

// Allow POST as well (some clients may send body instead of query params)
router.post(
  "/start-ride",
  authMiddleware.authCaptain,
  body("rideId").isMongoId().withMessage("invalid rideId"),
  body("otp").isLength({ min: 6, max: 6 }).withMessage("invalid otp"),
  rideController.startRide
);

router.post(
  "/end-ride",
  authMiddleware.authCaptain,
  body("rideId").isMongoId().withMessage("invalid ride id "),
  rideController.endRide
);

module.exports = router;
