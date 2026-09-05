import { useNavigate } from "react-router-dom";
import "../index.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <nav className="navbar">
        <div className="logo">WatchParty</div>

        <button
          className="nav-button"
          onClick={() => navigate("/create-room")}
        >
          Create Room
        </button>
      </nav>

      <main className="hero">
        <div className="hero-content">
          <p className="badge">🎬 Real-Time YouTube Watch Party</p>

          <h1>
            Watch YouTube
            <span> Together</span>
          </h1>

          <p className="hero-text">
            Create a room, invite your friends and watch YouTube videos
            together with synchronized playback.
          </p>

          <div className="hero-buttons">
            <button
              className="primary-button"
              onClick={() => navigate("/create-room")}
            >
              Create Watch Room
            </button>

            <button
              className="secondary-button"
              onClick={() => navigate("/create-room")}
            >
              Join Room
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;