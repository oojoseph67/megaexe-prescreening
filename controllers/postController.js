const Post = require("../models/post");
const Comment = require("../models/comment");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");

const createPost = async (req, res) => {
  const { user } = req.user;

  try {
    const { image, content, category } = req.body;
    const post = new Post({ userId: user.userId, image, content, category });
    await post.save();
    res.status(201).json({ post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const editPost = async (req, res) => {
  const { id: postId } = req.params;
  const { user } = req.user;
  const { content, image, category } = req.body;

  const post = await Post.findById(postId);

  if (!post) {
    throw new CustomError.NotFoundError(`No post with id ${postId}`);
  }

  if (post.userId.toString() !== user.userId.toString()) {
    throw new CustomError.UnauthorizedError("Not authorized to edit this post");
  }

  post.content = content;
  post.image = image;
  post.category = category;

  await post.save();
  res.status(StatusCodes.OK).json({ post });
};

const deletePost = async (req, res) => {
  const { id: postId } = req.params;
  const { user } = req.user;

  const post = await Post.findById(postId);

  if (!post) {
    throw new CustomError.NotFoundError(`No post with id: ${postId}`);
  }

  if (post.userId.toString() !== user.userId.toString()) {
    throw new CustomError.UnauthorizedError("Not authorized to edit this post");
  }

  await post.remove();
  res.status(StatusCodes.OK).json({ msg: "Success!!! Post deleted" });
};

const getPosts = async (req, res) => {
  const { sort } = req.query;
  let posts;
  if (sort === "time") {
    posts = await Post.find({}).sort({ createdAt: -1 });
  } else if (sort === "upvotes") {
    posts = await Post.find({}).sort({ upvotes: -1 });
  } else {
    posts = await Post.find({});
  }
  res.status(StatusCodes.OK).json({ posts });
};

const upvotePost = async (req, res) => {
  const { id: postId } = req.params;

  const post = await Post.findById(postId);

  if (!post) {
    throw new CustomError.NotFoundError(`No post with id: ${postId}`);
  }

  post.upvotes = (post.upvotes || 0) + 1;
  await post.save();
  res.status(StatusCodes.OK).json({ post });
};

const downvotePost = async (req, res) => {
  const { id: postId } = req.params;

  const post = await Post.findById(postId);

  if (!post) {
    throw new CustomError.NotFoundError(`No post with id: ${postId}`);
  }

  post.downvotes = (post.downvotes || 0) + 1;
  await post.save();
  res.status(StatusCodes.OK).json({ post });
};

const addComment = async (req, res) => {
  const { user } = req.user;
  try {
    const { id: postId } = req.params;
    const { commentText } = req.body;
    const comment = new Comment({
      postId,
      userId: user.userId,
      content: commentText,
    });
    await comment.save();
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getComments = async (req, res) => {
  const { id: postId } = req.params;
  const comments = await Comment.find({ postId });
  res.status(StatusCodes.OK).json({ comments });
};

module.exports = {
  createPost,
  editPost,
  deletePost,
  getPosts,
  upvotePost,
  downvotePost,
  addComment,
  getComments,
};
