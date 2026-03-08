import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import HomePage from "./pages/HomePage";
import HabitsPage from "./pages/HabitsPage";
import JournalPage from "./pages/JournalPage";
import InsightsPage from "./pages/InsightsPage";
import ProgressPage from "./pages/ProgressPage";
import NotFound from "./pages/NotFound";

const App = () => (
  <BrowserRouter>
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/habits" element={<HabitsPage />} />
        <Route path="/journal" element={<JournalPage />} />
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppShell>
  </BrowserRouter>
);

export default App;
