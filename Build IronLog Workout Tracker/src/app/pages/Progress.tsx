import { useEffect, useState } from "react";
import { api } from "../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export function Progress() {
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [nutrition, setNutrition] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    try {
      const [workoutsRes, nutritionRes, metricsRes] = await Promise.all([
        api.getWorkouts(),
        api.getNutrition(),
        api.getMetrics(),
      ]);

      if (workoutsRes.success) setWorkouts(workoutsRes.data || []);
      if (nutritionRes.success) setNutrition(nutritionRes.data || []);
      if (metricsRes.success) setMetrics(metricsRes.data || []);
    } catch (error) {
      console.error("Error loading progress data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare weekly workouts chart data
  const getWeeklyWorkoutData = () => {
    const last8Weeks: { [key: string]: number } = {};
    const now = new Date();

    // Initialize last 8 weeks
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - i * 7);
      const weekKey = `Week ${8 - i}`;
      last8Weeks[weekKey] = 0;
    }

    // Count workouts per week
    workouts.forEach((workout) => {
      const workoutDate = new Date(workout.date);
      const diffTime = now.getTime() - workoutDate.getTime();
      const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));

      if (diffWeeks >= 0 && diffWeeks < 8) {
        const weekKey = `Week ${8 - diffWeeks}`;
        if (last8Weeks[weekKey] !== undefined) {
          last8Weeks[weekKey]++;
        }
      }
    });

    return Object.entries(last8Weeks).map(([week, count]) => ({
      week,
      workouts: count,
    }));
  };

  // Prepare weight trend data
  const getWeightTrendData = () => {
    return metrics
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-10)
      .map((m) => ({
        date: new Date(m.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        weight: m.weight,
      }));
  };

  // Prepare calories trend data
  const getCaloriesTrendData = () => {
    return nutrition
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-10)
      .map((n) => ({
        date: new Date(n.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        calories: n.calories,
      }));
  };

  const weeklyWorkoutData = getWeeklyWorkoutData();
  const weightTrendData = getWeightTrendData();
  const caloriesTrendData = getCaloriesTrendData();

  const hasData = workouts.length > 0 || nutrition.length > 0 || metrics.length > 0;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Progress Analytics</h1>
        <p className="text-gray-600 mt-1">Visualize your fitness journey</p>
      </div>

      {!hasData ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Progress Data Yet
            </h3>
            <p className="text-gray-600 text-center max-w-md">
              Start logging workouts, nutrition, and body metrics to see your progress
              visualized here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Weekly Workouts Chart */}
          {workouts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Weekly Workouts (Last 8 Weeks)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyWorkoutData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="workouts" fill="#3b82f6" name="Workouts" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Weight Trend Chart */}
          {weightTrendData.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Weight Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weightTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ fill: "#10b981" }}
                        name="Weight (lbs)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Calories Trend Chart */}
          {caloriesTrendData.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Calorie Intake Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={caloriesTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="calories"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        dot={{ fill: "#f59e0b" }}
                        name="Calories"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {workouts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Total Workouts</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-600">
                    {workouts.length}
                  </p>
                </CardContent>
              </Card>
            )}
            {metrics.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Weight Change</CardTitle>
                </CardHeader>
                <CardContent>
                  {metrics.length > 1 ? (
                    <p className="text-3xl font-bold text-green-600">
                      {(
                        metrics[metrics.length - 1].weight - metrics[0].weight
                      ).toFixed(1)}{" "}
                      lbs
                    </p>
                  ) : (
                    <p className="text-3xl font-bold text-gray-600">N/A</p>
                  )}
                </CardContent>
              </Card>
            )}
            {nutrition.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Avg. Daily Calories</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-orange-600">
                    {Math.round(
                      nutrition.reduce((sum, n) => sum + n.calories, 0) /
                        nutrition.length
                    )}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}
