import type { ReactNode, SVGProps } from "react";
import { cn } from "@/lib/utils";

type IconProps = SVGProps<SVGSVGElement>;

function BaseIcon({ className, children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={props.strokeWidth || 1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-5 w-5", className)}
      {...props}
    >
      {children}
    </svg>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="3" y="4" width="18" height="17" rx="3" />
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <path d="M3 10h18" />
    </BaseIcon>
  );
}

export function TargetIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </BaseIcon>
  );
}

export function SparklesIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 3l1.4 4.2L17.5 8l-4.1 1.1L12 13.4l-1.4-4.3L6.5 8l4.1-.8L12 3z" />
      <path d="M5 15l.8 2.4L8.2 18l-2.4.7L5 21l-.8-2.3L2 18l2.2-.6L5 15z" />
      <path d="M19 14l.8 2.2 2.2.8-2.2.8L19 20l-.8-2.2-2.2-.8 2.2-.8L19 14z" />
    </BaseIcon>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M20 6L9 17l-5-5" />
    </BaseIcon>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </BaseIcon>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m15 6-6 6 6 6" />
    </BaseIcon>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m9 6 6 6-6 6" />
    </BaseIcon>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m6 9 6 6 6-6" />
    </BaseIcon>
  );
}

export function BookIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21z" />
      <path d="M8 7h8" />
      <path d="M8 11h8" />
      <path d="M8 15h5" />
    </BaseIcon>
  );
}

export function EditIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M11 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-6" />
      <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
    </BaseIcon>
  );
}

export function LayersIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 3l9 4.5-9 4.5-9-4.5L12 3z" />
      <path d="M3 12.5L12 17l9-4.5" />
      <path d="M3 17l9 4 9-4" />
    </BaseIcon>
  );
}

export function NoteIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M14 3H6a2 2 0 0 0-2 2v14l4-3 4 3 4-3 4 3V9z" />
      <path d="M14 3v6h6" />
    </BaseIcon>
  );
}

export function RefreshIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </BaseIcon>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </BaseIcon>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </BaseIcon>
  );
}

export function FilterIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 6h16" />
      <path d="M7 12h10" />
      <path d="M10 18h4" />
    </BaseIcon>
  );
}

export function MoreHorizontalIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="6" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="18" cy="12" r="1.3" fill="currentColor" stroke="none" />
    </BaseIcon>
  );
}

export function ArchiveIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="3" y="4" width="18" height="5" rx="1" />
      <path d="M5 9h14v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" />
      <path d="M10 13h4" />
    </BaseIcon>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </BaseIcon>
  );
}

export function XIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </BaseIcon>
  );
}

export function PlayIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m8 6 10 6-10 6z" fill="currentColor" stroke="none" />
    </BaseIcon>
  );
}

export function PauseIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M8 6v12" />
      <path d="M16 6v12" />
    </BaseIcon>
  );
}

export function SkipForwardIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m5 6 8 6-8 6z" />
      <path d="m13 6 6 6-6 6z" />
    </BaseIcon>
  );
}

export function LogOutIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </BaseIcon>
  );
}

export function UserCircleIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </BaseIcon>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v5l3 2" />
    </BaseIcon>
  );
}

export function HomeIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M3 10.5L12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </BaseIcon>
  );
}

export function ImageIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="10" r="1.2" />
      <path d="M21 15l-4.5-4.5L8 19" />
    </BaseIcon>
  );
}

export function TagIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M20 10l-8 8-9-9V4h5z" />
      <circle cx="7.5" cy="7.5" r=".8" fill="currentColor" stroke="none" />
    </BaseIcon>
  );
}

export function AlertTriangleIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 4l8 14H4L12 4z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </BaseIcon>
  );
}

export function DownloadIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 4v11" />
      <path d="M8 11l4 4 4-4" />
      <path d="M4 20h16" />
    </BaseIcon>
  );
}

export function UploadIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 20V9" />
      <path d="M8 13l4-4 4 4" />
      <path d="M4 4h16" />
    </BaseIcon>
  );
}

export function FileTextIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <path d="M14 3v6h6" />
      <path d="M8 13h8" />
      <path d="M8 17h8" />
      <path d="M8 9h3" />
    </BaseIcon>
  );
}

export function TrendIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 19h16" />
      <path d="M6 15l4-4 3 3 5-6" />
      <path d="M18 8h-3" />
      <path d="M18 8v3" />
    </BaseIcon>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2.5" />
      <path d="M12 19.5V22" />
      <path d="m4.9 4.9 1.8 1.8" />
      <path d="m17.3 17.3 1.8 1.8" />
      <path d="M2 12h2.5" />
      <path d="M19.5 12H22" />
      <path d="m4.9 19.1 1.8-1.8" />
      <path d="m17.3 6.7 1.8-1.8" />
    </BaseIcon>
  );
}

export function BellIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </BaseIcon>
  );
}

export function BookmarkIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M18 21 12 16.5 6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z" />
    </BaseIcon>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </BaseIcon>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </BaseIcon>
  );
}

export function CloudIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M17.5 19c2.5 0 4.5-2 4.5-4.5 0-2.3-1.7-4.2-3.9-4.5C17.6 6.3 14.7 4 11.2 4c-3.1 0-5.7 2.1-6.5 5C2.6 9.5 1 11.3 1 13.5 1 16 3 18 5.5 18h12" />
    </BaseIcon>
  );
}

export function CloudRainIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M16 13a4 4 0 0 0-8 0" />
      <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25" />
      <path d="M8 19v2" />
      <path d="M12 21v2" />
      <path d="M16 19v2" />
    </BaseIcon>
  );
}

export function SnowflakeIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M2 12h20" />
      <path d="M12 2v20" />
      <path d="m4.93 4.93 14.14 14.14" />
      <path d="m19.07 4.93-14.14 14.14" />
    </BaseIcon>
  );
}

export function CloudLightningIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9" />
      <path d="m13 11-4 6h3l-1 5 4-6h-3l1-5z" />
    </BaseIcon>
  );
}

