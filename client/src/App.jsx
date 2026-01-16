import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Board from './components/Board/Board';

function App() {
    return (
        <Router
            future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true
            }}
        >
            <div className="min-h-screen bg-gray-100">
                <Routes>
                    <Route path="/" element={<Board />} />
                    <Route path="/board/:id" element={<Board />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
