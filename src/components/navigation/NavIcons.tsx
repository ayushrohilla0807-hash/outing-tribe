import React from "react";

export interface NavIconProps {
  active?: boolean;
  className?: string;
  size?: number;
}

export function HomeIcon({ active = false, className = "", size = 24 }: NavIconProps) {
  if (active) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 2.69L2.5 10.29V20C2.5 21.1 3.4 22 4.5 22H9.5V15C9.5 14.17 10.17 13.5 11 13.5H13C13.83 13.5 14.5 14.17 14.5 15V22H19.5C20.6 22 21.5 21.1 21.5 20V10.29L12 2.69Z"
        />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 10.5L12 3L21 10.5V20C21 20.55 20.55 21 20 21H15V14H9V21H4C3.45 21 3 20.55 3 20V10.5Z" />
    </svg>
  );
}

export function ExploreIcon({ active = false, className = "", size = 24 }: NavIconProps) {
  if (active) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18C11.8487 18 13.551 17.3729 14.9056 16.3199L20.2929 21.7071C20.6834 22.0976 21.3166 22.0976 21.7071 21.7071C22.0976 21.3166 22.0976 20.6834 21.7071 20.2929L16.3199 14.9056C17.3729 13.551 18 11.8487 18 10C18 5.58172 14.4183 2 10 2ZM4.5 10C4.5 6.96243 6.96243 4.5 10 4.5C13.0376 4.5 15.5 6.96243 15.5 10C15.5 13.0376 13.0376 15.5 10 15.5C6.96243 15.5 4.5 13.0376 4.5 10Z"
        />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.35" y2="16.35" />
    </svg>
  );
}

export function CreateIcon({ active = false, className = "", size = 28 }: NavIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function ChatsIcon({ active = false, className = "", size = 24 }: NavIconProps) {
  if (active) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 3C6.477 3 2 6.806 2 11.5C2 13.914 3.16 16.082 5 17.625V21.5L8.765 19.617C9.794 19.866 10.877 20 12 20C17.523 20 22 16.194 22 11.5C22 6.806 17.523 3 12 3Z"
        />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 11.5C21 15.642 16.97 19 12 19C10.96 19 9.96 18.87 9.03 18.63L4 21V16.59C2.76 15.22 2 13.46 2 11.5C2 7.358 6.03 4 12 4C17.97 4 22 7.358 22 11.5Z" />
    </svg>
  );
}

export function ProfileIcon({ active = false, className = "", size = 24 }: NavIconProps) {
  if (active) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12ZM4 20.25C4 16.8 7.58 14 12 14C16.42 14 20 16.8 20 20.25C20 20.66 19.66 21 19.25 21H4.75C4.34 21 4 20.66 4 20.25Z"
        />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20" />
    </svg>
  );
}
