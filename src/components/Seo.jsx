import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE = "https://www.konnecthouse.cd";
const DEFAULT = {
  title:
    "Konnect House | Logement à Kinshasa via WhatsApp — maisons, appartements, guest houses",
  description:
    "Konnect House : trouvez ou louez un logement vérifié à Kinshasa (maison de passage, appartement, guest house, hôtel) directement sur WhatsApp. Bot 24/7, sélection en quelques minutes.",
  path: "/",
  robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
};

const ROUTES = {
  "/": DEFAULT,
  "/proprietaire": {
    title: "Espace propriétaire | Konnect House",
    description:
      "Gérez vos logements Konnect House : annonces, réservations et profil propriétaire à Kinshasa.",
    robots: "noindex, nofollow",
  },
  "/proprietaire/gestion": {
    title: "Gestion des biens | Konnect House",
    description: "Tableau de bord propriétaire Konnect House.",
    robots: "noindex, nofollow",
  },
  "/proprietaire/profil": {
    title: "Profil propriétaire | Konnect House",
    description: "Profil et KYC propriétaire Konnect House.",
    robots: "noindex, nofollow",
  },
  "/proprietaire/onboarding": {
    title: "Inscription propriétaire | Konnect House",
    description: "Complétez votre profil propriétaire Konnect House.",
    robots: "noindex, nofollow",
  },
  "/proprietaire/biens/nouveau": {
    title: "Publier un logement | Konnect House",
    description: "Ajoutez un bien à louer sur Konnect House.",
    robots: "noindex, nofollow",
  },
};

function setMeta(attr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Met à jour title / description / canonical / robots selon la route SPA.
 */
export default function Seo() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    const base =
      ROUTES[pathname] ||
      (pathname.startsWith("/proprietaire")
        ? {
            title: "Espace propriétaire | Konnect House",
            description: "Espace propriétaire Konnect House.",
            robots: "noindex, nofollow",
          }
        : DEFAULT);

    let title = base.title;
    let description = base.description;
    let robots = base.robots || DEFAULT.robots;
    let path = pathname === "/" ? "/" : pathname;

    const params = new URLSearchParams(search);
    const auth = params.get("auth");
    if (pathname === "/" && auth === "inscription") {
      title = "Inscription propriétaire | Konnect House Kinshasa";
      description =
        "Créez votre espace propriétaire Konnect House et publiez vos logements à Kinshasa.";
      path = "/";
      robots = "noindex, follow";
    } else if (pathname === "/" && auth === "connexion") {
      title = "Connexion propriétaire | Konnect House";
      description = "Connectez-vous à votre espace propriétaire Konnect House.";
      path = "/";
      robots = "noindex, follow";
    }

    document.title = title;
    setMeta("name", "description", description);
    setMeta("name", "robots", robots);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", `${SITE}${path === "/" ? "/" : path}`);
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setLink("canonical", `${SITE}${path === "/" ? "/" : path}`);
  }, [pathname, search]);

  return null;
}
