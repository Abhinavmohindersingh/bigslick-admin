import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  BarChart3,
  List,
  Calendar,
  TrendingUp,
  Edit,
  Trash2,
  GripVertical,
} from "lucide-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "createTicket", label: "Create Ticket", icon: Plus },
  { id: "tasks", label: "Tasks", icon: List },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "reports", label: "Reports", icon: TrendingUp },
];

const teamMembers = [
  { id: "AK", name: "Abhinav" },
  { id: "BS", name: "Brent" },
];

type TaskStatus = "todo" | "in-progress" | "review" | "done";

type TicketFormData = {
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  assignedTo: string;
  dueDate: string;
  tags: string;
  status: TaskStatus;
};

type Task = {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  assignedTo: string;
  dueDate: string;
  tags: string[];
  status: TaskStatus;
  createdAt: string;
};

type Column = {
  id: TaskStatus;
  label: string;
  bg: string;
};

const statusGroups: Column[] = [
  { id: "todo", label: "To Do", bg: "bg-gray-700/40" },
  { id: "in-progress", label: "In Progress", bg: "bg-blue-900/40" },
  { id: "review", label: "In Testing", bg: "bg-yellow-800/30" },
  { id: "done", label: "Production Ready", bg: "bg-green-800/30" },
];

const getPriorityLabel = (p: string) => p.charAt(0).toUpperCase() + p.slice(1);
const getPriorityBg = (p: string) => {
  switch (p) {
    case "low":
      return "bg-green-600";
    case "medium":
      return "bg-blue-600";
    case "high":
      return "bg-orange-600";
    case "urgent":
      return "bg-red-600";
    default:
      return "bg-gray-600";
  }
};

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export default function ProjectManagement() {
  const [activeView, setActiveView] = useState<
    "dashboard" | "createTicket" | "tasks" | "calendar" | "reports"
  >("dashboard");
  const [formData, setFormData] = useState<TicketFormData>({
    title: "",
    description: "",
    priority: "medium",
    assignedTo: "",
    dueDate: "",
    tags: "",
    status: "todo",
  });
  const [tasksByColumn, setTasksByColumn] = useState<
    Record<TaskStatus, Task[]>
  >({
    todo: [],
    "in-progress": [],
    review: [],
    done: [],
  });
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [pendingStatus, setPendingStatus] = useState<TaskStatus | null>(null);

  // Persistence + sample data
  useEffect(() => {
    const saved = localStorage.getItem("pm-tasks");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTasksByColumn(parsed);
      } catch (e) {
        console.error("Failed to parse saved tasks", e);
      }
    } else {
      // Sample data for first visit
      const samples: Task[] = [
        {
          id: "1",
          title: "Implement user authentication",
          description: "Set up JWT with refresh tokens",
          priority: "urgent",
          assignedTo: "John Smith",
          dueDate: "2025-11-18",
          tags: ["backend", "security"],
          status: "in-progress",
          createdAt: "2025-11-01T10:00:00Z",
        },
        {
          id: "2",
          title: "Fix mobile responsive header",
          description: "Header overlaps content on small screens",
          priority: "high",
          assignedTo: "Sarah Johnson",
          dueDate: "2025-11-19",
          tags: ["bug", "ui"],
          status: "todo",
          createdAt: "2025-11-10T12:00:00Z",
        },
        {
          id: "3",
          title: "Update API documentation",
          description: "Add new endpoints to Swagger",
          priority: "medium",
          assignedTo: "Mike Davis",
          dueDate: "",
          tags: ["docs"],
          status: "review",
          createdAt: "2025-11-05T09:00:00Z",
        },
        {
          id: "4",
          title: "Deploy v2.1 to production",
          description: "Final deployment after QA sign-off",
          priority: "high",
          assignedTo: "Alex Wilson",
          dueDate: "2025-11-15",
          tags: ["devops"],
          status: "done",
          createdAt: "2025-11-12T14:00:00Z",
        },
        {
          id: "5",
          title: "Add dark mode toggle",
          description: "User-requested feature",
          priority: "low",
          assignedTo: "Emma Brown",
          dueDate: "2025-12-01",
          tags: ["ui", "feature"],
          status: "todo",
          createdAt: "2025-11-16T15:00:00Z",
        },
      ];
      setTasksByColumn({
        todo: samples.filter((t) => t.status === "todo"),
        "in-progress": samples.filter((t) => t.status === "in-progress"),
        review: samples.filter((t) => t.status === "review"),
        done: samples.filter((t) => t.status === "done"),
      });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("pm-tasks", JSON.stringify(tasksByColumn));
  }, [tasksByColumn]);

  // Prefill status when adding from a column
  useEffect(() => {
    if (pendingStatus && activeView === "createTicket" && !editingTaskId) {
      setFormData((prev) => ({ ...prev, status: pendingStatus }));
      setPendingStatus(null);
    }
  }, [pendingStatus, activeView, editingTaskId]);

  const allTasks = useMemo<Task[]>(
    () => Object.values(tasksByColumn).flat(),
    [tasksByColumn]
  );

  const tasksByDueDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    allTasks.forEach((task) => {
      if (task.dueDate) {
        const key = task.dueDate;
        if (!map[key]) map[key] = [];
        map[key].push(task);
      }
    });
    return map;
  }, [allTasks]);

  const isOverdue = (task: Task) =>
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "done";

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArray = formData.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingTaskId) {
      // Update existing
      setTasksByColumn((prev) => {
        const newCols = {
          todo: [...prev.todo],
          "in-progress": [...prev["in-progress"]],
          review: [...prev.review],
          done: [...prev.done],
        };
        let found = false;
        for (const stat of Object.keys(newCols) as TaskStatus[]) {
          const idx = newCols[stat].findIndex((t) => t.id === editingTaskId);
          if (idx !== -1) {
            const oldTask = newCols[stat][idx];
            const updatedTask: Task = {
              ...oldTask,
              title: formData.title,
              description: formData.description,
              priority: formData.priority,
              assignedTo: formData.assignedTo,
              dueDate: formData.dueDate,
              tags: tagsArray,
              status: formData.status,
            };
            newCols[stat].splice(idx, 1);
            newCols[formData.status].unshift(updatedTask);
            found = true;
            break;
          }
        }
        return newCols;
      });
      setEditingTaskId(null);
      alert("Ticket updated!");
    } else {
      // Create new
      const newTask: Task = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        assignedTo: formData.assignedTo,
        dueDate: formData.dueDate,
        tags: tagsArray,
        status: formData.status,
        createdAt: new Date().toISOString(),
      };
      setTasksByColumn((prev) => ({
        ...prev,
        [formData.status]: [newTask, ...prev[formData.status]],
      }));
      alert("Ticket created!");
    }

    setFormData({
      title: "",
      description: "",
      priority: "medium",
      assignedTo: "",
      dueDate: "",
      tags: "",
      status: "todo",
    });
    setActiveView("tasks");
  };

  const handleEdit = (task: Task) => () => {
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      assignedTo: task.assignedTo,
      dueDate: task.dueDate,
      tags: task.tags.join(", "),
      status: task.status,
    });
    setEditingTaskId(task.id);
    setActiveView("createTicket");
  };

  const handleDelete = (task: Task) => () => {
    if (window.confirm("Delete this task permanently?")) {
      setTasksByColumn((prev) => ({
        ...prev,
        [task.status]: prev[task.status].filter((t) => t.id !== task.id),
      }));
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    setTasksByColumn((prev) => {
      const newCols = {
        todo: [...prev.todo],
        "in-progress": [...prev["in-progress"]],
        review: [...prev.review],
        done: [...prev.done],
      };
      const sourceCol = newCols[source.droppableId as TaskStatus];
      const [moved] = sourceCol.splice(source.index, 1);
      moved.status = destination.droppableId as TaskStatus;
      newCols[destination.droppableId as TaskStatus].splice(
        destination.index,
        0,
        moved
      );
      return newCols;
    });
  };

  return (
    <div className="p-6 min-h-screen bg-gray-900 text-white">
      {/* Tabs */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 mb-6">
        <nav className="flex space-x-8 px-6 border-b border-gray-700/50">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? "border-orange-500 text-orange-400"
                    : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600"
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Dashboard */}
      {activeView === "dashboard" && (
        <div>
          <h1 className="text-3xl font-bold mb-8">Project Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {statusGroups.map((col) => {
              const count = tasksByColumn[col.id].length;
              return (
                <div
                  key={col.id}
                  className={`p-6 rounded-xl border border-gray-700 ${col.bg}`}
                >
                  <h3 className="text-lg font-medium text-gray-300">
                    {col.label}
                  </h3>
                  <p className="text-4xl font-bold mt-4">{count}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-4">Recent Tasks</h3>
              {allTasks.length === 0 ? (
                <p className="text-gray-500">No tasks yet</p>
              ) : (
                <ul className="space-y-3">
                  {[...allTasks]
                    .sort(
                      (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                    )
                    .slice(0, 5)
                    .map((task) => (
                      <li
                        key={task.id}
                        className="flex justify-between text-sm"
                      >
                        <span>{task.title}</span>
                        <span className="text-gray-400">
                          {formatDate(task.createdAt)}
                        </span>
                      </li>
                    ))}
                </ul>
              )}
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-4">Overdue Tasks</h3>
              {allTasks.filter(isOverdue).length === 0 ? (
                <p className="text-gray-500">No overdue tasks</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {allTasks.filter(isOverdue).map((task) => (
                    <li key={task.id}>
                      {task.title} (due {formatDate(task.dueDate)})
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Ticket */}
      {activeView === "createTicket" && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 max-w-4xl">
          <h2 className="text-2xl font-semibold flex items-center gap-2 mb-6">
            <Plus className="w-6 h-6 text-orange-400" />
            {editingTaskId ? "Edit Ticket" : "Create New Ticket"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-300">
                Title
              </label>
              <input
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full rounded-lg bg-gray-700 border border-gray-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-300">
                Description
              </label>
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full rounded-lg bg-gray-700 border border-gray-600 px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-300">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full rounded-lg bg-gray-700 border border-gray-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-300">
                  Assigned To
                </label>
                <select
                  name="assignedTo"
                  required
                  value={formData.assignedTo}
                  onChange={handleChange}
                  className="w-full rounded-lg bg-gray-700 border border-gray-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select member</option>
                  {teamMembers.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-300">
                  Due Date
                </label>
                <input
                  name="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="w-full rounded-lg bg-gray-700 border border-gray-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-300">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-lg bg-gray-700 border border-gray-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {statusGroups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-300">
                Tags (comma separated)
              </label>
              <input
                name="tags"
                type="text"
                value={formData.tags}
                onChange={handleChange}
                placeholder="bug, ui, backend"
                className="w-full rounded-lg bg-gray-700 border border-gray-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 font-semibold hover:from-orange-600 hover:to-red-600 transition"
              >
                {editingTaskId ? "Update Ticket" : "Create Ticket"}
              </button>
              {editingTaskId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingTaskId(null);
                    setFormData({
                      title: "",
                      description: "",
                      priority: "medium",
                      assignedTo: "",
                      dueDate: "",
                      tags: "",
                      status: "todo",
                    });
                    setActiveView("tasks");
                  }}
                  className="px-6 py-3 rounded-lg border border-gray-600 hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Tasks - Kanban */}
      {activeView === "tasks" && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Kanban Board</h2>
            <button
              onClick={() => setActiveView("createTicket")}
              className="flex items-center gap-2 bg-orange-500 px-5 py-2 rounded-lg hover:bg-orange-600 transition"
            >
              <Plus className="w-5 h-5" /> New Ticket
            </button>
          </div>

          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-6 overflow-x-auto pb-8">
              {statusGroups.map((col) => {
                const columnTasks = tasksByColumn[col.id];
                return (
                  <div key={col.id} className="flex-shrink-0 w-80">
                    <div className="bg-gray-800/50 rounded-xl border border-gray-700">
                      <div className={`px-5 py-3 rounded-t-xl ${col.bg}`}>
                        <h3 className="font-semibold">
                          {col.label}{" "}
                          <span className="ml-2 text-sm opacity-80">
                            ({columnTasks.length})
                          </span>
                        </h3>
                      </div>

                      <Droppable droppableId={col.id}>
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="p-4 min-h-96"
                          >
                            {columnTasks.length === 0 && (
                              <p className="text-center text-gray-500 py-12">
                                No tasks here
                              </p>
                            )}
                            {columnTasks.map((task, index) => (
                              <Draggable
                                key={task.id}
                                draggableId={task.id}
                                index={index}
                              >
                                {(prov, snap) => (
                                  <div
                                    ref={prov.innerRef}
                                    {...prov.draggableProps}
                                    className={`mb-3 rounded-lg bg-gray-900 border ${
                                      snap.isDragging
                                        ? "border-orange-500 shadow-2xl"
                                        : "border-gray-700"
                                    } p-4 relative group transition-all`}
                                  >
                                    <div
                                      {...prov.dragHandleProps}
                                      className="absolute left-3 top-5 cursor-grab active:cursor-grabbing"
                                    >
                                      <GripVertical className="w-5 h-5 text-gray-600" />
                                    </div>

                                    <div className="pr-16 pl-10">
                                      <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-medium text-lg">
                                          {task.title}
                                        </h4>
                                        <span
                                          className={`text-xs px-2 py-1 rounded-full ${getPriorityBg(
                                            task.priority
                                          )} text-white`}
                                        >
                                          {getPriorityLabel(task.priority)}
                                        </span>
                                      </div>

                                      {task.description && (
                                        <p className="text-sm text-gray-400 mb-3">
                                          {task.description}
                                        </p>
                                      )}

                                      <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-xs font-medium">
                                          {task.assignedTo
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                        </div>
                                        <span className="text-sm">
                                          {task.assignedTo}
                                        </span>
                                      </div>

                                      {task.dueDate && (
                                        <div
                                          className={`text-xs ${
                                            isOverdue(task)
                                              ? "text-red-400"
                                              : "text-gray-500"
                                          }`}
                                        >
                                          Due {formatDate(task.dueDate)}
                                        </div>
                                      )}

                                      {task.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-3">
                                          {task.tags.map((tag) => (
                                            <span
                                              key={tag}
                                              className="text-xs bg-gray-700 px-2 py-1 rounded"
                                            >
                                              {tag}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>

                                    <div className="absolute right-3 top-4 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                      <button onClick={handleEdit(task)}>
                                        <Edit className="w-4 h-4 text-gray-400 hover:text-white" />
                                      </button>
                                      <button onClick={handleDelete(task)}>
                                        <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>

                      <div className="border-t border-gray-700 p-4">
                        <button
                          onClick={() => {
                            setPendingStatus(col.id);
                            setActiveView("createTicket");
                          }}
                          className="flex w-full items-center gap-2 text-sm text-gray-400 hover:text-orange-400 transition"
                        >
                          <Plus className="w-4 h-4" /> Add a task
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </DragDropContext>
        </div>
      )}

      {/* Calendar */}
      {activeView === "calendar" && (
        <div>
          <h1 className="text-3xl font-bold mb-6">Calendar View</h1>
          {Object.keys(tasksByDueDate).length === 0 ? (
            <p className="text-gray-400">No tasks with due dates</p>
          ) : (
            <div className="space-y-8">
              {Object.keys(tasksByDueDate)
                .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
                .map((date) => (
                  <div
                    key={date}
                    className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
                  >
                    <h3 className="text-xl font-semibold mb-4">
                      {new Date(date).toLocaleDateString(undefined, {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </h3>
                    <ul className="space-y-3">
                      {tasksByDueDate[date].map((task) => (
                        <li
                          key={task.id}
                          className="flex justify-between items-center text-sm"
                        >
                          <span>{task.title}</span>
                          <span className="text-gray-400">
                            {task.status.replace("-", " ")}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Reports */}
      {activeView === "reports" && (
        <div>
          <h1 className="text-3xl font-bold mb-6">Reports</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Completion Rate</h3>
              <p className="text-4xl font-bold">
                {allTasks.length === 0
                  ? 0
                  : Math.round(
                      (tasksByColumn.done.length / allTasks.length) * 100
                    )}
                %
              </p>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Total Tasks</h3>
              <p className="text-4xl font-bold">{allTasks.length}</p>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Overdue</h3>
              <p className="text-4xl font-bold text-red-400">
                {allTasks.filter(isOverdue).length}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
              <h3 className="text-xl font-semibold mb-4">Tasks by Priority</h3>
              <div className="space-y-4">
                {(["urgent", "high", "medium", "low"] as const).map((p) => (
                  <div
                    key={p}
                    className="flex justify-between items-center text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full ${getPriorityBg(p)}`}
                      />
                      <span>{getPriorityLabel(p)}</span>
                    </div>
                    <span>
                      {allTasks.filter((t) => t.priority === p).length}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
              <h3 className="text-xl font-semibold mb-4">
                Tasks by Team Member
              </h3>
              <div className="space-y-4">
                {teamMembers.map((m) => (
                  <div
                    key={m.id}
                    className="flex justify-between items-center text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-xs font-medium">
                        {m.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <span>{m.name}</span>
                    </div>
                    <span>
                      {allTasks.filter((t) => t.assignedTo === m.name).length}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
