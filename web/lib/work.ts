export type WorkKind = 'propio' | 'asignado';

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
  architecture: string;
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
    architecture: `             ┌──────────┐
             │  Wallet  │
             └────┬─────┘
                  │ OpenID4VC
             ┌────▼─────┐
             │   Web    │
             └────┬─────┘
                  │
       ┌──────────┼──────────┐
       ▼          ▼          ▼
    Billing    Issuer    Verifier
       │          │          │
       └──────────┴────┬─────┘
                       ▼
                   PostgreSQL`,
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
    architecture: `  Socio (app)     Staff (panel)
       │                │
       └────────┬───────┘
                ▼
              Nest API
                │
        ┌───────┼────────┐
        ▼       ▼        ▼
     Postgres  Redis   Kuatia
                         │
                      chat-api → MCP`,
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
    architecture: `        Ciudadano
            │
        ┌───▼───┐
        │  BAX  │  app Flutter
        └───┬───┘
            │
     ┌──────┼──────┐
     ▼      ▼      ▼
  MiBA   Quark   Servicios
  auth   Agent      BA
            │
     emisor / verificador / accesos`,
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
    architecture: `  Front emisor / verificador / accesos
              │
              ▼
         APIs Nest
              │
        QuarkID Agent
              │
     ┌────────┼────────┐
     ▼        ▼        ▼
   Wallet   Redis    Postgres
     │
  MiBA Connect → KMS → Vault
     │
  Sidetree / IPFS / chain`,
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
    architecture: `  Ciudadano (React)     Backoffice (microfrontends)
           │                        │
           └──────────┬─────────────┘
                      ▼
              backoffice-backend
                      │
              ┌───────┴───────┐
              ▼               ▼
             core         connectors
              │               │
           Postgres        Boti / etc.
              ▼
         queue-manager (Kafka)`,
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
    architecture: `  Microfrontends (Vite)
           │
           ▼
        APIs Node
           │
          AWS`,
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
    architecture: `  iOS / Android (Expo)
           │
           ▼
        API Node
           │
       PostgreSQL`,
    questions: ['¿Qué hiciste en Seekitup?', '¿React Native o web?'],
    featured: false,
  },
  {
    slug: 'ipskynet',
    name: 'ISP Skynet',
    tagline: 'Gestión de usuarios y pagos de un ISP',
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
    architecture: `  React
    │
    ▼
  Express + Sequelize
    │
  PostgreSQL`,
    questions: ['¿Qué hiciste en Skynet?', '¿Con qué stack empezaste?'],
    featured: false,
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
};

export function projectBySlug(slug: string): Project | undefined {
  return PROJECTS.find((item) => item.slug === slug);
}

export function projectLook(slug: string): { mark: string } {
  return PROJECT_LOOK[slug] ?? { mark: slug.slice(0, 2).toUpperCase() };
}

export function projectCoverSrc(slug: string): string {
  return `/work/${slug}.jpg`;
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
  email: 'lucianomocchegiani@gmail.com',
  linkedin: 'https://www.linkedin.com/in/luciano-mocchegiani',
  github: 'https://github.com/LucianoMocchegiani',
  calendar: 'https://calendar.app.google/Lnd8QSYV3TticMW5A',
};

export const HOME_QUESTIONS = [
  'Hablame de vos y de tu experiencia',
  '¿Qué proyectos hiciste?',
  '¿Qué habilidades tenés?',
  '¿Cómo te contacto?',
];
