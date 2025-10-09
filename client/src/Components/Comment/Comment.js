import React, { useState, useEffect } from 'react';
import './Comment.css';
import { useSelector } from 'react-redux';
import { 
    likeComment, 
    dislikeComment, 
    updateComment, 
    deleteComment,
    getCommentReplies,
    createReply
} from '../../api/CommentRequest';
import { formatDistanceToNow } from 'date-fns';

const Comment = ({ comment, onCommentUpdate, onCommentDelete, level = 0 }) => {
    const { user } = useSelector((state) => state.authReducer.authData);
    const [isLiked, setIsLiked] = useState(false);
    const [isDisliked, setIsDisliked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [dislikeCount, setDislikeCount] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [showReplies, setShowReplies] = useState(false);
    const [replies, setReplies] = useState([]);
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (comment) {
            setIsLiked(comment.likes?.includes(user._id) || false);
            setIsDisliked(comment.dislikes?.includes(user._id) || false);
            setLikeCount(comment.likes?.length || 0);
            setDislikeCount(comment.dislikes?.length || 0);
        }
    }, [comment, user._id]);

    const handleLike = async () => {
        try {
            const response = await likeComment(comment._id);
            setIsLiked(response.data.isLiked);
            setLikeCount(response.data.likeCount);
            setDislikeCount(response.data.dislikeCount);
            setIsDisliked(false);
        } catch (error) {
            console.error('Error liking comment:', error);
        }
    };

    const handleDislike = async () => {
        try {
            const response = await dislikeComment(comment._id);
            setIsDisliked(response.data.isDisliked);
            setLikeCount(response.data.likeCount);
            setDislikeCount(response.data.dislikeCount);
            setIsLiked(false);
        } catch (error) {
            console.error('Error disliking comment:', error);
        }
    };

    const handleEdit = async () => {
        if (editContent.trim() === '') return;
        
        try {
            await updateComment(comment._id, editContent);
            setIsEditing(false);
            onCommentUpdate && onCommentUpdate();
        } catch (error) {
            console.error('Error updating comment:', error);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this comment?')) {
            try {
                await deleteComment(comment._id);
                onCommentDelete && onCommentDelete(comment._id);
            } catch (error) {
                console.error('Error deleting comment:', error);
            }
        }
    };

    const loadReplies = async () => {
        if (showReplies) {
            setShowReplies(false);
            return;
        }

        try {
            setLoading(true);
            const response = await getCommentReplies(comment._id);
            setReplies(response.data.replies);
            setShowReplies(true);
        } catch (error) {
            console.error('Error loading replies:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async () => {
        if (replyContent.trim() === '') return;

        try {
            const replyData = {
                postId: comment.postId,
                content: replyContent,
                parentComment: comment._id
            };
            
            await createReply(replyData);
            setReplyContent('');
            setShowReplyForm(false);
            
            // Reload replies to show the new one
            if (showReplies) {
                loadReplies();
            }
        } catch (error) {
            console.error('Error creating reply:', error);
        }
    };

    const formatTime = (date) => {
        try {
            return formatDistanceToNow(new Date(date), { addSuffix: true });
        } catch (error) {
            return 'some time ago';
        }
    };

    const isOwner = comment.userId?._id === user._id || comment.userId === user._id;
    const maxNestingLevel = 3; // Limit nesting to prevent infinite threading

    return (
        <div className={`comment ${level > 0 ? 'comment-reply' : ''}`} style={{ marginLeft: `${level * 20}px` }}>
            <div className="comment-header">
                <div className="comment-user">
                    <img 
                        src={
                            comment.userId?.profilePicture 
                                ? `${process.env.REACT_APP_PUBLIC_FOLDER}${comment.userId.profilePicture}`
                                : '/default-avatar.png'
                        } 
                        alt="User" 
                        className="comment-avatar"
                    />
                    <div className="comment-user-info">
                        <span className="comment-username">
                            {comment.userId?.firstname} {comment.userId?.lastname}
                        </span>
                        <span className="comment-time">
                            {formatTime(comment.createdAt)}
                            {comment.isEdited && <span className="edited-indicator"> (edited)</span>}
                        </span>
                    </div>
                </div>
                
                {isOwner && (
                    <div className="comment-actions">
                        <button 
                            className="comment-action-btn edit-btn"
                            onClick={() => setIsEditing(!isEditing)}
                        >
                            ✏️
                        </button>
                        <button 
                            className="comment-action-btn delete-btn"
                            onClick={handleDelete}
                        >
                            🗑️
                        </button>
                    </div>
                )}
            </div>

            <div className="comment-content">
                {isEditing ? (
                    <div className="comment-edit">
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="comment-edit-textarea"
                            rows="3"
                        />
                        <div className="comment-edit-actions">
                            <button onClick={handleEdit} className="save-btn">Save</button>
                            <button onClick={() => setIsEditing(false)} className="cancel-btn">Cancel</button>
                        </div>
                    </div>
                ) : (
                    <p className="comment-text">{comment.content}</p>
                )}
            </div>

            <div className="comment-interactions">
                <div className="comment-reactions">
                    <button 
                        className={`reaction-btn ${isLiked ? 'liked' : ''}`}
                        onClick={handleLike}
                    >
                        👍 {likeCount > 0 && likeCount}
                    </button>
                    <button 
                        className={`reaction-btn ${isDisliked ? 'disliked' : ''}`}
                        onClick={handleDislike}
                    >
                        👎 {dislikeCount > 0 && dislikeCount}
                    </button>
                </div>

                <div className="comment-reply-actions">
                    {level < maxNestingLevel && (
                        <button 
                            className="reply-btn"
                            onClick={() => setShowReplyForm(!showReplyForm)}
                        >
                            Reply
                        </button>
                    )}
                    
                    {comment.replyCount > 0 && (
                        <button 
                            className="show-replies-btn"
                            onClick={loadReplies}
                            disabled={loading}
                        >
                            {loading ? 'Loading...' : 
                             showReplies ? 'Hide replies' : 
                             `Show ${comment.replyCount} ${comment.replyCount === 1 ? 'reply' : 'replies'}`}
                        </button>
                    )}
                </div>
            </div>

            {showReplyForm && (
                <div className="reply-form">
                    <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write a reply..."
                        className="reply-textarea"
                        rows="2"
                    />
                    <div className="reply-form-actions">
                        <button onClick={handleReply} className="reply-submit-btn">Reply</button>
                        <button onClick={() => setShowReplyForm(false)} className="reply-cancel-btn">Cancel</button>
                    </div>
                </div>
            )}

            {showReplies && replies.length > 0 && (
                <div className="comment-replies">
                    {replies.map((reply) => (
                        <Comment
                            key={reply._id}
                            comment={reply}
                            level={level + 1}
                            onCommentUpdate={loadReplies}
                            onCommentDelete={() => loadReplies()}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Comment;