import * as React from 'react';
import {useEffect, useState} from 'react';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import Typography from "@mui/material/Typography";
import DishCard from "../components/DishCard"
import Dialog from '@mui/material/Dialog';


export default function FavoritesPage() {
    const [favorites, setFavorites] = useState([]);
    const [selectedDish, setSelectedDish] = useState(null);
    const [selectedRecommendation, setSelectedRecommendation] = useState(null);
    const [showRecommendationsDialog, setShowRecommendationsDialog] = useState(false);
    const [recommendations, setRecommendations] = useState([]);


    useEffect(() => {
        fetch('http://localhost:5001/api/get_favorites')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Received favorites');
                setFavorites(data);
            })
            .catch(error => {
                console.error('There was a problem with your fetch operation:', error);
            });
    }, []);


    const getRecommendations = (dishName) => {
        fetch('http://localhost:5001/api/get_recommendations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({name: dishName}),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setRecommendations(data);
                console.log('Recommendations fetched:', data)
                // Now we open the recommendations dialog after fetching the recommendations
            })
            .catch(error => {
                console.error('There was a problem with your fetch operation:', error);
            });
    }


    return (
        <div className='page-div'>
            <Typography variant="p" component="h1" color='green'>
                Your favorite dishes:
            </Typography>
            <ImageList sx={{width: 1200, height: 950}} cols={4} rowHeight={300}>
                {favorites.map((item) => (
                    <ImageListItem key={item.image} onClick={() => setSelectedDish(item)}>
                        <img
                            src={`data:image/jpeg;base64,${item.image}`}
                            alt={item.name}
                            loading="lazy"
                        />
                    </ImageListItem>
                ))}
            </ImageList>
            <Dialog open={Boolean(selectedDish)} onClose={() => setSelectedDish(null)}>
                {selectedDish &&
                    <DishCard dish={selectedDish} onRequestRecommendations={() => {
                        console.log('Requesting recommendations for', selectedDish.name);
                        setShowRecommendationsDialog(true); // Open the dialog immediately
                        getRecommendations(selectedDish.name); // Fetch recommendations in the background
                        selectedDish && setSelectedDish(null); // Close the dialog after fetching recommendations
                    }}/>}
            </Dialog>
            <Dialog open={Boolean(selectedRecommendation)} onClose={() => setSelectedRecommendation(null)}>
                {selectedRecommendation &&
                    <DishCard dish={selectedRecommendation} onRequestRecommendations={() => {
                        console.log('Requesting recommendations for', selectedRecommendation.name);
                        setShowRecommendationsDialog(true); // Open the dialog immediately
                        getRecommendations(selectedRecommendation.name); // Fetch recommendations in the background
                        selectedRecommendation && setShowRecommendationsDialog(null); // Close the dialog after fetching recommendations
                    }}/>}
            </Dialog>
            <Dialog open={showRecommendationsDialog} onClose={() => setShowRecommendationsDialog(false)}>
                <ImageList sx={{width: 500, height: 500}} cols={2} rowHeight={164}>
                    {recommendations.map((item) => (
                        <ImageListItem key={item.image} onClick={() => setSelectedRecommendation(item)}>
                            <img
                                src={`data:image/jpeg;base64,${item.image}`}
                                alt={item.name}
                                loading="lazy"
                            />
                        </ImageListItem>
                    ))}
                </ImageList>
            </Dialog>
        </div>
    )
}





