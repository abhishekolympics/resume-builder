import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from './pages/Home/Home';
import Profile from "./pages/Profile/Profile";
import Jobs from "./pages/Jobs/Jobs";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";


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
