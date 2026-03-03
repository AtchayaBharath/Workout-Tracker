import { useEffect, useState } from "react";
import { api } from "../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Activity, Calendar, Flame, Target } from "lucide-react";

interface DashboardStats {
  totalWorkouts: number;
  weeklyWorkouts: number;
  currentStreak: number;
  goalProgress: number;
}

interface User {
  name: string;
  email: string;
}

export function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalWorkouts: 0,
    weeklyWorkouts: 0,
    currentStreak: 0,
    goalProgress: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Get current user
      const userResponse = await api.getCurrentUser();
      if (userResponse.success) {
        setUser(userResponse.data);
      }

      // Get workouts to calculate stats
      const workoutsResponse = await api.getWorkouts();
      if (workoutsResponse.success) {
        const workouts = workoutsResponse.data || [];
        
        // Calculate total workouts
        const totalWorkouts = workouts.length;

        // Calculate weekly workouts (last 7 days)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const weeklyWorkouts = workouts.filter((w: any) => 
          new Date(w.date) >= oneWeekAgo
        ).length;

        // Calculate current streak
        const currentStreak = calculateStreak(workouts);

        // Calculate goal progress (assuming goal of 12 workouts per month)
        const monthStart = new Date();
        monthStart.setDate(1);
        const monthlyWorkouts = workouts.filter((w: any) => 
          new Date(w.date) >= monthStart
        ).length;
        const goalProgress = Math.min((monthlyWorkouts / 12) * 100, 100);

        setStats({
          totalWorkouts,
          weeklyWorkouts,
          currentStreak,
          goalProgress: Math.round(goalProgress),
        });
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (workouts: any[]) => {
    if (workouts.length === 0) return 0;

    // Sort workouts by date (newest first)
    const sortedWorkouts = [...workouts].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const workout of sortedWorkouts) {
      const workoutDate = new Date(workout.date);
      workoutDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor(
        (currentDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === streak) {
        streak++;
      } else if (diffDays > streak) {
        break;
      }
    }

    return streak;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name || "User"}!
        </h1>
        <p className="text-gray-600 mt-1">Here's your fitness overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Workouts
            </CardTitle>
            <Activity className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalWorkouts}</div>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              This Week
            </CardTitle>
            <Calendar className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.weeklyWorkouts}</div>
            <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Current Streak
            </CardTitle>
            <Flame className="w-5 h-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.currentStreak}</div>
            <p className="text-xs text-gray-500 mt-1">Days in a row</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Monthly Goal
            </CardTitle>
            <Target className="w-5 h-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.goalProgress}%</div>
            <p className="text-xs text-gray-500 mt-1">12 workouts/month</p>
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      {stats.totalWorkouts === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Activity className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Start Your Fitness Journey
            </h3>
            <p className="text-gray-600 text-center max-w-md">
              You haven't logged any workouts yet. Head over to the Workouts page to
              record your first session!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
