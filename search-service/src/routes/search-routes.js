const express = require("express");
const { searchPostController } = require("../controller/search-controller");
const { authencationRequest } = require("../middleware/authmiddleware.js");

const router = express.Router();

router.use(authencationRequest);

router.get("/posts", searchPostController);

module.exports = router;
