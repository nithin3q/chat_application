import { useSelector } from 'react-redux';
import './App.css';
import Auth from './pages/Auth/Auth';
import { Routes, Route, Navigate } from 'react-router-dom';
import Chat from './pages/Chat/Chat';

function App() {
  const user = useSelector((state) => state.authReducer.authData);

  return (
    <div className="App">
      <Routes>
        <Route
          path="/"
          element={user ? <Navigate to="/chat" /> : <Auth />}
        />
        <Route
          path="/chat"
          element={user ? <Chat /> : <Navigate to="/" />}
        />
      </Routes>
    </div>
  );
}

export default App;
