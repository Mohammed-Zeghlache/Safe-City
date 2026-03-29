// components/AnalyticsDashboard.jsx
import React, { useMemo } from 'react';
import { Line, Bar, Pie, Doughnut, Radar } from 'react-chartjs-2';
import { FiTrendingUp, FiClock, FiStar, FiTarget, FiAward, FiActivity } from 'react-icons/fi';
import { MdTimeline, FaChartBar, FaChartPie, FaMapMarkedAlt } from 'react-icons/all';

const AnalyticsDashboard = ({ analyticsData, darkMode, stats, reports }) => {
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: darkMode ? '#f1f5f9' : '#334155',
          font: { size: 11 }
        }
      },
      tooltip: {
        backgroundColor: darkMode ? '#1e293b' : '#ffffff',
        titleColor: darkMode ? '#f1f5f9' : '#1e293b',
        bodyColor: darkMode ? '#cbd5e1' : '#475569',
        borderColor: darkMode ? '#334155' : '#e2e8f0',
        borderWidth: 1
      }
    },
    scales: {
      y: {
        grid: { color: darkMode ? '#334155' : '#e2e8f0' },
        ticks: { color: darkMode ? '#94a3b8' : '#64748b' }
      },
      x: {
        grid: { display: false },
        ticks: { color: darkMode ? '#94a3b8' : '#64748b' }
      }
    }
  }), [darkMode]);

  const chartData = useMemo(() => {
    const lastData = analyticsData.dailyData.slice(-30);
    
    return {
      lineChartData: {
        labels: lastData.map(d => d.date),
        datasets: [{
          label: 'Signalements',
          data: lastData.map(d => d.count),
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4
        }]
      },
      barChartData: {
        labels: analyticsData.categoryStats.map(c => c.category),
        datasets: [{
          label: 'Nombre de signalements',
          data: analyticsData.categoryStats.map(c => c.count),
          backgroundColor: analyticsData.categoryStats.map(c => c.color),
          borderRadius: 10
        }]
      },
      pieChartData: {
        labels: analyticsData.statusStats.map(s => {
          const statusMap = { pending: 'En attente', 'in-progress': 'En cours', resolved: 'Résolu' };
          return statusMap[s.status] || s.status;
        }),
        datasets: [{
          data: analyticsData.statusStats.map(s => s.count),
          backgroundColor: ['#f59e0b', '#3b82f6', '#10b981']
        }]
      },
      doughnutChartData: {
        labels: analyticsData.priorityStats.map(p => {
          const priorityMap = { high: 'Haute', medium: 'Moyenne', low: 'Basse' };
          return priorityMap[p.priority] || p.priority;
        }),
        datasets: [{
          data: analyticsData.priorityStats.map(p => p.count),
          backgroundColor: ['#ef4444', '#f59e0b', '#10b981']
        }]
      },
      radarChartData: {
        labels: analyticsData.wilayaStats.slice(0, 8).map(w => w.wilaya),
        datasets: [{
          label: 'Signalements par wilaya',
          data: analyticsData.wilayaStats.slice(0, 8).map(w => w.count),
          backgroundColor: 'rgba(102, 126, 234, 0.2)',
          borderColor: '#667eea',
          borderWidth: 2
        }]
      }
    };
  }, [analyticsData]);

  return (
    <div className="analytics-content">
      <div className="analytics-header">
        <h2><MdAnalytics /> Centre d'analyse avancée</h2>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon"><FiTrendingUp /></div>
          <div className="kpi-info">
            <h3>{analyticsData.resolutionRate.toFixed(1)}%</h3>
            <p>Taux de résolution</p>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon"><FiClock /></div>
          <div className="kpi-info">
            <h3>{analyticsData.responseTimeAvg}h</h3>
            <p>Temps de réponse moyen</p>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon"><FiStar /></div>
          <div className="kpi-info">
            <h3>{analyticsData.satisfactionScore}/5</h3>
            <p>Satisfaction citoyenne</p>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon"><FiTarget /></div>
          <div className="kpi-info">
            <h3>{analyticsData.topWilaya || 'Alger'}</h3>
            <p>Wilaya la plus active</p>
          </div>
        </div>
      </div>

      <div className="charts-grid-analytics">
        <div className="chart-card large">
          <div className="chart-header">
            <h3><MdTimeline /> Évolution des signalements</h3>
          </div>
          <div className="chart-container" style={{ height: '400px' }}>
            <Line data={chartData.lineChartData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-card">
          <h3><FaChartBar /> Répartition par type</h3>
          <div className="chart-container" style={{ height: '300px' }}>
            <Bar data={chartData.barChartData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-card">
          <h3><FaChartPie /> Statut des signalements</h3>
          <div className="chart-container" style={{ height: '300px' }}>
            <Pie data={chartData.pieChartData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-card">
          <h3>Priorités</h3>
          <div className="chart-container" style={{ height: '300px' }}>
            <Doughnut data={chartData.doughnutChartData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-card large">
          <h3><FaMapMarkedAlt /> Distribution par wilaya</h3>
          <div className="chart-container" style={{ height: '400px' }}>
            <Radar data={chartData.radarChartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;