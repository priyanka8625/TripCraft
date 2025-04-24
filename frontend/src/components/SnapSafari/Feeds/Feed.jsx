import { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart, FaComment, FaTimes, FaHome, FaUser, FaPlus } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Profile from './Profile';
import ImageUpload from './ImageUpload';
import { Route, Routes } from 'react-router-dom';
import { useNavigate, useLocation } from 'react-router-dom';

function Feed() {
  const [view, setView] = useState('feed');
  const [selectedPost, setSelectedPost] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [posts, setPosts] = useState([
    {
      id: 1,
      userId: 'adventure_seeker',
      userAvatar: 'https://i.pravatar.cc/150?img=1',
      image: './bg1.jpg',
      caption: 'Exploring the wilderness 🌲',
      likes: 245,
      comments: [
        { id: 1, username: 'traveler', text: 'Amazing view!' },
        { id: 2, username: 'photographer', text: 'Great composition!' }
      ]
    },
    {
      id: 2,
      userId: 'urban_explorer',
      userAvatar: 'https://i.pravatar.cc/150?img=2',
      image: './bg2.jpg',
      caption: 'Urban adventures in the city 🌆',
      likes: 189,
      comments: [
        { id: 3, username: 'cityexplorer', text: 'Love the urban vibes!' }
      ]
    },
    {
      id: 3,
      userId: 'mountain_climber',
      userAvatar: 'https://i.pravatar.cc/150?img=3',
      image: './bg3.jpg',
      caption: 'Mountain peaks 🏔',
      likes: 320,
      comments: []
    },
    {
      id: 4,
      userId: 'sunset_chaser',
      userAvatar: 'https://i.pravatar.cc/150?img=4',
      image: './bg4.jpg',
      caption: 'Sunset vibes 🌅',
      likes: 278,
      comments: []
    },
    {
      id: 5,
      userId: 'beach_lover',
      userAvatar: 'https://i.pravatar.cc/150?img=5',
      image: './bbg1.jpg',
      caption: 'Beach paradise 🏖',
      likes: 412,
      comments: []
    }
  ]);

  const [newComments, setNewComments] = useState({});
  const [likes, setLikes] = useState({});

  const navigate = useNavigate();
  const location = useLocation(); // Get the current location

  // useEffect to check pathname and navigate to /home if at root
  useEffect(() => {
    if (location.pathname === '/') {
      navigate('/home');
      setView('feed'); // Optionally set the view to 'feed'
    }
  }, [location.pathname, navigate]);

  const handleLike = (postId) => {
    setLikes(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleComment = (postId, e) => {
    e.preventDefault();
    if (newComments[postId]?.trim()) {
      const post = posts.find(p => p.id === postId);
      post.comments.push({
        id: Date.now(),
        username: 'user',
        text: newComments[postId]
      });
      setNewComments(prev => ({
        ...prev,
        [postId]: ''
      }));
    }
  };

  const handleAddPost = (image, caption) => {
    const newPost = {
      id: Date.now(),
      userId: 'current_user',
      userAvatar: 'https://i.pravatar.cc/150?img=8',
      image: URL.createObjectURL(image),
      caption,
      likes: 0,
      comments: []
    };
    setPosts(prev => [newPost, ...prev]);
    setUserPosts(prev => [newPost, ...prev]);
    setShowUploadModal(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-gray-900 text-2xl font-bold">Snap Safari</h1>
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => {
                setView('feed')
                navigate("/home")
              }}
              className={`text-gray-600 text-xl hover:text-emerald-500 transition-colors ${view === 'feed' ? 'text-emerald-500' : ''}`}
            >
              <FaHome />
            </button>
            <button 
              onClick={() => {
                setView('profile')
                navigate("/profile")
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
        {/* {view === 'feed' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
            {posts.map((post) => (
              <div
                key={post.id}
                className="aspect-square cursor-pointer relative group"
                onClick={() => setSelectedPost(post)}
              >
                <img
                  src={post.image}
                  alt={post.caption}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="text-white flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <FaHeart />
                      <span>{post.likes}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaComment />
                      <span>{post.comments.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )} */}

        {/* {view === 'profile' && (
          <div className="w-full">
            <Profile posts={userPosts} onPostClick={setSelectedPost} onAddPost={handleAddPost} />
          </div>
        )} */}

        <Routes>
            <Route path='/home' element={<View posts={posts} setSelectedPost={setSelectedPost} />}/>
            <Route path='/profile' element={<Profile posts={userPosts} onPostClick={setSelectedPost} onAddPost={handleAddPost} />}/>
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
              style={{ height: '80vh' }} // Explicit height for better control
            >
              <div className="w-[60%]">
                <img
                  src={selectedPost.image}
                  alt={selectedPost.caption}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="w-[40%] flex flex-col h-full">
                <div className="p-4 border-b border-gray-200 flex items-center space-x-3">
                  <img
                    src={selectedPost.userAvatar}
                    alt={selectedPost.userId}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-gray-900 font-semibold">{selectedPost.userId}</span>
                </div>
                <div className="p-4 border-b border-gray-200">
                  <p className="text-gray-900 text-lg">{selectedPost.caption}</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: 'calc(80vh - 180px)' }}>
                  {selectedPost.comments.map(comment => (
                    <div key={comment.id} className="text-gray-900">
                      <span className="font-bold">{comment.username}</span>: {comment.text}
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
                      {selectedPost.likes + (likes[selectedPost.id] ? 1 : 0)} likes
                    </span>
                  </div>
                  <form onSubmit={(e) => handleComment(selectedPost.id, e)}>
                    <input
                      type="text"
                      value={newComments[selectedPost.id] || ''}
                      onChange={(e) =>
                        setNewComments(prev => ({
                          ...prev,
                          [selectedPost.id]: e.target.value
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

function View ({ posts, setSelectedPost }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
            {posts.map((post) => (
              <div
                key={post.id}
                className="aspect-square cursor-pointer relative group"
                onClick={() => setSelectedPost(post)}
              >
                <img
                  src={post.image}
                  alt={post.caption}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="text-white flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <FaHeart />
                      <span>{post.likes}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaComment />
                      <span>{post.comments.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
  );
}

export default Feed;


