function EmptyState({
  title = "No data found",
  message = "There is nothing to display here.",
  action = null,
}) {
  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body text-center py-5 px-4">
        <div
          className="rounded-circle bg-light text-primary d-inline-flex align-items-center justify-content-center mb-3"
          style={{
            width: "70px",
            height: "70px",
            fontSize: "30px",
          }}
        >
          📭
        </div>

        <h4 className="fw-semibold mb-2">
          {title}
        </h4>

        <p className="text-muted mb-4">
          {message}
        </p>

        {action && <div>{action}</div>}
      </div>
    </div>
  );
}

export default EmptyState;