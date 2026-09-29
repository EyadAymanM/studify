# 03 — NestJS Architecture & Drizzle ORM

Welcome to part 3 of our study series! In this guide, we explore the modular architecture of **NestJS** and why **Drizzle ORM** has become the modern standard for TypeScript database layers.

---

## 1. What is NestJS?

**NestJS** is a progressive Node.js framework for building scalable enterprise server-side applications. It brings architectural discipline (inspired by Angular) to backend development using TypeScript.

### Core Building Blocks:
1. **Modules (`@Module`)**: The organizational boundaries of your code. Every domain feature (e.g. notes, database, metrics) is encapsulated in a module.
2. **Controllers (`@Controller`)**: Handle incoming HTTP requests, route paths, extract query/body parameters, and return responses.
3. **Providers & Services (`@Injectable`)**: Contain business logic and data access. They are decoupled from the transport layer (HTTP, WebSocket, gRPC).
4. **Dependency Injection (DI)**: Instead of manually instantiating classes (`new NotesService()`), Nest's IoC container automatically provides dependencies to class constructors.
5. **Interceptors (`@Injectable` implementing `NestInterceptor`)**: Intercept requests before they hit the controller and after the response leaves. Perfect for logging, metrics, and transformations.

```text
Incoming Request -> Interceptor -> Controller -> Service -> Drizzle ORM -> PostgreSQL
                                                      |
Outgoing Response <- Interceptor <--------------------+
```

---

## 2. Why Drizzle ORM?

### The Evolution of ORMs:
- **TypeORM / Sequelize (Old Guard)**: Heavy runtime reflections, extensive use of decorators, active record models, obscure query generation.
- **Prisma**: Introduced type-safety with a custom DSL (`schema.prisma`), but relies on a heavy Rust binary engine and code-generation step.
- **Drizzle ORM (Modern standard)**:
  - **"If you know SQL, you know Drizzle"**: Queries look like SQL written in TypeScript (`db.select().from(notes)`).
  - **Zero runtime overhead**: No heavy query engines or background binaries.
  - **Pure TypeScript schema**: Tables, constraints, and relationships are declared in standard `.ts` files.
  - **Type inference**: Your TypeScript types (`Note`, `NewNote`) are automatically inferred directly from the table definition (`typeof notes.$inferSelect`).

---

## 3. How We Wired Drizzle into NestJS

In `studify-server/src/db/`:
1. `schema.ts`: Defines `notes`, `tags`, and `noteTags` using `pgTable()`, with explicit foreign keys and relations.
2. `db.module.ts`: A `@Global()` module that initializes the PostgreSQL connection client and registers `DRIZZLE_PROVIDER`.
3. In any NestJS service:
```typescript
@Injectable()
export class NotesService {
  constructor(@Inject(DRIZZLE_PROVIDER) private db: PostgresJsDatabase<typeof schema>) {}

  async findAll() {
    return this.db.query.notes.findMany({
      with: { noteTags: { with: { tag: true } } },
    });
  }
}
```

---

## 4. Database Migrations with Drizzle Kit

- **`pnpm db:generate`**: Inspects `src/db/schema.ts`, compares it against past migration snapshots, and generates an incremental SQL migration file (e.g., `drizzle/0000_grey_bromley.sql`).
- **`pnpm db:push`**: Directly pushes schema changes to the target database without migration files (great for fast prototyping).
- **`pnpm db:studio`**: Opens a local web UI to browse and edit database tables.
