function ErrorMessage({ message }) {
  if (!message) {
    return null;
  }

  return (
    <div
      className="alert alert-danger d-flex align-items-start gap-2 shadow-sm"
      role="alert"
    >
      <span className="fs-5">⚠</span>

      <div>
        <strong className="d-block mb-1">
          Something went wrong
        </strong>

        <span>{message}</span>
      </div>
    </div>
  );
}

export default ErrorMessage;