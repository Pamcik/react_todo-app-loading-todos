import React, { FormEvent } from 'react';
import { Todo } from '../types/Todo';

interface Props {
  todos: Todo[];
  newTitle: string;
  isLoading: boolean;
  onTitleChange: (title: string) => void;
  onAdd: (e: FormEvent) => void;
}

const TodoHeader: React.FC<Props> = ({
  todos,
  newTitle,
  isLoading,
  onTitleChange,
  onAdd,
}) => {
  const allCompleted = todos.length > 0 && todos.every(t => t.completed);

  return (
    <header className="todoapp__header">
      <button
        type="button"
        className={`todoapp__toggle-all${allCompleted ? ' active' : ''}`}
        data-cy="ToggleAllButton"
        disabled={todos.length === 0 || isLoading}
      />
      <form onSubmit={onAdd}>
        <input
          data-cy="NewTodoField"
          type="text"
          className="todoapp__new-todo"
          placeholder="What needs to be done?"
          value={newTitle}
          onChange={e => onTitleChange(e.target.value)}
          disabled={isLoading}
        />
      </form>
    </header>
  );
};

export default React.memo(TodoHeader);
