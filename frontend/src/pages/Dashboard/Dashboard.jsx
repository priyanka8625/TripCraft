import React from 'react';
import Sidebar from '../../components/Dashboard/Sidebar/Sidebar';
import Navbar from '../../components/Dashboard/Navbar/Navbar';
import MainContent from '../../components/Dashboard/MainContent';

function Dashboard() {
  const user = {
    name: "Anni",
    role: "Traveler Pro",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128"
  };

  const recentTrips = [
    {
      image: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7",
      name: "Bali Adventure",
      destination: "Bali, Indonesia",
      people: 4,
      budget: "₹19,600"
    },
    {
      image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c",
      name: "Dubai Explorer",
      destination: "Dubai, UAE",
      people: 2,
      budget: "₹21,700"
    },
    {
      image: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd",
      name: "Maldives Retreat",
      destination: "Maldives",
      people: 3,
      budget: "₹11,300"
    },
    {
      image: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2",
      name: "Thailand Escape",
      destination: "Phuket, Thailand",
      people: 2,
      budget: "₹15,400"
    }
  ];

  const activities = [
    {
      image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1",
      title: "Beach Paradise",
      description: "Relaxing weekend at the most beautiful beach",
      likes: 186,
      comments: 32
    },
    {
      image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34",
      title: "Paris Wanderlust",
      description: "Exploring the romantic streets of Paris",
      likes: 324,
      comments: 56
    },
    {
      image: "https://images.unsplash.com/photo-1499363536502-87642509e31b",
      title: "Island Hopping",
      description: "Discovering hidden gems in the Pacific",
      likes: 198,
      comments: 28
    }
  ];

  const upcomingTrips = [
    {
      name: "Swiss Alps Tour",
      destination: "Switzerland",
      dates: "Mar 15 - Mar 25"
    },
    {
      name: "Tokyo Adventure",
      destination: "Japan",
      dates: "Apr 10 - Apr 20"
    },
    {
      name: "Greek Islands",
      destination: "Greece",
      dates: "May 5 - May 15"
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
    <Sidebar />
    <div className="flex-1 overflow-auto">
      <Navbar user={user} />
        <MainContent 
        user={user}
        recentTrips={recentTrips}
        activities={activities}
        upcomingTrips={upcomingTrips}
      />
    </div>
  </div>
  );
}

export default Dashboard;