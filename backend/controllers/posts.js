const Post = require("../models/post");

exports.createPost = (req, res, next) => {
    const host = `${req.protocol}://${req.get("host")}`;
    const post = new Post({
        title: req.body.title,
        content: req.body.content,
        imagePath: `${host}/images/${req.file.filename}`,
        creator: req.userData.userId,
    });
    post
        .save()
        .then((postCreated) => {
            return res.status(201).json({
                post: {
                    ...postCreated,
                    id: postCreated._id,
                },
                message: "Post added successfully",
            });
        })
        .catch((error) => {
            res.status(500).json({
                message: "Creating post failed!",
            });
        });
};

exports.getPosts = (req, res, next) => {
    const pageSize = +req.query.pageSize;
    const currentPage = +req.query.page;
    const postQuery = Post.find();
    let fetchedPosts;
    if (!!pageSize && !!currentPage) {
        postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
    }
    postQuery
        .then((document) => {
            fetchedPosts = document;
            return Post.count();
        })
        .then((count) => {
            return res.status(200).json({
                message: "posts fetched successfully",
                posts: fetchedPosts,
                maxPosts: count,
            });
        })
        .catch((error) => {
            res.status(500).json({
                message: "Getting posts failed!",
            });
        });
};

exports.getPost = (req, res, next) => {
    Post.findById(req.params.id)
        .then((post) => {
            if (!!post) res.status(200).json(post);
            else res.status(400).json({ message: "Post not found." });
        })
        .catch((error) => {
            res.status(500).json({
                message: "Getting post failed!",
            });
        });
};

exports.updatePost = (req, res, next) => {
    let imagePath = req.body.imagePath;
    if (req.file) {
        const host = `${req.protocol}://${req.get("host")}`;
        imagePath = `${host}/images/${req.file.filename}`;
    }
    const post = new Post({
        _id: req.body.id,
        title: req.body.title,
        content: req.body.content,
        imagePath: imagePath,
        creator: req.userData.userId,
    });
    Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, post)
        .then((result) => {
            console.log(result);
            if (result.matchedCount > 0) {
                res.status(200).json({
                    message: "Post updated.",
                });
            } else {
                res.status(401).json({
                    message: "Not Authorized.",
                });
            }
        })
        .catch((error) => {
            res.status(500).json({
                message: "Updating post failed!",
            });
        });
};

exports.deletePost = (req, res, next) => {
    Post.deleteOne({ _id: req.params.id, creator: req.userData.userId })
        .then((result) => {
            console.log(result);
            if (result.deletedCount > 0) {
                res.status(200).json({
                    message: "Post deleted.",
                });
            } else {
                res.status(401).json({
                    message: "Not Authorized.",
                });
            }
        })
        .catch((error) => {
            res.status(500).json({
                message: "Deleting post failed",
            });
        });
};
