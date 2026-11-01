
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Reports = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [lastWeek, setLastWeek] = useState({
    totalCompleted: 0,
    tasks: [],
  });

  const [pending, setPending] = useState({
    totalPendingDays: 0,
    totalPendingTasks: 0,
  });

  const [closedTasks, setClosedTasks] = useState({
    totalClosedTasks: 0,
    byTeam: {},
    byOwner: {},
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch reports
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError("");

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [lastWeekResponse, pendingResponse, closedResponse] =
          await Promise.all([
            fetch("http://localhost:5000/report/last-week", { headers }),
            fetch("http://localhost:5000/report/pending", { headers }),
            fetch("http://localhost:5000/report/closed-tasks", { headers }),
          ]);

        const responses = [
          lastWeekResponse,
          pendingResponse,
          closedResponse,
        ];

        const results = await Promise.all(
          responses.map((response) => response.json())
        );

        if (responses.some((response) => !response.ok)) {
          throw new Error("Failed to fetch reports.");
        }

        setLastWeek(results[0]);
        setPending(results[1]);
        setClosedTasks(results[2]);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchReports();
    }
  }, [token]);

  // Prepare last 7 days chart data
  const weeklyLabels = [];
  const weeklyCounts = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const dateKey = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");

    const label = date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });

    const count = (lastWeek.tasks || []).filter((task) => {
      if (!task.completedAt) return false;

      const completedDate = new Date(task.completedAt);

      const completedKey = [
        completedDate.getFullYear(),
        String(completedDate.getMonth() + 1).padStart(2, "0"),
        String(completedDate.getDate()).padStart(2, "0"),
      ].join("-");

      return completedKey === dateKey;
    }).length;

    weeklyLabels.push(label);
    weeklyCounts.push(count);
  }

  // Reusable chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          stepSize: 1,
        },
      },
    },
  };

  // Weekly completed tasks chart
  const weeklyChartData = {
    labels: weeklyLabels,
    datasets: [
      {
        label: "Completed Tasks",
        data: weeklyCounts,
        backgroundColor: "#4e73df",
        borderRadius: 6,
        barThickness: 25,
      },
    ],
  };

  // Prepare team chart
  const teamChartData = {
    labels: Object.keys(closedTasks.byTeam || {}),
    datasets: [
      {
        label: "Closed Tasks",
        data: Object.values(closedTasks.byTeam || {}),
        backgroundColor: "#36b9cc",
        borderRadius: 5,
      },
    ],
  };

  // Prepare owner chart
  const ownerChartData = {
    labels: Object.keys(closedTasks.byOwner || {}),
    datasets: [
      {
        label: "Closed Tasks",
        data: Object.values(closedTasks.byOwner || {}),
        backgroundColor: "#1cc88a",
        borderRadius: 5,
      },
    ],
  };

  //  chart options
  const verticalChartOptions = {
    ...chartOptions,
    indexAxis: "x",
  };

  return (
    <div className="container-fluid bg-light min-vh-100">

      {/* Header */}
      <div className="bg-white border-bottom p-3">
        <h3 className="text-center mb-0">Workasana Reports</h3>
      </div>

      <div className="row">

        {/* Sidebar */}
        <div className="col-md-3 col-lg-2 bg-white border-end min-vh-100 p-4">
          <button
            className="btn btn-outline-primary w-100"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>

        {/* Main Content */}
        <div className="col-md-9 col-lg-10 p-4">

          <h4 className="mb-4">Report Overview</h4>

          {loading ? (
            <p>Loading reports...</p>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : (
            <>

              {/* Summary Cards */}
              <div className="row mb-4">

                <div className="col-md-6 col-xl-3 mb-3">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-body">
                      <p className="text-muted mb-2">
                        Completed Last Week
                      </p>
                      <h2 className="text-primary mb-0">
                        {lastWeek.totalCompleted || 0}
                      </h2>
                    </div>
                  </div>
                </div>

                <div className="col-md-6 col-xl-3 mb-3">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-body">
                      <p className="text-muted mb-2">
                        Pending Work Days
                      </p>
                      <h2 className="text-warning mb-0">
                        {pending.totalPendingDays || 0}
                      </h2>
                    </div>
                  </div>
                </div>

                <div className="col-md-6 col-xl-3 mb-3">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-body">
                      <p className="text-muted mb-2">
                        Pending Tasks
                      </p>
                      <h2 className="text-danger mb-0">
                        {pending.totalPendingTasks || 0}
                      </h2>
                    </div>
                  </div>
                </div>

                <div className="col-md-6 col-xl-3 mb-3">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-body">
                      <p className="text-muted mb-2">
                        Total Closed Tasks
                      </p>
                      <h2 className="text-success mb-0">
                        {closedTasks.totalClosedTasks || 0}
                      </h2>
                    </div>
                  </div>
                </div>

              </div>

              {/* Weekly Work Chart */}
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-body p-4">
                  <h5 className="mb-4">
                    Total Work Done Last Week
                  </h5>

                  <div style={{ height: "300px" }}>
                    <Bar
                      data={weeklyChartData}
                      options={chartOptions}
                    />
                  </div>
                </div>
              </div>

              {/* Team and Owner Charts */}
              <div className="row">

                <div className="col-lg-6 mb-4">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-body p-4">
                      <h5 className="mb-4">
                        Tasks Closed by Team
                      </h5>

                      {teamChartData.labels.length === 0 ? (
                        <p className="text-muted">
                          No team data available.
                        </p>
                      ) : (
                        <div style={{ height: "300px" }}>
                          <Bar
                              data={teamChartData} options={verticalChartOptions}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-lg-6 mb-4">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-body p-4">
                      <h5 className="mb-4">
                        Tasks Closed by Owner
                      </h5>

                      {ownerChartData.labels.length === 0 ? (
                        <p className="text-muted">
                          No owner data available.
                        </p>
                      ) : (
                        <div style={{ height: "300px" }}>
                          <Bar
                            data={ownerChartData} options={verticalChartOptions}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>

            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default Reports;
