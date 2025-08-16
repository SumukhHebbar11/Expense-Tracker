export const categories = {
  Food: { icon: "🍔", color: "#EF4444" },
  Salary: { icon: "💰", color: "#10B981" },
  Travel: { icon: "✈️", color: "#3B82F6" },
  Shopping: { icon: "🛍️", color: "#EC4899" },
  Investment: { icon: "📈", color: "#6366F1" },
  Freelance: { icon: "🧑‍💻", color: "#10B981" },
  Bills: { icon: "💡", color: "#F59E0B" },
  Other: { icon: "📦", color: "#6B7280" },
  Entertainment: { icon: "🎬", color: "#EC4899" },
  Health: { icon: "💊", color: "#EF4444" },
  Education: { icon: "🎓", color: "#06B6D4" },
  Transfer: { icon: "🔁", color: "#9CA3AF" },
  default: { icon: "📂", color: "#9CA3AF" },
};

export function getCategory(name) {
  if (!name) return categories.default;
  if (categories[name]) return categories[name];
  const key = Object.keys(categories).find(
    (k) => k.toLowerCase() === String(name).toLowerCase()
  );
  if (key) return categories[key];
  return categories.default;
}

export default categories;
