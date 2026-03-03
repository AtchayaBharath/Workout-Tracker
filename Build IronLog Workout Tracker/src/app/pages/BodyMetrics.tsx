import { useEffect, useState } from "react";
import { api } from "../services/api";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Plus, Scale } from "lucide-react";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Metric {
  id: string;
  date: string;
  weight: number;
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
}

export function BodyMetrics() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    weight: "",
    chest: "",
    waist: "",
    hips: "",
    arms: "",
    thighs: "",
  });

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const response = await api.getMetrics();
      if (response.success) {
        setMetrics(response.data || []);
      }
    } catch (error) {
      console.error("Error loading metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.date || !formData.weight) {
      toast.error("Date and weight are required");
      return;
    }

    try {
      const metricData: any = {
        date: formData.date,
        weight: parseFloat(formData.weight),
      };

      if (formData.chest) metricData.chest = parseFloat(formData.chest);
      if (formData.waist) metricData.waist = parseFloat(formData.waist);
      if (formData.hips) metricData.hips = parseFloat(formData.hips);
      if (formData.arms) metricData.arms = parseFloat(formData.arms);
      if (formData.thighs) metricData.thighs = parseFloat(formData.thighs);

      const response = await api.createMetric(metricData);

      if (response.success) {
        toast.success("Metrics recorded!");
        setDialogOpen(false);
        setFormData({
          date: new Date().toISOString().split("T")[0],
          weight: "",
          chest: "",
          waist: "",
          hips: "",
          arms: "",
          thighs: "",
        });
        loadMetrics();
      } else {
        toast.error(response.message || "Failed to record metrics");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Prepare chart data
  const chartData = metrics
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((m) => ({
      date: formatDate(m.date),
      weight: m.weight,
    }));

  // Get latest metrics
  const latestMetric = metrics.length > 0 
    ? metrics.reduce((latest, current) => 
        new Date(current.date) > new Date(latest.date) ? current : latest
      )
    : null;

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
          <h1 className="text-3xl font-bold text-gray-900">Body Metrics</h1>
          <p className="text-gray-600 mt-1">Track your weight and measurements</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Record Metrics
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Body Metrics</DialogTitle>
              <DialogDescription>Enter your body metrics for the day.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metricDate">Date *</Label>
                <Input
                  id="metricDate"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (lbs) *</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="175.5"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="chest">Chest (in)</Label>
                  <Input
                    id="chest"
                    type="number"
                    step="0.1"
                    placeholder="40.0"
                    value={formData.chest}
                    onChange={(e) => setFormData({ ...formData, chest: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="waist">Waist (in)</Label>
                  <Input
                    id="waist"
                    type="number"
                    step="0.1"
                    placeholder="32.0"
                    value={formData.waist}
                    onChange={(e) => setFormData({ ...formData, waist: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hips">Hips (in)</Label>
                  <Input
                    id="hips"
                    type="number"
                    step="0.1"
                    placeholder="38.0"
                    value={formData.hips}
                    onChange={(e) => setFormData({ ...formData, hips: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="arms">Arms (in)</Label>
                  <Input
                    id="arms"
                    type="number"
                    step="0.1"
                    placeholder="15.0"
                    value={formData.arms}
                    onChange={(e) => setFormData({ ...formData, arms: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="thighs">Thighs (in)</Label>
                  <Input
                    id="thighs"
                    type="number"
                    step="0.1"
                    placeholder="24.0"
                    value={formData.thighs}
                    onChange={(e) => setFormData({ ...formData, thighs: e.target.value })}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                Record Metrics
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {metrics.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Scale className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Metrics Recorded
            </h3>
            <p className="text-gray-600 text-center max-w-md mb-4">
              Start tracking your body metrics to monitor your physical progress.
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Record First Entry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Latest Metrics */}
          {latestMetric && (
            <Card>
              <CardHeader>
                <CardTitle>Latest Measurements</CardTitle>
                <p className="text-sm text-gray-600">
                  {new Date(latestMetric.date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Weight</p>
                    <p className="text-2xl font-bold">{latestMetric.weight} lbs</p>
                  </div>
                  {latestMetric.chest && (
                    <div>
                      <p className="text-sm text-gray-600">Chest</p>
                      <p className="text-2xl font-bold">{latestMetric.chest} in</p>
                    </div>
                  )}
                  {latestMetric.waist && (
                    <div>
                      <p className="text-sm text-gray-600">Waist</p>
                      <p className="text-2xl font-bold">{latestMetric.waist} in</p>
                    </div>
                  )}
                  {latestMetric.hips && (
                    <div>
                      <p className="text-sm text-gray-600">Hips</p>
                      <p className="text-2xl font-bold">{latestMetric.hips} in</p>
                    </div>
                  )}
                  {latestMetric.arms && (
                    <div>
                      <p className="text-sm text-gray-600">Arms</p>
                      <p className="text-2xl font-bold">{latestMetric.arms} in</p>
                    </div>
                  )}
                  {latestMetric.thighs && (
                    <div>
                      <p className="text-sm text-gray-600">Thighs</p>
                      <p className="text-2xl font-bold">{latestMetric.thighs} in</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Weight Progress Chart */}
          {chartData.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Weight Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: "#3b82f6" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Entries */}
          <Card>
            <CardHeader>
              <CardTitle>All Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((metric) => (
                    <div key={metric.id} className="border-b last:border-b-0 pb-3">
                      <p className="font-medium">
                        {new Date(metric.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                        <span>Weight: {metric.weight} lbs</span>
                        {metric.chest && <span>Chest: {metric.chest}"</span>}
                        {metric.waist && <span>Waist: {metric.waist}"</span>}
                        {metric.hips && <span>Hips: {metric.hips}"</span>}
                        {metric.arms && <span>Arms: {metric.arms}"</span>}
                        {metric.thighs && <span>Thighs: {metric.thighs}"</span>}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}