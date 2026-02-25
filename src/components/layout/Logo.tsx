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
        className={`${sizes[size]} aspect-square`}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Rounded square background */}
        <rect width="40" height="40" rx="10" className="fill-primary" />

        {/* Wrench — proper spanner: handle + open jaw */}
        <g transform="translate(20,20) rotate(-45) translate(-20,-20)">
          {/* Handle */}
          <rect x="10" y="18" width="14" height="4" rx="1.5" fill="white" />
          {/* Head / jaw */}
          <path
            d="M24 15C24 15 26 15 28 17C30 19 30.5 21.5 29.5 23.5L27 21L25 23L27.5 25.5C25.5 26.5 23 26 21 24C19 22 19 19 19 19L24 15Z"
            fill="white"
          />
        </g>

        {/* AI sparkle — 4-point star, top-right */}
        <path
          d="M31 6L31.9 9.6L35.5 10.5L31.9 11.4L31 15L30.1 11.4L26.5 10.5L30.1 9.6L31 6Z"
          className="fill-accent"
        />
        {/* Small sparkle */}
        <path
          d="M34 16L34.4 17.4L35.8 17.8L34.4 18.2L34 19.6L33.6 18.2L32.2 17.8L33.6 17.4L34 16Z"
          className="fill-accent"
          opacity="0.6"
        />
      </svg>
      <span className="font-display font-extrabold text-primary">
        Pro<span className="text-accent">Buddy</span>
      </span>
    </div>
  )
}
