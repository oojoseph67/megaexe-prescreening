const express = require("express");
const router = express.Router();
const {
  createPost,
  editPost,
  deletePost,
  getPosts,
  upvotePost,
  downvotePost,
  addComment,
  getComments,
} = require("../controllers/postController");
const { authenticateUser } = require("../middleware/authentication");

router.post("/", authenticateUser, createPost);
router.patch("/:id", authenticateUser, editPost);
router.delete("/:id", authenticateUser, deletePost);
router.get("", getPosts);
router.post("/:id/upvote", authenticateUser, upvotePost);
router.post("/:id/downvote", authenticateUser, downvotePost);
router.post("/:id/comments", authenticateUser, addComment);
router.get("/:id/comments", getComments);

module.exports = router;
