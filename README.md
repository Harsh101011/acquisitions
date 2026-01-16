# Docker Setup

This project uses Docker for both development and production, leveraging **Neon Local** for ephemeral development branches and **Neon Cloud** for production.

## Prerequisites

- Docker Installed
- Neon API Key and Project ID (for local development)

## Development

1.  **Configure Environment**:
    Create a `.env` file (or use `.env.development`) with your Neon credentials:
    ```bash
    NEON_API_KEY=your_api_key
    NEON_PROJECT_ID=your_project_id
    ```

2.  **Start the App**:
    Run the development environment with Neon Local:
    ```bash
    docker compose -f docker-compose.dev.yml up --build
    ```
    
    **Or use the helper script:**
    ```bash
    sh setup-dev.sh
    ```

    *   The app will be available at `http://localhost:3000`.
    *   Neon Local will be running on port `5432`.
    *   A new database branch will be automatically created mapped to your current git branch.

## Production

1.  **Configure Environment**:
    Set the production `DATABASE_URL` in your `.env.production` or deployment platform secrets.

2.  **Deploy/Run**:
    ```bash
    docker compose -f docker-compose.prod.yml up --build -d
    ```

    **Or use the helper script:**
    ```bash
    sh setup-prod.sh
    ```

## Environment Variables

| Variable | Description |
| :--- | :--- |
| `NODE_ENV` | `development` or `production` |
| `DATABASE_URL` | Postgres connection string |
| `NEON_API_KEY` | Required for Neon Local (Dev only) |
| `NEON_PROJECT_ID` | Required for Neon Local (Dev only) |
