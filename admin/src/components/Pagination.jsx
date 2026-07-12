export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const range = [];
  const delta = 2;
  const left = Math.max(2, page - delta);
  const right = Math.min(totalPages - 1, page + delta);

  range.push(1);
  if (left > 2) range.push("...");
  for (let i = left; i <= right; i++) range.push(i);
  if (right < totalPages - 1) range.push("...");
  if (totalPages > 1) range.push(totalPages);

  return (
    <div className="pagination">
      <button
        className="page-btn"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label="Trang trước"
      >
        <span className="material-symbols-outlined">chevron_left</span>
      </button>

      {range.map((item, index) =>
        item === "..." ? (
          <span key={`ellipsis-${index}`} className="page-ellipsis">
            …
          </span>
        ) : (
          <button
            key={item}
            className={`page-btn${item === page ? " active" : ""}`}
            onClick={() => onPageChange(item)}
            aria-current={item === page ? "page" : undefined}
          >
            {item}
          </button>
        )
      )}

      <button
        className="page-btn"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Trang sau"
      >
        <span className="material-symbols-outlined">chevron_right</span>
      </button>
    </div>
  );
}
