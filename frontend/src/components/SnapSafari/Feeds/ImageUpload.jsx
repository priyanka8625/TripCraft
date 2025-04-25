import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

function ImageUpload({ onSubmit }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [caption, setCaption] = useState('');
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedImage && caption.trim()) {
      onSubmit(selectedImage, caption);
      setSelectedImage(null);
      setCaption('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          {selectedImage ? (
            <img 
              src={URL.createObjectURL(selectedImage)} 
              alt="Preview" 
              className="max-h-96 mx-auto rounded-lg"
            />
          ) : (
            <div className="text-gray-500">
              <p className="text-lg mb-2">Click to select an image</p>
              <p className="text-sm">or drag and drop your image here</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        <div>
          <label htmlFor="caption" className="block text-sm font-medium text-gray-700 mb-2">
            Caption
          </label>
          <textarea
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full bg-gray-50 text-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            rows="3"
            placeholder="Write a caption for your post..."
          />
        </div>

        <button
          type="submit"
          disabled={!selectedImage || !caption.trim()}
          className="w-100 bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Share Post
        </button>
      </form>
    </motion.div>
  );
}

export default ImageUpload;
