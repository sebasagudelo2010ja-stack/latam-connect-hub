import { motion } from "framer-motion";
import { Search, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { StudentSidebar } from "@/components/StudentSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const StudentSearch = () => (
  <SidebarProvider>
    <div className="min-h-screen flex w-full">
      <StudentSidebar />
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border/40 bg-background/80 px-4 backdrop-blur-md">
          <SidebarTrigger />
          <h2 className="text-lg font-semibold text-foreground">Buscar Tutor</h2>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <h1 className="mb-6 text-2xl font-bold text-foreground">Buscar Tutor</h1>
            <Card className="border-border/50 bg-card/80">
              <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
                  <Search className="h-8 w-8 text-primary" />
                </div>
                <p className="text-center text-muted-foreground">
                  Encuentra al tutor perfecto para ti entre cientos de profesionales de toda Latinoamérica.
                </p>
                <Button asChild className="bg-azure text-azure-foreground shadow-lg shadow-azure/20 hover:bg-azure/90">
                  <Link to="/tutors">
                    <Sparkles className="mr-2 h-4 w-4" /> Ir al Buscador
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  </SidebarProvider>
);

export default StudentSearch;
