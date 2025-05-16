import { Routes,Route } from "react-router-dom"
import CreateRoom from "./pages/CreateRoom"
import JoinRoom from "./pages/JoinRoom"
import Room from "./pages/Room"

const App = () => {
  return (
    
    <Routes>
      <Route path="/" element={<CreateRoom/>} />
      <Route path="/join" element={<JoinRoom />} />
      <Route path="/room/:roomId" element={<Room/>} />
    </Routes>
  )
}

export default App