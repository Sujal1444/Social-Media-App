import commentModel from '../Models/commentModel.js';
import postModel from '../Models/postModel.js';
import UserModel from '../Models/userModel.js';
import mongoose from 'mongoose';

// Create a new comment
export const createComment = async (req, res) => {
    try {
        const { postId, content, parentComment } = req.body;
        const userId = req.body._id;

        // Validate post exists
        const post = await postModel.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Validate parent comment if it's a reply
        if (parentComment) {
            const parent = await commentModel.findById(parentComment);
            if (!parent || parent.postId.toString() !== postId) {
                return res.status(404).json({ message: "Parent comment not found or doesn't belong to this post" });
            }
        }

        const newComment = new commentModel({
            postId,
            userId,
            content,
            parentComment: parentComment || null
        });

        const savedComment = await newComment.save();

        // If it's a reply, add to parent's replies array
        if (parentComment) {
            await commentModel.findByIdAndUpdate(
                parentComment,
                { $push: { replies: savedComment._id } }
            );
        }

        // Populate user data for response
        const populatedComment = await commentModel.findById(savedComment._id)
            .populate('userId', 'firstname lastname profilePicture')
            .populate('parentComment', 'content userId');

        res.status(201).json(populatedComment);
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ message: "Error creating comment", error: error.message });
    }
};

// Get comments for a post with pagination
export const getPostComments = async (req, res) => {
    try {
        const { postId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get top-level comments (not replies)
        const comments = await commentModel.find({ 
            postId, 
            parentComment: null 
        })
        .populate('userId', 'firstname lastname profilePicture')
        .populate({
            path: 'replies',
            populate: {
                path: 'userId',
                select: 'firstname lastname profilePicture'
            }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

        // Get total count for pagination
        const totalComments = await commentModel.countDocuments({ 
            postId, 
            parentComment: null 
        });

        const totalPages = Math.ceil(totalComments / limit);

        res.status(200).json({
            comments,
            pagination: {
                currentPage: page,
                totalPages,
                totalComments,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ message: "Error fetching comments", error: error.message });
    }
};

// Get comment count for a post
export const getCommentCount = async (req, res) => {
    try {
        const { postId } = req.params;
        
        const count = await commentModel.countDocuments({ postId });
        
        res.status(200).json({ count });
    } catch (error) {
        console.error('Error getting comment count:', error);
        res.status(500).json({ message: "Error getting comment count", error: error.message });
    }
};

// Update a comment
export const updateComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;
        const userId = req.body._id;

        const comment = await commentModel.findById(commentId);
        
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Check if user owns the comment
        if (comment.userId.toString() !== userId) {
            return res.status(403).json({ message: "You can only edit your own comments" });
        }

        const updatedComment = await commentModel.findByIdAndUpdate(
            commentId,
            { 
                content, 
                isEdited: true, 
                editedAt: new Date() 
            },
            { new: true }
        ).populate('userId', 'firstname lastname profilePicture');

        res.status(200).json(updatedComment);
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ message: "Error updating comment", error: error.message });
    }
};

// Delete a comment
export const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.body._id;

        const comment = await commentModel.findById(commentId);
        
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Check if user owns the comment
        if (comment.userId.toString() !== userId) {
            return res.status(403).json({ message: "You can only delete your own comments" });
        }

        // If comment has replies, delete them too
        if (comment.replies.length > 0) {
            await commentModel.deleteMany({ _id: { $in: comment.replies } });
        }

        // Remove from parent's replies if it's a reply
        if (comment.parentComment) {
            await commentModel.findByIdAndUpdate(
                comment.parentComment,
                { $pull: { replies: commentId } }
            );
        }

        await commentModel.findByIdAndDelete(commentId);

        res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ message: "Error deleting comment", error: error.message });
    }
};

// Like/Unlike a comment
export const likeComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.body._id;

        const comment = await commentModel.findById(commentId);
        
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        const isLiked = comment.likes.includes(userId);
        const isDisliked = comment.dislikes.includes(userId);

        let updateQuery = {};

        if (isLiked) {
            // Unlike the comment
            updateQuery = { $pull: { likes: userId } };
        } else {
            // Like the comment
            updateQuery = { $addToSet: { likes: userId } };
            
            // Remove from dislikes if previously disliked
            if (isDisliked) {
                updateQuery.$pull = { dislikes: userId };
            }
        }

        const updatedComment = await commentModel.findByIdAndUpdate(
            commentId,
            updateQuery,
            { new: true }
        ).populate('userId', 'firstname lastname profilePicture');

        res.status(200).json({
            comment: updatedComment,
            isLiked: !isLiked,
            likeCount: updatedComment.likes.length,
            dislikeCount: updatedComment.dislikes.length
        });
    } catch (error) {
        console.error('Error liking comment:', error);
        res.status(500).json({ message: "Error liking comment", error: error.message });
    }
};

// Dislike/Undislike a comment
export const dislikeComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.body._id;

        const comment = await commentModel.findById(commentId);
        
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        const isLiked = comment.likes.includes(userId);
        const isDisliked = comment.dislikes.includes(userId);

        let updateQuery = {};

        if (isDisliked) {
            // Remove dislike
            updateQuery = { $pull: { dislikes: userId } };
        } else {
            // Add dislike
            updateQuery = { $addToSet: { dislikes: userId } };
            
            // Remove from likes if previously liked
            if (isLiked) {
                updateQuery.$pull = { likes: userId };
            }
        }

        const updatedComment = await commentModel.findByIdAndUpdate(
            commentId,
            updateQuery,
            { new: true }
        ).populate('userId', 'firstname lastname profilePicture');

        res.status(200).json({
            comment: updatedComment,
            isDisliked: !isDisliked,
            likeCount: updatedComment.likes.length,
            dislikeCount: updatedComment.dislikes.length
        });
    } catch (error) {
        console.error('Error disliking comment:', error);
        res.status(500).json({ message: "Error disliking comment", error: error.message });
    }
};

// Get replies for a comment
export const getCommentReplies = async (req, res) => {
    try {
        const { commentId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;

        const replies = await commentModel.find({ parentComment: commentId })
            .populate('userId', 'firstname lastname profilePicture')
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(limit);

        const totalReplies = await commentModel.countDocuments({ parentComment: commentId });
        const totalPages = Math.ceil(totalReplies / limit);

        res.status(200).json({
            replies,
            pagination: {
                currentPage: page,
                totalPages,
                totalReplies,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error('Error fetching replies:', error);
        res.status(500).json({ message: "Error fetching replies", error: error.message });
    }
};