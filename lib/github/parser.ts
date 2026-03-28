import type { GitHubTreeItem } from "./client";

const SCAN_EXTENSIONS = [".ts", ".js", ".tsx", ".jsx", ".py", ".rb", ".go", ".java", ".php", ".json", ".yaml", ".yml", ".toml", ".env", ".cfg"];
const SKIP_DIRS = ["node_modules", ".git", "dist", "build", ".next", "vendor", "__pycache__", ".cache"];
const MAX_FILE_SIZE = 100000;

export function filterScannable(tree: GitHubTreeItem[]): GitHubTreeItem[] {
  return tree.filter(item => {
    if (item.type !== "blob") return false;
    if (item.size && item.size > MAX_FILE_SIZE) return false;
    if (SKIP_DIRS.some(d => item.path.includes(`${d}/`))) return false;
    return SCAN_EXTENSIONS.some(ext => item.path.endsWith(ext));
  });
}

export function extractPackageFiles(tree: GitHubTreeItem[]): GitHubTreeItem[] {
  return tree.filter(item =>
    item.type === "blob" && (
      item.path === "package.json" ||
      item.path === "package-lock.json" ||
      item.path === "requirements.txt" ||
      item.path === "Gemfile" ||
      item.path === "go.mod" ||
      item.path === "Cargo.toml" ||
      item.path === "pom.xml" ||
      item.path.endsWith("/package.json")
    )
  );
}
