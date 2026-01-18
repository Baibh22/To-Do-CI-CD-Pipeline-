import { useEffect, useMemo, useState } from 'react'
import { apiDelete, apiGet, apiPatch, apiPost } from '../lib/api.js'

const COLUMNS = [
  { key: 'todo', title: 'To Do' },
  { key: 'in_progress', title: 'In Progress' },
  { key: 'done', title: 'Done' },
]

function groupByStatus(todos) {
  const byStatus = {
    todo: [],
    in_progress: [],
    done: [],
  }

  for (const t of todos) {
    if (byStatus[t.status]) byStatus[t.status].push(t)
  }

  for (const k of Object.keys(byStatus)) {
    byStatus[k].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  }

  return byStatus
}

function computeInsertOrder(list, insertIndex) {
  if (!list.length) return 1000
  if (insertIndex <= 0) return (list[0].order ?? 0) - 1000
  if (insertIndex >= list.length) return (list[list.length - 1].order ?? 0) + 1000
  const prev = list[insertIndex - 1].order ?? 0
  const next = list[insertIndex].order ?? 0
  return (prev + next) / 2
}

export default function TodosPage({ initialUser }) {
  const userEmail = initialUser?.email || ''
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [editingId, setEditingId] = useState('')
  const [editingTitle, setEditingTitle] = useState('')

  const byStatus = useMemo(() => groupByStatus(todos), [todos])

  async function refresh() {
    setError('')
    setLoading(true)
    try {
      const data = await apiGet('/api/todos')
      setTodos(data.todos || [])
    } catch (err) {
      setError(err?.message || 'Failed to load todos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  async function addTodo(e) {
    e.preventDefault()
    const title = newTitle.trim()
    if (!title) return
    setNewTitle('')
    setError('')
    try {
      const data = await apiPost('/api/todos', { title })
      setTodos((prev) => [...prev, data.todo])
    } catch (err) {
      setError(err?.message || 'Failed to create todo')
      setNewTitle(title)
    }
  }

  async function updateTodoTitle(todoId, title) {
    const trimmed = String(title || '').trim()
    if (!trimmed) {
      setError('Title cannot be empty')
      return
    }

    const snapshot = todos
    setTodos((prev) => prev.map((t) => (t.id === todoId ? { ...t, title: trimmed } : t)))
    setError('')

    try {
      const data = await apiPatch(`/api/todos/${todoId}`, { title: trimmed })
      setTodos((prev) => prev.map((t) => (t.id === todoId ? data.todo : t)))
      setEditingId('')
      setEditingTitle('')
    } catch (err) {
      setError(err?.message || 'Failed to update todo')
      setTodos(snapshot)
    }
  }

  async function moveTodo(todoId, targetStatus, insertIndex) {
    const current = todos.find((t) => t.id === todoId)
    if (!current) return

    const currentStatus = current.status
    const targetList = byStatus[targetStatus]

    const nextTargetList =
      currentStatus === targetStatus
        ? targetList.filter((t) => t.id !== todoId)
        : targetList.slice()

    const order = computeInsertOrder(nextTargetList, insertIndex)

    setTodos((prev) =>
      prev.map((t) => (t.id === todoId ? { ...t, status: targetStatus, order } : t))
    )

    try {
      const data = await apiPatch(`/api/todos/${todoId}`, { status: targetStatus, order })
      setTodos((prev) => prev.map((t) => (t.id === todoId ? data.todo : t)))
    } catch (err) {
      setError(err?.message || 'Failed to move todo')
      setTodos((prev) =>
        prev.map((t) =>
          t.id === todoId ? { ...t, status: currentStatus, order: current.order } : t
        )
      )
    }
  }

  async function removeTodo(todoId) {
    const snapshot = todos
    setTodos((prev) => prev.filter((t) => t.id !== todoId))
    setError('')
    try {
      await apiDelete(`/api/todos/${todoId}`)
    } catch (err) {
      setError(err?.message || 'Failed to delete todo')
      setTodos(snapshot)
    }
  }

  if (loading) {
    return (
      <div className="card">
        <h1 className="title">Board</h1>
        <div className="muted">Loading…</div>
      </div>
    )
  }

  return (
    <div className="boardWrap">
      <div className="boardHeader">
        <div>
          <h1 className="boardTitle">Board</h1>
          <div className="muted">Logged in as {userEmail || 'unknown user'}</div>
        </div>
        <div className="boardHeaderActions">
          <form className="addForm addFormTop" onSubmit={addTodo}>
            <input
              className="input"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Add a task…"
            />
            <button className="primaryButton" type="submit">
              Add
            </button>
          </form>
          <button type="button" className="navButton" onClick={refresh}>
            Refresh
          </button>
        </div>
      </div>

      {error ? <div className="error">{error}</div> : null}

      <div className="board">
        {COLUMNS.map((col) => {
          const items = byStatus[col.key] || []

          return (
            <section
              key={col.key}
              className="column"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                const todoId = e.dataTransfer.getData('text/todoId')
                if (!todoId) return
                moveTodo(todoId, col.key, items.length)
              }}
            >
              <div className="columnHeader">
                <div className="columnTitle">{col.title}</div>
                <div className="columnCount">{items.length}</div>
              </div>

              <div className="cards">
                {items.map((t, index) => (
                  <div
                    key={t.id}
                    className="cardItem"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/todoId', t.id)
                      e.dataTransfer.effectAllowed = 'move'
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault()
                      const todoId = e.dataTransfer.getData('text/todoId')
                      if (!todoId) return
                      moveTodo(todoId, col.key, index)
                    }}
                  >
                    <div className="cardMain">
                      {editingId === t.id ? (
                        <div className="editRow">
                          <input
                            className="input"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            autoFocus
                          />
                          <button
                            type="button"
                            className="secondaryButton"
                            onClick={() => updateTodoTitle(t.id, editingTitle)}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            className="navButton"
                            onClick={() => {
                              setEditingId('')
                              setEditingTitle('')
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="cardTitle">{t.title}</div>
                          <div className="cardActions">
                            <select
                              className="select"
                              value={t.status}
                              onChange={(e) => {
                                const targetStatus = e.target.value
                                const list = byStatus[targetStatus] || []
                                moveTodo(t.id, targetStatus, list.length)
                              }}
                            >
                              <option value="todo">To Do</option>
                              <option value="in_progress">In Progress</option>
                              <option value="done">Done</option>
                            </select>
                            <button
                              type="button"
                              className="secondaryButton"
                              onClick={() => {
                                setEditingId(t.id)
                                setEditingTitle(t.title)
                              }}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="iconButton"
                              onClick={() => removeTodo(t.id)}
                              aria-label="Delete"
                              title="Delete"
                            >
                              ×
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
