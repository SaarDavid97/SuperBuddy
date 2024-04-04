import {DataGrid} from '@mui/x-data-grid';
import * as React from "react";
import {useState} from "react";


export default function IngredientsTable(ingredient, multiplier=2) {

    const [toCart, setToCart] = useState([]);

    const handleAmountChange = (ingredient, newAmount) => {
        const updatedToCart = toCart.filter(item => item.ingredient !== ingredient);
        updatedToCart.push({ ingredient, amount: newAmount });
        setToCart(updatedToCart);
        // console.log(toCart);
    };

    const columns = [
        {field: 'ingredient', headerName: 'Ingredient', width: 130},
        {
            field: 'amount',
            headerName: 'Amount',
            width: 90,
            renderCell: (params) => (
                <input
                    type="text"
                    placeholder="Amount"
                    defaultValue={params.value}
                    style={{width: '85%'}}
                    onChange={(e) => handleAmountChange(params.row.ingredient, e.target.value)} // Add onChange to update toCart
                />
            ),
            editable: false,
        },
        {field: 'unitOfMeasurement', headerName: 'Unit of measurement', width: 150},
        {field: 'importance', headerName: 'Importance', width: 90},
    ];

    const spaghetti = [
        {id: 1, ingredient: 'Spaghetti', amount: 8, unitOfMeasurement: 'ounces', importance: 'Essential'},
        {id: 2, ingredient: 'Tomato sauce', amount: 1, unitOfMeasurement: 'cup'},
        {id: 3, ingredient: 'Garlic', amount: 2, unitOfMeasurement: 'cloves'},
        {id: 4, ingredient: 'Onions', amount: 1, unitOfMeasurement: 'medium'},
        {id: 5, ingredient: 'Olive oil', amount: 2, unitOfMeasurement: 'tablespoons'},
        {id: 6, ingredient: 'Oregano', amount: 2, unitOfMeasurement: 'teaspoons', importance: 'Optional'},
    ];

    let rows = spaghetti.map(item => ({
        ...item, // Spread operator to copy item properties
        amount: item.amount, // Just pass amount, multiplication is handled in renderCell
    }));

    return (
        <div style={{height: 400, width: '100%'}}>
            <DataGrid
                rows={rows}
                columns={columns}
                initialState={{
                    pagination: {
                        paginationModel: {page: 0, pageSize: 20},
                    },
                }}
                pageSizeOptions={[20]}
            />
        </div>
    );
}