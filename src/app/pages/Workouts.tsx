import { useEffect, useState } from "react";
import { api } from "../services/api";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Plus, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";

interface Workout {
  id: string;
  name: string;
  date: string;
  duration: number;
  exercises: string;
  notes: string;
}

export function Workouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    date: new Date().toISOString().split("T")[0],
    duration: "",
    exercises: "",
    notes: "",
  });

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    try {
      const response = await api.getWorkouts();
      if (response.success) {
        setWorkouts(response.data || []);
      }
    } catch (error) {
      console.error("Error loading workouts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.date || !formData.duration) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      const response = await api.createWorkout({
        name: formData.name,
        date: formData.date,
        duration: parseInt(formData.duration),
        exercises: formData.exercises,
        notes: formData.notes,
      });

      if (response.success) {
        toast.success("Workout added!");
        setDialogOpen(false);
        setFormData({
          name: "",
          date: new Date().toISOString().split("T")[0],
          duration: "",
          exercises: "",
          notes: "",
        });
        loadWorkouts();
      } else {
        toast.error(response.message || "Failed to add workout");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this workout?")) return;

    try {
      const response = await api.deleteWorkout(id);
      if (response.success) {
        toast.success("Workout deleted");
        loadWorkouts();
      } else {
        toast.error(response.message || "Failed to delete workout");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Workouts</h1>
          <p className="text-gray-600 mt-1">Track your training sessions</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Workout
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Workout</DialogTitle>
              <DialogDescription>
                Add a new workout to your training log.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Workout Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Upper Body Push"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes) *</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="60"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exercises">Exercises</Label>
                <Textarea
                  id="exercises"
                  placeholder="e.g., Bench Press 4x8, Shoulder Press 3x10"
                  value={formData.exercises}
                  onChange={(e) => setFormData({ ...formData, exercises: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional notes..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                />
              </div>
              <Button type="submit" className="w-full">
                Add Workout
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {workouts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Workouts Yet
            </h3>
            <p className="text-gray-600 text-center max-w-md mb-4">
              Start tracking your fitness journey by adding your first workout session.
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Workout
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {workouts
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((workout) => (
              <Card key={workout.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{workout.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatDate(workout.date)} • {workout.duration} minutes
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(workout.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </CardHeader>
                {(workout.exercises || workout.notes) && (
                  <CardContent className="space-y-3">
                    {workout.exercises && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Exercises:
                        </p>
                        <p className="text-sm text-gray-600 whitespace-pre-line">
                          {workout.exercises}
                        </p>
                      </div>
                    )}
                    {workout.notes && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
                        <p className="text-sm text-gray-600 whitespace-pre-line">
                          {workout.notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}