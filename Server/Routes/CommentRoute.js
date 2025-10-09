import express from 'express';
import {
    createComment,
    getPostComments,
    getCommentCount,
    updateComment,
    deleteComment,
    likeComment,
    dislikeComment,
    getCommentReplies
} from '../Controllers/CommentController.js';
import authMiddleWare from '../Middleware/authMiddleWare.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/post/:postId', getPostComments);           // Get comments for a post
router.get('/post/:postId/count', getCommentCount);     // Get comment count for a post
router.get('/:commentId/replies', getCommentReplies);   // Get replies for a comment

// Protected routes (authentication required)
router.post('/', authMiddleWare, createComment);                    // Create a new comment
router.put('/:commentId', authMiddleWare, updateComment);           // Update a comment
router.delete('/:commentId', authMiddleWare, deleteComment);        // Delete a comment
router.put('/:commentId/like', authMiddleWare, likeComment);        // Like/unlike a comment
router.put('/:commentId/dislike', authMiddleWare, dislikeComment);  // Dislike/undislike a comment

export default router;