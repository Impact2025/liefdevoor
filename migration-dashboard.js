const express = require('express');
const path = require('path');
const fs = require('fs');
const MigrationStatusTracker = require('./migration-status');

class MigrationDashboard {
  constructor(port = 3001) {
    this.app = express();
    this.port = port;
    this.statusTracker = new MigrationStatusTracker();
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, 'public')));
    this.app.set('view engine', 'ejs');
    this.app.set('views', path.join(__dirname, 'views'));
  }

  setupRoutes() {
    // Main dashboard
    this.app.get('/', (req, res) => {
      const status = this.statusTracker.getStatus();
      res.render('dashboard', { status, title: 'Migration Dashboard' });
    });

    // API endpoints
    this.app.get('/api/status', (req, res) => {
      res.json(this.statusTracker.getStatus());
    });

    this.app.get('/api/logs', (req, res) => {
      const logFiles = this.getLogFiles();
      res.json(logFiles);
    });

    this.app.get('/api/logs/:filename', (req, res) => {
      const filename = req.params.filename;
      const logPath = path.join(__dirname, 'logs', filename);

      if (fs.existsSync(logPath)) {
        res.sendFile(logPath);
      } else {
        res.status(404).json({ error: 'Log file not found' });
      }
    });

    this.app.post('/api/reset', (req, res) => {
      try {
        this.statusTracker.reset();
        res.json({ success: true, message: 'Migration status reset' });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      const status = this.statusTracker.getStatus();
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        migration: {
          status: status.status,
          phase: status.phase,
          duration: status.performance.duration,
          recordsPerSecond: status.performance.recordsPerSecond
        },
        uptime: process.uptime()
      };
      res.json(health);
    });
  }

  getLogFiles() {
    const logsDir = path.join(__dirname, 'logs');
    if (!fs.existsSync(logsDir)) {
      return [];
    }

    return fs.readdirSync(logsDir)
      .filter(file => file.endsWith('.log'))
      .map(file => {
        const filePath = path.join(logsDir, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime
        };
      })
      .sort((a, b) => b.modified - a.modified);
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`🚀 Migration Dashboard running at http://localhost:${this.port}`);
      console.log(`📊 API endpoints available at http://localhost:${this.port}/api`);
      console.log(`💚 Health check at http://localhost:${this.port}/health`);
    });
  }

  stop() {
    if (this.server) {
      this.server.close();
    }
  }
}

