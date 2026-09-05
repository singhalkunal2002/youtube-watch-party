import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import CreateRoom from "./pages/CreateRoom";
import WatchRoom from "./pages/WatchRoom";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/create-room" element={<CreateRoom />} />

        <Route path="/room/:roomId" element={<WatchRoom />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;