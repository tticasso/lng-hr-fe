const FilterBar = ({ controls, summary, className = "" }) => {
  return (
    <div
      className={`flex flex-col justify-between gap-4 border-b border-gray-200 bg-gray-50 p-4 ${className}`}
    >
      <div className="flex flex-1 flex-col gap-3 sm:flex-row">{controls}</div>
      {summary ? <div>{summary}</div> : null}
    </div>
  );
};

export default FilterBar;
