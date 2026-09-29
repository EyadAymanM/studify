# 02 — Docker, Containerization & PostgreSQL Logical Replication

Welcome to part 2 of our study series! In this guide, we demystify **Docker**, container internals, Docker Compose orchestration, and why **PostgreSQL logical replication** is the foundation for real-time synchronization with Rocicorp Zero.

---

## 1. What is Docker & Why Do We Use It?

Traditionally, setting up a database or caching server required downloading installers, configuring system services, fighting port collisions, and managing OS-specific differences.

**Docker solves this by packaging software into standardized, isolated units called containers.**

### Containers vs. Virtual Machines (VMs)
- **Virtual Machines**: Emulate an entire hardware machine. Each VM runs a full guest operating system (several gigabytes in size), takes minutes to boot, and consumes heavy CPU and memory.
- **Docker Containers**: Share the host system's Linux kernel (using Linux features called `namespaces` for process isolation and `cgroups` for resource limits). A container only packages the application code, runtime, and system libraries it needs. Containers start in **sub-seconds** and consume very little overhead.

```text
┌───────────────────────────┐     ┌───────────────────────────┐
│     Virtual Machine       │     │      Docker Container     │
├───────────────────────────┤     ├───────────────────────────┤
│ App A   │ App B   │ App C │     │ App A   │ App B   │ App C │
├───────────────────────────┤     ├───────────────────────────┤
│ Full Guest OS (GBs)       │     │ Container Engine (Docker) │
├───────────────────────────┤     ├───────────────────────────┤
│ Hypervisor (VMware/VBox)  │     │ Host Operating System     │
├───────────────────────────┤     ├───────────────────────────┤
│ Host Hardware             │     │ Host Hardware             │
└───────────────────────────┘     └───────────────────────────┘
```

---

## 2. Core Docker Concepts

### 1. Images
An **image** is a lightweight, standalone, executable software package that includes everything needed to run an application: code, runtime, system tools, libraries, and settings.
- Images are built from a **Dockerfile** or pulled from registries like Docker Hub (e.g. `postgres:16-alpine`).
- Images are **immutable** (read-only).

### 2. Containers
A **container** is a runnable instance of an image. You can create, start, stop, move, or delete a container using the Docker API or CLI.

### 3. Volumes (Persistent Data)
By default, files created inside a container are stored in a writable container layer. **If you delete the container, that data is permanently lost!**
- For databases like PostgreSQL, we use **Docker Volumes** (`postgres_data:/var/lib/postgresql/data`).
- Volumes are stored on the host filesystem outside the container lifecycle, ensuring your data persists even if the container is recreated or upgraded.

### 4. Networking & Port Mapping
Containers live in isolated virtual networks:
- **Port Mapping (`5432:5432`)**: Bridges port `5432` on your physical machine (`localhost:5432`) to port `5432` inside the PostgreSQL container.
- **Service Discovery**: Inside the Docker network, containers talk to each other using their service names (e.g. `postgres:5432`), without needing hardcoded IP addresses.

---

## 3. Demystifying `docker-compose.yml`

When building modern applications with multiple interdependent services (like a database and a real-time sync daemon), **Docker Compose** lets you define the entire infrastructure as declarative YAML code.

Here is the exact anatomy of Studify's `docker-compose.yml`:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: studify-postgres
    restart: unless-stopped
    command: >
      postgres
      -c wal_level=logical
      -c max_wal_senders=10
      -c max_replication_slots=10
    environment:
      POSTGRES_USER: studify
      POSTGRES_PASSWORD: studify_secret
      POSTGRES_DB: studify_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U studify -d studify_db"]
      interval: 5s
      timeout: 5s
      retries: 5

  zero-cache:
    image: rocicorp/zero-cache:latest
    container_name: studify-zero-cache
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      ZERO_UPSTREAM_DB: "postgresql://studify:studify_secret@postgres:5432/studify_db"
      ZERO_CVR_DB: "postgresql://studify:studify_secret@postgres:5432/studify_cvr"
      ZERO_CHANGE_DB: "postgresql://studify:studify_secret@postgres:5432/studify_change"
      ZERO_AUTH_SECRET: "studify_super_secret_local_dev_token_at_least_32_chars"
      ZERO_REPLICA_FILE: "/tmp/zero-replica.db"
      ZERO_PORT: "4848"
    ports:
      - "4848:4848"

volumes:
  postgres_data:
```

### Breakdown of Key Properties:
1. **`command`**: Overrides the default container startup command. We pass `-c wal_level=logical` to enable PostgreSQL's logical replication engine.
2. **`healthcheck`**: Periodically executes `pg_isready` inside the PostgreSQL container.
3. **`depends_on.condition: service_healthy`**: Prevents `zero-cache` from booting until PostgreSQL is fully initialized and actively accepting connections, avoiding crash loops.
4. **`volumes: postgres_data`**: Attaches a persistent volume to preserve database rows between restarts.

---

## 4. Why Zero Sync Requires `wal_level = logical`

PostgreSQL records all database mutations (inserts, updates, deletes) in a sequential write-ahead log (WAL) on disk before writing to data files.

### Physical vs. Logical Replication:
- **Physical Replication**: Streams raw disk block changes. Both servers must be identical PostgreSQL instances on the exact same architecture.
- **Logical Replication**: Decodes the binary WAL into structured data events (e.g. `INSERT note { id: "1", content: "Closures..." }`).

**Rocicorp Zero (`zero-cache`) connects directly to this logical replication stream**. Whenever NestJS writes a note to PostgreSQL:
1. PostgreSQL emits a row mutation event into the replication slot.
2. `zero-cache` reads the event in sub-milliseconds.
3. `zero-cache` pushes the change delta over WebSockets to all connected browser tabs.

---

## 5. Essential Docker CLI Cheat Sheet

| Command | What It Does |
| :--- | :--- |
| `docker compose up -d` | Starts all services in the background (detached mode) |
| `docker compose ps` | Displays the status and healthcheck results of containers |
| `docker compose logs -f <service>` | Streams live output logs from a container (e.g. `postgres`) |
| `docker compose stop` | Stops running containers without deleting data |
| `docker compose down` | Stops and removes containers and internal virtual networks |
| `docker compose down -v` | ⚠️ Stops containers **and permanently wipes data volumes** |
| `docker exec -it studify-postgres psql -U studify -d studify_db` | Enters an interactive PostgreSQL SQL shell inside the container |
