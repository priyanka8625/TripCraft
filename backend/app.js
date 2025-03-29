const express = require("express");
const axios = require("axios");
// const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
// app.use(cors()); // Enable CORS

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

// Route to get travel spots for a given city
app.get("/getItinerary", async (req, res) => {
    try {
        const { destination } = req.query;

        if (!destination) {
            return res.status(400).json({ error: "Destination is required" });
        }

        // Fetch city coordinates
        const geoResponse = await axios.get(
            `https://opentripmap-places-v1.p.rapidapi.com/en/places/geoname?name=${destination}`,
            {
                headers: {
                    "X-RapidAPI-Key": RAPIDAPI_KEY,
                    "X-RapidAPI-Host": "opentripmap-places-v1.p.rapidapi.com",
                },
            }
        );

        const { lat, lon } = geoResponse.data;

        // Fetch places of interest
        const placesResponse = await axios.get(
            `https://opentripmap-places-v1.p.rapidapi.com/en/places/radius?radius=10000&lon=${lon}&lat=${lat}`,
            {
                headers: {
                    "X-RapidAPI-Key": RAPIDAPI_KEY,
                    "X-RapidAPI-Host": "opentripmap-places-v1.p.rapidapi.com",
                },
            }
        );

        let places = placesResponse.data.features;

        // Format response
        const placesData = places
        .filter((place) => place.properties.name && place.properties.name.trim() !== "")
        .map((place) => ({
            name: place.properties.name,
            description: place.properties.kinds.split(",").join(", "),
            rating: (Math.random() * 5).toFixed(1), // Generating random rating
        }));

        res.json({ itinerary: placesData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
