const express = require("express");

const {
    createNewRoom,
    getRoomDetails,
} = require("../controllers/roomControllers");

const router = express.Router();

router.post("/create", createNewRoom);
router.get("/:roomId", getRoomDetails);

module.exports = router;