#!/bin/bash

# Enterprise Migration Deployment Pipeline
# Usage: ./deploy-migration.sh [environment]
# Environment: development, staging, production

set -e  # Exit on any error

ENVIRONMENT=${1:-development}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Pre-deployment checks
pre_deployment_checks() {
    log_info "Running pre-deployment checks for $ENVIRONMENT environment..."

    # Check if required files exist
    local required_files=(".env.mysql" "migrate-data.js" "migration-status.js")
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            log_error "Required file missing: $file"
            exit 1
        fi
    done

    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi

    # Check Node.js version (require 18+)
    local node_version=$(node -v | sed 's/v//' | cut -d. -f1)
    if [ "$node_version" -lt 18 ]; then
        log_error "Node.js version 18+ required, found $(node -v)"
        exit 1
    fi

    # Check if npm packages are installed
    if [ ! -d "node_modules" ]; then
        log_info "Installing dependencies..."
        npm install
    fi

    log_success "Pre-deployment checks passed"
}

# Environment-specific configuration
setup_environment() {
    log_info "Setting up $ENVIRONMENT environment..."

    case $ENVIRONMENT in
        production)
            export NODE_ENV=production
            # Additional production checks
            if [ -z "$MYSQL_PASSWORD" ]; then
                log_error "MYSQL_PASSWORD environment variable must be set in production"
                exit 1
            fi
            ;;
        staging)
            export NODE_ENV=staging
            ;;
        development|*)
            export NODE_ENV=development
            ;;
    esac

    log_success "Environment configured for $ENVIRONMENT"
}

# Backup current state
create_backup() {
    log_info "Creating database backup..."

    local backup_dir="backups/$(date +%Y%m%d_%H%M%S)_$ENVIRONMENT"
    mkdir -p "$backup_dir"

    # Backup Prisma database
    if [ -f "prisma/dev.db" ]; then
        cp "prisma/dev.db" "$backup_dir/database.db"
        log_success "Database backup created: $backup_dir/database.db"
    else
        log_warning "No existing database to backup"
    fi

    # Backup migration status
    if [ -f "migration-status.json" ]; then
        cp "migration-status.json" "$backup_dir/migration-status.json"
        log_success "Migration status backup created"
    fi

    echo "$backup_dir" > .last_backup
}

# Run migration with monitoring
run_migration() {
    log_info "Starting migration process..."

    local start_time=$(date +%s)
    local log_file="logs/migration_$(date +%Y%m%d_%H%M%S).log"

    mkdir -p logs

    # Run migration and capture output
    if node migrate-data.js 2>&1 | tee "$log_file"; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))

        log_success "Migration completed successfully in ${duration}s"
        log_info "Log saved to: $log_file"

        # Validate migration results
        validate_results "$log_file"
    else
        log_error "Migration failed! Check logs: $log_file"
        exit 1
    fi
}

# Validate migration results
validate_results() {
    local log_file=$1

    log_info "Validating migration results..."

    # Check if migration completed successfully
    if grep -q "Migration completed successfully" "$log_file"; then
        log_success "Migration validation passed"

        # Check for any errors in the log
        local error_count=$(grep -c "❌ Error" "$log_file" || true)
        if [ "$error_count" -gt 0 ]; then
            log_warning "Migration completed with $error_count errors. Check log file for details."
        fi
    else
        log_error "Migration did not complete successfully"
        exit 1
    fi
}

# Post-migration tasks
post_migration_tasks() {
    log_info "Running post-migration tasks..."

    # Generate migration report
    if [ -f "migration-status.json" ]; then
        log_info "Generating migration report..."
        node -e "
            const status = require('./migration-status.json');
            console.log('📊 Migration Report:');
            console.log('==================');
            console.log('Status:', status.status);
            console.log('Duration:', status.performance.duration.toFixed(2), 'seconds');
            console.log('Records/sec:', Math.round(status.performance.recordsPerSecond));
            console.log('Users migrated:', status.progress.users.migrated);
            console.log('Photos migrated:', status.progress.photos.migrated);
            if (status.errors.length > 0) {
                console.log('Errors:', status.errors.length);
            }
        "
    fi

    log_success "Post-migration tasks completed"
}

# Rollback function
rollback() {
    log_warning "Initiating rollback..."

    if [ -f ".last_backup" ]; then
        local backup_dir=$(cat .last_backup)

        if [ -f "$backup_dir/database.db" ]; then
            cp "$backup_dir/database.db" "prisma/dev.db"
            log_success "Database rolled back from backup"
        fi

        if [ -f "$backup_dir/migration-status.json" ]; then
            cp "$backup_dir/migration-status.json" "migration-status.json"
            log_success "Migration status rolled back"
        fi
    else
        log_error "No backup found for rollback"
        exit 1
    fi
}

# Health check
health_check() {
    log_info "Running health checks..."

    # Check if application can start
    if timeout 10s npm run build > /dev/null 2>&1; then
        log_success "Application build check passed"
    else
        log_warning "Application build check failed"
    fi

    # Check database connectivity
    if npx prisma db push --preview-feature > /dev/null 2>&1; then
        log_success "Database connectivity check passed"
    else
        log_error "Database connectivity check failed"
        exit 1
    fi
}

# Main deployment flow
main() {
    log_info "🚀 Starting Enterprise Migration Deployment"
    log_info "Environment: $ENVIRONMENT"
    log_info "Timestamp: $(date)"
    echo

    # Trap for cleanup on error
    trap 'log_error "Deployment failed! Check logs for details."' ERR

    pre_deployment_checks
    setup_environment
    create_backup
    run_migration
    post_migration_tasks
    health_check

    echo
    log_success "🎉 Enterprise Migration Deployment completed successfully!"
    log_info "Next steps:"
    log_info "  1. Run: npx prisma studio"
    log_info "  2. Test the application thoroughly"
    log_info "  3. Monitor application performance"
    log_info "  4. Update DNS/load balancer if needed"
}

# Command line argument handling
case "${2:-}" in
    rollback)
        rollback
        ;;
    health-check)
        health_check
        ;;
    *)
        main
        ;;
esac