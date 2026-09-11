export type WorkKind = 'propio' | 'asignado' | 'repos';

export type Project = {
  slug: string;
  name: string;
  tagline: string;
  kind: WorkKind;
  href: string;
  role: string;
  stack: string[];
  about: string;
  built: string[];
  architecture?: string;
  questions: string[];
  featured: boolean;
};

export const PROJECTS: Project[] = [
  {
    slug: 'kuatia',
    name: 'Kuatia',
    tagline: 'Plataforma de credenciales digitales',
    kind: 'propio',
    href: 'https://kuatia.xyz/',
    role: 'Software Engineer — producto propio',
    stack: ['Next.js', 'NestJS', 'React Native / Flutter', 'PostgreSQL', 'Redis', 'OpenID4VC'],
    about:
      'Infraestructura para emitir y verificar credenciales con estándares abiertos (OpenID4VCI/VP, SD-JWT). Issuer, verifier y wallet. El titular guarda la credencial; vos verificás la prueba.',
    built: [
      'Consola y landing (identity-kuatia)',
      'Billing, API keys y planes',
      'Issuer OID4VCI + DIDComm',
      'Verifier OID4VP + DIDComm',
      'Wallet (holder)',
      'Flujos de oferta y presentación',
    ],
    architecture: `flowchart TB
  wallet[Wallet]
  web[Web]
  billing[Billing]
  issuer[Issuer]
  verifier[Verifier]
  db[(PostgreSQL)]
  wallet -->|OpenID4VC| web
  web --> billing
  web --> issuer
  web --> verifier
  billing --> db
  issuer --> db
  verifier --> db`,
    questions: [
      '¿Por qué OpenID4VC y no un QR propietario?',
      '¿Cómo es el flujo de una credencial?',
      '¿Cuál fue tu rol en Kuatia?',
    ],
    featured: true,
  },
  {
    slug: 'faciliter',
    name: 'Faciliter',
    tagline: 'SaaS de afiliaciones',
    kind: 'propio',
    href: 'https://faciliter.xyz/',
    role: 'Software Engineer — producto propio',
    stack: ['NestJS', 'Next.js', 'Flutter', 'PostgreSQL', 'Redis', 'chat-api + MCP'],
    about:
      'Plataforma multi-tenant para gyms, clubes y estudios en Argentina: afiliados, packs, caja (Mercado Pago + efectivo), puerta con QR y app del socio. Kuatia entra como issuer/verifier de acceso.',
    built: [
      'API Nest y panel Admin',
      'App Flutter del afiliado',
      'Caja, débitos y puerta',
      'Asistente (chat-api portable + MCP de lectura)',
      'Multi-tenant y roles',
    ],
    architecture: `flowchart TB
  socio["Socio (app)"]
  staff["Staff (panel)"]
  api[Nest API]
  pg[(Postgres)]
  redis[(Redis)]
  kuatia[Kuatia]
  chat[chat-api]
  mcp[MCP]
  socio --> api
  staff --> api
  api --> pg
  api --> redis
  api --> kuatia
  api --> chat
  chat --> mcp`,
    questions: [
      '¿Qué problema resuelve Faciliter?',
      '¿Cómo se relaciona con Kuatia?',
      '¿Qué hace el asistente?',
    ],
    featured: true,
  },
  {
    slug: 'bax',
    name: 'BAX',
    tagline: 'IA de la Ciudad de Buenos Aires',
    kind: 'asignado',
    href: 'https://bax.buenosaires.gob.ar/',
    role: 'Software Engineer — Phinx Lab (oct. 2024 — actualidad)',
    stack: ['Flutter', 'NestJS', 'QuarkID', 'WACI', 'Redis', 'PostgreSQL'],
    about:
      'BAX es la experiencia conversacional de la Ciudad: trámites, identidad digital y credenciales en una app (texto, voz, imagen). Último proyecto al que me asignaron. La wallet BAX se apoya en el ecosistema QuarkID del GCBA.',
    built: [
      'App Flutter (documentos digitales, identidad, asistente)',
      'Flujos con wallets y QR BAX',
      'Integración con el ecosistema Quark (emisor, verificador, accesos)',
      'Infra compartida con MiBA / QuarkID',
    ],
    architecture: `flowchart TB
  ciudadano[Ciudadano]
  bax["BAX app Flutter"]
  miba[MiBA auth]
  quark[Quark Agent]
  servicios[Servicios BA]
  ciudadano --> bax
  bax --> miba
  bax --> quark
  bax --> servicios
  quark --> emisor[Emisor]
  quark --> verificador[Verificador]
  quark --> accesos[Accesos]`,
    questions: [
      '¿Qué es BAX y qué hiciste ahí?',
      '¿Cómo se conecta BAX con QuarkID?',
      '¿Qué stack usa la app?',
    ],
    featured: true,
  },
  {
    slug: 'quarkid',
    name: 'QuarkID',
    tagline: 'Identidad digital del GCBA',
    kind: 'asignado',
    href: 'https://buenosaires.gob.ar/gcaba_historico/jefaturadegabinete/innovacionytransformaciondigital/quarkid',
    role: 'Software Engineer — Phinx Lab (oct. 2024 — actualidad)',
    stack: ['NestJS', 'Next.js', 'QuarkID Agent', 'WACI', 'DIDComm', 'Redis', 'PostgreSQL', 'MongoDB'],
    about:
      'Protocolo de identidad auto-soberana de la Ciudad: credenciales verificables, DIDs, WACI y DIDComm. En el repo de BAX conviven emisor genérico, verificador, accesos a eventos, MiBA Connect, KMS y nodos (Sidetree / IPFS / blockchain).',
    built: [
      'Emisor genérico (plantillas + QR WACI)',
      'Verificador genérico (sesión + Redis TTL + WebSocket)',
      'Accesos a eventos y edificios',
      'MiBA Connect (DIDs, VCs, WACI)',
      'KMS / DIDComm y resolución de DIDs (Sidetree, IPFS, RSK/LACChain)',
    ],
    architecture: `flowchart TB
  fronts["Front emisor / verificador / accesos"]
  apis[APIs Nest]
  agent[QuarkID Agent]
  wallet[Wallet]
  redis[(Redis)]
  pg[(Postgres)]
  connect[MiBA Connect]
  kms[KMS / Vault]
  did["Sidetree / IPFS / chain"]
  fronts --> apis
  apis --> agent
  agent --> wallet
  agent --> redis
  agent --> pg
  wallet --> connect
  connect --> kms
  connect --> did`,
    questions: [
      '¿Qué es WACI en este ecosistema?',
      '¿Para qué usan Redis en el verificador?',
      '¿Qué piezas toqué de QuarkID?',
    ],
    featured: true,
  },
  {
    slug: 'servicios-ba',
    name: 'Servicios BA',
    tagline: 'Turnos, trámites e inscripciones',
    kind: 'asignado',
    href: 'https://bax.buenosaires.gob.ar/',
    role: 'Software Engineer — Phinx Lab (oct. 2024 — actualidad)',
    stack: ['Node.js', 'TypeScript', 'React', 'Vite', 'PostgreSQL', 'Redis', 'Kafka'],
    about:
      'Plataforma de servicios al ciudadano del GCBA: core de turnos e inscripciones, backoffice con microfrontends, conectores (Boti, Doppler) y colas Kafka. Auth de ciudadanos con MIBA; staff con Active Directory.',
    built: [
      'APIs core y backoffice',
      'Front ciudadano y shell de microfrontends',
      'Conectores externos y queue manager',
    ],
    architecture: `flowchart TB
  ciudadano["Ciudadano (React)"]
  backoffice["Backoffice (microfrontends)"]
  backend[backoffice-backend]
  core[core]
  connectors[connectors]
  pg[(Postgres)]
  kafka[queue-manager Kafka]
  ciudadano --> backend
  backoffice --> backend
  backend --> core
  backend --> connectors
  core --> pg
  core --> kafka
  connectors --> boti[Boti / etc.]`,
    questions: [
      '¿Cómo está partido Servicios BA?',
      '¿Qué rol tiene Kafka?',
      '¿MIBA o Active Directory?',
    ],
    featured: false,
  },
  {
    slug: 'aubilities',
    name: 'Aubilities',
    tagline: 'Find My Couch — inclusión cognitiva',
    kind: 'asignado',
    href: 'https://aubilities.com/',
    role: 'Full Stack Developer — oct. 2023 — oct. 2024',
    stack: ['React', 'MUI', 'Node.js', 'Express', 'AWS Cognito', 'Vite'],
    about:
      'Producto Find My Couch desde cero: arquitectura por contextos, Cognito (JWT, RBAC), datos sensibles, paquetes por perfil cognitivo, calendario y panel de admin.',
    built: [
      'Núcleo funcional del producto (registro, perfiles, archivos, paquetes, asistencia)',
      'Auth y autorización con AWS Cognito',
      'Panel de administración (usuarios, paquetes, especialistas)',
      'Testing y refactor continuo',
    ],
    architecture: `flowchart TB
  fronts["Microfrontends (Vite)"]
  apis[APIs Node]
  aws[AWS]
  fronts --> apis
  apis --> aws`,
    questions: [
      '¿Qué hiciste en Aubilities?',
      '¿Cómo armaban los microfrontends?',
    ],
    featured: false,
  },
  {
    slug: 'seekitup',
    name: 'Seekitup',
    tagline: 'App mobile de red social',
    kind: 'asignado',
    href: 'https://www.seekitup.com/',
    role: 'Full Stack Developer — jun. 2023 — oct. 2023',
    stack: ['React Native', 'Node.js', 'Express', 'API-First'],
    about:
      'App mobile y backend API-First: autenticación, usuarios, módulos sociales y pizarras en tiempo real. Implementación desde Figma.',
    built: [
      'App mobile y APIs REST',
      'Módulo de pizarras en tiempo real',
      'Optimización, testing y refactor de módulos',
    ],
    architecture: `flowchart TB
  app["iOS / Android (Expo)"]
  api[API Node]
  pg[(PostgreSQL)]
  app --> api
  api --> pg`,
    questions: ['¿Qué hiciste en Seekitup?', '¿React Native o web?'],
    featured: false,
  },
  {
    slug: 'ipskynet',
    name: 'Skynet',
    tagline: 'Proveedor de internet',
    kind: 'asignado',
    href: 'https://ipskynet.com.ar/',
    role: 'Full Stack Developer — jun. 2021 — jul. 2023',
    stack: ['React', 'Node.js', 'Express', 'PostgreSQL'],
    about:
      'Plataforma web de autogestión para clientes del ISP. Único desarrollador: registro, pagos, planes, facturación y dashboard.',
    built: [
      'Producto end-to-end (front y back)',
      'Integración con APIs de pagos y de conexiones',
      'Planes, promociones, facturación y dashboard',
    ],
    architecture: `flowchart TB
  web[React]
  api["Express + Sequelize"]
  pg[(PostgreSQL)]
  web --> api
  api --> pg`,
    questions: ['¿Qué hiciste en Skynet?', '¿Con qué stack empezaste?'],
    featured: false,
  },
  {
    slug: 'codigo',
    name: 'Código',
    tagline: 'Más trabajos en GitHub',
    kind: 'repos',
    href: 'https://github.com/LucianoMocchegiani',
    role: 'Perfil público — repos, experimentos y el resto del código',
    stack: ['TypeScript', 'JavaScript', 'Python', 'Dart'],
    about:
      'Las cards de este sitio son los productos y asignaciones con ficha. El resto del código —pruebas, snippets, WIP— está en el perfil de GitHub, con el mismo icono que ves acá.',
    built: [
      'Repos públicos de productos propios y asignaciones',
      'Pruebas, snippets y trabajo en curso',
    ],
    questions: [
      '¿Dónde veo tu código?',
      '¿Qué hay en tu GitHub?',
    ],
    featured: true,
  },
];

