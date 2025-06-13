import React, { useState, useEffect } from 'react';
import MainContent from '../../components/Dashboard/MainContent';
import { getPostsByUserId } from '../../services/snapSafariService'; // Your existing service
import { getRecentTrips, getUpcomingTrips } from '../../services/tripService';
import { getUserProfile } from '../../services/userService';

function Dashboard() {
  // State for all data
  // const [user] = useState({
  //   name: "Anni",
  //   role: "Traveler Pro",
  //   avatar: "./img/profile_pic.jpg"
  // });
  // Initialize user state as null or an empty object
  const [user, setUser] = useState(null);
  const [recentTrips, setRecentTrips] = useState([]);
  const [upcomingTrips, setUpcomingTrips] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch user profile
        const userData = await getUserProfile();
        setUser({
          name: userData?.name || 'Unknown User',
          // name: 'Priyanka',
          role: 'Traveler',
          avatar: '/img/profile_pic.jpg' // Fallback avatar
        });
        
        // Fetch activities (posts)
        const postsData = await getPostsByUserId();
        setActivities(postsData);
        console.log("activities: ", postsData);
        

        // Fetch recent trips
        const recentTripsData = await getRecentTrips();
        setRecentTrips(recentTripsData);
        console.log("recent trips: ",recentTripsData);
        

        // Fetch upcoming trips
        const upcomingTripsData = await getUpcomingTrips();
        setUpcomingTrips(upcomingTripsData);
        console.log("upcoming trips: ", upcomingTripsData);
        

      } catch (err) {
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array means this runs once on mount

  // Handle loading and error states
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <MainContent 
      user={user}
      recentTrips={recentTrips}
      activities={activities}
      upcomingTrips={upcomingTrips}
    />
  );
}

export default Dashboard;