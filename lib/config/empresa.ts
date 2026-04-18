export const CONFIG_EMPRESA = {
  nombre: process.env.EMPRESA_NOMBRE ?? "Educanet",
  mision:
    "Impulsar el crecimiento profesional de cada miembro de nuestro equipo a traves de capacitacion continua y accesible.",
  vision:
    "Ser reconocidos como una empresa que invierte en su gente y ofrece oportunidades reales de desarrollo.",
  valores: [
    {
      titulo: "Integridad",
      descripcion: "Actuamos con honestidad y transparencia en todo lo que hacemos.",
    },
    {
      titulo: "Excelencia",
      descripcion: "Buscamos la mejora continua en cada proceso y resultado.",
    },
    {
      titulo: "Colaboracion",
      descripcion: "Trabajamos juntos para alcanzar objetivos comunes.",
    },
    {
      titulo: "Innovacion",
      descripcion: "Abrazamos el cambio y buscamos nuevas formas de hacer las cosas.",
    },
  ],
  contactoRRHH: {
    nombre: "Equipo RRHH",
    email: "rrhh@tuempresa.com",
    horario: "Lunes a viernes, 9:00 - 18:00",
  },
  faq: [
    {
      pregunta: "Como accedo a mis certificados?",
      respuesta: "Ve a tu perfil y selecciona la seccion Certificados, o usa el menu lateral.",
    },
    {
      pregunta: "Que son los puntos y para que sirven?",
      respuesta: "Los puntos reflejan tu progreso. Los ganas al completar lecciones, quizzes y cursos. Te ayudan a subir de nivel.",
    },
    {
      pregunta: "Como se que cursos debo tomar?",
      respuesta: "Revisa tu Ruta de Carrera en el menu 'Mi carrera'. Ahi veras los cursos requeridos para tu proximo ascenso.",
    },
    {
      pregunta: "Como contacto a RRHH?",
      respuesta: "Puedes escribir a rrhh@tuempresa.com o acercarte a la oficina de RRHH.",
    },
    {
      pregunta: "Mis datos estan seguros?",
      respuesta: "Si. Usamos encriptacion y controles de acceso para proteger tu informacion.",
    },
  ],
};
