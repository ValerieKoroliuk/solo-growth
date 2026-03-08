import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import HomePage from "./pages/HomePage";
import HabitsPage from "./pages/HabitsPage";
import JournalPage from "./pages/JournalPage";
import TimelinePage from "./pages/TimelinePage";
import InsightsPage from "./pages/InsightsPage";
import ProgressPage from "./pages/ProgressPage";
import CollectionsPage from "./pages/CollectionsPage";
import ListsPage from "./pages/ListsPage";
import NotFound from "./pages/NotFound";

const App = () => (
  <BrowserRouter>
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/habits" element={<HabitsPage />} />
        <Route path="/journal" element={<JournalPage />} />
        <Route path="/timeline" element={<TimelinePage />} />
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/collections" element={<CollectionsPage />} />
        <Route path="/lists" element={<ListsPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppShell>
  </BrowserRouter>
);

export default App;
