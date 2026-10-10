export const userSelect = {
  id: true,
  fullName: true,
  email: true,
  role: true,
  createdAt: true,
  department: { select: { id: true, name: true } },
} as const;
