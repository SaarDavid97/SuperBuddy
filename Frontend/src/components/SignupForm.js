import React from "react"
import TextField from '@mui/material/TextField';
import {Button} from "@mui/material";
import Box from "@mui/material/Box";
import {useState} from "react";

export default function SignupForm() {
    const [formData, setFormData] = useState(
        {
            name: "",
            email: "",
            phoneNum: "",
            password: ""
        }
    )

    function handleChange(event) {
        const {name, value, type, checked} = event.target
        setFormData(prevFormData => {
            return {
                ...prevFormData,
                [name]: type === "checkbox" ? checked : value
            }
        })
        console.log(formData)
    }

    function handleSubmit(event) {
        event.preventDefault();
        console.log(formData);

        // Example using fetch to POST data as JSON
        fetch('http://localhost:5001/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),  // Convert the React state to JSON and send it as the POST body
        })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }


    return (
        <Box
            component="form"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                '& > :not(style)': {m: 1, width: '25ch'},
            }}
            noValidate
            autoComplete="off"
        >
            <TextField
                id="outlined-basic"
                label="Name"
                variant="outlined"
                onChange={handleChange}
                name="name"
                value={formData.name}
            />
            <TextField
                id="outlined-basic"
                label="Email"
                variant="outlined"
                onChange={handleChange}
                name="email"
                value={formData.email}
                type="email"
            />
            <TextField
                id="outlined-basic"
                label="Phone Number"
                type="number"
                variant="outlined"
                onChange={handleChange}
                name="phoneNum"
                value={formData.phoneNum}
            />
            <TextField
                id="outlined-basic"
                label="Password"
                type="password"
                onChange={handleChange}
                name="password"
                value={formData.password}
            />
            <Button variant='contained' color="success" onClick={handleSubmit}>Signup</Button>
        </Box>
    )
}