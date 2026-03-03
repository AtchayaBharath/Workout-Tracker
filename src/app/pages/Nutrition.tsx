import { useEffect, useState } from "react";
import { api } from "../services/api";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Plus, Trash2, Apple } from "lucide-react";
import { toast } from "sonner";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface NutritionEntry {
  id: string;
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

const COLORS = ["#ef4444", "#3b82f6", "#f59e0b"];

export function Nutrition() {
  const [entries, setEntries] = useState<NutritionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
  });

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const response = await api.getNutrition();
      if (response.success) {
        setEntries(response.data || []);
      }
    } catch (error) {
      console.error("Error loading nutrition data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.date || !formData.calories || !formData.protein || !formData.carbs || !formData.fats) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const response = await api.createNutritionEntry({
        date: formData.date,
        calories: parseInt(formData.calories),
        protein: parseInt(formData.protein),
        carbs: parseInt(formData.carbs),
        fats: parseInt(formData.fats),
      });

      if (response.success) {
        toast.success("Nutrition entry added!");
        setDialogOpen(false);
        setFormData({
          date: new Date().toISOString().split("T")[0],
          calories: "",
          protein: "",
          carbs: "",
          fats: "",
        });
        loadEntries();
      } else {
        toast.error(response.message || "Failed to add entry");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    try {
      const response = await api.deleteNutritionEntry(id);
      if (response.success) {
        toast.success("Entry deleted");
        loadEntries();
      } else {
        toast.error(response.message || "Failed to delete entry");
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

  // Get today's entry for macro breakdown
  const today = new Date().toISOString().split("T")[0];
  const todayEntry = entries.find((e) => e.date === today);

  const macroData = todayEntry
    ? [
        { name: "Protein", value: todayEntry.protein, grams: todayEntry.protein },
        { name: "Carbs", value: todayEntry.carbs, grams: todayEntry.carbs },
        { name: "Fats", value: todayEntry.fats, grams: todayEntry.fats },
      ]
    : [];

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
          <h1 className="text-3xl font-bold text-gray-900">Nutrition Tracking</h1>
          <p className="text-gray-600 mt-1">Log your daily macros and calories</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Log Nutrition
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Nutrition Entry</DialogTitle>
              <DialogDescription>Enter your nutrition details for the day.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nutritionDate">Date *</Label>
                <Input
                  id="nutritionDate"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="calories">Calories *</Label>
                <Input
                  id="calories"
                  type="number"
                  placeholder="2000"
                  value={formData.calories}
                  onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="protein">Protein (g) *</Label>
                  <Input
                    id="protein"
                    type="number"
                    placeholder="150"
                    value={formData.protein}
                    onChange={(e) =>
                      setFormData({ ...formData, protein: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carbs">Carbs (g) *</Label>
                  <Input
                    id="carbs"
                    type="number"
                    placeholder="250"
                    value={formData.carbs}
                    onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fats">Fats (g) *</Label>
                  <Input
                    id="fats"
                    type="number"
                    placeholder="60"
                    value={formData.fats}
                    onChange={(e) => setFormData({ ...formData, fats: e.target.value })}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                Log Entry
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Today's Macro Breakdown */}
      {todayEntry && (
        <Card>
          <CardHeader>
            <CardTitle>Today's Macro Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Total Calories</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {todayEntry.calories}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Protein</span>
                    <span className="font-medium">{todayEntry.protein}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Carbs</span>
                    <span className="font-medium">{todayEntry.carbs}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Fats</span>
                    <span className="font-medium">{todayEntry.fats}g</span>
                  </div>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={macroData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {macroData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}g`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Entries List */}
      {entries.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Apple className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Nutrition Entries
            </h3>
            <p className="text-gray-600 text-center max-w-md mb-4">
              Start tracking your nutrition by logging your first entry.
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Log First Entry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Entries</h2>
          <div className="space-y-3">
            {entries
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((entry) => (
                <Card key={entry.id}>
                  <CardContent className="py-4">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {formatDate(entry.date)}
                        </p>
                        <div className="flex gap-4 mt-2 text-sm text-gray-600">
                          <span>{entry.calories} cal</span>
                          <span>P: {entry.protein}g</span>
                          <span>C: {entry.carbs}g</span>
                          <span>F: {entry.fats}g</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(entry.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}