const express = require("express");
const checkAuth = require("../middleware/check-auth");
const checkFile = require("../middleware/file");
const router = express.Router();
const PostController = require("../controllers/posts");

router.post("", checkAuth, checkFile, PostController.createPost);

router.get("", PostController.getPosts);

router.get("/:id", PostController.getPost);

router.put("/:id", checkAuth, checkFile, PostController.updatePost);

router.delete("/:id", checkAuth, PostController.deletePost);

module.exports = router;
