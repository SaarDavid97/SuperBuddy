import React, {useEffect, useState} from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import {Button} from "@mui/material";
import Dialog from '@mui/material/Dialog';
import DishCard from "../components/DishCard";
import {useTheme} from '@mui/material/styles';
import MobileStepper from '@mui/material/MobileStepper';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import CircularProgress from "@mui/material/CircularProgress";


export default function NewRecipePage() {
    const [name, setName] = useState("");
    const [dishImage, setDishImage] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState("");
    const [showTextErrorDialog, setShowTextErrorDialog] = useState(false);
    const [showImageErrorDialog, setShowImageErrorDialog] = useState(false);
    const [activeStep, setActiveStep] = React.useState(0);
    const [maxSteps, setMaxSteps] = React.useState(0);
    const theme = useTheme();
    const [selectedDish0, setSelectedDish0] = useState(null);
    const [selectedDish1, setSelectedDish1] = useState(null);
    const [selectedDish2, setSelectedDish2] = useState(null);
    const [showLoadingText, setShowLoadingText] = useState(false);
    const [showLoadingImage, setShowLoadingImage] = useState(false);


    const handleChange = (event) => {
        setName(event.target.value);
    };


    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setDishImage(file);
            const previewUrl = URL.createObjectURL(file);
            setImagePreviewUrl(previewUrl);

            // Clean up URL object after it's no longer needed
            return () => URL.revokeObjectURL(previewUrl);
        }
    };


    const getRecipeFromText = () => {
        if (!name.trim()) {
            setShowTextErrorDialog(true);
            return;
        }
        setShowLoadingText(true);
        fetch('http://localhost:5001/api/recipe/text', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({name: name}),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Received recipes')

                setSelectedDish0(data[0]);
                setSelectedDish1(data[1]);
                setSelectedDish2(data[2]);
                setMaxSteps(3);
            })
            .catch(error => {
                console.error('There was a problem with your fetch operation:', error);
            })
            .finally(() => setShowLoadingText(false));
    }


    const getRecipeFromImage = () => {
        if (!dishImage) {
            setShowImageErrorDialog(true);
            return;
        }
        setShowLoadingImage(true);
        const formData = new FormData();
        formData.append('dish_image', dishImage);
        console.log(formData)

        fetch('http://localhost:5001/api/recipe/image', {
            method: 'POST',
            body: formData,
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Received recipe');
                setSelectedDish0(data[0]);
                setSelectedDish1(data[1]);
                setSelectedDish2(data[2]);
                setMaxSteps(3);
            })
            .catch(error => {
                console.error('There was a problem with your fetch operation:', error);
            })
            .finally(() => setShowLoadingImage(false));
    };


    useEffect(() => {
        console.log(selectedDish0);
    }, [selectedDish0]);


    useEffect(() => {
        console.log(selectedDish1);
    }, [selectedDish1]);


    useEffect(() => {
        console.log(selectedDish2);
    }, [selectedDish2]);


    const handleCloseTextErrorDialog = () => {
        setShowTextErrorDialog(false);
    };


    const handleCloseImageErrorDialog = () => {
        setShowImageErrorDialog(false);
    };


    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };


    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };


    return (
        <div className="new-recipe-div">
            <Typography variant="h1" component="h2" color="green">
                Discover
            </Typography>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'left',
                    alignItems: 'flex-start',
                }}
                noValidate
                autoComplete="off"
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        '& > :not(style)': {m: 1, width: '25ch'},
                    }}
                    noValidate
                    autoComplete="off"
                >
                    <Typography variant="p" component="h2" color="green">
                        Type in a dish name
                    </Typography>
                    <TextField
                        id="outlined-basic"
                        label="Dish"
                        variant="outlined"
                        onChange={handleChange}
                        name="name"
                        value={name}
                    />
                    <Button variant="contained" color="success" onClick={getRecipeFromText}>
                        Discover Recipe!
                    </Button>
                    {showLoadingText && <CircularProgress color="success" size={50}/>}
                </Box>

                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        '& > :not(style)': {m: 1, width: '25ch'},
                    }}
                    noValidate
                    autoComplete="off"
                >
                    <Typography variant="p" component="h2" color="green">
                        Upload a photo of the dish
                    </Typography>
                    <label htmlFor="raised-button-file">
                        {!dishImage && <Button variant="contained" component="span" color="success" sx={{mt: 2}}>
                            Upload Photo
                        </Button>}
                    </label>
                    <input
                        accept="image/*"
                        style={{display: 'none'}}
                        id="raised-button-file"
                        multiple
                        type="file"
                        onChange={handleFileChange}
                    />
                    {imagePreviewUrl && (
                        <label htmlFor="raised-button-file">
                            <Box mt={2} sx={{display: 'flex', justifyContent: 'center'}}>
                                <img src={imagePreviewUrl} alt="Preview" style={{maxWidth: '100%', maxHeight: 200}}/>
                            </Box>
                        </label>
                    )}
                    <Button variant="contained" color="success" sx={{mt: 2}} onClick={getRecipeFromImage}>
                        Discover Recipe!
                    </Button>
                    {showLoadingImage && <CircularProgress color="success" size={50}/>}
                </Box>
            </Box>
            <Dialog open={selectedDish0 && activeStep === 0} onClose={() => setSelectedDish0(null)}>
                <MobileStepper
                    variant="text"
                    steps={maxSteps}
                    position="static"
                    activeStep={activeStep}
                    nextButton={
                        <Button
                            size="small"
                            onClick={handleNext}
                            disabled={activeStep === maxSteps - 1}
                            color='success'
                        >
                            Next
                            {theme.direction === 'rtl' ? (
                                <KeyboardArrowLeft/>
                            ) : (
                                <KeyboardArrowRight/>
                            )}
                        </Button>
                    }
                    backButton={
                        <Button
                            size="small"
                            onClick={handleBack}
                            disabled={activeStep === 0}
                            color='success'
                        >
                            {theme.direction === 'rtl' ? (
                                <KeyboardArrowRight/>
                            ) : (
                                <KeyboardArrowLeft/>
                            )}
                            Back
                        </Button>
                    }
                />
                {selectedDish0 && <DishCard dish={selectedDish0}/>}
            </Dialog>
            <Dialog open={selectedDish1 && activeStep === 1} onClose={() => setSelectedDish1(null)}>
                <MobileStepper
                    variant="text"
                    steps={maxSteps}
                    position="static"
                    activeStep={activeStep}
                    nextButton={
                        <Button
                            size="small"
                            onClick={handleNext}
                            disabled={activeStep === maxSteps - 1}
                            color='success'
                        >
                            Next
                            {theme.direction === 'rtl' ? (
                                <KeyboardArrowLeft/>
                            ) : (
                                <KeyboardArrowRight/>
                            )}
                        </Button>
                    }
                    backButton={
                        <Button
                            size="small"
                            onClick={handleBack}
                            disabled={activeStep === 0}
                            color='success'
                        >
                            {theme.direction === 'rtl' ? (
                                <KeyboardArrowRight/>
                            ) : (
                                <KeyboardArrowLeft/>
                            )}
                            Back
                        </Button>
                    }
                />
                {selectedDish1 && <DishCard dish={selectedDish1}/>}
            </Dialog>
            <Dialog open={selectedDish2 && activeStep === 2} onClose={() => setSelectedDish2(null)}>
                <MobileStepper
                    variant="text"
                    steps={maxSteps}
                    position="static"
                    activeStep={activeStep}
                    nextButton={
                        <Button
                            size="small"
                            onClick={handleNext}
                            disabled={activeStep === maxSteps - 1}
                            color='success'
                        >
                            Next
                            {theme.direction === 'rtl' ? (
                                <KeyboardArrowLeft/>
                            ) : (
                                <KeyboardArrowRight/>
                            )}
                        </Button>
                    }
                    backButton={
                        <Button
                            size="small"
                            onClick={handleBack}
                            disabled={activeStep === 0}
                            color='success'
                        >
                            {theme.direction === 'rtl' ? (
                                <KeyboardArrowRight/>
                            ) : (
                                <KeyboardArrowLeft/>
                            )}
                            Back
                        </Button>
                    }
                />
                {selectedDish2 && <DishCard dish={selectedDish2}/>}
            </Dialog>


            <Dialog open={showTextErrorDialog} onClose={handleCloseTextErrorDialog}>
                <Box p={2}>
                    <Typography variant="h6" color="error" gutterBottom>
                        Missing Information
                    </Typography>
                    <Typography variant="body1">
                        Please write the name of a dish to use this option.
                    </Typography>
                    <Box textAlign="right" mt={2}>
                        <Button variant="contained" onClick={handleCloseTextErrorDialog}>
                            OK
                        </Button>
                    </Box>
                </Box>
            </Dialog>
            <Dialog open={showImageErrorDialog} onClose={handleCloseImageErrorDialog}>
                <Box p={2}>
                    <Typography variant="h6" color="error" gutterBottom>
                        Missing Information
                    </Typography>
                    <Typography variant="body1">
                        Please upload an image of a dish to use this option.
                    </Typography>
                    <Box textAlign="right" mt={2}>
                        <Button variant="contained" onClick={handleCloseImageErrorDialog}>
                            OK
                        </Button>
                    </Box>
                </Box>
            </Dialog>
        </div>
    );
}
