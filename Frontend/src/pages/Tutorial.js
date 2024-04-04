import * as React from 'react';
import {createTheme} from '@mui/material/styles';
import Box from '@mui/material/Box';
import MobileStepper from '@mui/material/MobileStepper';
import Button from '@mui/material/Button';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import Dialog from "@mui/material/Dialog";


function Tutorial() {
    const [activeStep, setActiveStep] = React.useState(0);
    const [showTutorial, setShowTutorial] = React.useState(true);
    const images = ['tutorial1.jpeg', 'tutorial2.jpeg', 'tutorial3.jpeg']
    const maxSteps = images.length;


    const handleNext = () => {
        if (activeStep === maxSteps - 1) {
            window.location.href = '/new_recipe'
        } else {
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };


    const theme = createTheme({
        components: {
            MuiMobileStepper: {
                styleOverrides: {
                    dot: {
                        backgroundColor: 'gray', // Inactive dot color
                    },
                    dotActive: {
                        backgroundColor: 'primary.main', // Active dot color
                    },
                },
            },
        },
    });


    return (
        <Dialog open={showTutorial} onClose={() => setShowTutorial(false)}>
            <Box sx={{maxWidth: 1400, flexGrow: 1}}>
                <img
                    src={images[activeStep]}
                    alt={images[activeStep]}
                    style={{width: '100%', height: '100%'}}
                />
                <MobileStepper
                    steps={maxSteps}
                    position="static"
                    variant="dots"
                    activeStep={activeStep}
                    color='success'
                    nextButton={
                        <Button size="small" onClick={handleNext} color='success'>
                            {activeStep === maxSteps - 1 ? "Let's start!" : "Next"}
                            {theme.direction === 'rtl' ? <KeyboardArrowLeft/> : <KeyboardArrowRight/>}
                        </Button>
                    }
                    backButton={
                        <Button size="small" onClick={handleBack} disabled={activeStep === 0} color='success'>
                            {theme.direction === 'rtl' ? <KeyboardArrowRight/> : <KeyboardArrowLeft/>}
                            Back
                        </Button>
                    }
                />
            </Box>
        </Dialog>
    );
}

export default Tutorial;

