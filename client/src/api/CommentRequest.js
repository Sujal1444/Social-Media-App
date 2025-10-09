import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:4000' });

// Add token to requests
API.interceptors.request.use((req) => {
    if (localStorage.getItem('profile')) {
        req.headers.Authorization = `Bearer ${JSON.parse(localStorage.getItem('profile')).token}`;
    }
    return req;
});

// Comment CRUD operations
export const createComment = (commentData) => API.post('/comment', commentData);

export const getPostComments = (postId, page = 1, limit = 10) => 
    API.get(`/comment/post/${postId}?page=${page}&limit=${limit}`);

export const getCommentCount = (postId) => 
    API.get(`/comment/post/${postId}/count`);

export const updateComment = (commentId, content) => 
    API.put(`/comment/${commentId}`, { content });

export const deleteComment = (commentId) => 
    API.delete(`/comment/${commentId}`);

// Comment interactions
export const likeComment = (commentId) => 
    API.put(`/comment/${commentId}/like`);

export const dislikeComment = (commentId) => 
    API.put(`/comment/${commentId}/dislike`);

// Reply operations
export const getCommentReplies = (commentId, page = 1, limit = 5) => 
    API.get(`/comment/${commentId}/replies?page=${page}&limit=${limit}`);

export const createReply = (commentData) => 
    API.post('/comment', commentData); // Same endpoint, but with parentComment field