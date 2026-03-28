export function SourceBadge({ source }: { source: string }) {
  const colors: Record<string, string> = {
    runtime: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    repo: "bg-green-500/10 text-green-400 border-green-500/20",
    snippet: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    cve: "bg-red-500/10 text-red-400 border-red-500/20",
    package: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    intelligence: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    exa: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    apify: "bg-teal-500/10 text-teal-400 border-teal-500/20",
    github: "bg-gray-500/10 text-gray-300 border-gray-500/20",
    manual: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider font-medium border ${colors[source] || colors.manual}`}>
      {source}
    </span>
  );
}
