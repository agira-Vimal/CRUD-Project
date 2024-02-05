const Player = require("../ models/admin");
const { validationResult } = require("express-validator");
// const mongodb = require("mongodb");
// const ObjectID = mongodb.ObjectId;

exports.getAddplayer = (req, res) => {
  //   console.log("inside");
  return res
    .status(201)
    .render("add-player", {
      pageTitle: "Add Player",
      playername: "",
      jerseyno: "",
      role: "",
      price: "",
      team: "",
    });
};

exports.postAddplayer = (req, res, next) => {
  const [playername, jersey, role, price, team] = [
    req.body.playername,
    req.body.jersey,
    req.body.role,
    req.body.price,
    req.body.team,
  ];
  const userId = req.user._id;
  const errors = validationResult(req);
  if (!errors.isEmpty) {
    return res
      .status(422)
      .render("add-player", {
        pageTitle: "Add Player",
        playername: playername,
        jerseyno: jersey,
        role: role,
        price: price,
        team: team,
      });
  }
  const player = new Player({
    playername,
    jerseyno: jersey,
    role,
    price,
    team,
    user: userId,
  });

  player
    .save()
    .then((result) => {
      console.log("Player created!!");
      res
        .status(201)
        .render("add-player", {
          pageTitle: "Add Player",
          playername: "",
          jerseyno: "",
          role: "",
          price: "",
          team: "",
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};

exports.getViewPlayers = (req, res, next) => {
  let message = req.flash("error");
  // console.log("error is", message);
  if (message.length > 0) {
    message = message[0];
  } else {
    message = false;
  }
  Player.find({ user: req.user })
    .then((players) => {
      console.log(players);
      res.status(200).render("players-list", {
        pageTitle: "All Players",
        user: req.user.name,
        players: players,
        errorMessage: message,
        team: null,
      });
    })
    .catch((err) => console.log(err));
};
exports.postDeletePlayer = (req, res, next) => {
  const playerid = req.params.playerid;
  //   Player.find({ user: req.user }).then((user) => {
  //     Player.findByIdAndDelete(playerid)
  //       .then((result) => {
  //         console.log(result);
  //         res.status(302).redirect("/admin/view-players");
  //       })
  //       .catch((err) => console.log(err));
  //   });
  Player.deleteOne({ user: req.user, _id: playerid })
    .then((result) => {
      console.log(result);
      req.flash("error", "Deleted Successfully!!!");
      res.status(302).redirect("/admin/view-players");
    })
    .catch((err) => console.log(err));
};

exports.getUpdatePlayer = async (req, res, next) => {
  const playerid = req.params.playerid;
  Player.findById(playerid)
    .then((player) => {
      if (!player) {
        return redirect("/admin/view-player");
      }
      res.status(200).render("update-player", {
        pageTitle: "Update Player",
        player: player,
      });
    })
    .catch((err) => console.log(err));
};

exports.postUpdatePlayer = async (req, res, next) => {
  const playerid = req.params.playerid;
  const [playername, jersey, role, price, team] = [
    req.body.playername,
    req.body.jersey,
    req.body.role,
    req.body.price,
    req.body.team,
  ];
  const errors = validationResult(req);
  if (!errors.isEmpty) {
    return res
      .status(422)
      .render("update-player", {
        pageTitle: "Update Player",
        playername: playername,
        jerseyno: jersey,
        role: role,
        price: price,
        team: team,
      });
  }
  Player.findById(playerid)
    .then((player) => {
      if (player.user.toString() !== req.user._id.toString()) {
        return res.redirect("/admin/view-players");
      }
      player.playername = playername;
      player.jerseyno = jersey;
      player.role = role;
      player.price = price;
      player.team = team;
      return player.save();
    })
    .then((result) => {
      req.flash("error", "Updated Successfully!!!");
      res.status(302).redirect("/admin/view-players");
    })
    .catch((err) => console.log(err));
};

exports.postPlayerByTeam = (req, res, next) => {
  const user = req.user;
  const team = req.body.team;
  const query = { user: user._id };
  if (team) {
    query.team = team;
  }

  Player.find(query)
    .then((players) => {
      let message = req.flash("error");
      // console.log("error is", message);
      if (message.length > 0) {
        message = message[0];
      } else {
        message = false;
      }
      console.log(players);
      res.status(200).render("players-list", {
        pageTitle: "All Players",
        user: req.user.name,
        players: players,
        team: team,
        errorMessage: message,
      });
    })
    .catch((err) => console.log(err));
};
