// Step 1: Create a minimal PlannerApp with basic structure
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Calendar, ListChecks } from 'lucide-react';
import AnimatedGradientText from '@/components/AnimatedGradientText';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function MinimalPlannerApp() {
  const [view, setView] = useState<'list' | 'calendar' | 'grocery'>('list');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              <AnimatedGradientText text="Task Planner" />
            </h1>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex gap-2 mb-6">
          <Button
            variant={view === 'list' ? 'default' : 'outline'}
            onClick={() => setView('list')}
            className="flex items-center gap-2"
          >
            <ListChecks className="h-4 w-4" />
            Tasks
          </Button>
          <Button
            variant={view === 'calendar' ? 'default' : 'outline'}
            onClick={() => setView('calendar')}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Calendar
          </Button>
          <Button
            variant={view === 'grocery' ? 'default' : 'outline'}
            onClick={() => setView('grocery')}
            className="flex items-center gap-2"
          >
            <ListChecks className="h-4 w-4" />
            Grocery
          </Button>
        </div>

        {/* Main Content Area */}
        <div className="grid gap-6">
          {view === 'list' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Task List</span>
                  <Button size="sm">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Task list functionality will be added here.
                </p>
              </CardContent>
            </Card>
          )}

          {view === 'calendar' && (
            <Card>
              <CardHeader>
                <CardTitle>Calendar View</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Calendar functionality will be added here.
                </p>
              </CardContent>
            </Card>
          )}

          {view === 'grocery' && (
            <Card>
              <CardHeader>
                <CardTitle>Grocery List</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Grocery list functionality will be added here.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}