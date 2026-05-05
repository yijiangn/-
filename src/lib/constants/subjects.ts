export type SubjectKey = "math" | "english" | "cs408";

export interface SubjectMeta {
  key: SubjectKey;
  label: string;
  accentTextClass: string;
  accentSurfaceClass: string;
  accentBarClass: string;
}

export const subjectMetas: SubjectMeta[] = [
  {
    key: "math",
    label: "数学",
    accentTextClass: "text-sage-700",
    accentSurfaceClass: "border-sage-200 bg-sage-50",
    accentBarClass: "bg-sage-500"
  },
  {
    key: "english",
    label: "英语",
    accentTextClass: "text-moss-700",
    accentSurfaceClass: "border-moss-200 bg-moss-50",
    accentBarClass: "bg-moss-500"
  },
  {
    key: "cs408",
    label: "408",
    accentTextClass: "text-stone-700",
    accentSurfaceClass: "border-stone-200 bg-stone-100",
    accentBarClass: "bg-stone-500"
  }
];

export const subjectMetaMap = Object.fromEntries(subjectMetas.map((item) => [item.key, item])) as Record<
  SubjectKey,
  SubjectMeta
>;
