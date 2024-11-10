import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from './components/Pages/Home/home';
import Profile from "./components/Pages/Profile/Profile";
import Jobs from "./components/Pages/Jobs/Jobs";
import Login from "./components/Pages/Auth/Login";
import Register from "./components/Pages/Auth/Register";


function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/profile' element={<Profile/>}/>
        <Route path='/jobs' element={<Jobs/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/register' element={<Register/>}/>
      </Routes>
    </Router>
  );
}

export default App;
