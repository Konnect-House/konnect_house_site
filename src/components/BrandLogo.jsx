import logoDark from "../assets/removebg.png";
import logoWhite from "../assets/logo-white.png";
import useTheme from "../hooks/useTheme";

/**
 * Brand mark — navy+cyan on light surfaces, white+cyan on dark theme.
 */
export default function BrandLogo({
  className = "h-8 sm:h-10 w-auto",
  variant = "auto",
  alt = "Konnect House",
}) {
  const { theme } = useTheme();
  const src =
    variant === "white"
      ? logoWhite
      : variant === "dark"
        ? logoDark
        : theme === "dark"
          ? logoWhite
          : logoDark;

  return <img src={src} alt={alt} className={className} />;
}
