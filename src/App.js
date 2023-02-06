import './App.css';
import { Route, Routes } from 'react-router-dom'
import Home from './components/home/Home'
import AddRoute from './components/route/Route'

function App() {
  return (
    <div className="App">
      <div>
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route path="/route" element={<AddRoute />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
