// src/services/snapSafariService.js
import api from './api';

// Upload a new post (multipart form data)
export const uploadPost = async (formData) => {
  try {
    const response = await api.post('/snap-safari/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Required for file uploads
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to upload post' };
  }
};

// Get all posts
export const getAllPosts = async () => {
  try {
    const response = await api.get('/snap-safari');
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch posts' };
  }
};

// Get a post by ID
export const getPostById = async (postId) => {
  try {
    const response = await api.get(`/snap-safari/${postId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch post' };
  }
};

// Get posts by user ID
export const getPostsByUserId = async () => {
  try {
    const response = await api.get(`/snap-safari/user`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch user posts' };
  }
};

// Like a post
export const likePost = async (postId) => {
  try {
    const response = await api.post(`/snap-safari/${postId}/like`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to like post' };
  }
};

// Add a comment to a post
export const addComment = async (postId, commentText) => {
    try {
        console.log('Sending comment request:', { postId, comment: commentText });
        const response = await api.post(
          `/snap-safari/${postId}/comment`,
          {}, // Empty body for POST request
          {
            params: {
              comment: commentText, // Send comment as a query parameter
            },
          }
        );
        console.log('addComment response:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error adding comment:', error.response?.data, error.response?.status, error.message);
        throw error.response?.data || { error: 'Failed to add comment' };
      }
};

// Delete a post
export const deletePost = async (postId) => {
  try {
    const response = await api.delete(`/snap-safari/${postId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to delete post' };
  }
};