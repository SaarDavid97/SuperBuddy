import * as React from 'react';
import {useState} from 'react';
import {styled} from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {DataGrid} from "@mui/x-data-grid";
import RemoveIcon from '@mui/icons-material/Remove';
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import {Button} from "@mui/material";
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';


const ExpandMore = styled((props) => {
    const {expand, ...other} = props;
    return <IconButton {...other} />;
})(({theme, expand}) => ({
    transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
    }),
}));


export default function DishCard({dish, onRequestRecommendations}) {
    const [expanded, setExpanded] = useState(false);
    const [isFavorite, setIsFavorite] = useState(dish.is_favorite);
    const [isAddedToCart, setIsAddedToCart] = useState(false);
    const [servings, setServings] = useState(1);
    const [toCart, setToCart] = useState(dish.ingredients.map(item => ({
        ingredient: item.name,
        amount: item.amount,
        originalAmount: item.amount,
        category: item.category,
    })));
    const [showEmptyServingsDialog, setShowEmptyServingsDialog] = useState(false);


    const handleExpandClick = () => {
        setExpanded(!expanded);
    };


    const handleFavoriteClick = () => {
        setIsFavorite(!isFavorite); // Toggle isFavorite state
        fetch('http://localhost:5001/api/recipe/toggle_favorite', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // This line is necessary for the server to know it's receiving JSON
            },
            body: JSON.stringify({name: dish.name}),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('changed favorite status');
            })
            .catch(error => {
                console.error('There was a problem with your fetch operation:', error);
            });
    };


    const handleAddedClick = () => {
        const payload = [
            dish.name,
            {
                add: !isAddedToCart, // This now directly represents the new state
                items: toCart.map(item => ({
                    ingredient: item.ingredient,
                    amount: item.amount,
                }))
            }
        ]

        setIsAddedToCart(!isAddedToCart);
        fetch('http://localhost:5001/api/recipe/add_to_cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('changed added to cart status');
            })
            .catch(error => {
                console.error('There was a problem with your fetch operation:', error);
            });
        console.log('added to cart');
    }


    const handleRecommendationsClick = () => {
        if (onRequestRecommendations) {
            onRequestRecommendations();
        }
    };


    const handleAmountChange = (ingredient, newAmount) => {
        setToCart(toCart.map(item =>
            item.ingredient === ingredient
                ? {...item, amount: parseFloat(newAmount)}
                : item
        ));
    };


    const handleServingChange = (newServings) => {
        const numericServings = Number(newServings); // Ensure conversion to number
        setServings(numericServings);
        setToCart(currentToCart => currentToCart.map(item => ({
            ...item,
            amount: item.originalAmount * numericServings,
        })));
    };


    const handleServingBlur = (newServings) => {
        if (newServings.trim() === '') {
            handleServingChange(1);
            setShowEmptyServingsDialog(true);
        }
    }


    const handleServingsDialogClose = () => {
        setShowEmptyServingsDialog(false);
    }


    const columns = [
        {field: 'ingredient', headerName: 'Ingredient', width: 180},
        {
            field: 'amount',
            headerName: 'Amount',
            width: 100,
            renderCell: (params) => (
                <input
                    type="number"
                    onKeyPress={handleKeyPress}
                    step="0.25"
                    defaultValue={params.value}
                    onChange={(e) => handleAmountChange(params.row.ingredient, e.target.value)}
                    style={{width: '50px'}}
                />
            ),
            editable: false,
        },
        {field: 'unitOfMeasurement', headerName: 'Unit of measurement', width: 150},
        {field: 'category', headerName: 'Category', width: 150},
    ];


    let rows = toCart.map((item, index) => ({
        id: index,
        ingredient: item.ingredient,
        amount: item.amount,
        // Assuming unitOfMeasurement is static and doesn't need to be recalculated
        unitOfMeasurement: dish.ingredients.find(dishItem => dishItem.name === item.ingredient).unitOfMeasurement,
        category: item.category,
    }));


    const handleKeyPress = (event) => {
        const charCode = event.which ? event.which : event.keyCode;

        // Allow numbers and dot
        if ((charCode > 31 && (charCode < 48 || charCode > 57)) && (charCode !== 46)) {
            event.preventDefault();
        }
    };


    return (
        <div>
            <Card sx={{maxWidth: 800}} className='card'>
                <CardHeader
                    title={dish.name}
                />
                <CardMedia
                    component="img"
                    height="350"
                    image={`data:image/jpeg;base64,${dish.image}`}
                    alt={dish.name}
                    loading="lazy"
                    style={{width: '100%', height: '100%', objectFit: 'contain'}}
                />
                <CardContent>
                    <Typography variant="body2" color="text.secondary">
                        {dish.description}
                    </Typography>
                </CardContent>
                <CardActions disableSpacing>
                    <IconButton aria-label="add to favorites" color={isFavorite ? 'error' : ''}
                                onClick={handleFavoriteClick}>
                        <FavoriteIcon/>
                    </IconButton>
                    <IconButton aria-label="add to cart" color={isAddedToCart ? 'error' : 'success'}
                                onClick={handleAddedClick}>
                        {isAddedToCart ? <RemoveIcon/> : <AddIcon/>}
                    </IconButton>
                    {isFavorite === 1 &&
                        <IconButton aria-label="ask for recommendations" color={'success'}
                                    onClick={handleRecommendationsClick}>
                            <TipsAndUpdatesIcon/>
                        </IconButton>}

                    {/*<Fab aria-label="add to cart" color={isAddedToCart ? '' : 'success'}*/}
                    {/*     onClick={handleAddedClick}>*/}
                    {/*    {isAddedToCart ? <AddIcon/> : <RemoveIcon/>}*/}
                    {/*</Fab>*/}
                    <ExpandMore
                        expand={expanded}
                        onClick={handleExpandClick}
                        aria-expanded={expanded}
                        aria-label="show more"
                    >
                        <ExpandMoreIcon/>
                    </ExpandMore>
                </CardActions>
                <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <CardContent>
                        <Typography paragraph style={{display: 'inline'}}>Ingredients for
                            <input
                                type="number"
                                onKeyPress={handleKeyPress}
                                min={0}
                                defaultValue={servings}
                                onChange={(e) => handleServingChange(e.target.value)}
                                onBlur={(e) => handleServingBlur(e.target.value)}
                                style={{display: 'inline-block', marginLeft: '5px'}}
                            />
                            {servings === 1 ? ' serving' : ' servings'}:
                        </Typography>
                        <DataGrid
                            key={servings}
                            rows={rows}
                            columns={columns}
                            initialState={{
                                pagination: {
                                    paginationModel: {page: 0, pageSize: 20},
                                },
                            }}
                            pageSizeOptions={[20]}
                        />
                    </CardContent>
                </Collapse>
            </Card>
            <Dialog open={showEmptyServingsDialog} onClose={() => setShowEmptyServingsDialog(false)}>
                <Box p={2}>
                    <Typography variant="h6" color="error" gutterBottom>
                        Missing Information
                    </Typography>
                    <Typography variant="body1">
                        Servings field cannot be empty and will be set to 1.
                        Please enter a valid number.
                    </Typography>
                    <Box textAlign="right" mt={2}>
                        <Button variant="contained" onClick={handleServingsDialogClose}>
                            OK
                        </Button>
                    </Box>
                </Box>
            </Dialog>
        </div>
    )
        ;
}
