import React from 'react';

interface Props {
  activeCount: number;
  completedCount: number;
  currentFilter: 'all' | 'active' | 'completed';
  onClearCompleted: () => void | Promise<void>;
}

const TodoFooter: React.FC<Props> = ({
  activeCount,
  completedCount,
  currentFilter,
}) => (
  <footer className="todoapp__footer" data-cy="Footer">
    <span className="todo-count" data-cy="TodosCounter">
      {activeCount} items left
    </span>
    <nav className="filter" data-cy="Filter">
      {(['all', 'active', 'completed'] as const).map(f => (
        <a
          key={f}
          href={`#/${f === 'all' ? '' : f}`}
          className={`filter__link${currentFilter === f ? ' selected' : ''}`}
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
);

export default React.memo(TodoFooter);
