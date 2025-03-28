import React from 'react';
import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Reviews = () => {
  const navigate = useNavigate();

  const handleNavigation = () => {
    navigate("/plan");
  };

  const reviews = [
    {
      name: "Sarah Johnson",
      location: "New York, USA",
      rating: 5,
      text: "TravelX transformed my vacation planning experience. The AI recommendations were spot-on! I was able to plan an entire trip within my budget and even discovered hidden gems I wouldn’t have found otherwise. The itinerary was flexible, and the expense tracker ensured I stayed on budget. Highly recommend!",
      image: "./face.jpg"
    },
    {
      name: "Michael Chen",
      location: "Singapore",
      rating: 5,
      text: "The local expertise feature connected me with amazing guides. Truly exceptional service! Not only did I get personalized recommendations, but the AI-driven insights helped me find the best flight deals and hotel stays. The interactive map feature was a game-changer, making navigation in a new city effortless. Can't wait to use it again!",
      image: "./face.jpg"
    },
    {
      name: "Emma Thompson",
      location: "London, UK",
      rating: 5,
      text: "24/7 support came in handy when I needed last-minute changes. Fantastic experience!",
      image: "./face.jpg"
    },
    {
      name: "Carlos Mendes",
      location: "Lisbon, Portugal",
      rating: 4,
      text: "Easy-to-use interface and great travel suggestions. Will use again!",
      image: "./face.jpg"
    },
    {
      name: "Ananya Patel",
      location: "Mumbai, India",
      rating: 5,
      text: "Loved the AI-driven budget tracking! Made my solo trip stress-free.",
      image: "./face.jpg"
    },
    {
      name: "James Robertson",
      location: "Sydney, Australia",
      rating: 4,
      text: "Good experience overall. Some minor improvements needed, but very helpful!",
      image: "./face.jpg"
    }
  ];

  return (
    <section className="py-20 bg-offwhite text-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-extrabold tracking-wide mb-4 text-green-600">Hear From Our Travelers</h2>
          <p className="text-lg max-w-2xl mx-auto opacity-80 text-gray-700">
            Discover how AI-powered travel planning has made trips seamless, budget-friendly, and unforgettable.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto h-auto">
  {reviews.map((review, index) => (
    <div
      key={index}
      className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 hover:shadow-lg"
    >
      {/* Star Ratings */}
      <div className="flex mb-4 text-yellow-500">
        {[...Array(review.rating)].map((_, i) => (
          <Star key={i} className="w-5 h-5 fill-current text-yellow-500" />
        ))}
      </div>

      {/* Review Text */}
      <p className="text-base leading-relaxed text-gray-700 mb-5">
        "{review.text}"
      </p>

      {/* Reviewer Information */}
      <div className="flex items-center">
        <img
          src={review.image}
          alt={review.name}
          className="w-12 h-12 rounded-full object-cover border-2 border-gray-300 mr-4"
        />
        <div>
          <h4 className="font-semibold text-lg text-gray-900">{review.name}</h4>
          <p className="text-sm text-gray-500">{review.location}</p>
        </div>
      </div>
    </div>
  ))}
</div>


        <div className="text-center mt-16">
          <button
            className="bg-gradient-to-r from-blue-800 to-blue-500 text-white px-10 py-3 rounded-xl shadow-md hover:from-blue-500 hover:to-blue-800 hover:cursor-pointer text-lg font-bold"
            onClick={handleNavigation}
          >
            Start Your Journey
          </button>
        </div>
      </div>
    </section>
  );
};

export default Reviews;
