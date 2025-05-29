
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Calendar, Target } from "lucide-react";

const monthlyData = [
  { month: "Jan", violations: 12, appeals: 8, dismissed: 5 },
  { month: "Feb", violations: 15, appeals: 10, dismissed: 7 },
  { month: "Mar", violations: 8, appeals: 6, dismissed: 4 },
  { month: "Apr", violations: 20, appeals: 15, dismissed: 9 },
  { month: "May", violations: 18, appeals: 12, dismissed: 8 },
  { month: "Jun", violations: 25, appeals: 18, dismissed: 11 },
];

const violationTypes = [
  { name: "Overspeeding", value: 35, color: "#ef4444" },
  { name: "Illegal Parking", value: 25, color: "#f97316" },
  { name: "No Contact Lane", value: 20, color: "#eab308" },
  { name: "Red Light", value: 15, color: "#22c55e" },
  { name: "Others", value: 5, color: "#6366f1" },
];

const chartConfig = {
  violations: {
    label: "Violations",
    color: "#6366f1",
  },
  appeals: {
    label: "Appeals",
    color: "#8b5cf6",
  },
  dismissed: {
    label: "Dismissed",
    color: "#22c55e",
  },
};

interface ViolationChartProps {
  violations: any[];
}

export const ViolationChart = ({ violations }: ViolationChartProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              <span>Monthly Trends</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="violations" 
                    stroke="#6366f1" 
                    strokeWidth={3}
                    dot={{ fill: "#6366f1", strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="appeals" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="dismissed" 
                    stroke="#22c55e" 
                    strokeWidth={3}
                    dot={{ fill: "#22c55e", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-purple-600" />
              <span>Violation Types</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={violationTypes}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {violationTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <span>This Month</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">New Violations</span>
                <span className="text-2xl font-bold text-red-600">25</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Appeals Filed</span>
                <span className="text-2xl font-bold text-blue-600">18</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Dismissed</span>
                <span className="text-2xl font-bold text-green-600">11</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className="text-2xl font-bold text-purple-600">61%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-sm">Top Violation Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">EDSA Ortigas</span>
                <span className="text-sm font-bold">5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Commonwealth Ave</span>
                <span className="text-sm font-bold">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">C5 Libis</span>
                <span className="text-sm font-bold">2</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">SLEX Bicutan</span>
                <span className="text-sm font-bold">1</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-sm">Appeal Success by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Illegal Parking</span>
                <span className="text-sm font-bold text-green-600">80%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Overspeeding</span>
                <span className="text-sm font-bold text-yellow-600">45%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Red Light</span>
                <span className="text-sm font-bold text-red-600">25%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">No Contact Lane</span>
                <span className="text-sm font-bold text-blue-600">65%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
