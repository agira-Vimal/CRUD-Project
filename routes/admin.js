const express = require("express");
const router = express.Router();
const adminHandlerController = require("../controllers/admin");
const auth = require("../middleware/auth");
const { check, body } = require("express-validator");

router.get("/add-player", auth, adminHandlerController.getAddplayer);
router.post(
  "/add-player",
  [
    body("playername", "Enter a Valid Player Name").isString(),
    body("jersey", "Enter a valid Jersey Number").isInt(),
    body("price", "Please Enter Valid Prize").isFloat(),
    body("team", "Please Enter a Valid Team Name").isString(),
    body("role", "Please Enter a Valid Role").isString(),
  ],
  auth,
  adminHandlerController.postAddplayer
);
router.get("/view-players", auth, adminHandlerController.getViewPlayers);
router.post(
  "/delete-player/:playerid",
  auth,
  adminHandlerController.postDeletePlayer
);
router.get(
  "/update-player/:playerid",
  auth,
  adminHandlerController.getUpdatePlayer
);
router.post(
  "/update-player/:playerid",
  [
    body("playername", "Enter a Valid Player Name").isString(),
    body("jersey", "Enter a valid Jersey Number").isInt(),
    body("price", "Please Enter Valid Prize").isFloat(),
    body("team", "Please Enter a Valid Team Name").isString(),
    body("role", "Please Enter a Valid Role").isString(),
  ],
  auth,
  adminHandlerController.postUpdatePlayer
);
router.post("/players-by-team", auth, adminHandlerController.postPlayerByTeam);

module.exports = router;
