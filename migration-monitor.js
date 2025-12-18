const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const MigrationStatusTracker = require('./migration-status');

class MigrationMonitor {
  constructor() {
    this.statusTracker = new MigrationStatusTracker();
    this.alerts = [];
    this.metrics = {
      startTime: null,
      lastHealthCheck: null,
      consecutiveFailures: 0,
      performanceHistory: []
    };
    this.alertsFile = path.join(__dirname, 'migration-alerts.json');
    this.loadAlerts();
  }

  // Health monitoring
  async performHealthCheck() {
    const healthStatus = {
      timestamp: new Date().toISOString(),
      database: await this.checkDatabaseHealth(),
      system: this.checkSystemHealth(),
      migration: this.checkMigrationHealth()
    };

    this.metrics.lastHealthCheck = healthStatus.timestamp;

    // Check for issues and create alerts
    await this.analyzeHealthStatus(healthStatus);

    return healthStatus;
  }

  async checkDatabaseHealth() {
    const health = {
      mysql: { status: 'unknown', latency: null, error: null },
      postgresql: { status: 'unknown', latency: null, error: null }
    };

    // Check MySQL connection
    try {
      const mysql = require('mysql2/promise');
      const start = Date.now();
      const config = require('./migrate-data').config?.mysql;
      if (config) {
        const connection = await mysql.createConnection(config);
        await connection.execute('SELECT 1');
        await connection.end();
        health.mysql = {
          status: 'healthy',
          latency: Date.now() - start
        };
      } else {
        health.mysql = { status: 'not_configured' };
      }
    } catch (error) {
      health.mysql = {
        status: 'unhealthy',
        error: error.message
      };
    }

    // Check PostgreSQL connection
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      const start = Date.now();
      await prisma.$connect();
      await prisma.$disconnect();
      health.postgresql = {
        status: 'healthy',
        latency: Date.now() - start
      };
    } catch (error) {
      health.postgresql = {
        status: 'unhealthy',
        error: error.message
      };
    }

