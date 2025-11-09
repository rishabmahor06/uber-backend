const mapService = require("../services/maps.service");
const { validationResult } = require("express-validator");

module.exports.getCordinates = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(400).json({ error: error.array() });
  }
  const { address } = req.query;

  try {
    const coordinates = await mapService.getAddressCordinate(address);
    res.status(200).json(coordinates);
  } catch (error) {
    res.status(404).json({ message: "coordinate not found " });
  }
};

module.exports.getDistanceTime = async (req, res, next) => {
  try {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ message: error.array() });
    }
    const { origin, destination } = req.query;
    const deistanceTime = await mapService.getDistanceTime(origin, destination);
    res.status(200).json(deistanceTime);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "internal server error" });
  }
};

module.exports.getAutoCompleteSiuggestions = async (req, res, next) => {
  try {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ error: error.array() });
    }

    // read the input from query (route uses GET with query param)
    const { input } = req.query;
    const suggestions = await mapService.getAutoCompleteSiuggestions(input);
    res.status(200).json(suggestions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "internal server error" });
  }
};
