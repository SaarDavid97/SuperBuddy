import * as React from 'react';
import {useEffect, useState} from 'react';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import Typography from "@mui/material/Typography";
import DishCard from "../components/DishCard"
import Dialog from '@mui/material/Dialog';


export default function RecommendationsGrid({dishName}) {
    const [recommendations, setRecommendations] = useState([]);
    const [selectedDish, setSelectedDish] = useState(null);


    useEffect(() => {
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

            })
            .catch(error => {
                console.error('There was a problem with your fetch operation:', error);
            });
    }, [dishName]);


    return (
        <div className='page-div'>
            <Dialog open={Boolean(selectedDish)} onClose={() => setSelectedDish(null)}>
                {selectedDish &&
                    <DishCard dish={selectedDish} onRequestRecommendations={() => {
                        setSelectedDish(null); // This closes the DishCard dialog
                    }}/>}
            </Dialog>
            <Typography variant="p" component="h1" color='green'>
                Your favorite dishes:
            </Typography>
            <ImageList sx={{width: 500, height: 500}} cols={2} rowHeight={164}>
                {recommendations.map((item) => (
                    <ImageListItem key={item.image} onClick={() => setSelectedDish(item)}>
                        <img
                            src={`data:image/jpeg;base64,${item.image}`}
                            alt={item.name}
                            loading="lazy"
                        />
                    </ImageListItem>
                ))}
            </ImageList>
        </div>
    )
}




