const fs = require('fs');
const path = require('path');

class MigrationStatusTracker {
  constructor() {
    this.statusFile = path.join(__dirname, 'migration-status.json');
    this.status = this.loadStatus();
  }

  loadStatus() {
    try {
      if (fs.existsSync(this.statusFile)) {
        const data = fs.readFileSync(this.statusFile, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.warn('⚠️  Could not load migration status:', error.message);
    }

    // Default status
    return {
      version: '1.0.0',
      startTime: null,
      endTime: null,
      status: 'not_started', // not_started, running, completed, failed
      phase: null, // users, photos, validation
      progress: {
        users: { total: 0, migrated: 0, skipped: 0, errors: 0 },
        photos: { total: 0, migrated: 0, skipped: 0, errors: 0 }
      },
      performance: {
        duration: 0,
        recordsPerSecond: 0,
        memoryUsage: 0
      },
      errors: [],
      warnings: []
    };
  }

  saveStatus() {
    try {
      fs.writeFileSync(this.statusFile, JSON.stringify(this.status, null, 2));
    } catch (error) {
      console.error('❌ Failed to save migration status:', error.message);
    }
  }

  startMigration() {
    this.status.startTime = new Date().toISOString();
    this.status.status = 'running';
    this.status.phase = 'initializing';
    this.saveStatus();
    console.log('📊 Migration status tracking started');
  }

  updateProgress(phase, data) {
    this.status.phase = phase;
    if (data) {
      Object.assign(this.status.progress[phase], data);
    }
    this.saveStatus();
  }

  addError(error, context = {}) {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      phase: this.status.phase,
      error: error.message || error,
      context
    };
    this.status.errors.push(errorEntry);

    // Safely increment error count
    if (this.status.progress[this.status.phase]) {
      this.status.progress[this.status.phase].errors = (this.status.progress[this.status.phase].errors || 0) + 1;
    }

    this.saveStatus();
  }

  addWarning(warning, context = {}) {
    const warningEntry = {
      timestamp: new Date().toISOString(),
      phase: this.status.phase,
      warning,
      context
    };
    this.status.warnings.push(warningEntry);
    this.saveStatus();
  }

  completeMigration(success = true) {
    this.status.endTime = new Date().toISOString();
    this.status.status = success ? 'completed' : 'failed';

    if (this.status.startTime) {
      const start = new Date(this.status.startTime);
      const end = new Date(this.status.endTime);
      this.status.performance.duration = (end - start) / 1000; // seconds

      const totalRecords = Object.values(this.status.progress).reduce(
        (sum, phase) => sum + phase.migrated + phase.skipped,
        0
      );
      this.status.performance.recordsPerSecond = totalRecords / this.status.performance.duration;
    }

    // Memory usage
    const memUsage = process.memoryUsage();
    this.status.performance.memoryUsage = {
      rss: Math.round(memUsage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      external: Math.round(memUsage.external / 1024 / 1024) // MB
    };

    this.saveStatus();

    this.printSummary();
  }

  printSummary() {
    console.log('\n📊 Migration Summary Report');
    console.log('='.repeat(50));

    const duration = this.status.performance.duration;
    const recordsPerSec = Math.round(this.status.performance.recordsPerSecond);

    console.log(`⏱️  Duration: ${duration.toFixed(2)}s`);
    console.log(`⚡ Performance: ${recordsPerSec} records/second`);
    console.log(`🧠 Memory: ${this.status.performance.memoryUsage.heapUsed}MB used`);

    console.log('\n📈 Progress by Phase:');
    Object.entries(this.status.progress).forEach(([phase, stats]) => {
      const total = stats.total || (stats.migrated + stats.skipped + stats.errors);
      const successRate = total > 0 ? Math.round(((stats.migrated + stats.skipped) / total) * 100) : 0;
      console.log(`   ${phase}: ${stats.migrated} migrated, ${stats.skipped} skipped, ${stats.errors} errors (${successRate}% success)`);
    });

    if (this.status.errors.length > 0) {
      console.log(`\n❌ Errors: ${this.status.errors.length}`);
      this.status.errors.slice(-3).forEach((error, i) => {
        console.log(`   ${i + 1}. ${error.error}`);
      });
      if (this.status.errors.length > 3) {
        console.log(`   ... and ${this.status.errors.length - 3} more`);
      }
    }

    if (this.status.warnings.length > 0) {
      console.log(`\n⚠️  Warnings: ${this.status.warnings.length}`);
    }

    console.log(`\n📄 Full report saved to: ${this.statusFile}`);
  }

  getStatus() {
    return { ...this.status };
  }

  reset() {
    this.status = this.loadStatus();
    this.status.startTime = null;
    this.status.endTime = null;
    this.status.status = 'not_started';
    this.status.phase = null;
    this.status.errors = [];
    this.status.warnings = [];
    this.saveStatus();
  }
}

module.exports = MigrationStatusTracker;