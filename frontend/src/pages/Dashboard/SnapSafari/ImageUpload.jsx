import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

function ImageUpload({ onSubmit }) {
  const [selectedImages, setSelectedImages] = useState([]); // Changed to array for multiple images
  const [destination, setDestination] = useState('');
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const fileInputRef = useRef(null);
  // Define the maximum file size (10MB in bytes)
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => file.type.startsWith('image/'));

    // Check file size for each image
    const oversizedFiles = validFiles.filter(file => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      alert(`The following files exceed the 10MB limit: ${oversizedFiles.map(f => f.name).join(', ')}`);
      return;
    }

    setSelectedImages(validFiles);
  };

  // Remove an image from the selected images
  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      selectedImages.length > 0 &&
      destination.trim() &&
      title.trim() &&
      caption.trim()
    ) {
      // Pass form data to onSubmit handler
      onSubmit({
        destination,
        title,
        caption,
        images: selectedImages,
      });
      // Reset form
      setSelectedImages([]);
      setDestination('');
      setTitle('');
      setCaption('');
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset file input
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Destination Field */}
        <div>
          <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-2">
            Destination
          </label>
          <input
            id="destination"
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full bg-gray-50 text-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Enter the destination (e.g., Paris)"
            required
          />
        </div>

        {/* Title Field */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-gray-50 text-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Enter a title for your post"
            required
          />
        </div>

        {/* Caption Field */}
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
            required
          />
        </div>

        {/* Image Upload Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Images
          </label>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            {selectedImages.length > 0 ? (
              <div className="flex flex-wrap gap-4 justify-center">
                {selectedImages.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Preview ${index}`}
                      className="max-h-40 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering file input click
                        removeImage(index);
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500">
                <p className="text-lg mb-2">Click to select images</p>
                <p className="text-sm">or drag and drop your images here</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple // Allow multiple file selection
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={
            selectedImages.length === 0 ||
            !destination.trim() ||
            !title.trim() ||
            !caption.trim()
          }
          className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Share Post
        </button>
      </form>
    </motion.div>
  );
}

export default ImageUpload;