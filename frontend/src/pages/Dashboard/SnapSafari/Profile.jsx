import { FaHeart, FaComment } from "react-icons/fa";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Profile({ posts, onPostClick, onAddPost }) {
  const [userPosts, setUserPosts] = useState([]);

  useEffect(() => {
    setUserPosts(posts || []);
  }, [posts]);

  const handleImageUpload = (image, caption) => {
    onAddPost(image, caption);
  };

  return (
    <>
      {/* Profile Section */}

      <div
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        className="w-150 max-w-7xl ml-10 px-4 py-6"
      >
        <div className="bg-white rounded-lg p-6 shadow-md">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-emerald-600 rounded-full flex items-center justify-center text-white text-4xl">
              U
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">current_user</h2>
              <p className="text-gray-600 mt-1">
                Capturing moments through my lens 📸
              </p>
              <div className="flex space-x-6 mt-4 text-gray-600">
                <div>
                  <span className="font-bold text-gray-900">
                    {posts.length}
                  </span>{" "}
                  posts
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="w-full px-2 sm:px-4 pb-8"
      >
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
          {userPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => onPostClick(post)}
              className="aspect-square cursor-pointer relative group"
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
      </motion.div>
    </>
  );
}

export default Profile;
