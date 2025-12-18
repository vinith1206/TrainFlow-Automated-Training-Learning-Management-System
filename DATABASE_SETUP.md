# Database Setup Guide

## Option 1: Local PostgreSQL Installation

### macOS (using Homebrew)
```bash
# Install PostgreSQL
brew install postgresql@14

# Start PostgreSQL service
brew services start postgresql@14

# Create database
createdb tmds

# Or connect and create manually
psql postgres
CREATE DATABASE tmds;
\q
```

### Linux (Ubuntu/Debian)
```bash
# Install PostgreSQL
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql

# Create database
sudo -u postgres createdb tmds
```

### Windows
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Install and set password for `postgres` user
3. Open pgAdmin or psql
4. Create database: `CREATE DATABASE tmds;`

## Option 2: Docker (Recommended for Development)

```bash
# Run PostgreSQL in Docker
docker run --name tmds-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=tmds \
  -p 5432:5432 \
  -d postgres:14

# Check if running
docker ps

# Stop container (when needed)
docker stop tmds-postgres

# Start container again
docker start tmds-postgres

# Remove container (when needed)
docker rm tmds-postgres
```

## Option 3: Cloud Database (Production)

Use services like:
- AWS RDS
- Google Cloud SQL
- Heroku Postgres
- Supabase
- Railway

Update `DATABASE_URL` in `backend/.env` with your connection string.

## Update .env File

After setting up PostgreSQL, update `backend/.env`:

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/tmds?schema=public"
```

**Default values:**
- Username: `postgres`
- Password: `postgres` (or your custom password)
- Database: `tmds`
- Port: `5432`

## Run Migrations

```bash
cd backend
npx prisma migrate dev
npx prisma generate
npm run prisma:seed
```

## Verify Database

```bash
# Using Prisma Studio (GUI)
cd backend
npx prisma studio

# Or using psql
psql -d tmds
\dt  # List tables
SELECT * FROM users;
\q
```

## Troubleshooting

### Connection Refused
- Check if PostgreSQL is running: `brew services list` (macOS) or `sudo systemctl status postgresql` (Linux)
- Verify port 5432 is not blocked
- Check firewall settings

### Authentication Failed
- Reset postgres password: `psql postgres -c "ALTER USER postgres PASSWORD 'postgres';"`
- Or update DATABASE_URL with correct credentials

### Database Does Not Exist
- Create it: `createdb tmds` or `CREATE DATABASE tmds;`

