import React from 'react';

interface Props {
  message: string;
  onClose: () => void;
}

const ErrorNotification: React.FC<Props> = ({ message, onClose }) => (
  <div
    data-cy="ErrorNotification"
    className={`notification is-danger is-light has-text-weight-normal${
      message ? '' : ' hidden'
    }`}
  >
    <button
      data-cy="HideErrorButton"
      type="button"
      className="delete"
      onClick={onClose}
    />
    <span>{message}</span>
  </div>
);

export default React.memo(ErrorNotification);
