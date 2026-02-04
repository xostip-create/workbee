import type { SVGProps } from "react";

export function WorkBeeLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M11.83 2.18a1 1 0 0 0-.66 0l-7 4A1 1 0 0 0 4 7v10a1 1 0 0 0 .17.55l7 4a1 1 0 0 0 .66 0l7-4A1 1 0 0 0 20 17V7a1 1 0 0 0-.17-.55l-7-4Z" />
      <path d="M12 12h8" />
      <path d="m18 7 4 2.3" />
      <path d="m6 7-4 2.3" />
      <path d="m12 22 4-2.3" />
      <path d="M12 22V12l-4 2.3V22l4-2.3" />
      <path d="M12 12l4-2.3V5l-4-2.3L8 5v4.7L12 12Z" />
    </svg>
  );
}
