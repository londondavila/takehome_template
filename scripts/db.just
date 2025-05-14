# PostgreSQL database implementation

# Start database server (Docker)
dev:
    cd ../db_server && \
    if [ ! -f ".env" ]; then \
        echo "⚠️ .env file not found, creating from template..." && \
        cp .env.example .env; \
    fi && \
    docker compose up -d

# Run database in background (Docker)
docker:
    cd ../db_server && docker compose up -d

# Stop database (Docker)
stop:
    cd ../db_server && docker compose down -v

# Initialize database with schema
init:
    cd ../db_server && \
    if [ -f ".env" ]; then \
        export $(grep -v '^#' .env | xargs) && \
        docker exec -i app_postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" < init/01_schema.sql; \
    else \
        echo "⚠️ .env file not found"; \
        exit 1; \
    fi

# Reset database (drops and recreates)
reset:
    cd ../db_server && \
    if [ -f ".env" ]; then \
        export $(grep -v '^#' .env | xargs) && \
        echo "⏳ Waiting for database to be ready..." && \
        until docker exec app_postgres pg_isready -U "$POSTGRES_USER" > /dev/null 2>&1; do sleep 1; done && \
        echo "Dropping and recreating database..." && \
        docker exec -u postgres app_postgres psql -c "DROP DATABASE IF EXISTS $POSTGRES_DB;" && \
        docker exec -u postgres app_postgres psql -c "CREATE DATABASE $POSTGRES_DB;" && \
        just db init; \
    else \
        echo "⚠️ .env file not found"; \
        exit 1; \
    fi

# Create database backup
backup:
    cd ../db_server && \
    if [ -f ".env" ]; then \
        . .env && \
        mkdir -p backups && \
        PGPASSWORD=$$POSTGRES_PASSWORD pg_dump -h $$POSTGRES_HOST -p $$POSTGRES_PORT -U $$POSTGRES_USER -d $$POSTGRES_DB -F c -f backups/backup_$$(date +%Y%m%d_%H%M%S).dump; \
    else \
        echo "⚠️ .env file not found"; \
        exit 1; \
    fi

# Restore database from latest backup
restore:
    cd ../db_server && \
    if [ -f ".env" ]; then \
        . .env && \
        LATEST_BACKUP=$$(ls -t backups/*.dump | head -n1) && \
        if [ -n "$$LATEST_BACKUP" ]; then \
            PGPASSWORD=$$POSTGRES_PASSWORD pg_restore -h $$POSTGRES_HOST -p $$POSTGRES_PORT -U $$POSTGRES_USER -d $$POSTGRES_DB -c "$$LATEST_BACKUP"; \
        else \
            echo "No backup files found in backups/"; \
            exit 1; \
        fi; \
    else \
        echo "⚠️ .env file not found"; \
        exit 1; \
    fi

# Check database health
health-check:
    cd ../db_server && \
    if [ -f ".env" ]; then \
        . .env && \
        PGPASSWORD=$$POSTGRES_PASSWORD psql -h $$POSTGRES_HOST -p $$POSTGRES_PORT -U $$POSTGRES_USER -d $$POSTGRES_DB -c "SELECT version();" && \
        echo "🏥 Database health check complete"; \
    else \
        echo "⚠️ .env file not found"; \
        exit 1; \
    fi 