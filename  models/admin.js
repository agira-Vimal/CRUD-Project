const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const playerSchema = new Schema({
  playername: {
    type: String,
    required: true,
  },
  jerseyno: {
    type: Number,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  team: {
    type: String,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});
module.exports = mongoose.model("Player", playerSchema);
