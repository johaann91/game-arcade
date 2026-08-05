import { useState } from "react";
import Header from "./components/Header.jsx";
import Home from "./pages/Home.jsx";
import Snake from "./games/Snake.jsx";
import Memory from "./games/Memory.jsx";
import Game2048 from "./games/Game2048.jsx";
import Breakout from "./games/Breakout.jsx";

const PAGES = {
  home: Home,
  snake: Snake,
  memory: Memory,
  "2048": Game2048,
  breakout: Breakout,
};

function App() {
  const [page, setPage] = useState("home");
  const Page = PAGES[page] ?? Home;

  return (
    <>
      <Header current={page} onNavigate={setPage} />
      <main className="app-main">
        <Page onNavigate={setPage} />
      </main>
      <footer className="app-footer">Game Arcade — jeux sans compte, scores partagés localement.</footer>
    </>
  );
}

export default App;
