const axios = require("axios");
const captain = require("../models/captain.model");

module.exports.getAddressCordinate = async (address) => {
  if (!address) {
    throw new Error("Address is required");
  }

  const apiKey = process.env.GOOGLE_MAPS_API;
  if (!apiKey) {
    throw new Error("Google Maps API key is not configured");
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    console.log("Google API Response:", response.data); // Debug log

    if (
      response.data.status === "OK" &&
      response.data.results &&
      response.data.results[0]
    ) {
      const location = response.data.results[0].geometry.location;

      return {
        lat: location.lat,
        lng: location.lng,
        formatted_address: response.data.results[0].formatted_address,
      };
    } else {
      console.error("Google API Error Response:", response.data);
      throw new Error("Unable to fetch coordinates: " + response.data.status);
    }
  } catch (err) {
    console.error("Geocoding Error:", err.response?.data || err.message);
    throw new Error(
      err.response?.data?.error_message || "Unable to fetch coordinates"
    );
  }
};

module.exports.getDistanceTime = async (origin, destination) => {
  if (!origin || !destination) {
    throw new Error("Origin and destination are required");
  }

  const apiKey = process.env.GOOGLE_MAPS_API;
  if (!apiKey) {
    throw new Error("Google Maps API key is not configured");
  }

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
    origin
  )}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    console.log("Distance Matrix API Response:", response.data); // Debug log

    if (response.data.status === "OK") {
      const element = response.data.rows[0]?.elements[0];
      if (!element || element.status === "ZERO_RESULTS") {
        throw new Error("No route found between the specified locations");
      }
      return {
        distance: element.distance,
        duration: element.duration,
      };
    } else {
      console.error("Distance Matrix API Error:", response.data);
      throw new Error(
        "Unable to fetch distance and time: " + response.data.status
      );
    }
  } catch (error) {
    console.error(
      "Distance Matrix Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

module.exports.getAutoCompleteSiuggestions = async (input) => {
  if (!input) {
    throw new Error("query is required");
  }

  const apiKey = process.env.GOOGLE_MAPS_API;
  if (!apiKey) {
    throw new Error("Google Maps API key is not configured");
  }

  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
    input
  )}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    console.log("Places API Response:", response.data); // Debug log

    if (response.data.status === "OK") {
      return response.data.predictions.map((prediction) => ({
        place_id: prediction.place_id,
        description: prediction.description,
      }));
    } else {
      console.error("Places API Error:", response.data);
      throw new Error("Unable to fetch suggestions: " + response.data.status);
    }
  } catch (error) {
    console.error("Places API Error:", error.response?.data || error.message);
    throw error;
  }
};

module.exports.getCaptainTheRadius = async (ltd, lng, radius) => {
  const captains = await captain.find({
    location: {
      $geoWithin: { $centerSphere: [[ltd, lng], radius / 6371] },
    },
  });

  return captains;
};
