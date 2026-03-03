import { useEffect, useState } from "react";
import { api } from "../services/api";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Plus, Dumbbell } from "lucide-react";
import { toast } from "sonner";

interface Exercise {
  id: string;
  name: string;
  category: string;
  equipment?: string;
}

// Reference exercise categories
const REFERENCE_EXERCISES = {
  Chest: [
    { name: "Barbell Bench Press", equipment: "Barbell" },
    { name: "Incline Dumbbell Press", equipment: "Dumbbells" },
    { name: "Dips", equipment: "Bodyweight" },
    { name: "Cable Flyes", equipment: "Cable" },
    { name: "Push-ups", equipment: "Bodyweight" },
  ],
  Back: [
    { name: "Deadlift", equipment: "Barbell" },
    { name: "Pull-ups", equipment: "Bodyweight" },
    { name: "Barbell Row", equipment: "Barbell" },
    { name: "Lat Pulldown", equipment: "Cable" },
    { name: "Cable Row", equipment: "Cable" },
  ],
  Legs: [
    { name: "Barbell Squat", equipment: "Barbell" },
    { name: "Romanian Deadlift", equipment: "Barbell" },
    { name: "Leg Press", equipment: "Machine" },
    { name: "Leg Curls", equipment: "Machine" },
    { name: "Calf Raises", equipment: "Machine" },
  ],
  Shoulders: [
    { name: "Overhead Press", equipment: "Barbell" },
    { name: "Dumbbell Shoulder Press", equipment: "Dumbbells" },
    { name: "Lateral Raises", equipment: "Dumbbells" },
    { name: "Face Pulls", equipment: "Cable" },
    { name: "Front Raises", equipment: "Dumbbells" },
  ],
  Arms: [
    { name: "Barbell Curl", equipment: "Barbell" },
    { name: "Tricep Dips", equipment: "Bodyweight" },
    { name: "Hammer Curls", equipment: "Dumbbells" },
    { name: "Skull Crushers", equipment: "Barbell" },
    { name: "Cable Tricep Extensions", equipment: "Cable" },
  ],
  Core: [
    { name: "Plank", equipment: "Bodyweight" },
    { name: "Hanging Knee Raises", equipment: "Bodyweight" },
    { name: "Cable Crunches", equipment: "Cable" },
    { name: "Russian Twists", equipment: "Bodyweight" },
    { name: "Ab Wheel Rollout", equipment: "Equipment" },
  ],
};

const CATEGORIES = Object.keys(REFERENCE_EXERCISES);

export function Exercises() {
  const [userExercises, setUserExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("Chest");
  const [formData, setFormData] = useState({
    name: "",
    category: "Chest",
    equipment: "",
  });

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      const response = await api.getExercises();
      if (response.success) {
        setUserExercises(response.data || []);
      }
    } catch (error) {
      console.error("Error loading exercises:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.category) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      const response = await api.createExercise(formData);

      if (response.success) {
        toast.success("Exercise added!");
        setDialogOpen(false);
        setFormData({
          name: "",
          category: "Chest",
          equipment: "",
        });
        loadExercises();
      } else {
        toast.error(response.message || "Failed to add exercise");
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
          <h1 className="text-3xl font-bold text-gray-900">Exercise Library</h1>
          <p className="text-gray-600 mt-1">Browse exercises by category</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Exercise
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Custom Exercise</DialogTitle>
              <DialogDescription>Add a new exercise to your library.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="exerciseName">Exercise Name *</Label>
                <Input
                  id="exerciseName"
                  placeholder="e.g., Cable Crossover"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exerciseCategory">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="exerciseEquipment">Equipment</Label>
                <Input
                  id="exerciseEquipment"
                  placeholder="e.g., Cable, Dumbbells"
                  value={formData.equipment}
                  onChange={(e) =>
                    setFormData({ ...formData, equipment: e.target.value })
                  }
                />
              </div>
              <Button type="submit" className="w-full">
                Add Exercise
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            onClick={() => setSelectedCategory(category)}
            size="sm"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Reference Exercises */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {selectedCategory} Exercises
        </h2>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {REFERENCE_EXERCISES[
                selectedCategory as keyof typeof REFERENCE_EXERCISES
              ].map((exercise, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <Dumbbell className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{exercise.name}</p>
                      <p className="text-sm text-gray-600">{exercise.equipment}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Exercises */}
      {userExercises.filter((e) => e.category === selectedCategory).length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            My Custom {selectedCategory} Exercises
          </h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {userExercises
                  .filter((e) => e.category === selectedCategory)
                  .map((exercise) => (
                    <div
                      key={exercise.id}
                      className="flex items-center justify-between py-3 border-b last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <Dumbbell className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {exercise.name}
                          </p>
                          {exercise.equipment && (
                            <p className="text-sm text-gray-600">
                              {exercise.equipment}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        Custom
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}