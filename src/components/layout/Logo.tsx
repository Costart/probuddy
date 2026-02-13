interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function Logo({ className = "", size = "md" }: LogoProps) {
  const sizes = {
    sm: "h-7",
    md: "h-8",
    lg: "h-10",
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        className={sizes[size]}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Shield shape */}
        <path
          d="M20 2L4 10V20C4 30.5 11 36.5 20 38C29 36.5 36 30.5 36 20V10L20 2Z"
          className="fill-primary"
        />
        {/* Wrench/tool icon inside */}
        <path
          d="M25.5 14.5C25.5 14.5 24.2 13.2 22 13C19.8 13.2 18.5 14.5 18.5 14.5L14 19L16 21L19.5 17.5V28H22.5V17.5L26 21L28 19L25.5 14.5Z"
          fill="white"
        />
        {/* Checkmark */}
        <path
          d="M15 24L18 27L25 20"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.6"
        />
      </svg>
      <span className="font-display font-extrabold text-primary">
        Pro<span className="text-accent">Buddy</span>
      </span>
    </div>
  )
}
