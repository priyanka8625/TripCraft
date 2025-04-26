import React from 'react';
const Posts = () => {
  const posts = [
    {
      id: 1,
      image: './img/bbg1.jpg', // Larger image
      title: 'ALASKA TRIP PLAN',
      author: 'John Doe',
      experience: 'A thrilling adventure through the icy peaks!',
      date: 'March 15, 2025',
      location: 'Denali National Park',
      snapSafari: '@johns_adventures',
    },
    {
      id: 2,
      image: './img/bbg2.jpg', // Larger image
      title: 'BRUCE FINKLEA',
      author: 'Bruce Finklea',
      experience: 'Scaling the toughest cliffs was unforgettable.',
      date: 'March 10, 2025',
      location: 'Yosemite National Park',
      snapSafari: '@bruce_climbs',
    },
    {
      id: 3,
      image: './img/bbg3.jpg', // Smaller image
      title: "New Zealand's Reflection Lake",
      author: 'Sarah Lee',
      experience: 'The waterfalls were breathtaking!',
      date: 'March 5, 2025',
      location: 'Glacier Bay, Alaska',
      snapSafari: '@sarah_explores',
    },
    {
      id: 4,
      image: './img/bbg4.jpg', // Smaller image
      title: 'Smoky Mountains',
      author: 'Mike Brown',
      experience: 'Camping with friends, best memories!',
      date: 'March 1, 2025',
      location: 'Rocky Mountains',
      snapSafari: '@mike_camps',
    },
  ];

  return (
    <div className="py-12 px-5 bg-gray-50 text-center -mb-40">
      {/* Main Heading and Tagline */}
      <h1 className="text-4xl md:text-5xl font-bold uppercase text-gray-800 mb-4">
        Post of our Snap Safari Users
      </h1>
      <p className="text-xl md:text-2xl uppercase text-gray-600 mb-3">
        The Summit is What Drives Us,
      </p>
      <p className="uppercase text-gray-600 mb-4">
        But the Climb is What Matters.
      </p>
      {/* First Row: Two Larger Images Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto mb-6">
        {posts.slice(0, 2).map((post) => (
          <div key={post.id} className="text-center">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-72 object-cover rounded-lg"
            />
            <h3 className="mt-4 text-lg font-semibold text-gray-700 uppercase">
              {post.title}
            </h3>
            <p className="text-sm text-teal-600 mt-1 mb-1 cursor-pointer hover:cursor-pointer">
              Snap Safari: {post.snapSafari}
            </p>
            <p className="text-sm text-gray-500">Posted by: {post.author}</p>
            <p className="text-sm text-gray-500">{post.experience}</p>
            <p className="text-sm text-gray-500">
              {post.date} | {post.location}
            </p>
            
          </div>
        ))}
      </div>

      {/* Second Row: Two Smaller Images Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-10">
        {posts.slice(2, 4).map((post) => (
          <div key={post.id} className="text-center">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-48 object-cover rounded-lg"
            />
            <h3 className="mt-4 text-md font-semibold text-gray-700 uppercase">
              {post.title}
            </h3>
            <p className="text-sm text-teal-600 mt-1 mb-1 cursor-pointer hover:cursor-pointer">
              Snap Safari: {post.snapSafari}
            </p>
            <p className="text-sm text-gray-500">Posted by: {post.author}</p>
            <p className="text-sm text-gray-500">{post.experience}</p>
            <p className="text-sm text-gray-500">
              {post.date} | {post.location}
            </p>
            
          </div>
        ))}
      </div>

      {/* Floating Posts Heading */}
      {/* <h2 className="text-2xl font-bold uppercase text-gray-800">
        FLOATING POSTS
      </h2> */}
    </div>
  );
};

export default Posts;