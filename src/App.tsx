import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AIChatWidget } from "@/components/chat/AIChatWidget";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Prevention from "./pages/Prevention";
import RRHH from "./pages/RRHH";
import Alerts from "./pages/Alerts";
import Operations from "./pages/Operations";
import Gerencia from "./pages/Gerencia";
import Reclutamiento from "./pages/Reclutamiento";
import ComiteParitario from "./pages/ComiteParitario";
import Documents from "./pages/Documents";
import Settings from "./pages/Settings";
import Compliance from "./pages/Compliance";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/cumplimiento" 
              element={
                <ProtectedRoute>
                  <Compliance />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/prevencion" 
              element={
                <ProtectedRoute>
                  <Prevention />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/rrhh" 
              element={
                <ProtectedRoute>
                  <RRHH />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/alertas" 
              element={
                <ProtectedRoute>
                  <Alerts />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/operaciones" 
              element={
                <ProtectedRoute>
                  <Operations />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/gerencia" 
              element={
                <ProtectedRoute>
                  <Gerencia />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/reclutamiento" 
              element={
                <ProtectedRoute>
                  <Reclutamiento />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/comite" 
              element={
                <ProtectedRoute>
                  <ComiteParitario />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/documentos" 
              element={
                <ProtectedRoute>
                  <Documents />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/configuracion" 
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <AIChatWidget />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
