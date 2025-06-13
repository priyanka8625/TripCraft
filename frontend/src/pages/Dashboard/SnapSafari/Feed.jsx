import { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart, FaComment, FaTimes, FaHome, FaUser, FaPlus } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Profile from './Profile';
import ImageUpload from './ImageUpload';
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { addComment, getAllPosts, getPostsByUserId, likePost, uploadPost } from '../../../services/snapSafariService';

function Feed() {
  const [view, setView] = useState('feed');
  const [selectedPost, setSelectedPost] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [posts, setPosts] = useState([]); // Start with an empty array since we fetch from backend
  const [newComments, setNewComments] = useState({});
  const [likes, setLikes] = useState({});

  const navigate = useNavigate();
  const location = useLocation();

  // Fetch all posts on component mount
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const fetchedPosts = await getAllPosts();
        setPosts(fetchedPosts.map(post => ({
          ...post,
          image: post.images && post.images.length > 0 ? post.images[0] : '', // Safely access images
          userAvatar: post.userAvatar || 'https://i.pravatar.cc/150?img=8', // Fallback avatar
          comments: post.comments || [], // Ensure comments is an array
        })));
        console.log(fetchedPosts);
        
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, []);

  // Fetch user posts (for Profile page)
  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const fetchedUserPosts = await getPostsByUserId();
        setUserPosts(fetchedUserPosts.map(post => ({
          ...post,
          image: post.images && post.images.length > 0 ? post.images[0] : '', // Map image for Profile.jsx
          userAvatar: post.userAvatar || 'https://i.pravatar.cc/150?img=8', // Fallback avatar
          comments: post.comments || [], // Ensure comments is an array
        })));
      } catch (error) {
        console.error('Error fetching user posts:', error);
      }
    };

    fetchUserPosts();
  }, []);

  const handleLike = (postId) => {
    setLikes(prev => ({
      ...prev,
      [postId]: !prev[postId],
    }));
    likePost(postId)
      .then(updatedPost => {
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post.id === postId ? { ...post, likes: updatedPost.likes || 0 } : post
          )
        );
        setUserPosts(prevUserPosts =>
          prevUserPosts.map(post =>
            post.id === postId ? { ...post, likes: updatedPost.likes || 0 } : post
          )
        );
      })
      .catch(error => console.error('Error liking post:', error));
  };

  const handleComment = (postId, e) => {
    e.preventDefault();
    console.log('Form submitted for post:', postId);
    if (newComments[postId]?.trim()) {
      const commentText = newComments[postId];
      console.log('Comment data:', { postId, commentText });
      addComment(postId, commentText)
        .then(newComment => {
          console.log('New comment added:', newComment);
          // Update posts state
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post.id === postId
              ? { ...post, comments: [...(post.comments || []), newComment] }
              : post
          )
        );
        // Update userPosts state
        setUserPosts(prevUserPosts =>
          prevUserPosts.map(post =>
            post.id === postId
              ? { ...post, comments: [...(post.comments || []), newComment] }
              : post
          )
        );
        // Update selectedPost state to reflect the new comment in the modal
        setSelectedPost(prevSelectedPost => ({
          ...prevSelectedPost,
          comments: [...(prevSelectedPost.comments || []), newComment],
        }));
        // Clear the comment input
        setNewComments(prev => ({
          ...prev,
          [postId]: '',
        }));
        })
        .catch(error => console.error('Error adding comment:', error));
    }
  };

  const handleAddPost = async (formData) => {
    const { destination, title, caption, images } = formData;

    const data = new FormData();
    data.append('destination', destination);
    data.append('title', title);
    data.append('caption', caption);
    images.forEach((image) => {
      data.append('images', image);
    });

    try {
      await uploadPost(data);
      const updatedPosts = await getAllPosts();
      setPosts(updatedPosts.map(post => ({
        ...post,
        image: post.images && post.images.length > 0 ? post.images[0] : '',
        userAvatar: post.userAvatar || 'https://i.pravatar.cc/150?img=8',
        comments: post.comments || [],
      })));
      const updatedUserPosts = await getPostsByUserId();
      setUserPosts(updatedUserPosts.map(post => ({
        ...post,
        image: post.images && post.images.length > 0 ? post.images[0] : '',
        userAvatar: post.userAvatar || 'https://i.pravatar.cc/150?img=8',
        comments: post.comments || [],
      })));
      setShowUploadModal(false);
    } catch (error) {
      console.error('Error uploading post:', error);
      alert('Failed to upload post. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="fixed top-64px left-[305px] w-[calc(100%-350px)] bg-white border-b border-gray-200 z-40">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-gray-900 text-2xl font-bold">Snap Safari</h1>
          <div className="flex items-center space-x-6">
            <button
              onClick={() => {
                setView('feed');
                navigate('/dashboard/snap-safari');
              }}
              className={`text-gray-600 text-xl hover:text-emerald-500 transition-colors ${view === 'feed' ? 'text-emerald-500' : ''}`}
            >
              <FaHome />
            </button>
            <button
              onClick={() => {
                setView('profile');
                navigate('/dashboard/snap-safari/profile');
              }}
              className={`text-gray-600 text-xl hover:text-emerald-500 transition-colors ${view === 'profile' ? 'text-emerald-500' : ''}`}
            >
              <FaUser />
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="text-gray-600 text-xl hover:text-emerald-500 transition-colors"
            >
              <FaPlus />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-screen mx-auto p-4 pt-20">
        <Routes>
          <Route path="/" element={<View posts={posts} setSelectedPost={setSelectedPost} />} />
          <Route path="/profile" element={<Profile posts={userPosts} onPostClick={setSelectedPost} onAddPost={handleAddPost} />} />
          <Route path="*" element={<div>No matching route found. Current path: {location.pathname}</div>} />
        </Routes>
      </div>

      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPost(null)}
          >
            <div
              className="bg-white rounded-lg max-w-[80vw] w-full max-h-[80vh] flex overflow-hidden"
              onClick={e => e.stopPropagation()}
              style={{ height: '80vh' }}
            >
              <div className="w-[60%]">
                {selectedPost.image ? (
                  <img
                    src={selectedPost.image}
                    alt={selectedPost.caption || 'Post image'}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    No image available
                  </div>
                )}
              </div>
              <div className="w-[40%] flex flex-col h-full">
                <div className="p-4 border-b border-gray-200 flex items-center space-x-3">
                  <img
                    src={selectedPost.userAvatar || 'https://i.pravatar.cc/150?img=8'}
                    alt={selectedPost.userId || 'User'}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-gray-900 font-semibold">{selectedPost.name || 'Unknown'}</span>
                </div>
                <div className="p-4 border-b border-gray-200">
                  <p className="text-gray-900 text-lg">{selectedPost.caption || 'No caption'}</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: 'calc(80vh - 180px)' }}>
                  {(selectedPost.comments || []).map(comment => (
                    <div key={comment.userId} className="text-gray-900">
                      <span className="font-bold">{comment.name}</span>: {comment.comment}
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center space-x-4 mb-4">
                    <button
                      onClick={() => handleLike(selectedPost.id)}
                      className="text-2xl text-gray-900"
                    >
                      {likes[selectedPost.id] ? (
                        <FaHeart className="text-red-500" />
                      ) : (
                        <FaRegHeart />
                      )}
                    </button>
                    <span className="text-gray-900">
                      {(selectedPost.likes || 0) + (likes[selectedPost.id] ? 1 : 0)} likes
                    </span>
                  </div>
                  <form onSubmit={(e) => handleComment(selectedPost.id,
                     e)}>
                    <input
                      type="text"
                      value={newComments[selectedPost.id] || ''}
                      onChange={(e) =>
                        setNewComments(prev => ({
                          ...prev,
                          [selectedPost.id]: e.target.value,
                        }))
                      }
                      placeholder="Add a comment..."
                      className="w-full bg-gray-100 text-gray-900 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </form>
                </div>
              </div>
              <button
                className="absolute top-4 right-4 text-white text-2xl"
                onClick={() => setSelectedPost(null)}
              >
                <FaTimes />
              </button>
            </div>
          </motion.div>
        )}

        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={() => setShowUploadModal(false)}
          >
            <div
              className="bg-white rounded-lg w-full max-w-2xl h-[600px] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Create New Post</h2>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setShowUploadModal(false)}
                >
                  <FaTimes />
                </button>
              </div>
              <div className="p-4 h-[calc(100%-73px)] overflow-y-auto">
                <ImageUpload onSubmit={handleAddPost} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function View({ posts, setSelectedPost }) {
  return (
    <div className="mt-64px grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
      {posts.map((post) => (
        <div
          key={post.id}
          className="aspect-square cursor-pointer relative group"
          onClick={() => setSelectedPost(post)}
        >
          {post.image ? (
            <img
              src={post.image}
              alt={post.caption || 'Post image'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
              No image
            </div>
          )}
          <div className="absolute inset-0 bg-black/50 bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
            <div className="text-white flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <FaHeart />
                <span>{post.likes || 0}</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaComment />
                <span>{(post.comments || []).length}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Feed;