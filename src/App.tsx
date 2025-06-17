/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useState, useEffect, FormEvent } from 'react';
import { UserWarning } from './UserWarning';
import {
  getTodos,
  createTodo,
  deleteTodo,
  updateTodo,
  USER_ID,
} from './api/todos';
import { Todo } from './types/Todo';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTodoIds, setLoadingTodoIds] = useState<number[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    setErrorMessage('');
    setIsLoading(true);
    getTodos()
      .then(data => setTodos(data))
      .catch(() => setErrorMessage('Unable to load todos'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const updateFilter = () => {
      const { hash } = window.location;

      setFilter(
        hash === '#/active'
          ? 'active'
          : hash === '#/completed'
            ? 'completed'
            : 'all',
      );
    };

    updateFilter();
    window.addEventListener('hashchange', updateFilter);

    return () => window.removeEventListener('hashchange', updateFilter);
  }, []);

  useEffect(() => {
    if (!errorMessage) {
      return;
    }

    const timer = setTimeout(() => setErrorMessage(''), 3000);

    return () => clearTimeout(timer);
  }, [errorMessage]);

  if (!USER_ID) {
    return <UserWarning />;
  }

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    const title = newTitle.trim();

    if (!title) {
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    try {
      const created = await createTodo(title);

      setTodos([created, ...todos]);
      setNewTitle('');
    } catch {
      setErrorMessage('Unable to create todo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setLoadingTodoIds(ids => [...ids, id]);
    setErrorMessage('');
    try {
      await deleteTodo(id);
      setTodos(todos.filter(t => t.id !== id));
    } catch {
      setErrorMessage('Unable to delete todo');
    } finally {
      setLoadingTodoIds(ids => ids.filter(x => x !== id));
    }
  };

  const handleToggle = async (todo: Todo) => {
    setLoadingTodoIds(ids => [...ids, todo.id]);
    setErrorMessage('');
    try {
      const updated = await updateTodo(todo.id, { completed: !todo.completed });

      setTodos(todos.map(t => (t.id === todo.id ? updated : t)));
    } catch {
      setErrorMessage('Unable to update todo');
    } finally {
      setLoadingTodoIds(ids => ids.filter(x => x !== todo.id));
    }
  };

  const activeCount = todos.filter(t => !t.completed).length;
  const completedCount = todos.filter(t => t.completed).length;
  const filteredTodos = todos.filter(t =>
    filter === 'active'
      ? !t.completed
      : filter === 'completed'
        ? t.completed
        : true,
  );

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>
      <div className="todoapp__content">
        <header className="todoapp__header">
          <button
            type="button"
            className={`todoapp__toggle-all${
              todos.length > 0 && todos.every(t => t.completed) ? ' active' : ''
            }`}
            data-cy="ToggleAllButton"
            disabled={todos.length === 0 || isLoading}
          />
          <form onSubmit={handleAdd}>
            <input
              data-cy="NewTodoField"
              type="text"
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              disabled={isLoading}
            />
          </form>
        </header>

        {todos.length > 0 && (
          <section className="todoapp__main" data-cy="TodoList">
            {filteredTodos.map(todo => {
              const isBusy = loadingTodoIds.includes(todo.id);

              return (
                <div
                  key={todo.id}
                  data-cy="Todo"
                  className={`todo${todo.completed ? ' completed' : ''}`}
                >
                  <label className="todo__status-label">
                    <input
                      data-cy="TodoStatus"
                      type="checkbox"
                      className="todo__status"
                      checked={todo.completed}
                      onChange={() => handleToggle(todo)}
                      disabled={isBusy || isLoading}
                    />
                  </label>
                  <span data-cy="TodoTitle" className="todo__title">
                    {todo.title}
                  </span>
                  <button
                    type="button"
                    className="todo__remove"
                    data-cy="TodoDelete"
                    onClick={() => handleDelete(todo.id)}
                    disabled={isBusy}
                  >
                    ×
                  </button>

                  <div
                    className={`modal overlay${isBusy ? '' : ' hidden'}`}
                    data-cy="TodoLoader"
                  >
                    <div
                      className="modal-background has-background-white-
                      ter"
                    />
                    <div className="loader" />
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {todos.length > 0 && (
          <footer className="todoapp__footer" data-cy="Footer">
            <span className="todo-count" data-cy="TodosCounter">
              {activeCount} items left
            </span>
            <nav className="filter" data-cy="Filter">
              {(['all', 'active', 'completed'] as const).map(f => (
                <a
                  key={f}
                  href={`#/${f === 'all' ? '' : f}`}
                  className={`filter__link${filter === f ? ' selected' : ''}`}
                  data-cy={`FilterLink${f.charAt(0).toUpperCase() + f.slice(1)}`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </a>
              ))}
            </nav>
            <button
              type="button"
              className="todoapp__clear-completed"
              data-cy="ClearCompletedButton"
              disabled={completedCount === 0}
            >
              Clear completed
            </button>
          </footer>
        )}

        <div
          data-cy="ErrorNotification"
          className={`notification is-danger is-light has-text-weight-normal${
            errorMessage ? '' : ' hidden'
          }`}
        >
          <button
            data-cy="HideErrorButton"
            type="button"
            className="delete"
            onClick={() => setErrorMessage('')}
          />
          <span>{errorMessage}</span>
        </div>
      </div>
    </div>
  );
};