export const PROJECT_LOOK: Record<string, { mark: string }> = {
  kuatia: { mark: 'KU' },
  faciliter: { mark: 'FA' },
  bax: { mark: 'BX' },
  quarkid: { mark: 'QK' },
  'servicios-ba': { mark: 'BA' },
  aubilities: { mark: 'AU' },
  seekitup: { mark: 'SK' },
  ipskynet: { mark: 'IS' },
  codigo: { mark: 'GH' },
};

export function workKindLabel(kind: WorkKind, long = false): string {
  if (kind === 'repos') {
    return long ? 'Código' : 'Repos';
  }
  if (kind === 'propio') {
    return long ? 'Proyecto propio' : 'Propio';
  }
  return long ? 'Asignado' : 'Asignado';
}

export function projectBySlug(slug: string): Project | undefined {
  return PROJECTS.find((item) => item.slug === slug);
}

export function projectLook(slug: string): { mark: string } {
  return PROJECT_LOOK[slug] ?? { mark: slug.slice(0, 2).toUpperCase() };
}

export function projectIconSrc(href: string): string {
  try {
    const hostname = new URL(href).hostname;
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=128`;
  } catch {
    return '';
  }
}

const PROJECT_COVER: Record<string, string> = {
  kuatia: '/work/kuatia.png',
  quarkid: '/work/quarkid.png',
  faciliter: '/work/faciliter.png',
  'servicios-ba': '/work/servicios-ba.svg',
  ipskynet: '/work/ipskynet.svg',
  codigo: '/work/codigo.svg',
};

const PROJECT_DISC: Record<string, 'black' | 'white'> = {
  faciliter: 'black',
  kuatia: 'black',
  seekitup: 'black',
  codigo: 'black',
  bax: 'white',
  quarkid: 'white',
  aubilities: 'white',
  ipskynet: 'white',
  'servicios-ba': 'white',
};

export function projectDiscTone(slug: string): 'black' | 'white' {
  return PROJECT_DISC[slug] ?? 'white';
}

export function projectCoverSources(slug: string, href?: string): string[] {
  const local = PROJECT_COVER[slug];
  if (local) {
    return [local];
  }
  if (!href) {
    return [];
  }
  const favicon = projectIconSrc(href);
  return favicon ? [favicon] : [];
}

export function projectCoverSrc(slug: string): string {
  return `/work/${slug}.png`;
}

export const EXPERIENCE = [
  {
    org: 'Phinx Lab',
    role: 'Software Engineer (remoto)',
    dates: 'oct. 2024 — actualidad',
    detail:
      'Servicios BA, QuarkID y BAX para el GCBA. Microfrontends, microservicios, API-First, Event-Driven, DDD.',
    impact:
      'Más mantenibilidad por patrones compartidos; estabilización de QuarkID; menos tiempo de desarrollo al sacar fallas estructurales.',
  },
  {
    org: 'Faciliter / Kuatia',
    role: 'Software Engineer — productos propios',
    dates: 'en paralelo',
    detail: 'SaaS de afiliaciones (Faciliter) e infraestructura de credenciales (Kuatia).',
    impact: 'Producto e infraestructura de punta a punta, incluido el asistente.',
  },
  {
    org: 'Aubilities',
    role: 'Full Stack Developer (remoto)',
    dates: 'oct. 2023 — oct. 2024',
    detail: 'Find My Couch desde cero: Cognito, datos sensibles, paquetes por perfil, admin.',
    impact: 'Núcleo funcional completo y arquitectura clara, escalable y mantenible.',
  },
  {
    org: 'Seekitup',
    role: 'Full Stack Developer (remoto)',
    dates: 'jun. 2023 — oct. 2023',
    detail: 'App mobile de red social y backend API-First; pizarras en tiempo real.',
    impact: 'Módulos sociales y de pizarras listos para escalar.',
  },
  {
    org: 'ISP Skynet',
    role: 'Full Stack Developer (presencial)',
    dates: 'jun. 2021 — jul. 2023',
    detail: 'Autogestión de clientes: usuarios, pagos, planes, facturación. Único desarrollador.',
    impact: 'Primera plataforma de autogestión del ISP; menos carga operativa.',
  },
];

export const SKILLS = {
  lenguajes: ['TypeScript', 'JavaScript', 'Python', 'Dart'],
  frontend: ['React', 'Next.js', 'React Native', 'MUI', 'Vite', 'microfrontends'],
  backend: ['Node.js', 'Express', 'NestJS', 'Hono'],
  'base de datos': ['PostgreSQL', 'MySQL', 'MongoDB', 'DynamoDB', 'Redis'],
  mensajería: ['Apache Kafka', 'AWS SQS', 'RabbitMQ'],
  cloud: ['AWS', 'Google Cloud'],
  contenedores: ['Docker', 'OpenShift'],
  observabilidad: ['Elasticsearch', 'Kibana', 'Argo CD'],
  prácticas: ['Clean / Hexagonal', 'DDD', 'SOLID', 'Event-Driven', 'API-First', 'CI/CD'],
};

export const CONTACT = {
  location: 'Buenos Aires, Argentina',
  phone: '+54 11 2712-6514',
  phoneHref: 'tel:+541127126514',
  whatsappHref: 'https://wa.me/541127126514',
  email: 'lucianomocchegiani@gmail.com',
  linkedin: 'https://www.linkedin.com/in/luciano-mocchegiani',
  github: 'https://github.com/LucianoMocchegiani',
  calendar: 'https://calendar.app.google/Lnd8QSYV3TticMW5A',
};

export const HOME_QUESTIONS = [
  'Hablame de vos y de tu experiencia',
  '¿Qué proyectos hiciste?',
  '¿Qué habilidades tenés?',
  '¿Dónde veo tu código?',
  '¿Cómo te contacto?',
];
