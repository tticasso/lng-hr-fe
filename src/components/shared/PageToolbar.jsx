const PageToolbar = ({
  title,
  description,
  meta,
  actions,
  className = "",
}) => {
  return (
    <div
      className={`flex shrink-0 flex-col gap-4 xl:flex-row xl:items-center xl:justify-between ${className}`}
    >
      <div className="min-w-0 space-y-2 xl:max-w-[320px]">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          {meta}
        </div>
        {description ? <p className="text-sm text-gray-500">{description}</p> : null}
      </div>

      <div className="w-full min-w-0 xl:flex-1">{actions}</div>
    </div>
  );
};

export default PageToolbar;
