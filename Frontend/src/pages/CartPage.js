import {DataGrid} from "@mui/x-data-grid";
import * as React from "react";
import {useEffect, useState} from "react";
import Typography from "@mui/material/Typography";
import DoneIcon from '@mui/icons-material/Done';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from "@mui/material/IconButton";
import {Button} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";

export default function CartPage() {
    const [cart, setCart] = useState([]);
    const [showEmptyDialog, setShowEmptyDialog] = useState(false);


    const handleAmountChange = (ingredient, newAmount) => {
        const updatedCart = cart.map(item =>
            item.ingredient === ingredient
                ? {...item, amount: parseFloat(newAmount)}
                : item
        );
        setCart(updatedCart);
        console.log(updatedCart);
    };


    useEffect(() => {
        fetch('http://localhost:5001/api/cart/get')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Received cart')
                setCart(data);
            })
            .catch(error => {
                console.error('There was a problem with your fetch operation:', error);
            });
    },[]);


    const handleUpdateClick = () => {
        fetch('http://localhost:5001/api/cart/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(cart),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Cart updated')
            })
            .catch(error => {
                console.error('There was a problem with your fetch operation:', error);
            });
    }

    const handleEmptyClick = () => {
        fetch('http://localhost:5001/api/cart/empty', {
            method: 'POST',
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Cart deleted')
            })
            .catch(error => {
                console.error('There was a problem with your fetch operation:', error);
            });
        setShowEmptyDialog(false);
        setCart([])
    }


    const handlePreEmptyClick = () => {
        setShowEmptyDialog(true);
    }


    const handleCloseEmptyDialog = () => {
        setShowEmptyDialog(false);
    };


    const getLongestDishes = () => {
        let longest = 0;
        cart.forEach(item => {
            if (item.dishes.length > longest) {
                longest = item.dishes.length;
            }
        });
        return longest;
    }


    const columns = [
        {
            field: 'ingredient',
            headerName: 'Ingredient',
            width: 250,
            renderCell: (params) => (
                <strong style={{fontSize: '18px'}}>{params.value}</strong>
            ),
        },
        {
            field: 'amount',
            headerName: 'Amount',
            width: 200,
            renderCell: (params) => (
                <input
                    type="number"
                    step="0.25"
                    defaultValue={params.value}
                    onChange={(e) => handleAmountChange(params.row.ingredient, e.target.value)}
                    style={{width: '50px', fontWeight: 'bold', fontSize: '18px'}} // Increase font size for amount input
                />
            ),
            editable: false,
        },
        {
            field: 'unitOfMeasurement',
            headerName: 'Unit of measurement',
            width: 250,
            renderCell: (params) => (
                <strong style={{fontSize: '18px'}}>{params.value}</strong>
            ),
        },
        {
            field: 'category',
            headerName: 'Category',
            width: 300,
            renderCell: (params) => (
                <strong style={{fontSize: '18px'}}>{params.value}</strong>
            ),
        },
        {
            field: 'dishes',
            headerName: 'Dishes',
            width: getLongestDishes() * 10,
            renderCell: (params) => (
                <strong style={{fontSize: '18px'}}>{params.value}</strong>
            ),
        },
    ];


    let rows = cart.map((item, index) => ({
        id: index,
        ...item,
    }));


    return (
        <div className="page-div">
            <div className='cart-header'>
                <Typography variant="p" component="h1" color='green'>
                    Your current shopping cart:
                </Typography>
                <div className='cart-buttons'>
                    <IconButton color='success' onClick={handleUpdateClick}>
                        <DoneIcon/>
                    </IconButton>
                    <IconButton color='error' onClick={handlePreEmptyClick}>
                        <DeleteIcon/>
                    </IconButton>
                </div>
            </div>
            <DataGrid
                autoHeight
                sx={{
                    '& .MuiDataGrid-columnHeaderTitle': {
                        fontWeight: 'bold', // Ensure the text is bold
                        fontSize: '1.3rem', // Increase the font size
                    }
                }}
                rows={rows}
                columns={columns}
                initialState={{
                    pagination: {
                        paginationModel: {page: 0, pageSize: 100},
                    },
                }}
                pageSizeOptions={[5]}
            />


            <Dialog open={showEmptyDialog} onClose={() => setShowEmptyDialog(false)}>
                <Box p={2}>
                    <Typography variant="h6" color="error" gutterBottom>
                        Missing Information
                    </Typography>
                    <Typography variant="body1">
                        The cart will be emptied. Are you sure you want to proceed?
                    </Typography>
                    <div className='dialog-buttons'>
                        <Button variant="contained" color='success' onClick={handleCloseEmptyDialog}>
                            keep the cart
                        </Button>
                        <Button variant="contained" color='error' onClick={handleEmptyClick}>
                            empty the cart
                        </Button>
                    </div>
                </Box>
            </Dialog>
        </div>
    )
}