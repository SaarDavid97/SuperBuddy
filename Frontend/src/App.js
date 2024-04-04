import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'
import React from 'react';
import Navbar from "./components/Navbar";
import NewRecipePage from "./pages/NewRecipePage";
import CartPage from "./pages/CartPage";
import FavoritesPage from "./pages/FavoritesPage";
import Tutorial from "./pages/Tutorial";
import HomePage from "./pages/HomePage";


function App() {
    return (
        <div>
            <Router>
                <Navbar/>
                <Routes>
                    <Route path='/' element={<HomePage/>}/>
                    <Route path='/tutorial' element={<Tutorial/>}/>
                    <Route path='/new_recipe' element={<NewRecipePage/>}/>
                    <Route path='/cart' element={<CartPage/>}/>
                    <Route path='/favorites' element={<FavoritesPage/>}/>
                </Routes>
            </Router>
        </div>
    );
}

export default App;
