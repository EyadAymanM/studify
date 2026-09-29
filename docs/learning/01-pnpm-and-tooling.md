# 01 — Understanding pnpm, `pnpm dlx`, and `pnpm approve-builds`

Welcome to your study guide on modern package management! As part of building **Studify**, each tool we adopt is documented with its core concept, why it exists, how it works under the hood, and practical real-world commands.

---

## 1. What is pnpm?

**pnpm** stands for **Fast, disk space efficient package manager** (*Performant npm*). It is a drop-in replacement for `npm` and `yarn`, created to solve the two biggest flaws of traditional package managers:
1. **Massive disk space consumption**
2. **"Phantom dependencies" and fragile dependency trees**

---

## 2. The Problems with Standard `npm`

### A. The Disk Space Black Hole
If you have 10 projects on your machine that all use `react`, `typescript`, and `vite`:
- **npm** downloads and copies the full files of those packages **10 separate times**, storing hundreds of megabytes in each project's `node_modules`.
- With hundreds of packages, your hard drive quickly loses gigabytes of space to identical duplicate files.

### B. "Phantom Dependencies" (Flat `node_modules`)
In npm v3+, the dependency tree was flattened to avoid Windows path-length limits:
```text
node_modules/
  ├── my-package/       (declared in package.json)
  └── helper-lib/       (dependency of my-package, NOT in your package.json!)
```
Because `helper-lib` sits directly in the root of `node_modules`, your code can do `import 'helper-lib'` and it works! **However**, if `my-package` updates and stops using `helper-lib`, your code suddenly crashes in production because `helper-lib` was never in your `package.json`. This is called a **phantom dependency**.

---

## 3. How pnpm Solves This

### 1. Content-Addressable Storage (CAS)
Instead of copying files into every project:
- `pnpm` stores all packages in a single global content-addressable store on your hard drive (e.g. `~/.pnpm-store` or `D:\.pnpm-store`).
- Files are saved by their content hash. If two packages share identical files, that file is saved only **once**.

### 2. Hard Links & Symlinks
When you run `pnpm install` in `studify-client`:
- `pnpm` does not copy files. Instead, it creates **hard links** from the global store into a hidden `.pnpm/` folder in your project.
- A **hard link** points to the exact same physical disk sectors as the original file. It consumes **0 additional disk space** and creation is instantaneous.
- Then, `pnpm` uses **symbolic links (symlinks)** to expose *only* the packages you explicitly defined in `package.json` at the root of `node_modules`.

```text
studify-client/
  └── node_modules/
        ├── react  ---------> symlink to .pnpm/react@19.../node_modules/react
        ├── vite   ---------> symlink to .pnpm/vite@8.../node_modules/vite
        └── .pnpm/ (virtual store where real hard links reside)
```
> **Key Takeaway**: If your code tries to import a library you forgot to add to `package.json`, pnpm prevents it immediately at development time. No more phantom dependency bugs!

---

## 4. Deep Dive: What is `pnpm dlx`?

### What Does "dlx" Stand For?
`dlx` stands for **Download and eXecute**. It is pnpm's equivalent of `npx`.

### How Does `pnpm dlx` Differ from `npx`?
- **`npx`**: Often installs packages into a shared global npm cache. If the package was previously downloaded, `npx` may reuse stale binaries or leave residual clutter on disk.
- **`pnpm dlx`**: Fetches the package to a **temporary, isolated directory**, executes its binary, and cleans up after execution. It does **not** install the package as a dependency in your `package.json` or pollute your project's `node_modules`.

### Real-World Example in Studify:
When scaffolding our backend, instead of globally installing the NestJS CLI (`npm install -g @nestjs/cli`), we used:
```bash
pnpm dlx @nestjs/cli new studify-server -p pnpm -g --no-observe
```
This downloaded the latest `@nestjs/cli`, ran the project generation command, and left our machine clean without unused global binaries.

---

## 5. Deep Dive: `pnpm approve-builds` & Supply Chain Security

### The Problem: Malicious Lifecycle Scripts
In the JavaScript ecosystem, packages can declare lifecycle scripts in their `package.json`:
- `preinstall`: Runs before packages are downloaded.
- `install` / `postinstall`: Runs immediately after packages are extracted.

Historically, malicious actors published npm packages that used `postinstall` scripts to steal environment variables, private SSH keys, or install cryptominers the moment a developer ran `npm install`.

### How pnpm Protects You
In modern versions of pnpm (v10+ and v12+):
1. **Build scripts are blocked by default**: When you install a dependency that contains lifecycle scripts (such as `esbuild`, which uses `postinstall` to download platform-specific binaries for Windows/Linux/Mac), pnpm intercepts it.
2. **`ERR_PNPM_IGNORED_BUILDS` Warning**: If a package requires build scripts, pnpm warns you:
   ```text
   Error: ERR_PNPM_IGNORED_BUILDS
     × adding a new package
     ╰─▶ Ignored build scripts: esbuild@0.25.12
     help: Run "pnpm approve-builds" to pick which dependencies should be allowed to run scripts.
   ```

### How to Use `pnpm approve-builds`

#### Interactive Approval:
```bash
pnpm approve-builds
```
This opens an interactive terminal menu listing all packages requesting permission to execute scripts. You can inspect the package name and approve or deny each one individually.

#### Non-Interactive / Automated Approval:
When working in automated scripts or trusted setups, use the `--all` flag:
```bash
pnpm approve-builds --all
```
This approves all pending build scripts immediately.

#### How pnpm Remembers Your Choice:
Once approved, pnpm writes an entry into your `package.json` under `pnpm.onlyBuiltDependencies`:
```json
{
  "pnpm": {
    "onlyBuiltDependencies": ["esbuild"]
  }
}
```
This ensures that your teammates, Docker containers, and CI/CD pipelines automatically know which build scripts are trusted without asking again.

---

## 6. Essential pnpm Commands Cheat Sheet

| Task | npm Equivalent | pnpm Command |
| :--- | :--- | :--- |
| Install all dependencies | `npm install` | `pnpm install` (or `pnpm i`) |
| Add production package | `npm install <pkg>` | `pnpm add <pkg>` |
| Add development package | `npm install -D <pkg>` | `pnpm add -D <pkg>` |
| Remove package | `npm uninstall <pkg>` | `pnpm remove <pkg>` (or `pnpm rm`) |
| Run a script | `npm run dev` | `pnpm dev` or `pnpm run dev` |
| Execute one-off CLI tool | `npx <pkg>` | `pnpm dlx <pkg>` |
| Approve lifecycle build scripts | N/A | `pnpm approve-builds` (or `--all`) |
| Check where store is located | N/A | `pnpm store path` |
| Clean unreferenced packages | `npm cache clean --force` | `pnpm store prune` |
