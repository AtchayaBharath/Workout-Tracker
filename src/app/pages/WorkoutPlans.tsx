import { useEffect, useState } from "react";
import { api } from "../services/api";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Plus, Trash2, ListTodo, Save } from "lucide-react";
import { toast } from "sonner";

interface Plan {
  id: string;
  name: string;
  description: string;
  exercises: string;
}

// System workout plan templates
const SYSTEM_TEMPLATES = [
  {
    name: "5x5 Strength Program",
    description: "Classic strength building program focusing on compound movements",
    exercises: `Workout A:
Squat 5x5
Bench Press 5x5
Barbell Row 5x5

Workout B:
Squat 5x5
Overhead Press 5x5
Deadlift 1x5`,
  },
  {
    name: "Push Pull Legs",
    description: "Popular 6-day split focusing on movement patterns",
    exercises: `Push Day:
Bench Press 4x8-12
Overhead Press 3x8-12
Incline Dumbbell Press 3x10-12
Lateral Raises 3x12-15
Tricep Dips 3x10-12

Pull Day:
Deadlift 4x6-8
Pull-ups 3x8-12
Barbell Row 3x8-12
Face Pulls 3x12-15
Bicep Curls 3x10-12

Leg Day:
Squat 4x8-12
Romanian Deadlift 3x10-12
Leg Press 3x12-15
Leg Curls 3x12-15
Calf Raises 4x15-20`,
  },
  {
    name: "Upper Lower Split",
    description: "4-day split dividing upper and lower body",
    exercises: `Upper Day 1:
Bench Press 4x6-8
Barbell Row 4x6-8
Overhead Press 3x8-10
Pull-ups 3x8-10
Tricep Extensions 3x12-15

Lower Day 1:
Squat 4x6-8
Romanian Deadlift 3x8-10
Leg Press 3x10-12
Leg Curls 3x12-15
Calf Raises 4x15-20

Upper Day 2:
Incline Dumbbell Press 4x8-12
Cable Row 4x8-12
Dumbbell Shoulder Press 3x10-12
Lat Pulldown 3x10-12
Bicep Curls 3x12-15

Lower Day 2:
Front Squat 3x8-10
Deadlift 3x6-8
Bulgarian Split Squat 3x10-12
Hamstring Curls 3x12-15
Standing Calf Raises 4x15-20`,
  },
  {
    name: "Full Body 3x/Week",
    description: "Efficient full body routine for beginners",
    exercises: `Day A:
Squat 3x8-10
Bench Press 3x8-10
Barbell Row 3x8-10
Overhead Press 2x10-12
Plank 3x60s

Day B:
Deadlift 3x6-8
Pull-ups 3x8-10
Dumbbell Press 3x10-12
Leg Press 3x10-12
Hanging Knee Raises 3x12-15

Day C:
Front Squat 3x8-10
Incline Bench Press 3x8-10
Cable Row 3x10-12
Lateral Raises 3x12-15
Face Pulls 3x15-20`,
  },
];

export function WorkoutPlans() {
  const [userPlans, setUserPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    exercises: "",
  });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await api.getPlans();
      if (response.success) {
        setUserPlans(response.data || []);
      }
    } catch (error) {
      console.error("Error loading plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.description) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      const response = await api.createPlan(formData);

      if (response.success) {
        toast.success("Plan saved!");
        setDialogOpen(false);
        setFormData({
          name: "",
          description: "",
          exercises: "",
        });
        loadPlans();
      } else {
        toast.error(response.message || "Failed to save plan");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleSaveTemplate = async (template: typeof SYSTEM_TEMPLATES[0]) => {
    try {
      const response = await api.createPlan(template);

      if (response.success) {
        toast.success("Template saved to your plans!");
        loadPlans();
      } else {
        toast.error(response.message || "Failed to save template");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;

    try {
      const response = await api.deletePlan(id);
      if (response.success) {
        toast.success("Plan deleted");
        loadPlans();
      } else {
        toast.error(response.message || "Failed to delete plan");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">Workout Plans</h1>
          <p className="text-gray-600 mt-1">Browse templates and create your own plans</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Custom Plan</DialogTitle>
              <DialogDescription>
                Create a custom workout plan tailored to your fitness goals.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="planName">Plan Name *</Label>
                <Input
                  id="planName"
                  placeholder="e.g., My Custom Program"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="planDescription">Description *</Label>
                <Input
                  id="planDescription"
                  placeholder="Brief description of your plan"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="planExercises">Exercises</Label>
                <Textarea
                  id="planExercises"
                  placeholder="List your exercises and sets/reps..."
                  value={formData.exercises}
                  onChange={(e) => setFormData({ ...formData, exercises: e.target.value })}
                  rows={10}
                />
              </div>
              <Button type="submit" className="w-full">
                Create Plan
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* System Templates */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          System Templates
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {SYSTEM_TEMPLATES.map((template, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {template.description}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSaveTemplate(template)}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono bg-gray-50 p-3 rounded-md">
                  {template.exercises}
                </pre>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* User Plans */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">My Plans</h2>
        {userPlans.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ListTodo className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Custom Plans Yet
              </h3>
              <p className="text-gray-600 text-center max-w-md mb-4">
                Create your own workout plan or save a template above to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {userPlans.map((plan) => (
              <Card key={plan.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {plan.description}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(plan.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </CardHeader>
                {plan.exercises && (
                  <CardContent>
                    <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono bg-gray-50 p-3 rounded-md">
                      {plan.exercises}
                    </pre>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}