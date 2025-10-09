import React, { useState } from 'react';
import './Post.css';
import Comment from '../../Img/comment.png';
import Share from '../../Img/share.png';
import Like from '../../Img/like.png';
import Notlike from '../../Img/notlike.png';
import { useSelector } from 'react-redux';
import { likePost, deletePost } from '../../api/PostRequest';
import CommentList from '../CommentList/CommentList';



const Post = ({ data }) => {

  const { user } = useSelector((state) => state.authReducer.authData)
  const [liked, setLiked] = useState(data.likes.includes(user._id))
  const [likes, setLikes] = useState(data.likes.length)
  const [commentCount, setCommentCount] = useState(0)
  const [showComments, setShowComments] = useState(false)


  const handleLike = () => {
    setLiked((prev) => !prev)
    likePost(data._id, user._id)
    liked ? setLikes((prev) => prev - 1) : setLikes((prev) => prev + 1)
  }

  const handleComment = () => {
    setShowComments(!showComments);
  }

  const handleShare = () => {
    // Basic share functionality - copy post link to clipboard
    const postUrl = `${window.location.origin}/post/${data._id}`;
    navigator.clipboard.writeText(postUrl).then(() => {
      alert("Post link copied to clipboard! 📋");
    }).catch(() => {
      // Fallback for older browsers
      alert("Share feature: Post ID " + data._id);
    });
  }

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("Delete button clicked");
    const confirmResult = window.confirm("Are you sure you want to delete this post?");
    console.log("Confirmation result:", confirmResult);
    
    if (confirmResult) {
      try {
        console.log("Proceeding with deletion...");
        const response = await deletePost(data._id, user._id);
        console.log("Delete response:", response);
        alert("Post deleted successfully! 🗑️");
        window.location.reload();
      } catch (error) {
        console.error("Error deleting post:", error);
        alert("Failed to delete post. Please try again.");
      }
    } else {
      console.log("User cancelled deletion");
    }
  }

  return (
    <div className='Post'>
      {/* Delete button - only show for posts owned by current user */}
      {data.userId === user._id && (
        <div className="deleteButton" onClick={handleDelete}>
          ✕
        </div>
      )}

      <img src={data.image ? process.env.REACT_APP_PUBLIC_FOLDER + data.image : " "} alt="" />

      <div className="postReact">
        <img src={liked ? Like : Notlike} alt="" style={{ cursor: "pointer" }} onClick={handleLike} />
        <img src={Comment} alt="" style={{ cursor: "pointer" }} onClick={handleComment} />
        <img src={Share} alt="" style={{ cursor: "pointer" }} onClick={handleShare} />
      </div>

      <div className="post-stats">
        <span style={{ color: "var(--gray)", fontSize: '14px' }}>{likes} likes</span>
        {commentCount > 0 && (
          <span style={{ color: "var(--gray)", fontSize: '14px', marginLeft: '12px' }}>
            {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
          </span>
        )}
      </div>

      <div className="detail">
        <span> <b>{data.name}</b> </span>
        <span>{data.desc}</span>
      </div>

      {/* Comment Section */}
      <CommentList 
        postId={data._id} 
        onCommentCountChange={setCommentCount}
      />

    </div>
  )
}

export default Post