    return health;
  }

  checkSystemHealth() {
    const memUsage = process.memoryUsage();
    const uptime = process.uptime();

    return {
      memory: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024),
        total: Math.round(memUsage.heapTotal / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024)
      },
      uptime: Math.round(uptime),
      nodeVersion: process.version,
      platform: process.platform
    };
  }

  checkMigrationHealth() {
    const status = this.statusTracker.getStatus();

    return {
      status: status.status,
      phase: status.phase,
      duration: status.performance.duration,
      recordsPerSecond: status.performance.recordsPerSecond,
      errorCount: status.errors.length,
      warningCount: status.warnings.length,
      lastActivity: status.endTime || status.startTime
    };
  }

  async analyzeHealthStatus(healthStatus) {
    const issues = [];

    // Database connectivity issues
    if (healthStatus.database.mysql.status === 'unhealthy') {
      issues.push({
        type: 'database',
        severity: 'critical',
        message: `MySQL connection failed: ${healthStatus.database.mysql.error}`,
        recommendation: 'Check MySQL credentials and server status'
      });
    }

    if (healthStatus.database.postgresql.status === 'unhealthy') {
      issues.push({
        type: 'database',
        severity: 'critical',
        message: `PostgreSQL connection failed: ${healthStatus.database.postgresql.error}`,
        recommendation: 'Check DATABASE_URL and PostgreSQL server'
      });
    }

    // High latency warnings
    if (healthStatus.database.mysql.latency > 5000) {
      issues.push({
        type: 'performance',
        severity: 'warning',
        message: `MySQL latency is high: ${healthStatus.database.mysql.latency}ms`,
        recommendation: 'Check network connectivity and MySQL performance'
      });
    }

    // Memory usage warnings
    const memoryUsagePercent = (healthStatus.system.memory.used / healthStatus.system.memory.total) * 100;
    if (memoryUsagePercent > 80) {
      issues.push({
        type: 'system',
        severity: 'warning',
        message: `High memory usage: ${memoryUsagePercent.toFixed(1)}%`,
        recommendation: 'Monitor memory usage and consider increasing system resources'
      });
    }

    // Migration status issues
    const migrationHealth = healthStatus.migration;
    if (migrationHealth.status === 'failed') {
      issues.push({
        type: 'migration',
        severity: 'critical',
        message: 'Migration has failed',
        recommendation: 'Check migration logs and resolve errors before retrying'
      });
    }

    if (migrationHealth.errorCount > 10) {
      issues.push({
        type: 'migration',
        severity: 'warning',
        message: `High error count: ${migrationHealth.errorCount} errors`,
        recommendation: 'Review error logs and fix data issues'
      });
    }

    // Create alerts for new issues
    for (const issue of issues) {
      await this.createAlert(issue);
    }
  }

  async createAlert(issue) {
    const alert = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...issue,
      acknowledged: false,
      resolved: false
    };

    // Check for similar recent alerts to avoid spam
    const recentSimilar = this.alerts.filter(a =>
      a.type === issue.type &&
      a.message === issue.message &&
      !a.resolved &&
      (Date.now() - new Date(a.timestamp)) < 300000 // 5 minutes
    );

    if (recentSimilar.length === 0) {
      this.alerts.unshift(alert);
      this.saveAlerts();

      // Send notification (console for now, can be extended to email/Slack/etc)
      await this.sendNotification(alert);
    }
  }

  async sendNotification(alert) {
    const severityEmoji = {
      critical: '🚨',
      warning: '⚠️',
      info: 'ℹ️'
    };

    const message = `${severityEmoji[alert.severity]} **${alert.type.toUpperCase()} ALERT**\n\n${alert.message}\n\n💡 ${alert.recommendation}`;

    console.log('\n' + '='.repeat(60));
    console.log(message);
    console.log('='.repeat(60) + '\n');

    // Here you could integrate with:
    // - Email notifications (nodemailer)
    // - Slack webhooks
    // - SMS services (Twilio)
    // - Monitoring systems (DataDog, New Relic)
  }

  acknowledgeAlert(alertId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedAt = new Date().toISOString();
      this.saveAlerts();
    }
  }

  resolveAlert(alertId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = new Date().toISOString();
      this.saveAlerts();
    }
  }

  loadAlerts() {
    try {
      if (fs.existsSync(this.alertsFile)) {
        const data = fs.readFileSync(this.alertsFile, 'utf8');
        this.alerts = JSON.parse(data);
      }
    } catch (error) {
      console.warn('Could not load alerts:', error.message);
      this.alerts = [];
    }
  }

  saveAlerts() {
    try {
      // Keep only last 100 alerts
      this.alerts = this.alerts.slice(0, 100);
      fs.writeFileSync(this.alertsFile, JSON.stringify(this.alerts, null, 2));
    } catch (error) {
      console.error('Failed to save alerts:', error.message);
    }
  }

  getAlerts(options = {}) {
    let filtered = [...this.alerts];

    if (options.type) {
      filtered = filtered.filter(a => a.type === options.type);
    }

    if (options.severity) {
      filtered = filtered.filter(a => a.severity === options.severity);
    }

    if (options.resolved === false) {
      filtered = filtered.filter(a => !a.resolved);
    }

    if (options.limit) {
      filtered = filtered.slice(0, options.limit);
    }

    return filtered;
  }

  getMetrics() {
    return {
      ...this.metrics,
      activeAlerts: this.alerts.filter(a => !a.resolved).length,
      totalAlerts: this.alerts.length,
      criticalAlerts: this.alerts.filter(a => a.severity === 'critical' && !a.resolved).length
    };
  }

  // Performance profiling
  startPerformanceProfiling() {
    this.metrics.startTime = Date.now();
    this.performanceInterval = setInterval(() => {
      const memUsage = process.memoryUsage();
      this.metrics.performanceHistory.push({
        timestamp: new Date().toISOString(),
        memory: {
          used: Math.round(memUsage.heapUsed / 1024 / 1024),
          total: Math.round(memUsage.heapTotal / 1024 / 1024)
        },
        uptime: Math.round(process.uptime())
      });

      // Keep only last 100 data points
      if (this.metrics.performanceHistory.length > 100) {
        this.metrics.performanceHistory.shift();
      }
    }, 30000); // Every 30 seconds
  }

  stopPerformanceProfiling() {
    if (this.performanceInterval) {
      clearInterval(this.performanceInterval);
    }
  }

  // Generate comprehensive report
  generateReport() {
    const status = this.statusTracker.getStatus();
    const health = this.checkSystemHealth();
    const alerts = this.getAlerts({ resolved: false });

    return {
      timestamp: new Date().toISOString(),
      migration: status,
      health: health,
      alerts: alerts,
      metrics: this.getMetrics(),
      recommendations: this.generateRecommendations(status, health, alerts)
    };
  }

  generateRecommendations(status, health, alerts) {
    const recommendations = [];

    if (status.status === 'failed') {
      recommendations.push({
        priority: 'high',
        action: 'Fix migration errors',
        description: 'Review error logs and resolve data issues before retrying migration'
      });
    }

    if (alerts.some(a => a.severity === 'critical')) {
      recommendations.push({
        priority: 'high',
        action: 'Address critical alerts',
        description: 'Resolve critical system or database issues immediately'
      });
    }

    if (health.memory.used / health.memory.total > 0.8) {
      recommendations.push({
        priority: 'medium',
        action: 'Optimize memory usage',
        description: 'Consider increasing system memory or optimizing migration batch size'
      });
    }

    if (status.performance.recordsPerSecond < 100) {
      recommendations.push({
        priority: 'medium',
        action: 'Optimize performance',
        description: 'Review database indexes, network latency, and batch sizes'
      });
    }

    return recommendations;
  }
}

// CLI interface for monitoring
if (require.main === module) {
  const monitor = new MigrationMonitor();
  const command = process.argv[2];

  switch (command) {
    case 'health':
      monitor.performHealthCheck().then(health => {
        console.log(JSON.stringify(health, null, 2));
      });
      break;

    case 'alerts':
      const options = {};
      if (process.argv[3]) options.type = process.argv[3];
      if (process.argv[4]) options.severity = process.argv[4];
      console.log(JSON.stringify(monitor.getAlerts(options), null, 2));
      break;

    case 'report':
      console.log(JSON.stringify(monitor.generateReport(), null, 2));
      break;

    case 'watch':
      console.log('🔍 Starting migration monitoring... (Ctrl+C to stop)');
      monitor.startPerformanceProfiling();

      const watchInterval = setInterval(async () => {
        const health = await monitor.performHealthCheck();
        const status = monitor.statusTracker.getStatus();

        console.log(`[${new Date().toLocaleTimeString()}] Status: ${status.status} | Phase: ${status.phase || 'none'} | Errors: ${status.errors.length}`);
      }, 10000); // Every 10 seconds

      process.on('SIGINT', () => {
        clearInterval(watchInterval);
        monitor.stopPerformanceProfiling();
        console.log('\n🛑 Monitoring stopped');
        process.exit(0);
      });
      break;

    default:
      console.log('Usage: node migration-monitor.js <command>');
      console.log('Commands:');
      console.log('  health    - Check system health');
      console.log('  alerts    - Show active alerts');
      console.log('  report    - Generate comprehensive report');
      console.log('  watch     - Start real-time monitoring');
      break;
  }
}

module.exports = MigrationMonitor;