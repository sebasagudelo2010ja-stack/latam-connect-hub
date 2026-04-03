import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import StudentRegister from "./pages/StudentRegister.tsx";
import TutorRegister from "./pages/TutorRegister.tsx";
import StudentLogin from "./pages/StudentLogin.tsx";
import TutorLogin from "./pages/TutorLogin.tsx";
import StudentDashboard from "./pages/StudentDashboard.tsx";
import TutorDashboard from "./pages/TutorDashboard.tsx";
import TutorsSearch from "./pages/TutorsSearch.tsx";
import SessionRequest from "./pages/SessionRequest.tsx";
import SessionConfirm from "./pages/SessionConfirm.tsx";
import SessionNegotiate from "./pages/SessionNegotiate.tsx";
import SessionMeeting from "./pages/SessionMeeting.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/accounts/register/client" element={<StudentRegister />} />
          <Route path="/tutores/registro" element={<TutorRegister />} />
          <Route path="/tutors" element={<TutorsSearch />} />
          <Route
            path="/accounts/dashboard/client"
            element={
              <ProtectedRoute allowedRole="client">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/accounts/dashboard/tutor"
            element={
              <ProtectedRoute allowedRole="tutor">
                <TutorDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/sessions/request/:tutor_id" element={<SessionRequest />} />
          <Route path="/sessions/confirm/:id" element={<SessionConfirm />} />
          <Route path="/sessions/negotiate/:id" element={<SessionNegotiate />} />
          <Route path="/sessions/meeting/:id" element={<SessionMeeting />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
