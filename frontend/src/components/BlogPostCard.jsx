import React from 'react';

const BlogPostList = () => {
  // Sample data for the blog posts
  const posts = [
    {
      id: 1,
      image: './bbg1.jpg', // Placeholder image
      date: 'Mar 22, 2023',
      readTime: '1 min read',
      title: 'My Top 5 Movies of All Times',
      subtitle:
        'Create a blog post subtitle that summarizes your post in a few short, punchy sentences and entices your audience to continue reading...',
    },
    {
      id: 2,
      image: './bbg2.jpg', // Placeholder image
      date: 'Mar 22, 2023',
      readTime: '2 min read',
      title: 'New Movies to Stream from Home This Week',
      subtitle:
        'Create a blog post subtitle that summarizes your post in a few short, punchy sentences and entices your audience to continue reading...',
    },
  ];

  return (
    <div className="py-8 px-4 bg-white">
      <h1 className='text-teal-700 font-extrabold text-6xl text-center mb-10'>Few Blogs of our User</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {posts.map((post) => (
          <div key={post.id} className="flex flex-col">
            {/* Thumbnail Image */}
            <div className="w-full h-48">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>

            {/* Post Details */}
            <div className="mt-4">
              {/* Date and Read Time */}
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>{post.date}</span>
                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                <span>{post.readTime}</span>
              </div>

              {/* Title */}
              <h2 className="mt-2 text-2xl font-bold text-gray-800">
                {post.title}
              </h2>

              {/* Subtitle */}
              <p className="mt-2 text-gray-600">{post.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogPostList;