import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/cursos/", "/admin/", "/api/", "/perfil", "/logros", "/mi-carrera", "/desempeno", "/certificados", "/notificaciones", "/induccion"],
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/sitemap.xml`,
  };
}
