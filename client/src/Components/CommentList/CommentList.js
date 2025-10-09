import React, { useState, useEffect, useCallback } from 'react';
import './CommentList.css';
import { useSelector } from 'react-redux';
import Comment from '../Comment/Comment';
import { 
    getPostComments, 
    createComment, 
    getCommentCount 
} from '../../api/CommentRequest';

const CommentList = ({ postId, onCommentCountChange }) => {
    const { user } = useSelector((state) => state.authReducer.authData);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalComments, setTotalComments] = useState(0);
    const [showComments, setShowComments] = useState(false);
    const [error, setError] = useState('');

    const commentsPerPage = 5;

    const fetchCommentCount = useCallback(async () => {
        try {
            const response = await getCommentCount(postId);
            setTotalComments(response.data.count);
            onCommentCountChange && onCommentCountChange(response.data.count);
        } catch (error) {
            console.error('Error fetching comment count:', error);
        }
    }, [postId, onCommentCountChange]);

    const fetchComments = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const response = await getPostComments(postId, currentPage, commentsPerPage);
            
            if (currentPage === 1) {
                setComments(response.data.comments);
            } else {
                setComments(prev => [...prev, ...response.data.comments]);
            }
            
            setTotalPages(response.data.totalPages);
            setTotalComments(response.data.totalComments);
            onCommentCountChange && onCommentCountChange(response.data.totalComments);
        } catch (error) {
            console.error('Error fetching comments:', error);
            setError('Failed to load comments. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [postId, currentPage, commentsPerPage, onCommentCountChange]);

    useEffect(() => {
        if (postId) {
            fetchCommentCount();
        }
    }, [postId, fetchCommentCount]);

    useEffect(() => {
        if (showComments && postId) {
            fetchComments();
        }
    }, [showComments, postId, currentPage, fetchComments]);

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        
        if (!newComment.trim()) {
            setError('Please enter a comment');
            return;
        }

        if (!user) {
            setError('You must be logged in to comment');
            return;
        }

        try {
            setSubmitting(true);
            setError('');
            
            const commentData = {
                postId,
                content: newComment.trim()
            };
            
            await createComment(commentData);
            setNewComment('');
            
            // Refresh comments and count
            setCurrentPage(1);
            await fetchComments();
            await fetchCommentCount();
            
            // Show comments if they weren't visible
            if (!showComments) {
                setShowComments(true);
            }
        } catch (error) {
            console.error('Error creating comment:', error);
            setError('Failed to post comment. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCommentUpdate = async () => {
        // Refresh comments when a comment is updated
        await fetchComments();
        await fetchCommentCount();
    };

    const handleCommentDelete = async (commentId) => {
        // Remove the deleted comment from the list
        setComments(prev => prev.filter(comment => comment._id !== commentId));
        await fetchCommentCount();
    };

    const loadMoreComments = () => {
        if (currentPage < totalPages && !loading) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const toggleComments = () => {
        setShowComments(!showComments);
        if (!showComments) {
            setCurrentPage(1);
        }
    };

    return (
        <div className="comment-list-container">
            {/* Comment Count and Toggle */}
            <div className="comment-header">
                <button 
                    className="comment-toggle-btn"
                    onClick={toggleComments}
                >
                    💬 {totalComments} {totalComments === 1 ? 'Comment' : 'Comments'}
                    <span className={`toggle-icon ${showComments ? 'expanded' : ''}`}>▼</span>
                </button>
            </div>

            {/* Comment Form */}
            {user && (
                <form onSubmit={handleSubmitComment} className="comment-form">
                    <div className="comment-input-container">
                        <img 
                            src={
                                user.profilePicture 
                                    ? `${process.env.REACT_APP_PUBLIC_FOLDER}${user.profilePicture}`
                                    : '/default-avatar.png'
                            } 
                            alt="Your avatar" 
                            className="comment-form-avatar"
                        />
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            className="comment-textarea"
                            rows="3"
                            disabled={submitting}
                        />
                    </div>
                    
                    {error && <div className="comment-error">{error}</div>}
                    
                    <div className="comment-form-actions">
                        <button 
                            type="submit" 
                            className="comment-submit-btn"
                            disabled={submitting || !newComment.trim()}
                        >
                            {submitting ? 'Posting...' : 'Post Comment'}
                        </button>
                    </div>
                </form>
            )}

            {!user && (
                <div className="comment-login-prompt">
                    <p>Please log in to leave a comment</p>
                </div>
            )}

            {/* Comments List */}
            {showComments && (
                <div className="comments-section">
                    {loading && currentPage === 1 ? (
                        <div className="comment-loading">
                            <div className="loading-spinner"></div>
                            <span>Loading comments...</span>
                        </div>
                    ) : comments.length > 0 ? (
                        <>
                            <div className="comments-list">
                                {comments.map((comment) => (
                                    <Comment
                                        key={comment._id}
                                        comment={comment}
                                        onCommentUpdate={handleCommentUpdate}
                                        onCommentDelete={handleCommentDelete}
                                        level={0}
                                    />
                                ))}
                            </div>
                            
                            {/* Load More Button */}
                            {currentPage < totalPages && (
                                <div className="load-more-container">
                                    <button 
                                        onClick={loadMoreComments}
                                        className="load-more-btn"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <div className="loading-spinner small"></div>
                                                Loading...
                                            </>
                                        ) : (
                                            `Load More Comments (${totalComments - comments.length} remaining)`
                                        )}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="no-comments">
                            <div className="no-comments-icon">💭</div>
                            <p>No comments yet. Be the first to comment!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CommentList;