// Auto-create views directory and dashboard template
function createDashboardTemplate() {
  const viewsDir = path.join(__dirname, 'views');
  const dashboardTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><%= title %> - Migration Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        .animate-pulse-slow {
            animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .status-healthy { background-color: #10b981; }
        .status-running { background-color: #f59e0b; }
        .status-failed { background-color: #ef4444; }
        .status-not_started { background-color: #6b7280; }
    </style>
</head>
<body class="bg-gray-100 min-h-screen">
    <div class="container mx-auto px-4 py-8">
        <header class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">🚀 Migration Dashboard</h1>
            <p class="text-gray-600">Real-time monitoring of your data migration process</p>
        </header>

        <!-- Status Overview -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center">
                    <div class="status-<%= status.status %> w-4 h-4 rounded-full mr-3"></div>
                    <div>
                        <p class="text-sm font-medium text-gray-600">Status</p>
                        <p class="text-2xl font-bold text-gray-900"><%= status.status.replace('_', ' ').toUpperCase() %></p>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center">
                    <div class="text-blue-500 mr-3">
                        <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
                        </svg>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-gray-600">Duration</p>
                        <p class="text-2xl font-bold text-gray-900"><%= Math.round(status.performance.duration) %>s</p>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center">
                    <div class="text-green-500 mr-3">
                        <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path>
                        </svg>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-gray-600">Records/sec</p>
                        <p class="text-2xl font-bold text-gray-900"><%= Math.round(status.performance.recordsPerSecond) %></p>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center">
                    <div class="text-purple-500 mr-3">
                        <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path>
                        </svg>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-gray-600">Memory</p>
                        <p class="text-2xl font-bold text-gray-900"><%= status.performance.memoryUsage.heapUsed %>MB</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Progress Charts -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Migration Progress</h3>
                <canvas id="progressChart" width="400" height="200"></canvas>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                <canvas id="performanceChart" width="400" height="200"></canvas>
            </div>
        </div>

        <!-- Detailed Progress -->
        <div class="bg-white rounded-lg shadow p-6 mb-8">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Detailed Progress</h3>
            <div class="overflow-x-auto">
                <table class="min-w-full table-auto">
                    <thead>
                        <tr class="bg-gray-50">
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Phase</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Migrated</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Skipped</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Errors</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Success Rate</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <% Object.entries(status.progress).forEach(([phase, stats]) => { %>
                        <tr>
                            <td class="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900"><%= phase %></td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-500"><%= stats.migrated || 0 %></td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-500"><%= stats.skipped || 0 %></td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-red-500"><%= stats.errors || 0 %></td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm">
                                <% const total = (stats.migrated || 0) + (stats.skipped || 0) + (stats.errors || 0); %>
                                <% const successRate = total > 0 ? Math.round(((stats.migrated || 0) + (stats.skipped || 0)) / total * 100) : 0; %>
                                <span class="<%= successRate >= 90 ? 'text-green-600' : successRate >= 70 ? 'text-yellow-600' : 'text-red-600' %>">
                                    <%= successRate %>%
                                </span>
                            </td>
                        </tr>
                        <% }); %>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Errors and Warnings -->
        <% if (status.errors.length > 0 || status.warnings.length > 0) { %>
        <div class="bg-white rounded-lg shadow p-6 mb-8">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Issues</h3>

            <% if (status.errors.length > 0) { %>
            <div class="mb-4">
                <h4 class="text-md font-medium text-red-700 mb-2">Errors (<%= status.errors.length %>)</h4>
                <div class="space-y-2">
                    <% status.errors.slice(0, 5).forEach(error => { %>
                    <div class="bg-red-50 border border-red-200 rounded p-3">
                        <p class="text-sm text-red-800"><%= error.error %></p>
                        <p class="text-xs text-red-600 mt-1"><%= new Date(error.timestamp).toLocaleString() %></p>
                    </div>
                    <% }); %>
                </div>
            </div>
            <% } %>

            <% if (status.warnings.length > 0) { %>
            <div>
                <h4 class="text-md font-medium text-yellow-700 mb-2">Warnings (<%= status.warnings.length %>)</h4>
                <div class="space-y-2">
                    <% status.warnings.slice(0, 3).forEach(warning => { %>
                    <div class="bg-yellow-50 border border-yellow-200 rounded p-3">
                        <p class="text-sm text-yellow-800"><%= warning.warning %></p>
                        <p class="text-xs text-yellow-600 mt-1"><%= new Date(warning.timestamp).toLocaleString() %></p>
                    </div>
                    <% }); %>
                </div>
            </div>
            <% } %>
        </div>
        <% } %>

        <!-- Actions -->
        <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            <div class="flex space-x-4">
                <button onclick="resetStatus()" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Reset Status
                </button>
                <button onclick="refreshData()" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                    Refresh Data
                </button>
                <a href="/api/status" target="_blank" class="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
                    View JSON API
                </a>
            </div>
        </div>
    </div>

    <script>
        let statusData = <%- JSON.stringify(status) %>;

        // Progress Chart
        const progressCtx = document.getElementById('progressChart').getContext('2d');
        new Chart(progressCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(statusData.progress),
                datasets: [{
                    label: 'Migrated',
                    data: Object.values(statusData.progress).map(p => p.migrated || 0),
                    backgroundColor: 'rgba(34, 197, 94, 0.8)',
                }, {
                    label: 'Skipped',
                    data: Object.values(statusData.progress).map(p => p.skipped || 0),
                    backgroundColor: 'rgba(251, 191, 36, 0.8)',
                }, {
                    label: 'Errors',
                    data: Object.values(statusData.progress).map(p => p.errors || 0),
                    backgroundColor: 'rgba(239, 68, 68, 0.8)',
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // Performance Chart
        const performanceCtx = document.getElementById('performanceChart').getContext('2d');
        new Chart(performanceCtx, {
            type: 'line',
            data: {
                labels: ['Duration', 'Records/sec', 'Memory'],
                datasets: [{
                    label: 'Performance Metrics',
                    data: [
                        statusData.performance.duration,
                        statusData.performance.recordsPerSecond,
                        statusData.performance.memoryUsage.heapUsed
                    ],
                    borderColor: 'rgba(59, 130, 246, 1)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // Auto-refresh every 5 seconds
        setInterval(refreshData, 5000);

        async function refreshData() {
            try {
                const response = await fetch('/api/status');
                const newData = await response.json();
                if (JSON.stringify(newData) !== JSON.stringify(statusData)) {
                    location.reload();
                }
            } catch (error) {
                console.error('Failed to refresh data:', error);
            }
        }

        async function resetStatus() {
            if (confirm('Are you sure you want to reset the migration status?')) {
                try {
                    const response = await fetch('/api/reset', { method: 'POST' });
                    const result = await response.json();
                    if (result.success) {
                        alert('Migration status reset successfully');
                        location.reload();
                    } else {
                        alert('Failed to reset status');
                    }
                } catch (error) {
                    alert('Error resetting status: ' + error.message);
                }
            }
        }
    </script>
</body>
</html>`;

  if (!fs.existsSync(viewsDir)) {
    fs.mkdirSync(viewsDir, { recursive: true });
  }

  fs.writeFileSync(path.join(viewsDir, 'dashboard.ejs'), dashboardTemplate);
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const port = args[0] ? parseInt(args[0]) : 3001;

  createDashboardTemplate();

  const dashboard = new MigrationDashboard(port);
  dashboard.start();

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down Migration Dashboard...');
    dashboard.stop();
    process.exit(0);
  });
}

module.exports = MigrationDashboard;