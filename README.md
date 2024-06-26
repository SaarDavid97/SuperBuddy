# Project Setup Instructions
Welcome to our project! Follow these instructions to get the frontend and backend of our application up and running on your system.
For a video demonstration, you can visit the next link: 

https://drive.google.com/file/d/1fDnQAzdPYj46a0EascwoU5_YLASZYuOW/view?usp=sharing

## Prerequisites

Before you begin, make sure you have the following installed:
- Git
- Node.js and npm
- Python (with pip)
- A virtual environment tool for Python (such as `venv` or `virtualenv`)

## Setup

### Cloning the project:

1. **Create and navigate to a new directory for the project:**

   ```bash
   mkdir superbuddy
   cd superbuddy
   ```
   
2. **Clone the github repository**
   ```bash
   git clone https://github.com/SaarDavid97/SuperBuddy.git superbuddy
   ```

3. **Navigate to the project directory**
   ```bash
   cd superbuddy
   ```



### Frontend Setup

1. **Navigate to the frontend directory and install dependencies:**

   ```bash
   cd Frontend
   npm install
   ```

2. **Start the frontend application:**

   ```bash
   npm start
   ```

   You should now have the frontend running. Open your web browser and visit the address shown in the terminal to view the application.

### Backend Setup

1. **Open a new terminal window and navigate to the original directory:**

   Assuming you're starting in your home directory, navigate back to the project directory:

   ```bash
   cd ~/superbuddy
   ```

2. **Navigate to the backend directory:**

   ```bash
   cd superbuddy/Backend
   ```

3. **Create a virtual environment and activate it:**

   - On macOS/Linux:

     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

   - On Windows:

     ```bash
     python -m venv venv
     .\venv\Scripts\activate
     ```
     *Make sure to use python>=3.9*

4. **Install the required Python packages:**

   ```bash
   pip install -r requirements.txt
   ```

5. **Configure Environment Variables:**

The backend application requires certain environment variables to be set. Create a .env file in the root of the Backend directory and add the following variables:
```
EDAMAM_APP_ID=value
EDAMAM_API_KEY=value
GOOGLE_API_KEY=value
```
The values are provided inside the final report we've submitted in Moodle.
The first two variables are used to call the next API:
https://api.edamam.com/api/recipes/v2

The third variable is used for Gemini APIs.
There are no specific access points for the APIs we call since we use the python SDK, but we use Gemini for image recognition, embeddings generation and providing description for dishes based on the ingredients included in their recipe.



6. **Start the backend server:**

   ```bash
   python app.py
   ```

   Your Flask server should now be running.

## Usage

With both the frontend and backend running, you can interact with the application through the web interface opened by the frontend. Ensure both servers are running simultaneously for the full functionality.
