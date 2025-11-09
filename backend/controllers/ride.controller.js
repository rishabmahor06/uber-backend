const rideService = require("../services/ride.service");
const { validationResult } = require("express-validator");
const mapsService = require("../services/maps.service");
const { sendMessageToSocket } = require("../socket");
const rideModel = require("../models/ride.model");

module.exports.createRide = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { userId, pickup, destination } = req.body;

  // Accept common misspellings/variants from clients (vehicleType, vehicelType, vehiclType)
  let vehicleType =
    req.body.vehicleType ||
    req.body.vehicelType ||
    req.body.vehiclType ||
    req.body.vehicltype;

  // Basic validation: return 400 with a clear message when fields are missing
  if (!pickup || !destination || !vehicleType) {
    return res
      .status(400)
      .json({ message: "pickup, destination and vehicleType are required" });
  }

  // normalize vehicleType variants (e.g., 'moto' -> 'motorcycle') and lowercase
  vehicleType = String(vehicleType).toLowerCase();
  if (vehicleType === "moto") vehicleType = "motorcycle";

  try {
    const userIdFromReq =
      (req.user && req.user._id) || userId || req.body.userId;
    console.log("[ride.createRide] userIdFromReq:", userIdFromReq);
    console.log("[ride.createRide] payload:", {
      pickup,
      destination,
      vehicleType: vehicleType,
    });

    const ride = await rideService.createRide({
      pickup,
      destination,
      vehicleType,
      userId: userIdFromReq,
    });

    res.status(201).json(ride);

    const pickupCoordinates = await mapsService.getAddressCordinate(pickup);
    console.log(pickupCoordinates);

    const CaptainTheRadius = await mapsService.getCaptainTheRadius(
      pickupCoordinates.ltd,
      pickupCoordinates.lng,
      2 // 5 km radius
    );

    ride.otp = "";

    CaptainTheRadius.map(async (captain) => {
      console.log("Captain within radius:", captain);

      const rideWithUser = await rideModel
        .findOne({ _id: ride._id })
        .populate("user");
      sendMessageToSocket(captain.socketId, {
        event: "new-ride",
        data: rideWithUser,
      });
    });

    console.log(CaptainTheRadius);
  } catch (error) {
    // If service throws a validation-style error, forward as 400, otherwise 500
    const message =
      error && error.message ? error.message : "internal server error";
    const isClientError = /required|invalid/i.test(message);
    return res.status(isClientError ? 400 : 500).json({ message });
  }
};

module.exports.getFare = async (req, res) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return res.status(400).json({ error: error.array() });
  }

  // Read from query string (route uses GET with query params)
  const { pickup, destination } = req.query;

  try {
    const fare = await rideService.getFare(pickup, destination);
    return res.status(200).json(fare);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.confirmRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId } = req.body;
  try {
    // rideService.confirmRide expects (rideId, captain)
    const ride = await rideService.confirmRide(rideId, req.captain);

    sendMessageToSocket(ride.user.socketId, {
      event: "ride-confirmed",
      data: ride,
    });

    res.status(200).json(ride);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports.startRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // Support both GET (query) and POST (body)
  const { rideId, otp } = req.method === "GET" ? req.query : req.body;
  console.log("[ride.startRide] request received", {
    method: req.method,
    rideId,
    otp,
    captainId: req.captain && req.captain._id,
  });
  try {
    // rideService.startRide expects (rideId, otp, captain)
    const ride = await rideService.startRide(rideId, otp, req.captain);

    if (ride.user && ride.user.socketId) {
      sendMessageToSocket(ride.user.socketId, {
        event: "ride-started",
        data: ride,
      });
    } else {
      console.warn(
        "ride.user or ride.user.socketId is missing, cannot send ride-started event"
      );
    }
    res.status(200).json(ride);
  } catch (error) {
    // Log full error for debugging
    console.error("[ride.startRide] error:", error);

    const message =
      error && error.message ? error.message : "internal server error";

    // Treat common validation/service errors as client errors (400)
    const clientErrorPatterns =
      /(required|invalid|not accepted|Invalid OTP|not found)/i;
    if (clientErrorPatterns.test(message)) {
      return res.status(400).json({ message });
    }

    return res.status(500).json({ message });
  }
};

module.exports.endRide = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { rideId } = req.body;

  try {
    // rideService.endRide expects (rideId, captain)
    const ride = await rideService.endRide(rideId, req.captain);
    sendMessageToSocket(ride.user.socketId, {
      event: "ride-ended",
      data: ride,
    });
    res.status(200).json(ride);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
