const ThemeToggle = ({ darkMode, onToggle, theme, size = "md" }) => {
  const boxSize = size === "sm" ? "h-9 w-9" : "h-10 w-10";

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`group flex ${boxSize} shrink-0 items-center justify-center rounded-lg border ${theme.border} ${theme.panel} ${theme.text} transition hover:border-[#C8102E] hover:text-[#C8102E]`}
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {darkMode ? <SunIcon /> : <MoonIcon />}
    </button>
  );
};

const SunIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0-15v3m0 14v3M4.2 4.2l2.1 2.1m11.4 11.4 2.1 2.1M2 12h3m14 0h3M4.2 19.8l2.1-2.1m11.4-11.4 2.1-2.1"
    />
  </svg>
);

const MoonIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z"
    />
  </svg>
);

export default ThemeToggle;
