function Loading({ message = "Loading..." }) {
  return (
    <div className="container">
      <div
        className="d-flex flex-column justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <div
          className="spinner-border text-primary mb-3"
          role="status"
          style={{ width: "3rem", height: "3rem" }}
        >
          <span className="visually-hidden">
            Loading...
          </span>
        </div>

        <p className="text-muted mb-0">{message}</p>
      </div>
    </div>
  );
}

export default Loading;