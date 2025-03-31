import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const images = [
  "./bbg1.jpg",
  "./bbg2.jpg",
  "./bbg3.jpg",
  "./bbg4.jpg",
  "./bbg5.jpg",
  // "./bbg6.jpg",
  // "./bg1.jpg",
  // "./wallhaven-bbg1.jpg",
  // "./wallhaven-bbg2.jpg",
  // "./wallhaven-bbg3.jpg",
  // "./wallhaven-bbg4.jpg",
  // "./wallhaven-bbg5.jpg",
  // "./wallhaven-bbg6.jpg",
];

const Home = () => {
  const [startIndex, setStartIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState(2);

  useEffect(() => {
    const interval = setInterval(() => {
      setStartIndex((prevIndex) => (prevIndex + 1) % images.length);
      setSelectedImage((prevSelected) => (prevSelected + 1) % images.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const visibleImages = Array.from({ length: 5 }, (_, i) => {
    const index = (startIndex + i) % images.length;
    return { image: images[index], index };
  });

  return (
    <div className="min-h-screen relative overflow-hidden">
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          key={selectedImage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${images[selectedImage]})` }}
        />
        <div className="absolute inset-0 bg-black/70" />
      </motion.div>

      <div className="relative h-screen flex flex-col justify-center items-center text-white z-10">
        <h2 className="text-5xl font-semibold mb-6 text-center max-w-4xl">
          Capture the Journey, Cherish the Memories.
        </h2>
        <p className="text-2xl mb-10 text-center">
          Your perfect journey is a click away from you
        </p>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 px-2 overflow-hidden">
          <AnimatePresence>
            {visibleImages.map(({ image, index }, i) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className={`relative cursor-default transition-all duration-300 ease-in-out ${
                  index === selectedImage
                    ? "w-48 h-32"
                    : "w-40 h-28 opacity-70 hover:opacity-100"
                }`}
                onClick={() => {
                  setSelectedImage(index);
                  setStartIndex((index - 2 + images.length) % images.length);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <img
                  src={image}
                  alt={`Location ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Home;
