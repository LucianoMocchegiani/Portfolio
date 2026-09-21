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
    stack: ['Next.js', 'NestJS', 'React Native / Flutter', 'PostgreSQL', 'OpenID4VC'],
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
  super["Super Admin"]
  api[Nest API]
  pg[(Postgres)]
  redis[(Redis)]
  kuatia[Kuatia]
  mp[Mercado Pago]
  chat[chat-api]
  mcp[MCP]
  socio --> api
  staff --> api
  super --> api
  staff --> chat
  chat --> pg
  chat --> mcp
  mcp --> api
  api --> pg
  api --> redis
  api --> kuatia
  api --> mp`,
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
  login[MiBA Login]
  session[session-ms]
  mibaApi[miba2-api]
  verifier["Verificador (WebView)"]
  boti[Boti]
  eleven[ElevenLabs]
  connect[MiBA Connect]
  proxy[Proxy Core]
  tad["TAD / VisionBA"]
  gedo[GEDO]
  eventos[Eventos]
  ciudadano --> bax
  bax --> login
  bax --> session
  bax --> mibaApi
  bax --> verifier
  session --> boti
  session --> eleven
  session --> connect
  session --> proxy
  session --> tad
  session --> gedo
  session --> eventos`,
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
    role: 'Lider Tecnico, Software Engineer — Phinx Lab (oct. 2024 — actualidad)',
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
  ops[Operadores]
  emisor[Emisor]
  verificador[Verificador]
  accesos[Accesos]
  wallet["Wallet / BAX"]
  connect[MiBA Connect]
  modena[Modena Resolver]
  sidetree[rsk-sidetree]
  vcsl[VCSL]
  ipfs[IPFS]
  chain[Blockchain]
  ops --> emisor
  ops --> verificador
  ops --> accesos
  wallet --> connect
  wallet -.-> verificador
  emisor --> modena
  verificador --> modena
  accesos --> modena
  connect --> modena
  emisor -.-> vcsl
  modena --> sidetree
  sidetree --> ipfs
  sidetree --> chain
  vcsl --> ipfs`,
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
      'Web de la Ciudad para sacar turno (incluye salud), inscribirse a programas e iniciar trámites. El vecino entra con MiBA; el organismo opera el catálogo, las agendas y las inscripciones desde un backoffice (AD). Las notificaciones salen asíncronas (Boti, Doppler).',
    built: [
      'APIs core y backoffice',
      'Front ciudadano y shell de microfrontends',
      'Conectores externos y queue manager',
    ],
    architecture: `flowchart TB
  ciudadano["Ciudadano (React)"]
  shell["Backoffice shell + MFEs"]
  backend[backoffice-backend]
  core[core]
  connectors[connectors]
  queue[queue-manager]
  miba[MiBA]
  ad[Active Directory]
  boti[Boti]
  doppler[Doppler]
  ciudadano --> miba
  ciudadano --> backend
  shell --> ad
  shell --> backend
  backend --> core
  backend --> connectors
  core --> queue
  queue --> backend
  queue --> connectors
  connectors --> boti
  connectors --> doppler`,
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
    tagline: 'Plataforma de inclusión cognitiva',
    kind: 'asignado',
    href: 'https://aubilities.com/',
    role: 'Full Stack Developer — oct. 2023 — oct. 2024',
    stack: ['React', 'Vite', 'AWS Cognito', 'S3'],
    about:
      'Plataforma de neurodivergencia: cuestionarios, noticias, admin, chat y Find My Couch (encontrar un couch, sesiones, fotos en S3). El host PHP era legado; se migraba a React. Yo trabajé en los productos React, no en el monolito PHP como destino.',
    built: [
      'Productos React montados sobre el legado (chat, Find My Couch)',
      'Find My Couch: matching de couch, sesiones e imágenes en S3',
      'Migración del servicio PHP hacia el stack nuevo',
      'Auth Cognito, testing y refactor',
    ],
    architecture: `flowchart TB
  user[Usuario]
  admin[Admin]
  php["PHP legado"]
  chat["Chat (React)"]
  couch["Find My Couch (React)"]
  cognito[Cognito]
  s3[(S3)]
  user --> php
  admin --> php
  php --> chat
  php --> couch
  php --> cognito
  couch --> s3`,
    questions: [
      '¿De qué va Aubilities?',
      '¿Qué es Find My Couch?',
      '¿Qué hiciste vos ahí?',
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
    stack: ['React Native', 'Node.js', 'Express', 'PostgreSQL'],
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
    stack: ['React', 'Vite', 'Node.js', 'Express', 'PostgreSQL'],
    about:
      'Portal de autogestión del ISP (~3000 clientes): facturas, pagos, planes y estado de conexión. Único desarrollador. React habla con skynet-api; pagos, red y facturación van por adaptadores al legado y a Mercado Pago.',
    built: [
      'skynet-frontend (React) y skynet-api (Express)',
      'Adaptadores: pagos, conexiones y facturación',
      'Primera autogestión del ISP, punta a punta',
    ],
    architecture: `flowchart TB
  cliente[Cliente]
  web["skynet-frontend"]
  api[skynet-api]
  pay[payment-adapter]
  conn[connection-adapter]
  bill[billing-adapter]
  mp[Mercado Pago]
  banco[Bancos]
  red["Conexiones legacy"]
  fact["Facturación legacy"]
  cliente --> web
  web --> api
  api --> pay
  api --> conn
  api --> bill
  pay --> mp
  pay --> banco
  conn --> red
  bill --> fact`,
    questions: [
      '¿Qué hiciste en Skynet?',
      '¿Cómo cobraban los clientes?',
    ],
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
    detail: 'PHP legado; productos React (chat, Find My Couch con sesiones y S3) y migración al stack nuevo.',
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
    detail: 'Portal de autogestión: React + API, adaptadores a Mercado Pago, red y facturación legado. Único desarrollador.',
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
