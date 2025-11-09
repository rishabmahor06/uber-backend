const userModel = require("./models/user.model");
const captainModel = require("./models/captain.model");

let io;

function initializeSocket(socketIo) {
  io = socketIo;

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("join", async (data) => {
      try {
        const { userId, userType } = data;
        console.log(`User ${userId} joined as ${userType}`);

        if (userType === "user") {
          await userModel.findByIdAndUpdate(userId, {
            socketId: socket.id,
            status: "available",
          });
        } else if (userType === "captain") {
          const captain = await captainModel.findByIdAndUpdate(
            userId,
            {
              socketId: socket.id,
              status: "available",
            },
            { new: true }
          );
          console.log(`Captain ${userId} marked as available`);
        }
      } catch (err) {
        console.error("Error in join event:", err);
      }
    });

    socket.on("update-location-captain", async (data) => {
      try {
        const { userId, location } = data || {};
        if (
          !userId ||
          !location ||
          typeof location.ltd === "undefined" ||
          typeof location.lng === "undefined"
        ) {
          console.log("Invalid location update data:", data);
          return;
        }

        console.log(`Captain ${userId} updating location to:`, location);

        await captainModel.findByIdAndUpdate(
          userId,
          {
            location: { ltd: location.ltd, lng: location.lng },
            socketId: socket.id, // Ensure socket ID is up to date
          },
          { new: true }
        );
      } catch (err) {
        console.error("Failed to update captain location:", err);
      }
    });

    // Handle new ride requests
    socket.on("new-ride-request", async (data) => {
      try {
        console.log("New ride request received:", data);

        // Find all available captains
        const availableCaptains = await captainModel.find({
          status: "available",
          socketId: { $exists: true, $ne: null },
        });

        console.log(`Found ${availableCaptains.length} available captains`);

        if (availableCaptains.length === 0) {
          // Notify user that no captains are available
          const user = await userModel.findById(data.ride.userId);
          if (user && user.socketId) {
            io.to(user.socketId).emit("no-captains-available");
          }
          return;
        }

        // Broadcast to available captains
        availableCaptains.forEach((captain) => {
          console.log(`Sending ride request to captain ${captain._id}`);
          io.to(captain.socketId).emit("new-ride-request", {
            ...data,
            timestamp: new Date(),
          });
        });
      } catch (err) {
        console.error("Error handling new ride request:", err);
      }
    });

    // Handle ride acceptance from captain
    socket.on("accept-ride", async (data) => {
      try {
        const { ride, captainId } = data;
        console.log(`Captain ${captainId} accepting ride:`, ride);

        // Update captain status
        await captainModel.findByIdAndUpdate(captainId, {
          status: "on_ride",
        });

        // Notify user
        const user = await userModel.findById(ride.userId);
        if (user && user.socketId) {
          io.to(user.socketId).emit("ride-accepted", { ...ride, captainId });
        }
      } catch (err) {
        console.error("Error handling ride acceptance:", err);
      }
    });

    // Handle ride start
    socket.on("ride-started", async (data) => {
      try {
        const { ride, captainId } = data;
        console.log(`Captain ${captainId} started ride:`, ride);

        // Notify user
        const user = await userModel.findById(ride.userId);
        if (user && user.socketId) {
          io.to(user.socketId).emit("ride-started", { ...ride, captainId });
        }
      } catch (err) {
        console.error("Error handling ride start:", err);
      }
    });

    // Handle ride completion
    socket.on("ride-completed", async (data) => {
      try {
        const { ride, captainId } = data;
        console.log(`Captain ${captainId} completed ride:`, ride);

        // Update captain status back to available
        await captainModel.findByIdAndUpdate(captainId, {
          status: "available",
        });

        // Notify user
        const user = await userModel.findById(ride.userId);
        if (user && user.socketId) {
          io.to(user.socketId).emit("ride-completed", { ...ride, captainId });
        }
      } catch (err) {
        console.error("Error handling ride completion:", err);
      }
    });

    // Handle disconnection
    socket.on("disconnect", async () => {
      try {
        console.log(`Client disconnected: ${socket.id}`);
        // Update captain status to unavailable on disconnect
        await captainModel.findOneAndUpdate(
          { socketId: socket.id },
          {
            status: "unavailable",
            socketId: null,
          }
        );
      } catch (err) {
        console.error("Error handling disconnect:", err);
      }
    });
  });
}

function sendMessageToSocket(socketId, messageObject) {
  console.log(`sending message to ${socketId}`, messageObject);

  if (io) {
    io.to(socketId).emit(messageObject.event, messageObject.data);
  } else {
    console.log("socket io not initialize.");
  }
}

module.exports = { initializeSocket, sendMessageToSocket };
