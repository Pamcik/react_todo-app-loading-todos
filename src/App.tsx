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

import TodoHeader from './components/TodoHeader';
import TodoList from './components/TodoList';
import TodoFooter from './components/TodoFooter';
import ErrorNotification from './components/ErrorNotification';

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
      .then(setTodos)
      .catch(() => setErrorMessage('Unable to load todos'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const updateFilter = () => {
      const hash = window.location.hash;

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

  const handleClearCompleted = async () => {
    const completedTodos = todos.filter(t => t.completed);

    for (const todo of completedTodos) {
      setLoadingTodoIds(ids => [...ids, todo.id]);
      try {
        await deleteTodo(todo.id);
        setTodos(current => current.filter(t => t.id !== todo.id));
      } catch {
        setErrorMessage('Unable to delete a todo');
      } finally {
        setLoadingTodoIds(ids => ids.filter(id => id !== todo.id));
      }
    }
  };

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
        <TodoHeader
          todos={todos}
          newTitle={newTitle}
          isLoading={isLoading}
          onTitleChange={setNewTitle}
          onAdd={handleAdd}
        />

        {todos.length > 0 && (
          <TodoList
            todos={filteredTodos}
            loadingIds={loadingTodoIds}
            globalLoading={isLoading}
            onDelete={handleDelete}
            onToggle={handleToggle}
          />
        )}

        {todos.length > 0 && (
          <TodoFooter
            activeCount={activeCount}
            completedCount={completedCount}
            currentFilter={filter}
            onClearCompleted={handleClearCompleted}
          />
        )}

        <ErrorNotification
          message={errorMessage}
          onClose={() => setErrorMessage('')}
        />
      </div>
    </div>
  );
};
