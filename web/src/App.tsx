import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Status from './pages/Status'
import Chat from './pages/Chat'

function App() {
    return (
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/status/:orderId" element={<Status />} />
          <Route path="/chat/:orderId" element={<Chat />} />
        </Routes>
        )
}

export default App
