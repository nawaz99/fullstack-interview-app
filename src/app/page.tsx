
"use client";

import { useCallback, useEffect, useState } from "react";

type Task = {
  id: string;
  title: string;
  completed: boolean;
};

export default function Home() {
  const [title, setTitle] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<
    "all" | "pending" | "completed"
  >("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // GET: Fetch tasks from the backend
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/tasks");
      const data = await response.json();


      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch tasks");
      }

      setTasks(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // POST: Add a new task
  async function addTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    setError("");

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmedTitle }),
      });

      const newTask = await response.json();
      console.log(newTask);

      if (!response.ok) {
        throw new Error(newTask.message || "Failed to add task");
      }

      setTasks((previous) => [...previous, newTask]);
      setTitle("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add task"
      );
    }
  }

  // PATCH: Update task completion status
  async function toggleTask(task: Task) {
    setError("");

    try {
      const response = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: task.id,
          completed: !task.completed,
        }),
      });

      const updatedTask = await response.json();

      if (!response.ok) {
        throw new Error(updatedTask.message || "Failed to update task");
      }

      setTasks((previous) =>
        previous.map((item) =>
          item.id === updatedTask.id ? updatedTask : item
        )
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update task"
      );
    }
  }

  // DELETE: Remove a task
  async function deleteTask(id: string) {
    setError("");

    try {
      const response = await fetch("/api/tasks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete task");
      }

      setTasks((previous) =>
        previous.filter((task) => task.id !== id)
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete task"
      );
    }
  }

  const completedCount = tasks.filter(
    (task) => task.completed
  ).length;

  const filteredTasks = tasks.filter((task) => {
    if (filter === "pending") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  return (
    <main className="dashboard">
      <header className="page-header">
        <div>
          <p className="eyebrow">FULL-STACK INTERVIEW PROJECT</p>
          <h1>Task Dashboard</h1>
          <p className="subtitle">
            Organize your work, one task at a time.
          </p>
        </div>

        <span className="project-badge">React + Next.js</span>
      </header>

      <section className="stats">
        <article className="stat-card">
          <span>Total tasks</span>
          <strong>{tasks.length}</strong>
        </article>

        <article className="stat-card">
          <span>Pending</span>
          <strong>{tasks.length - completedCount}</strong>
        </article>

        <article className="stat-card">
          <span>Completed</span>
          <strong>{completedCount}</strong>
        </article>
      </section>

      <section className="panel">
        <h2>Add a new task</h2>

        <form className="task-form" onSubmit={addTask}>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What do you need to do?"
            aria-label="Task title"
          />

          <button type="submit" disabled={!title.trim()}>
            Add task
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="list-header">
          <h2>Your tasks</h2>

          <select
            value={filter}
            onChange={(event) =>
              setFilter(
                event.target.value as
                  | "all"
                  | "pending"
                  | "completed"
              )
            }
            aria-label="Filter tasks"
          >
            <option value="all">All tasks</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {error && (
          <p role="alert" className="error-message">
            {error}
            {" "}
            <button type="button" onClick={fetchTasks}>
              Retry
            </button>
          </p>
        )}

        {loading ? (
          <p className="empty-state">Loading tasks...</p>
        ) : filteredTasks.length === 0 ? (
          <p className="empty-state">
            No tasks here yet. Add your first task above.
          </p>
        ) : (
          <ul className="task-list">
            {filteredTasks.map((task) => (
              <li className="task-item" key={task.id}>
                <label className="task-label">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task)}
                  />

                  <span className={task.completed ? "completed" : ""}>
                    {task.title}
                  </span>
                </label>

                <button
                  type="button"
                  className="delete-button"
                  onClick={() => deleteTask(task.id)}
                  aria-label={`Delete ${task.title}`}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
