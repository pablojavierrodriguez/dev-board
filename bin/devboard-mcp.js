#!/usr/bin/env node

// scripts/mcp-server.ts
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";

// scripts/backlogMdParser.ts
function normalizeStatus(raw) {
  if (!raw) return "draft";
  const clean = raw.trim().toLowerCase().replace(/[\s_-]+/g, "");
  switch (clean) {
    case "draft":
    case "drafts":
    case "ideas":
    case "idea":
    case "backlog":
    case "todo":
    case "open":
      return "draft";
    case "doing":
    case "inprogress":
    case "wip":
    case "inprog":
    case "active":
    case "started":
      return "doing";
    case "review":
    case "testing":
    case "testingqa":
    case "qa":
    case "test":
    case "inreview":
      return "review";
    case "ready":
    case "finish":
    case "readyfordeploy":
    case "staged":
    case "resolved":
      return "ready";
    case "done":
    case "deployed":
    case "closed":
    case "completed":
    case "shipped":
      return "done";
    case "dismissed":
    case "cancelled":
    case "canceled":
    case "abandoned":
    case "archived":
    case "archive":
      return "dismissed";
    default:
      return "draft";
  }
}
function formatStatusForMd(status) {
  switch (status) {
    case "draft":
      return "Draft";
    case "doing":
      return "Doing";
    case "review":
      return "Review";
    case "ready":
      return "Ready";
    case "done":
      return "Done";
    case "dismissed":
      return "Dismissed";
    case "cancelled":
      return "Cancelled";
    default:
      return "Draft";
  }
}
function normalizePriority(raw) {
  if (!raw) return "p2";
  const clean = raw.trim().toLowerCase();
  if (clean === "p0" || clean === "urgent" || clean === "critical") return "p0";
  if (clean === "p1" || clean === "high") return "p1";
  if (clean === "p2" || clean === "medium" || clean === "med") return "p2";
  if (clean === "p3" || clean === "low") return "p3";
  return "p2";
}
function formatPriorityForMd(p) {
  if (p === "p0") return "high";
  if (p === "p1") return "high";
  if (p === "p2") return "medium";
  if (p === "p3") return "low";
  return p || "medium";
}
function parseBacklogMd(content, defaultId = "") {
  const result = {
    id: defaultId,
    title: "Sin t\xEDtulo",
    status: "draft",
    type: "feature",
    priority: "p2",
    assignees: [],
    labels: [],
    dependencies: [],
    acceptanceCriteria: [],
    rawExtraFrontmatter: {}
  };
  if (!content) return result;
  let bodyContent = content;
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (frontmatterMatch) {
    const rawFm = frontmatterMatch[1];
    bodyContent = frontmatterMatch[2];
    const lines = rawFm.split(/\r?\n/);
    let currentKey = "";
    let currentList = [];
    let inList = false;
    const finalizeList = () => {
      if (inList && currentKey) {
        if (currentKey === "labels") result.labels = currentList;
        else if (currentKey === "assignee" || currentKey === "assignees") result.assignees = currentList;
        else if (currentKey === "dependencies") result.dependencies = currentList;
      }
      inList = false;
      currentList = [];
    };
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      if (trimmed.startsWith("- ")) {
        const itemVal = trimmed.replace(/^- /, "").trim().replace(/^['"]|['"]$/g, "");
        currentList.push(itemVal);
        continue;
      }
      if (inList && !line.startsWith(" ") && !line.startsWith("	")) {
        finalizeList();
      }
      const colonIdx = line.indexOf(":");
      if (colonIdx !== -1) {
        const key = line.slice(0, colonIdx).trim().toLowerCase();
        const rawVal = line.slice(colonIdx + 1).trim();
        const cleanVal = rawVal.replace(/^['"]|['"]$/g, "");
        currentKey = key;
        if (!rawVal) {
          inList = true;
          currentList = [];
          continue;
        }
        if (rawVal.startsWith("[") && rawVal.endsWith("]")) {
          const items = rawVal.slice(1, -1).split(",").map((s) => s.trim().replace(/^['"]|['"]$/g, "")).filter(Boolean);
          if (key === "labels") result.labels = items;
          else if (key === "assignee" || key === "assignees") result.assignees = items;
          else if (key === "dependencies") result.dependencies = items;
          continue;
        }
        switch (key) {
          case "id":
            result.id = cleanVal;
            break;
          case "title":
            result.title = cleanVal;
            break;
          case "status":
            result.rawStatus = cleanVal;
            result.status = normalizeStatus(cleanVal);
            break;
          case "type":
            result.type = cleanVal;
            break;
          case "priority":
            result.priority = cleanVal;
            break;
          case "milestone":
          case "sprint":
            result.milestone = cleanVal;
            break;
          case "created_date":
          case "createdat":
            result.createdDate = cleanVal;
            break;
          case "updated_date":
          case "updatedat":
            result.updatedDate = cleanVal;
            break;
          case "assignee":
            result.assignees = [cleanVal];
            break;
          default:
            if (result.rawExtraFrontmatter) {
              result.rawExtraFrontmatter[key] = cleanVal;
            }
            break;
        }
      }
    }
    finalizeList();
  }
  const descMatch = bodyContent.match(/<!--\s*SECTION:DESCRIPTION:BEGIN\s*-->([\s\S]*?)<!--\s*SECTION:DESCRIPTION:END\s*-->/i);
  if (descMatch) {
    result.description = descMatch[1].trim();
  } else {
    const descHeaderMatch = bodyContent.match(/## Description\r?\n([\s\S]*?)(?=\r?\n## |$)/i);
    if (descHeaderMatch) {
      result.description = descHeaderMatch[1].trim();
    }
  }
  const acMatch = bodyContent.match(/<!--\s*AC:BEGIN\s*-->([\s\S]*?)<!--\s*AC:END\s*-->/i);
  const acText = acMatch ? acMatch[1] : bodyContent.match(/## Acceptance Criteria\r?\n([\s\S]*?)(?=\r?\n## |$)/i)?.[1] || "";
  if (acText) {
    const acLines = acText.split(/\r?\n/);
    const parsedAC = [];
    let autoIndex = 1;
    for (const line of acLines) {
      const match = line.match(/^-\s*\[([ xX])\]\s*(?:#(\d+)\s+)?(.*)$/);
      if (match) {
        const checked = match[1].toLowerCase() === "x";
        const num = match[2] ? parseInt(match[2], 10) : autoIndex++;
        const text = match[3].trim();
        parsedAC.push({ index: num, text, checked });
      }
    }
    result.acceptanceCriteria = parsedAC;
  }
  const planMatch = bodyContent.match(/<!--\s*SECTION:PLAN:BEGIN\s*-->([\s\S]*?)<!--\s*SECTION:PLAN:END\s*-->/i);
  if (planMatch) {
    result.implementationPlan = planMatch[1].trim();
  } else {
    const planHeaderMatch = bodyContent.match(/## Implementation Plan\r?\n([\s\S]*?)(?=\r?\n## |$)/i);
    if (planHeaderMatch) {
      result.implementationPlan = planHeaderMatch[1].trim();
    }
  }
  const notesMatch = bodyContent.match(/<!--\s*SECTION:NOTES:BEGIN\s*-->([\s\S]*?)<!--\s*SECTION:NOTES:END\s*-->/i);
  if (notesMatch) {
    result.implementationNotes = notesMatch[1].trim();
  }
  const summaryMatch = bodyContent.match(/<!--\s*SECTION:FINAL_SUMMARY:BEGIN\s*-->([\s\S]*?)<!--\s*SECTION:FINAL_SUMMARY:END\s*-->/i);
  if (summaryMatch) {
    result.finalSummary = summaryMatch[1].trim();
  }
  return result;
}
function serializeBacklogMd(task) {
  const frontmatterLines = ["---"];
  frontmatterLines.push(`id: ${task.id}`);
  frontmatterLines.push(`title: ${JSON.stringify(task.title || "Sin t\xEDtulo")}`);
  frontmatterLines.push(`status: ${formatStatusForMd(task.status)}`);
  if (task.assignees && task.assignees.length > 0) {
    frontmatterLines.push("assignee:");
    task.assignees.forEach((a) => frontmatterLines.push(`  - ${JSON.stringify(a)}`));
  }
  const nowStr = (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").slice(0, 16);
  frontmatterLines.push(`created_date: '${task.createdDate || nowStr}'`);
  frontmatterLines.push(`updated_date: '${nowStr}'`);
  if (task.labels && task.labels.length > 0) {
    frontmatterLines.push("labels:");
    task.labels.forEach((l) => frontmatterLines.push(`  - ${l}`));
  } else {
    frontmatterLines.push("labels: []");
  }
  if (task.dependencies && task.dependencies.length > 0) {
    frontmatterLines.push("dependencies:");
    task.dependencies.forEach((d) => frontmatterLines.push(`  - ${d}`));
  } else {
    frontmatterLines.push("dependencies: []");
  }
  frontmatterLines.push(`priority: ${formatPriorityForMd(task.priority || "p2")}`);
  if (task.type) {
    frontmatterLines.push(`type: ${task.type}`);
  }
  if (task.milestone) {
    frontmatterLines.push(`milestone: ${JSON.stringify(task.milestone)}`);
  }
  if (task.rawExtraFrontmatter) {
    for (const [k, v] of Object.entries(task.rawExtraFrontmatter)) {
      if (!["id", "title", "status", "assignee", "created_date", "updated_date", "labels", "dependencies", "priority", "type", "milestone"].includes(k.toLowerCase())) {
        frontmatterLines.push(`${k}: ${JSON.stringify(v)}`);
      }
    }
  }
  frontmatterLines.push("---");
  frontmatterLines.push("");
  const bodySections = [];
  bodySections.push("## Description\n");
  bodySections.push("<!-- SECTION:DESCRIPTION:BEGIN -->");
  bodySections.push(task.description || "Sin descripci\xF3n detallada.");
  bodySections.push("<!-- SECTION:DESCRIPTION:END -->\n");
  bodySections.push("## Acceptance Criteria\n");
  bodySections.push("<!-- AC:BEGIN -->");
  if (task.acceptanceCriteria && task.acceptanceCriteria.length > 0) {
    task.acceptanceCriteria.forEach((ac, i) => {
      const idx = ac.index || i + 1;
      const mark = ac.checked ? "x" : " ";
      bodySections.push(`- [${mark}] #${idx} ${ac.text}`);
    });
  } else {
    bodySections.push("- [ ] #1 Criterio de aceptaci\xF3n inicial definido.");
  }
  bodySections.push("<!-- AC:END -->\n");
  bodySections.push("## Implementation Plan\n");
  bodySections.push("<!-- SECTION:PLAN:BEGIN -->");
  if (task.implementationPlan) {
    bodySections.push(task.implementationPlan);
  } else {
    bodySections.push("1. Investigar archivos afectados.\n2. Implementar soluci\xF3n y pruebas.\n3. Validar con criterios de aceptaci\xF3n.");
  }
  bodySections.push("<!-- SECTION:PLAN:END -->\n");
  if (task.implementationNotes) {
    bodySections.push("## Implementation Notes\n");
    bodySections.push("<!-- SECTION:NOTES:BEGIN -->");
    bodySections.push(task.implementationNotes);
    bodySections.push("<!-- SECTION:NOTES:END -->\n");
  }
  if (task.finalSummary) {
    bodySections.push("## Final Summary\n");
    bodySections.push("<!-- SECTION:FINAL_SUMMARY:BEGIN -->");
    bodySections.push(task.finalSummary);
    bodySections.push("<!-- SECTION:FINAL_SUMMARY:END -->\n");
  }
  return `${frontmatterLines.join("\n")}
${bodySections.join("\n")}`;
}
function generateTaskFilename(id, title) {
  const cleanTitle = (title || "task").toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 50);
  const cleanId = id.toLowerCase();
  return `${cleanId} - ${cleanTitle}.md`;
}
function generateMonolithicBacklogMd(projectName, items) {
  const now = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const lines = [
    `# Backlog: ${projectName}`,
    `> Consolidado generado el ${now} por DevBoard \u26A1`,
    "",
    "## Resumen de Estados",
    ""
  ];
  const statuses = ["doing", "review", "ready", "draft", "done", "dismissed"];
  const grouped = {
    doing: [],
    review: [],
    ready: [],
    draft: [],
    done: [],
    dismissed: [],
    cancelled: []
  };
  for (const item of items) {
    const s = item.status || "draft";
    if (grouped[s]) grouped[s].push(item);
    else grouped.draft.push(item);
  }
  for (const s of statuses) {
    const list = grouped[s];
    if (list.length === 0) continue;
    const titleMap = {
      doing: "\u26A1 In Progress / Doing",
      review: "\u{1F50D} Review & QA",
      ready: "\u{1F680} Ready for Deploy",
      draft: "\u{1F4CB} Backlog / Draft",
      done: "\u2705 Done / Deployed",
      dismissed: "\u{1F4E6} Archivadas / Descartadas"
    };
    lines.push(`### ${titleMap[s] || s.toUpperCase()} (${list.length})`);
    lines.push("");
    for (const item of list) {
      lines.push(`#### [${item.id}] ${item.title}`);
      lines.push(`- **Prioridad**: \`${item.priority || "p2"}\` | **Tipo**: \`${item.type || "feature"}\``);
      if (item.milestone) lines.push(`- **Sprint / Milestone**: ${item.milestone}`);
      if (item.description) lines.push(`
${item.description}
`);
      if (item.acceptanceCriteria && item.acceptanceCriteria.length > 0) {
        lines.push("**Criterios de Aceptaci\xF3n:**");
        item.acceptanceCriteria.forEach((ac) => {
          lines.push(`- [${ac.checked ? "x" : " "}] #${ac.index} ${ac.text}`);
        });
        lines.push("");
      }
      lines.push("---");
      lines.push("");
    }
  }
  return lines.join("\n");
}

// scripts/mcp-server.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var ROOT_DIR = path.resolve(__dirname, "..");
var REGISTRY_FILE = path.join(ROOT_DIR, "data/projects-registry.json");
var DEMO_FILE = path.join(ROOT_DIR, "data/demo-backlog.json");
function getRegistry() {
  let reg = { activeProjectId: "", projects: [] };
  if (fs.existsSync(REGISTRY_FILE)) {
    try {
      reg = JSON.parse(fs.readFileSync(REGISTRY_FILE, "utf8"));
    } catch {
    }
  }
  const args = process.argv.slice(2);
  let cliRepo = null;
  const repoIdx = args.findIndex((a) => a === "--repo" || a === "-p");
  if (repoIdx !== -1 && args[repoIdx + 1]) {
    cliRepo = path.resolve(args[repoIdx + 1]);
  }
  const targetRepo = cliRepo || process.cwd();
  const hasMdBacklog = fs.existsSync(path.join(targetRepo, "backlog/tasks"));
  const hasJsonBacklog = fs.existsSync(path.join(targetRepo, ".devboard/backlog.json"));
  if (hasMdBacklog || hasJsonBacklog || cliRepo) {
    const existing = reg.projects.find((p) => p.repoPath && path.resolve(p.repoPath) === targetRepo);
    if (existing) {
      reg.activeProjectId = existing.id;
    } else {
      const folderName = path.basename(targetRepo);
      const synthId = folderName.toLowerCase().replace(/[^a-z0-9_-]/g, "-");
      const synthProject = {
        id: synthId,
        name: folderName,
        codePrefix: folderName.substring(0, 4).toUpperCase(),
        repoPath: targetRepo,
        storageType: hasMdBacklog ? "markdown" : "json",
        backlogDir: "backlog",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      reg.projects.unshift(synthProject);
      reg.activeProjectId = synthId;
    }
  }
  return reg;
}
function getTasksDir(project) {
  const dir = project.backlogDir || "backlog";
  return path.join(project.repoPath || ROOT_DIR, dir, "tasks");
}
function readTasksForProject(project) {
  if (project.storageType === "markdown" && project.repoPath) {
    const tasksDir = getTasksDir(project);
    if (!fs.existsSync(tasksDir)) return [];
    const files = fs.readdirSync(tasksDir).filter((f) => f.endsWith(".md"));
    files.sort((a, b) => a.localeCompare(b, void 0, { numeric: true }));
    const items = [];
    for (const file of files) {
      try {
        const raw = fs.readFileSync(path.join(tasksDir, file), "utf8");
        const fallbackId = file.split(" - ")[0] || file.replace(/\.md$/, "");
        const task = parseBacklogMd(raw, fallbackId);
        items.push({
          id: task.id,
          code: task.id,
          projectId: project.id,
          title: task.title,
          status: task.status,
          type: task.type || "feature",
          priority: task.priority,
          assignees: task.assignees || [],
          labels: task.labels || [],
          description: task.description,
          implementationPlan: task.implementationPlan,
          notes: task.implementationNotes,
          acceptanceCriteriaList: task.acceptanceCriteria,
          targetSprint: task.milestone,
          milestone: task.milestone,
          createdAt: task.createdDate ? `${task.createdDate}T00:00:00.000Z` : void 0,
          updatedAt: task.updatedDate ? `${task.updatedDate}T00:00:00.000Z` : void 0
        });
      } catch (err) {
      }
    }
    return items;
  }
  const filePath = project.isDemo ? DEMO_FILE : project.repoPath ? path.join(project.repoPath, ".devboard/backlog.json") : path.join(ROOT_DIR, `data/${project.id}-backlog.json`);
  if (fs.existsSync(filePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      return data.items || [];
    } catch {
    }
  }
  return [];
}
var TOOLS = [
  {
    name: "devboard_list_projects",
    description: "Lista los proyectos registrados en DevBoard, su ruta y motor de almacenamiento (Backlog.md vs JSON).",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "devboard_list_tasks",
    description: "Lista tareas del backlog con filtros opcionales (openOnly, search, limit, format compacto para m\xEDnimo consumo de tokens).",
    inputSchema: {
      type: "object",
      properties: {
        projectId: { type: "string", description: 'ID del proyecto (ej: "dev-board", "dom"). Si se omite lista el activo.' },
        status: {
          type: "string",
          description: 'Filtrar por estado: "draft", "doing", "review", "ready", "done", "dismissed", "cancelled".'
        },
        openOnly: {
          type: "boolean",
          description: "Si es true, excluye tareas en done, dismissed o cancelled, devolviendo solo tareas activas o en backlog."
        },
        priority: { type: "string", description: 'Filtrar por prioridad: "urgent", "high", "medium", "low".' },
        milestone: { type: "string", description: 'Filtrar por milestone o sprint (ej: "v1.1.0").' },
        search: { type: "string", description: "T\xE9rmino de b\xFAsqueda para filtrar en t\xEDtulo, c\xF3digo o etiquetas." },
        prefix: { type: "string", description: 'Filtrar por prefijo de c\xF3digo (ej: "FEAT-", "BUG-", "CORE-").' },
        taskIds: {
          type: "array",
          items: { type: "string" },
          description: 'Lista expl\xEDcita de IDs de tareas a consultar (ej: ["BUG-001", "BUG-002"]).'
        },
        limit: { type: "number", description: "L\xEDmite m\xE1ximo de tareas a retornar (ideal para no saturar ventana de tokens)." },
        offset: { type: "number", description: "Desplazamiento para paginaci\xF3n (por defecto 0)." },
        format: {
          type: "string",
          enum: ["detailed", "compact"],
          description: 'Formato de salida. "compact" devuelve una lista resumida de 1 l\xEDnea por tarea ideal para agentes (ahorra ~90% de tokens).'
        }
      }
    }
  },
  {
    name: "devboard_get_stats",
    description: "Obtiene m\xE9tricas agregadas del backlog: total de tareas, abiertas, cerradas, porcentaje completado, distribuci\xF3n por estado/prioridad y desglose agrupado por prefijos de c\xF3digo (ej: FEAT, BUG, CORE).",
    inputSchema: {
      type: "object",
      properties: {
        projectId: { type: "string", description: 'ID del proyecto (ej: "dev-board", "mi-proyecto"). Si se omite analiza el activo.' }
      }
    }
  },
  {
    name: "devboard_bulk_update_tasks",
    description: "Actualiza en lote m\xFAltiples tareas simult\xE1neamente (por lista de taskIds o por prefijo/filtro). Ideal para auditor\xEDas y limpiezas masivas sin hacer decenas de tool calls.",
    inputSchema: {
      type: "object",
      properties: {
        projectId: { type: "string", description: "ID del proyecto." },
        taskIds: {
          type: "array",
          items: { type: "string" },
          description: 'Lista expl\xEDcita de IDs de tareas a actualizar (ej: ["TASK-01", "TASK-02"]).'
        },
        filterPrefix: {
          type: "string",
          description: 'Prefijo de c\xF3digo para aplicar actualizaci\xF3n masiva (ej: "FEAT-", "EPIC-").'
        },
        filterStatus: {
          type: "string",
          description: 'Filtrar por estado actual antes de aplicar actualizaci\xF3n (ej: "draft").'
        },
        updates: {
          type: "object",
          description: "Campos a actualizar en todas las tareas coincidentes.",
          properties: {
            status: { type: "string", enum: ["draft", "doing", "review", "ready", "done", "dismissed", "cancelled"] },
            priority: { type: "string", enum: ["urgent", "high", "medium", "low"] },
            milestone: { type: "string" },
            implementationNotes: { type: "string" },
            labels: { type: "array", items: { type: "string" } }
          }
        }
      },
      required: ["updates"]
    }
  },
  {
    name: "devboard_get_task",
    description: "Obtiene el detalle completo de una tarea incluyendo Criterios de Aceptaci\xF3n (AC), Plan de Implementaci\xF3n y Notas.",
    inputSchema: {
      type: "object",
      properties: {
        taskId: { type: "string", description: 'C\xF3digo o ID de la tarea (ej: "DEV-001", "AUTH-012").' },
        projectId: { type: "string", description: "ID del proyecto (opcional si el c\xF3digo es \xFAnico)." }
      },
      required: ["taskId"]
    }
  },
  {
    name: "devboard_create_task",
    description: "Crea una nueva tarea en DevBoard (genera archivo .md individual si es Backlog.md o a\xF1ade al JSON).",
    inputSchema: {
      type: "object",
      properties: {
        projectId: { type: "string", description: 'ID del proyecto (ej: "dev-board").' },
        title: { type: "string", description: "T\xEDtulo descriptivo de la tarea." },
        description: { type: "string", description: "Descripci\xF3n t\xE9cnica o requerimiento detallado." },
        type: { type: "string", enum: ["feature", "bug", "tech_debt", "ux"], description: "Tipo de \xEDtem." },
        priority: { type: "string", enum: ["urgent", "high", "medium", "low"], description: "Prioridad." },
        status: { type: "string", enum: ["draft", "doing", "review", "ready", "done"], description: "Estado inicial." },
        acceptanceCriteria: {
          type: "array",
          items: { type: "string" },
          description: "Lista de criterios de aceptaci\xF3n en texto plano."
        },
        implementationPlan: { type: "string", description: "Plan t\xE9cnico paso a paso para la implementaci\xF3n." },
        milestone: { type: "string", description: "Sprint o milestone asignado." }
      },
      required: ["title"]
    }
  },
  {
    name: "devboard_update_task",
    description: "Actualiza el estado (draft, doing, review, ready, done), Criterios de Aceptaci\xF3n o Plan de Implementaci\xF3n de una tarea.",
    inputSchema: {
      type: "object",
      properties: {
        taskId: { type: "string", description: "C\xF3digo o ID de la tarea a actualizar." },
        projectId: { type: "string", description: "ID del proyecto." },
        status: { type: "string", enum: ["draft", "doing", "review", "ready", "done", "dismissed", "cancelled"] },
        title: { type: "string" },
        description: { type: "string" },
        priority: { type: "string", enum: ["urgent", "high", "medium", "low"] },
        implementationPlan: { type: "string", description: "Actualizaci\xF3n del plan t\xE9cnico." },
        toggleAcIndex: { type: "number", description: "\xCDndice de AC (1-indexed) a alternar como completado/pendiente." },
        milestone: { type: "string" }
      },
      required: ["taskId"]
    }
  },
  {
    name: "devboard_export_backlog",
    description: "Genera o actualiza el archivo BACKLOG.md consolidado en la ra\xEDz del repositorio del proyecto.",
    inputSchema: {
      type: "object",
      properties: {
        projectId: { type: "string", description: "ID del proyecto a consolidar." }
      }
    }
  },
  {
    name: "devboard_list_releases",
    description: "Lista las versiones, releases y notas de cambio estructuradas del proyecto, permitiendo contrastar tareas asociadas.",
    inputSchema: {
      type: "object",
      properties: {
        projectId: { type: "string", description: "ID del proyecto. Si se omite, usa el proyecto activo." },
        version: { type: "string", description: 'Versi\xF3n espec\xEDfica a consultar (ej: "v1.2.0" o "1.2.0"). Si se omite, devuelve todas.' }
      }
    }
  }
];
async function handleToolCall(name, args) {
  const registry = getRegistry();
  if (name === "devboard_list_projects") {
    return {
      activeProjectId: registry.activeProjectId,
      projects: registry.projects.map((p) => ({
        id: p.id,
        name: p.name,
        codePrefix: p.codePrefix,
        repoPath: p.repoPath,
        storageType: p.storageType || "json"
      }))
    };
  }
  if (name === "devboard_list_tasks") {
    const targetProject = registry.projects.find((p) => p.id === args.projectId) || registry.projects.find((p) => p.id === registry.activeProjectId) || registry.projects[0];
    if (!targetProject) throw new Error("No hay proyectos registrados en DevBoard.");
    let tasks = readTasksForProject(targetProject);
    if (args.openOnly) {
      const closedStatuses = ["done", "dismissed", "cancelled", "released"];
      tasks = tasks.filter((t) => !closedStatuses.includes(normalizeStatus(t.status)));
    }
    if (args.status) {
      const norm = normalizeStatus(args.status);
      tasks = tasks.filter((t) => normalizeStatus(t.status) === norm);
    }
    if (args.priority) {
      const normP = normalizePriority(args.priority);
      tasks = tasks.filter((t) => normalizePriority(t.priority) === normP);
    }
    if (args.milestone) {
      tasks = tasks.filter((t) => t.milestone === args.milestone || t.targetSprint === args.milestone);
    }
    if (args.prefix) {
      const pfx = String(args.prefix).toLowerCase();
      tasks = tasks.filter(
        (t) => t.id && t.id.toLowerCase().startsWith(pfx) || t.code && t.code.toLowerCase().startsWith(pfx)
      );
    }
    if (Array.isArray(args.taskIds) && args.taskIds.length > 0) {
      const idsLower = new Set(args.taskIds.map((id) => String(id).toLowerCase()));
      tasks = tasks.filter(
        (t) => t.id && idsLower.has(t.id.toLowerCase()) || t.code && idsLower.has(t.code.toLowerCase())
      );
    }
    if (args.search) {
      const q = String(args.search).toLowerCase();
      tasks = tasks.filter(
        (t) => t.title && t.title.toLowerCase().includes(q) || t.id && t.id.toLowerCase().includes(q) || t.labels && Array.isArray(t.labels) && t.labels.some((l) => l.toLowerCase().includes(q))
      );
    }
    const totalFiltered = tasks.length;
    const offset = typeof args.offset === "number" ? Math.max(0, args.offset) : 0;
    if (args.limit && typeof args.limit === "number" && args.limit > 0) {
      tasks = tasks.slice(offset, offset + args.limit);
    } else if (offset > 0) {
      tasks = tasks.slice(offset);
    }
    if (args.format === "compact") {
      return {
        projectId: targetProject.id,
        projectName: targetProject.name,
        storageType: targetProject.storageType,
        total: totalFiltered,
        showing: tasks.length,
        offset,
        items: tasks.map((t) => {
          const acInfo = t.acceptanceCriteriaList ? `${t.acceptanceCriteriaList.filter((ac) => ac.checked).length}/${t.acceptanceCriteriaList.length} AC` : "0/0 AC";
          const m = t.milestone || t.targetSprint ? ` [${t.milestone || t.targetSprint}]` : "";
          return `[${t.code || t.id}] (${t.status}/${t.priority}) ${t.title}${m} (${acInfo})`;
        })
      };
    }
    return {
      projectId: targetProject.id,
      projectName: targetProject.name,
      storageType: targetProject.storageType,
      total: totalFiltered,
      showing: tasks.length,
      offset,
      tasks: tasks.map((t) => ({
        id: t.code || t.id,
        title: t.title,
        status: t.status,
        priority: t.priority,
        type: t.type,
        milestone: t.milestone || t.targetSprint,
        acProgress: t.acceptanceCriteriaList ? `${t.acceptanceCriteriaList.filter((ac) => ac.checked).length}/${t.acceptanceCriteriaList.length} AC` : "0/0 AC"
      }))
    };
  }
  if (name === "devboard_get_stats") {
    const targetProject = registry.projects.find((p) => p.id === args.projectId) || registry.projects.find((p) => p.id === registry.activeProjectId) || registry.projects[0];
    if (!targetProject) throw new Error("No hay proyectos registrados en DevBoard.");
    const tasks = readTasksForProject(targetProject);
    const total = tasks.length;
    const closedStatuses = ["done", "dismissed", "cancelled", "released"];
    let openCount = 0;
    let doneCount = 0;
    const byStatus = {};
    const byPriority = {};
    const byPrefix = {};
    for (const t of tasks) {
      const s = normalizeStatus(t.status);
      const p = normalizePriority(t.priority);
      const isClosed = closedStatuses.includes(s);
      if (isClosed) doneCount++;
      else openCount++;
      byStatus[s] = (byStatus[s] || 0) + 1;
      byPriority[p] = (byPriority[p] || 0) + 1;
      const code = String(t.code || t.id || "");
      const parts = code.split("-");
      const prefix = parts.length > 2 ? `${parts[0]}-${parts[1]}` : parts[0] || "OTHER";
      if (!byPrefix[prefix]) {
        byPrefix[prefix] = { total: 0, open: 0, done: 0 };
      }
      byPrefix[prefix].total++;
      if (isClosed) byPrefix[prefix].done++;
      else byPrefix[prefix].open++;
    }
    const completionRate = total > 0 ? Math.round(doneCount / total * 100) : 0;
    return {
      projectId: targetProject.id,
      projectName: targetProject.name,
      storageType: targetProject.storageType,
      summary: {
        total,
        open: openCount,
        done: doneCount,
        completionRate: `${completionRate}%`
      },
      byStatus,
      byPriority,
      byPrefix
    };
  }
  if (name === "devboard_bulk_update_tasks") {
    const targetProject = registry.projects.find((p) => p.id === args.projectId) || registry.projects.find((p) => p.id === registry.activeProjectId) || registry.projects[0];
    if (!targetProject) throw new Error("No hay proyectos registrados en DevBoard.");
    const updates = args.updates || {};
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const cleanIds = Array.isArray(args.taskIds) ? new Set(args.taskIds.map((id) => String(id).toLowerCase())) : null;
    const pfxFilter = args.filterPrefix ? String(args.filterPrefix).toLowerCase() : null;
    const statusFilter = args.filterStatus ? normalizeStatus(args.filterStatus) : null;
    let updatedCount = 0;
    const updatedIds = [];
    if (targetProject.storageType === "markdown" && targetProject.repoPath) {
      const tasksDir = getTasksDir(targetProject);
      if (!fs.existsSync(tasksDir)) throw new Error("Carpeta de tareas no encontrada.");
      const files = fs.readdirSync(tasksDir).filter((f) => f.endsWith(".md"));
      for (const file of files) {
        try {
          const fullPath = path.join(tasksDir, file);
          const raw = fs.readFileSync(fullPath, "utf8");
          const fallbackId = file.split(" - ")[0] || file.replace(/\.md$/, "");
          const current = parseBacklogMd(raw, fallbackId);
          const taskId = String(current.id || fallbackId).toLowerCase();
          let match = false;
          if (cleanIds) {
            match = cleanIds.has(taskId);
          } else if (pfxFilter) {
            match = taskId.startsWith(pfxFilter);
          } else {
            match = true;
          }
          if (statusFilter && normalizeStatus(current.status) !== statusFilter) {
            match = false;
          }
          if (match) {
            if (updates.status) current.status = normalizeStatus(updates.status);
            if (updates.priority) current.priority = normalizePriority(updates.priority);
            if (updates.milestone !== void 0) current.milestone = updates.milestone;
            if (updates.implementationNotes !== void 0) current.implementationNotes = updates.implementationNotes;
            if (Array.isArray(updates.labels)) current.labels = updates.labels;
            current.updatedDate = today;
            const serialized = serializeBacklogMd(current);
            const canonicalName = generateTaskFilename(current.id, current.title);
            const canonicalPath = path.join(tasksDir, canonicalName);
            if (file !== canonicalName) {
              try {
                fs.unlinkSync(fullPath);
              } catch {
              }
            }
            fs.writeFileSync(canonicalPath, serialized, "utf8");
            updatedCount++;
            updatedIds.push(current.id);
          }
        } catch {
        }
      }
      return {
        ok: true,
        projectId: targetProject.id,
        storageType: "markdown",
        updatedCount,
        updatedIds
      };
    }
    const filePath = targetProject.isDemo ? DEMO_FILE : targetProject.repoPath ? path.join(targetProject.repoPath, ".devboard/backlog.json") : path.join(ROOT_DIR, `data/${targetProject.id}-backlog.json`);
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      const items = data.items || [];
      for (let i = 0; i < items.length; i++) {
        const current = items[i];
        const taskId = String(current.id || current.code || "").toLowerCase();
        let match = false;
        if (cleanIds) {
          match = cleanIds.has(taskId);
        } else if (pfxFilter) {
          match = taskId.startsWith(pfxFilter);
        } else {
          match = true;
        }
        if (statusFilter && normalizeStatus(current.status) !== statusFilter) {
          match = false;
        }
        if (match) {
          if (updates.status) current.status = normalizeStatus(updates.status);
          if (updates.priority) current.priority = normalizePriority(updates.priority);
          if (updates.milestone !== void 0) {
            current.milestone = updates.milestone;
            current.targetSprint = updates.milestone;
          }
          if (updates.implementationNotes !== void 0) {
            current.implementationNotes = updates.implementationNotes;
            current.fix = updates.implementationNotes;
          }
          if (Array.isArray(updates.labels)) current.labels = updates.labels;
          current.updatedAt = now;
          items[i] = current;
          updatedCount++;
          updatedIds.push(current.code || current.id);
        }
      }
      data.items = items;
      data.lastUpdated = now;
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
      return {
        ok: true,
        projectId: targetProject.id,
        storageType: "json",
        updatedCount,
        updatedIds
      };
    }
    throw new Error("No se pudo encontrar el archivo de almacenamiento del proyecto.");
  }
  if (name === "devboard_get_task") {
    const cleanId = String(args.taskId).toLowerCase();
    for (const p of registry.projects) {
      if (args.projectId && p.id !== args.projectId) continue;
      const tasks = readTasksForProject(p);
      const match = tasks.find(
        (t) => t.id && t.id.toLowerCase() === cleanId || t.code && t.code.toLowerCase() === cleanId
      );
      if (match) {
        return {
          found: true,
          project: { id: p.id, name: p.name, storageType: p.storageType },
          task: match
        };
      }
    }
    throw new Error(`Tarea ${args.taskId} no encontrada.`);
  }
  if (name === "devboard_create_task") {
    const project = registry.projects.find((p) => p.id === args.projectId) || registry.projects.find((p) => p.id === registry.activeProjectId) || registry.projects[0];
    if (!project) throw new Error("Proyecto no encontrado.");
    const tasks = readTasksForProject(project);
    const code = `${project.codePrefix}-${String(tasks.length + 1).padStart(3, "0")}`;
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const acList = (args.acceptanceCriteria || []).map((text, i) => ({
      index: i + 1,
      text,
      checked: false
    }));
    const taskData = {
      id: code,
      title: args.title,
      status: normalizeStatus(args.status || "draft"),
      priority: normalizePriority(args.priority || "medium"),
      type: args.type || "feature",
      createdDate: today,
      updatedDate: today,
      milestone: args.milestone,
      description: args.description || "",
      acceptanceCriteria: acList,
      implementationPlan: args.implementationPlan || ""
    };
    if (project.storageType === "markdown" && project.repoPath) {
      const tasksDir = getTasksDir(project);
      if (!fs.existsSync(tasksDir)) fs.mkdirSync(tasksDir, { recursive: true });
      const filename = generateTaskFilename(code, args.title);
      const filepath = path.join(tasksDir, filename);
      fs.writeFileSync(filepath, serializeBacklogMd(taskData), "utf8");
      return { ok: true, task: taskData, savedFile: filepath };
    }
    const filePath = project.isDemo ? DEMO_FILE : project.repoPath ? path.join(project.repoPath, ".devboard/backlog.json") : path.join(ROOT_DIR, `data/${project.id}-backlog.json`);
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const newItem = {
      ...taskData,
      code,
      projectId: project.id,
      acceptanceCriteriaList: acList,
      createdAt: now,
      updatedAt: now
    };
    let existingData = { project, items: [], releases: [] };
    if (fs.existsSync(filePath)) {
      existingData = JSON.parse(fs.readFileSync(filePath, "utf8"));
    }
    existingData.items.push(newItem);
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2), "utf8");
    return { ok: true, task: newItem, savedFile: filePath };
  }
  if (name === "devboard_update_task") {
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const now = (/* @__PURE__ */ new Date()).toISOString();
    for (const project of registry.projects) {
      if (args.projectId && project.id !== args.projectId) continue;
      if (project.storageType === "markdown" && project.repoPath) {
        const tasksDir = getTasksDir(project);
        if (!fs.existsSync(tasksDir)) continue;
        const files = fs.readdirSync(tasksDir).filter((f) => f.endsWith(".md"));
        const cleanId = String(args.taskId).toLowerCase();
        let resolvedFile = files.find((f) => {
          const fLower = f.toLowerCase();
          return fLower.startsWith(`${cleanId} `) || fLower === `${cleanId}.md` || fLower.startsWith(`${cleanId}-`);
        });
        if (!resolvedFile) {
          for (const f of files) {
            try {
              const raw = fs.readFileSync(path.join(tasksDir, f), "utf8");
              const fallbackId = f.split(" - ")[0] || f.replace(/\.md$/, "");
              const task = parseBacklogMd(raw, fallbackId);
              if (task.id && task.id.toLowerCase() === cleanId) {
                resolvedFile = f;
                break;
              }
            } catch {
            }
          }
        }
        if (resolvedFile) {
          const fullPath = path.join(tasksDir, resolvedFile);
          const raw = fs.readFileSync(fullPath, "utf8");
          const current = parseBacklogMd(raw, args.taskId);
          if (args.status) current.status = normalizeStatus(args.status);
          if (args.title) current.title = args.title;
          if (args.description !== void 0) current.description = args.description;
          if (args.priority) current.priority = normalizePriority(args.priority);
          if (args.implementationPlan !== void 0) current.implementationPlan = args.implementationPlan;
          if (args.milestone !== void 0) current.milestone = args.milestone;
          current.updatedDate = today;
          if (args.toggleAcIndex !== void 0 && current.acceptanceCriteria) {
            current.acceptanceCriteria = current.acceptanceCriteria.map(
              (ac) => ac.index === args.toggleAcIndex ? { ...ac, checked: !ac.checked } : ac
            );
          }
          const serialized = serializeBacklogMd(current);
          const canonicalName = generateTaskFilename(current.id, current.title);
          const canonicalPath = path.join(tasksDir, canonicalName);
          if (resolvedFile !== canonicalName) {
            try {
              fs.unlinkSync(fullPath);
            } catch {
            }
          }
          fs.writeFileSync(canonicalPath, serialized, "utf8");
          return { ok: true, updatedTask: current, filePath: canonicalPath };
        }
      } else {
        const filePath = project.isDemo ? DEMO_FILE : project.repoPath ? path.join(project.repoPath, ".devboard/backlog.json") : path.join(ROOT_DIR, `data/${project.id}-backlog.json`);
        if (fs.existsSync(filePath)) {
          const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
          const cleanId = String(args.taskId).toLowerCase();
          const idx = data.items.findIndex(
            (i) => i.id && String(i.id).toLowerCase() === cleanId || i.code && String(i.code).toLowerCase() === cleanId
          );
          if (idx >= 0) {
            const current = data.items[idx];
            if (args.status) current.status = normalizeStatus(args.status);
            if (args.title) current.title = args.title;
            if (args.description !== void 0) current.description = args.description;
            if (args.priority) current.priority = normalizePriority(args.priority);
            if (args.implementationPlan !== void 0) current.implementationPlan = args.implementationPlan;
            if (args.milestone !== void 0) current.milestone = args.milestone;
            current.updatedAt = now;
            if (args.toggleAcIndex !== void 0 && current.acceptanceCriteriaList) {
              current.acceptanceCriteriaList = current.acceptanceCriteriaList.map(
                (ac) => ac.index === args.toggleAcIndex ? { ...ac, checked: !ac.checked } : ac
              );
            }
            data.items[idx] = current;
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
            return { ok: true, updatedTask: current, filePath };
          }
        }
      }
    }
    throw new Error(`Tarea ${args.taskId} no encontrada para actualizar.`);
  }
  if (name === "devboard_export_backlog") {
    const project = registry.projects.find((p) => p.id === args.projectId) || registry.projects.find((p) => p.id === registry.activeProjectId) || registry.projects[0];
    if (!project) throw new Error("Proyecto no encontrado.");
    const tasks = readTasksForProject(project);
    const mdTasks = tasks.map((t) => ({
      id: t.code || t.id,
      title: t.title,
      status: normalizeStatus(t.status),
      type: t.type,
      priority: t.priority,
      milestone: t.milestone || t.targetSprint,
      description: t.description,
      acceptanceCriteria: t.acceptanceCriteriaList || []
    }));
    const content = generateMonolithicBacklogMd(project.name, mdTasks);
    let savedPath = null;
    if (project.repoPath) {
      savedPath = path.join(project.repoPath, "BACKLOG.md");
      fs.writeFileSync(savedPath, content, "utf8");
    }
    return {
      ok: true,
      savedPath,
      taskCount: tasks.length
    };
  }
  if (name === "devboard_list_releases") {
    const targetProject = registry.projects.find((p) => p.id === args.projectId) || registry.projects.find((p) => p.id === registry.activeProjectId) || registry.projects[0];
    if (!targetProject) throw new Error("No hay proyectos registrados en DevBoard.");
    let releases = [];
    const repoPath = targetProject.repoPath || ROOT_DIR;
    const releasesJsonPath = path.join(repoPath, targetProject.backlogDir || "backlog", "releases.json");
    const legacyReleasesPath = path.join(repoPath, ".devboard/releases.json");
    const dataReleasesPath = path.join(ROOT_DIR, "data/releases.json");
    if (fs.existsSync(releasesJsonPath)) {
      try {
        releases = JSON.parse(fs.readFileSync(releasesJsonPath, "utf8"));
      } catch {
      }
    } else if (fs.existsSync(legacyReleasesPath)) {
      try {
        releases = JSON.parse(fs.readFileSync(legacyReleasesPath, "utf8"));
      } catch {
      }
    } else if (fs.existsSync(dataReleasesPath)) {
      try {
        releases = JSON.parse(fs.readFileSync(dataReleasesPath, "utf8"));
      } catch {
      }
    }
    if (releases.length === 0) {
      const notesPaths = [
        path.join(repoPath, "docs/RELEASE_NOTES.md"),
        path.join(repoPath, "RELEASE_NOTES.md"),
        path.join(repoPath, "CHANGELOG.md")
      ];
      for (const np of notesPaths) {
        if (fs.existsSync(np)) {
          try {
            const content = fs.readFileSync(np, "utf8");
            const versionHeaderRegex = /^##\s*\[?([vV]?\d+\.\d+\.?\d*[^\]\n]*)\]?(?:\s*-\s*(\d{4}-\d{2}-\d{2}))?/gm;
            let match;
            while ((match = versionHeaderRegex.exec(content)) !== null) {
              releases.push({
                version: match[1].trim(),
                date: match[2] || "",
                title: `Release ${match[1].trim()}`,
                itemCodes: []
              });
            }
          } catch {
          }
          if (releases.length > 0) break;
        }
      }
    }
    const allTasks = readTasksForProject(targetProject);
    if (args.version) {
      const vClean = String(args.version).trim().toLowerCase().replace(/^v/, "");
      const foundRelease = releases.find((r) => String(r.version).toLowerCase().replace(/^v/, "") === vClean);
      if (!foundRelease) {
        return {
          project: targetProject.id,
          version: args.version,
          found: false,
          message: `No se encontr\xF3 el release para la versi\xF3n "${args.version}".`,
          availableVersions: releases.map((r) => r.version)
        };
      }
      const relatedCodes = new Set((foundRelease.itemCodes || []).map((c) => c.toLowerCase()));
      const relatedTasks = allTasks.filter((t) => {
        const idLower = String(t.id || t.code || "").toLowerCase();
        if (relatedCodes.has(idLower)) return true;
        const mLower = String(t.milestone || t.targetSprint || "").toLowerCase().replace(/^v/, "");
        return mLower === vClean;
      });
      return {
        project: targetProject.id,
        release: foundRelease,
        taskCount: relatedTasks.length,
        tasks: relatedTasks.map((t) => ({
          id: t.id,
          title: t.title,
          status: t.status,
          priority: t.priority,
          type: t.type
        }))
      };
    }
    return {
      project: targetProject.id,
      totalReleases: releases.length,
      releases: releases.map((r) => ({
        version: r.version,
        date: r.date,
        title: r.title,
        itemCount: Array.isArray(r.itemCodes) ? r.itemCodes.length : 0,
        itemCodes: r.itemCodes || []
      }))
    };
  }
  throw new Error(`Herramienta desconocida: ${name}`);
}
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});
function sendJsonRpc(response) {
  process.stdout.write(JSON.stringify(response) + "\n");
}
rl.on("line", async (line) => {
  if (!line.trim()) return;
  try {
    const request = JSON.parse(line);
    const { id, method, params } = request;
    if (method === "initialize") {
      sendJsonRpc({
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: {
            tools: {}
          },
          serverInfo: {
            name: "devboard-mcp",
            version: "1.0.0"
          }
        }
      });
      return;
    }
    if (method === "notifications/initialized") {
      return;
    }
    if (method === "tools/list") {
      sendJsonRpc({
        jsonrpc: "2.0",
        id,
        result: {
          tools: TOOLS
        }
      });
      return;
    }
    if (method === "tools/call") {
      const toolName = params?.name;
      const toolArgs = params?.arguments || {};
      try {
        const result = await handleToolCall(toolName, toolArgs);
        sendJsonRpc({
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2)
              }
            ]
          }
        });
      } catch (toolErr) {
        sendJsonRpc({
          jsonrpc: "2.0",
          id,
          result: {
            isError: true,
            content: [
              {
                type: "text",
                text: `Error ejecutando ${toolName}: ${toolErr.message}`
              }
            ]
          }
        });
      }
      return;
    }
    if (id !== void 0) {
      sendJsonRpc({
        jsonrpc: "2.0",
        id,
        error: {
          code: -32601,
          message: `M\xE9todo desconocido: ${method}`
        }
      });
    }
  } catch (parseErr) {
    sendJsonRpc({
      jsonrpc: "2.0",
      id: null,
      error: {
        code: -32700,
        message: "Parse error: invalid JSON"
      }
    });
  }
});
