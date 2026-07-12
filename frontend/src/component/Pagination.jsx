export default function Pagination({ currentPage, totalPages, onPageChange }) {
  // Generate list of page numbers to show
  const getPagesList = () => {
    const list = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) list.push(i);
    } else {
      // Logic for showing dots, e.g., 1, 2, 3, '...', totalPages
      if (currentPage <= 3) {
        list.push(1, 2, 3, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        list.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
      } else {
        list.push(1, '...', currentPage, '...', totalPages);
      }
    }
    return list;
  };

  const pages = getPagesList();

  return (
    <div className="mt-8 flex select-none items-center justify-center gap-2 md:gap-4">
      {/* Prev Button */}
      <button
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
          currentPage === 1
            ? 'opacity-30 cursor-not-allowed'
            : 'hover:bg-bone text-slate-deep active:scale-95'
        }`}
        aria-label="Previous page"
      >
        <span className="material-symbols-outlined text-[20px]">chevron_left</span>
      </button>

      {/* Pages list */}
      {pages.map((page, index) => {
        if (page === '...') {
          return (
            <span key={`dots-${index}`} className="mx-1 text-on-surface-variant">
              ...
            </span>
          );
        }

        const isCurrent = currentPage === page;

        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 flex items-center justify-center rounded-full font-body-md transition-all active:scale-95 ${
              isCurrent
                ? 'bg-slate-deep text-white font-semibold'
                : 'hover:bg-bone text-slate-deep'
            }`}
          >
            {page}
          </button>
        );
      })}

      {/* Next Button */}
      <button
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
          currentPage === totalPages
            ? 'opacity-30 cursor-not-allowed'
            : 'hover:bg-bone text-slate-deep active:scale-95'
        }`}
        aria-label="Next page"
      >
        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
      </button>
    </div>
  );
}
