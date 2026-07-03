'use client';
import { useEffect } from 'react';
import { useAudioStore } from './store';

// Platform i18n — Spanish-first with an English toggle (navbar). Keys cover
// the main surfaces: navbar, homepage, and the Studio creation flow. The
// Melao chat handles its own bilingual logic (auto-detects per message).

const DICT = {
  es: {
    // Navbar
    'nav.explore': 'Explorar',
    'nav.library': 'Biblioteca',
    'nav.pricing': 'Precios',
    'nav.learn': 'Aprende',
    'nav.create': 'Crear',
    'nav.signin': 'Entrar',
    'nav.dashboard': 'Panel',
    'nav.createNow': 'Crear Ahora',
    'nav.search': 'Busca canciones, artistas...',
    // Homepage
    'home.badge': 'Presentamos MELAOS v5 — Nuestro modelo más potente',
    'home.title1': 'Crea cualquier canción',
    'home.title2': 'que imagines',
    'home.subtitle': 'Empieza con una idea sencilla o entra a nuestras herramientas pro. Tu próximo tema está a un paso.',
    'home.cta.create': 'Crear',
    'home.cta.explore': 'Explorar Música',
    'home.noCard': 'Sin tarjeta de crédito · 1 canción gratis al día',
    'home.features.title1': 'Todo lo que necesitas para hacer música',
    'home.features.title2': 'a tu manera',
    'home.features.subtitle': 'De la generación instantánea a herramientas de edición profesionales, MELAOS lo tiene todo.',
    'home.f1.title': '1 canción gratis, diaria',
    'home.f1.desc': 'Genera 1 tema cada día sin costo. Calidad completa, sin trucos.',
    'home.f2.title': 'Generador de música IA gratis',
    'home.f2.desc': 'Con el poder de MELAOS v5 — nuestro modelo más avanzado hasta la fecha.',
    'home.f3.title': 'Compártelo con el mundo',
    'home.f3.desc': 'Publica al instante en tu perfil. Que tus fans descubran tu sonido desde donde sea.',
    'home.f4.title': 'Controles de creación precisos',
    'home.f4.desc': 'Ajusta BPM, género, mood, estilo vocal y más con nuestras herramientas pro.',
    'home.f5.title': 'Derechos comerciales de tus canciones',
    'home.f5.desc': 'Los suscriptores Pro y Premier son dueños de los derechos comerciales de cada canción que crean.',
    'home.f6.title': 'Tu espacio creativo completo',
    'home.f6.desc': 'DAW multipista, editor de letras, mezclador de stems — todo en un solo lugar.',
    'home.f7.title': 'Extrae stems. Llévalos a tu DAW.',
    'home.f7.desc': 'Separa voces, drums, bajo y más. Exporta a Ableton, FL, Logic sin fricción.',
    'home.f8.title': 'Crea a diario. Guárdalo todo.',
    'home.f8.desc': 'Tu biblioteca completa vive en la nube. Almacenamiento ilimitado en Pro y Premier.',
    'home.ready.title': '¿Listo para empezar a crear?',
    'home.ready.subtitle': 'Únete a más de 500,000 artistas haciendo música con MELAOS STUDIOS · Eclat Universe.',
    'home.ready.cta': 'Empieza Gratis',
    'home.footer.tagline': 'Donde el Sonido Encuentra el Alma',
    // Studio
    'studio.describe': 'Describe Tu Canción',
    'studio.genre': 'Género',
    'studio.mood': 'Mood',
    'studio.vocals': 'Voces',
    'studio.male': 'Hombre',
    'studio.female': 'Mujer',
    'studio.none': 'Sin Voz',
    'studio.generate': 'Generar Canción',
    'studio.generated': 'Generada',
    'studio.generating': 'Sintetizando...',
    'studio.play': 'Reproducir',
    'studio.download': 'Descargar MP3',
    'studio.coverArt': 'Portada',
    'studio.lyrics': 'Letras',
    'studio.language': 'Idioma',
    'studio.instrumental': 'Instrumental',
    'studio.simple': 'Simple',
    'studio.advanced': 'Avanzado',
    'studio.freeTier': 'Plan gratis: canciones hasta 0:50 ·',
    'studio.upgrade': 'Mejora tu plan para canciones completas',
    'studio.promptPlaceholder': 'Un trap oscuro con 808s, voces con auto-tune y un piano misterioso...',
  },
  en: {
    'nav.explore': 'Explore',
    'nav.library': 'Library',
    'nav.pricing': 'Pricing',
    'nav.learn': 'Learn',
    'nav.create': 'Create',
    'nav.signin': 'Sign In',
    'nav.dashboard': 'Dashboard',
    'nav.createNow': 'Create Now',
    'nav.search': 'Search songs, artists...',
    'home.badge': 'Introducing MELAOS v5 — Our most powerful model',
    'home.title1': 'Make any song',
    'home.title2': 'you can imagine',
    'home.subtitle': 'Start with a simple prompt or dive into our pro editing tools. Your next track is just a step away.',
    'home.cta.create': 'Create',
    'home.cta.explore': 'Explore Music',
    'home.noCard': 'No credit card required · 1 free song daily',
    'home.features.title1': 'Everything you need to make music',
    'home.features.title2': 'your way',
    'home.features.subtitle': 'From instant generation to professional-grade editing tools, MELAOS has it all.',
    'home.f1.title': '1 free song, daily',
    'home.f1.desc': 'Generate 1 track every day at no cost. Full quality, no strings attached.',
    'home.f2.title': 'Free AI music generator',
    'home.f2.desc': 'Powered by MELAOS v5 — our most advanced generation model to date.',
    'home.f3.title': 'Share it with the world',
    'home.f3.desc': 'Publish instantly to your profile. Let fans discover your sound from anywhere.',
    'home.f4.title': 'Granular creation controls',
    'home.f4.desc': 'Dial in BPM, genre, mood, vocal style, and more with our pro parameter suite.',
    'home.f5.title': 'Commercial rights to your songs',
    'home.f5.desc': 'Pro and Premier subscribers own full commercial rights to every song they create.',
    'home.f6.title': 'Your complete creative workspace',
    'home.f6.desc': 'Multitrack DAW, lyrics editor, stem mixer — everything in one place.',
    'home.f7.title': 'Extract stems. Drop into your DAW.',
    'home.f7.desc': 'Separate vocals, drums, bass, and more. Export to Ableton, FL, Logic seamlessly.',
    'home.f8.title': 'Create everyday. Keep it all.',
    'home.f8.desc': 'Your entire library lives in the cloud. Unlimited storage on Pro and Premier.',
    'home.ready.title': 'Ready to start creating?',
    'home.ready.subtitle': 'Join 500,000+ artists making music with MELAOS STUDIOS · Eclat Universe.',
    'home.ready.cta': 'Start for Free',
    'home.footer.tagline': 'Where Sound Meets Soul',
    'studio.describe': 'Describe Your Song',
    'studio.genre': 'Genre',
    'studio.mood': 'Mood',
    'studio.vocals': 'Vocals',
    'studio.male': 'Male',
    'studio.female': 'Female',
    'studio.none': 'None',
    'studio.generate': 'Generate Track',
    'studio.generated': 'Generated',
    'studio.generating': 'Synthesizing...',
    'studio.play': 'Play Track',
    'studio.download': 'Download MP3',
    'studio.coverArt': 'Cover Art',
    'studio.lyrics': 'Lyrics',
    'studio.language': 'Language',
    'studio.instrumental': 'Instrumental',
    'studio.simple': 'Simple',
    'studio.advanced': 'Advanced',
    'studio.freeTier': 'Free tier: songs up to 0:50 ·',
    'studio.upgrade': 'Upgrade for full-length tracks',
    'studio.promptPlaceholder': 'A dark trap banger with 808s, auto-tune vocals, and a haunting piano melody...',
  },
} as const;

export type UiLang = 'es' | 'en';
type DictKey = keyof typeof DICT['en'];

export function useT() {
  const uiLang = useAudioStore(s => s.uiLang);
  const setUiLang = useAudioStore(s => s.setUiLang);
  const t = (key: DictKey): string => DICT[uiLang]?.[key] ?? DICT.en[key] ?? key;

  // Keep the document language attribute in sync for accessibility/SEO
  useEffect(() => {
    document.documentElement.lang = uiLang;
  }, [uiLang]);

  return { t, lang: uiLang, setLang: setUiLang };
}
