import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function RouteScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // ❌ DO NOT scroll to top if there is a hash
    if (hash) return;

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [pathname, hash]);

  return null;
}
