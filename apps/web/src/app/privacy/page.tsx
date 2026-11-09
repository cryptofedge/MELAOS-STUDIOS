import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ArrowDown } from 'lucide-react';

// Public privacy policy. Google Play requires a privacy policy URL for every
// app, reachable on the web and from inside the app (footer link). Both
// languages are on one page and rendered on the server, so reviewers and
// crawlers see the full text without running any JavaScript.
//
// It describes what the code actually does. If a feature changes (real
// accounts, payments, analytics, a new AI provider), update this page and the
// Play Console Data safety form together.

// Who is responsible and how to reach them. Keep in sync with the contact
// email in Play Console → Store settings.
const OPERATOR = 'Rafael Rodriguez Jr.';
const CONTACT_EMAIL = 'cryptofedge@gmail.com';
const EFFECTIVE_ES = '8 de noviembre de 2026';
const EFFECTIVE_EN = 'November 8, 2026';

export const metadata: Metadata = {
  title: 'Política de privacidad · Privacy Policy — MELAOS STUDIOS',
  description: 'Cómo MELAOS STUDIOS trata tus datos. How MELAOS STUDIOS handles your data.',
  alternates: { canonical: '/privacy' },
};

// Links in the policy text: orange, with a quiet underline that brightens on hover.
const LINK = 'text-melaos-orange underline underline-offset-4 decoration-melaos-orange/40 hoverable:hover:decoration-melaos-orange';

const Email = () => (
  <a href={`mailto:${CONTACT_EMAIL}`} className={LINK}>{CONTACT_EMAIL}</a>
);

const A = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className={LINK}>{children}</a>
);

// Each article resets the counter; each section shows its number (01, 02, …)
// in the left gutter. The number is decoration, hidden from screen readers.
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="[counter-increment:policy] border-t border-line-soft pt-6 pb-10 sm:pb-12 last:pb-0">
      <div className="flex items-baseline gap-4">
        <span aria-hidden className="w-8 shrink-0 font-mono text-[11px] text-fog-dim tabular-nums before:content-[counter(policy,decimal-leading-zero)]" />
        <h3 className="display font-light text-white text-lg sm:text-[22px] leading-snug">{title}</h3>
      </div>
      <div className="mt-4 sm:mt-5 sm:pl-12">
        <div className="max-w-[68ch] space-y-4 text-fog text-base sm:text-[17px] leading-relaxed [&_strong]:font-medium">{children}</div>
      </div>
    </section>
  );
}

const List = ({ children }: { children: ReactNode }) => <ul className="list-[square] pl-5 space-y-2.5 marker:text-melaos-orange/60">{children}</ul>;

// Article layout: on phones the heading stacks above the sections; on desktop
// it becomes a sticky left rail beside a reading column.
const ARTICLE = 'grid lg:grid-cols-12 gap-x-8 scroll-mt-[calc(var(--nav-h)+1.5rem)] [counter-reset:policy]';
const RAIL = 'lg:col-span-4 lg:self-start lg:sticky lg:top-[calc(var(--nav-h)+2.5rem)] lg:border-t lg:border-line-soft lg:pt-6 pb-8 lg:pb-0';
const ARTICLE_TITLE = 'display font-light text-white leading-[1.08] text-[clamp(1.6rem,3.2vw,2.5rem)]';
const EFFECTIVE = 'mt-4 label tabular-nums flex items-center gap-2';

function Spanish() {
  return (
    <article id="es" lang="es" className={ARTICLE}>
      <header className={RAIL}>
        <p className="label mb-4">01 — Español</p>
        <h2 className={ARTICLE_TITLE}>Política de privacidad</h2>
        <p className={EFFECTIVE}><span className="inline-block w-4 h-px bg-melaos-orange" aria-hidden />Vigente desde el {EFFECTIVE_ES}</p>
      </header>

      <div className="lg:col-span-8">

        <Section title="Quiénes somos">
          <p>
            MELAOS STUDIOS, una marca de Eclat Universe, ofrece el sitio web melaosstudios.com y la app de Android
            «MELAOS STUDIOS» (en conjunto, «el servicio»). La app de Android abre el mismo sitio web dentro de
            Google Chrome, así que esta política cubre ambos. El responsable es {OPERATOR}.
          </p>
        </Section>

        <Section title="En resumen">
          <List>
            <li>No hay cuentas reales todavía: no te pedimos nombre, correo ni contraseña. La pantalla «Entrar» es una vista previa y lo que escribas allí no se envía ni se guarda.</li>
            <li>Lo que escribes o subes para crear música se envía a proveedores de IA para generar el resultado.</li>
            <li>No mostramos anuncios, no usamos herramientas de analítica ni de seguimiento y no vendemos datos.</li>
            <li>No guardamos tus canciones, letras ni imágenes en nuestros servidores: se envían de vuelta a tu dispositivo.</li>
          </List>
        </Section>

        <Section title="Qué datos tratamos y para qué">
          <p><strong className="text-white">Lo que usas para crear.</strong> La descripción de la canción, el género, el mood, el BPM, el tipo de voz, el idioma, la letra que escribas, el artista de referencia, la descripción de la portada y las imágenes de referencia que subas. Los usamos solo para generar la canción, la letra o la portada que pides.</p>
          <p><strong className="text-white">Chat con Melao.</strong> Los mensajes que le escribes al asistente Melao, para generar su respuesta.</p>
          <p><strong className="text-white">Dictado por voz.</strong> Si usas el botón de micrófono, tu navegador convierte la voz en texto con su propio servicio de reconocimiento de voz (Web Speech API). En Chrome, incluida la app de Android, el audio lo procesa Google. Nosotros no recibimos ni guardamos el audio; solo el texto que resulte, si decides enviarlo. El permiso de micrófono lo pide el navegador y puedes retirarlo cuando quieras.</p>
          <p><strong className="text-white">Reportes de contenido.</strong> Si reportas una canción, una letra, una portada o una respuesta de Melao, recibimos el motivo, tus comentarios opcionales y el texto relacionado (descripción, letra, respuesta) para revisarlo. El reporte no incluye tu dirección IP ni ningún dato para identificarte.</p>
          <p><strong className="text-white">Datos técnicos.</strong> Usamos tu dirección IP solo para limitar cuántas canciones, portadas, mensajes y reportes se pueden pedir por hora. Ese contador vive en la memoria del servidor, no en una base de datos, y se borra al reiniciarse. Nuestro proveedor de hosting puede registrar datos técnicos habituales (IP, fecha, página pedida) para operar y proteger el servicio.</p>
          <p><strong className="text-white">Datos en tu dispositivo.</strong> En el almacenamiento local de tu navegador (localStorage) guardamos tus canciones favoritas, el volumen, el plan elegido, el idioma de la interfaz y si ya viste el recorrido de bienvenida. Estos datos no se envían a nuestros servidores.</p>
        </Section>

        <Section title="Con quién compartimos datos">
          <p>Solo con estos proveedores, y solo para prestar el servicio:</p>
          <List>
            <li><strong className="text-white">Replicate</strong> (modelo ACE-Step): recibe las etiquetas de estilo y la letra para generar el audio. <A href="https://replicate.com/privacy">Política de privacidad de Replicate</A>.</li>
            <li><strong className="text-white">fal.ai</strong> (modelo MiniMax Music, solo si eliges ese motor): recibe la descripción de estilo y la letra para generar el audio. <A href="https://fal.ai/legal/privacy-policy">Política de privacidad de fal.ai</A>.</li>
            <li><strong className="text-white">Google (API de Gemini)</strong>: recibe tu descripción para escribir letras, la descripción y la imagen de referencia para crear portadas, y tus mensajes al chat de Melao. Google los trata según los <A href="https://ai.google.dev/gemini-api/terms">términos de la API de Gemini</A> y su <A href="https://policies.google.com/privacy">política de privacidad</A>; según el plan de servicio, Google puede usar ese contenido para mejorar sus productos. No incluyas datos personales ni confidenciales en tus descripciones, letras, imágenes o mensajes.</li>
            <li><strong className="text-white">Render</strong>: aloja nuestro servidor. <A href="https://render.com/privacy">Política de privacidad de Render</A>.</li>
            <li><strong className="text-white">Nuestro canal de moderación</strong> (por ejemplo Discord o Slack): recibe los reportes de contenido para que el equipo los revise.</li>
            <li><strong className="text-white">Google Chrome</strong>: la app de Android funciona dentro de Chrome, que se rige por la <A href="https://www.google.com/chrome/privacy/">política de privacidad de Chrome</A>.</li>
          </List>
          <p>No vendemos ni alquilamos datos personales y no los compartimos con anunciantes.</p>
        </Section>

        <Section title="Cuánto tiempo los conservamos">
          <p>No guardamos lo que creas: la canción, la letra y la portada se envían a tu dispositivo, y si no las descargas se pierden al salir. Replicate, fal.ai y Google pueden conservar las solicitudes por un tiempo limitado según sus propias políticas. Los reportes se guardan en nuestro canal de moderación el tiempo necesario para atenderlos. Los datos de tu dispositivo se quedan allí hasta que borres los datos del sitio o de la app.</p>
        </Section>

        <Section title="Contenido generado por IA">
          <p>Las canciones, letras, portadas y respuestas del servicio las genera inteligencia artificial y pueden ser inexactas o inapropiadas. Cada una tiene un botón «Reportar» para avisarnos sin salir de la app. Revisamos los reportes y podemos ajustar o bloquear lo que genera contenido inapropiado.</p>
        </Section>

        <Section title="Menores de edad">
          <p>El servicio no está dirigido a menores de 13 años y no recopilamos a sabiendas datos de menores. Si crees que un menor nos envió datos personales, escríbenos y los eliminaremos.</p>
        </Section>

        <Section title="Tus opciones y derechos">
          <List>
            <li>Puedes usar el servicio sin dar datos personales.</li>
            <li>Puedes borrar los datos guardados en tu dispositivo desde la configuración del navegador o, en Android, en Ajustes → Apps → MELAOS STUDIOS → Almacenamiento → Borrar datos (y los datos del sitio en Chrome).</li>
            <li>Según dónde vivas, puedes tener derecho a pedir acceso, corrección o eliminación de tus datos, y a reclamar ante una autoridad de protección de datos. Escríbenos a <Email />.</li>
          </List>
        </Section>

        <Section title="Seguridad">
          <p>Todo el tráfico va cifrado por HTTPS y las claves de los proveedores de IA solo están en nuestro servidor, nunca en tu navegador.</p>
        </Section>

        <Section title="Cambios">
          <p>Si cambia lo que hacemos con los datos (por ejemplo, al añadir cuentas o pagos), actualizaremos esta página y la fecha de arriba.</p>
        </Section>

        <Section title="Contacto">
          <p>{OPERATOR}<br /><Email /></p>
        </Section>
      </div>
    </article>
  );
}

function English() {
  return (
    <article id="en" lang="en" className={ARTICLE}>
      <header className={RAIL}>
        <p className="label mb-4">02 — English</p>
        <h2 className={ARTICLE_TITLE}>Privacy Policy</h2>
        <p className={EFFECTIVE}><span className="inline-block w-4 h-px bg-melaos-orange" aria-hidden />Effective {EFFECTIVE_EN}</p>
      </header>

      <div className="lg:col-span-8">

        <Section title="Who we are">
          <p>
            MELAOS STUDIOS, an Eclat Universe brand, provides the website melaosstudios.com and the Android app
            “MELAOS STUDIOS” (together, “the service”). The Android app opens the same website inside Google Chrome,
            so this policy covers both. The operator is {OPERATOR}.
          </p>
        </Section>

        <Section title="In short">
          <List>
            <li>There are no real accounts yet: we do not ask for your name, email or password. The “Sign In” screen is a preview; nothing typed there is sent or stored.</li>
            <li>What you type or upload to create music is sent to AI providers to generate the result.</li>
            <li>We show no ads, use no analytics or tracking tools, and do not sell data.</li>
            <li>We do not keep your songs, lyrics or images on our servers: they are sent back to your device.</li>
          </List>
        </Section>

        <Section title="What data we process and why">
          <p><strong className="text-white">What you create with.</strong> The song description, genre, mood, BPM, vocal type, language, lyrics you write, reference artist, cover-art description and any reference images you upload. Used only to generate the song, lyrics or cover art you ask for.</p>
          <p><strong className="text-white">Chat with Melao.</strong> The messages you send to the Melao assistant, to generate its reply.</p>
          <p><strong className="text-white">Voice dictation.</strong> If you use the microphone button, your browser turns your voice into text with its own speech recognition service (Web Speech API). In Chrome, including the Android app, Google processes the audio. We never receive or store the audio, only the resulting text if you choose to submit it. The browser asks for microphone permission, and you can withdraw it at any time.</p>
          <p><strong className="text-white">Content reports.</strong> If you report a song, lyrics, cover art or a Melao reply, we receive the reason, your optional comments and the related text (description, lyrics, reply) so we can review it. Reports do not include your IP address or anything that identifies you.</p>
          <p><strong className="text-white">Technical data.</strong> We use your IP address only to limit how many songs, cover images, messages and reports can be requested per hour. That counter lives in the server’s memory, not in a database, and is cleared on restart. Our hosting provider may record standard technical logs (IP address, time, page requested) to run and protect the service.</p>
          <p><strong className="text-white">Data on your device.</strong> Your browser’s local storage (localStorage) keeps your liked songs, volume, selected plan, interface language and whether you have seen the welcome tour. This data is not sent to our servers.</p>
        </Section>

        <Section title="Who we share data with">
          <p>Only these providers, and only to run the service:</p>
          <List>
            <li><strong className="text-white">Replicate</strong> (ACE-Step model): receives the style tags and lyrics to generate the audio. <A href="https://replicate.com/privacy">Replicate privacy policy</A>.</li>
            <li><strong className="text-white">fal.ai</strong> (MiniMax Music model, only if you choose that engine): receives the style description and lyrics to generate the audio. <A href="https://fal.ai/legal/privacy-policy">fal.ai privacy policy</A>.</li>
            <li><strong className="text-white">Google (Gemini API)</strong>: receives your description to write lyrics, the description and reference image to create cover art, and your messages to Melao. Google handles them under the <A href="https://ai.google.dev/gemini-api/terms">Gemini API terms</A> and its <A href="https://policies.google.com/privacy">privacy policy</A>; depending on the service plan, Google may use that content to improve its products. Do not put personal or confidential information in your descriptions, lyrics, images or messages.</li>
            <li><strong className="text-white">Render</strong>: hosts our server. <A href="https://render.com/privacy">Render privacy policy</A>.</li>
            <li><strong className="text-white">Our moderation channel</strong> (for example Discord or Slack): receives content reports so the team can review them.</li>
            <li><strong className="text-white">Google Chrome</strong>: the Android app runs inside Chrome, which is covered by the <A href="https://www.google.com/chrome/privacy/">Chrome privacy notice</A>.</li>
          </List>
          <p>We do not sell or rent personal data and do not share it with advertisers.</p>
        </Section>

        <Section title="How long we keep it">
          <p>We do not store what you create: songs, lyrics and cover art are sent to your device, and are gone when you leave unless you download them. Replicate, fal.ai and Google may keep requests for a limited time under their own policies. Reports stay in our moderation channel for as long as needed to handle them. Data on your device stays there until you clear the site’s or the app’s data.</p>
        </Section>

        <Section title="AI-generated content">
          <p>Songs, lyrics, cover art and replies in the service are generated by artificial intelligence and can be inaccurate or inappropriate. Each one has a “Report” button so you can tell us without leaving the app. We review reports and may adjust or block what produces inappropriate content.</p>
        </Section>

        <Section title="Children">
          <p>The service is not directed to children under 13, and we do not knowingly collect data from children. If you believe a child has sent us personal data, contact us and we will delete it.</p>
        </Section>

        <Section title="Your choices and rights">
          <List>
            <li>You can use the service without giving any personal data.</li>
            <li>You can delete the data stored on your device from your browser settings or, on Android, in Settings → Apps → MELAOS STUDIOS → Storage → Clear data (and the site data in Chrome).</li>
            <li>Depending on where you live, you may have the right to access, correct or delete your data and to complain to a data protection authority. Write to <Email />.</li>
          </List>
        </Section>

        <Section title="Security">
          <p>All traffic is encrypted with HTTPS, and the AI providers’ keys live only on our server, never in your browser.</p>
        </Section>

        <Section title="Changes">
          <p>If what we do with data changes (for example when accounts or payments are added), we will update this page and the date above.</p>
        </Section>

        <Section title="Contact">
          <p>{OPERATOR}<br /><Email /></p>
        </Section>
      </div>
    </article>
  );
}

// Language jump links: a two-cell ruled strip.
const JUMP = 'group bg-ink-0 min-h-[52px] px-4 flex items-center justify-between gap-3 transition-colors hoverable:hover:bg-ink-1';
const JUMP_TEXT = 'font-mono text-[11px] tracking-[0.14em] uppercase text-[#ECECF1] transition-colors hoverable:group-hover:text-melaos-orange';
const JUMP_ICON = 'w-4 h-4 shrink-0 text-fog-dim transition-colors hoverable:group-hover:text-melaos-orange';

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-safe md:px-8 pt-10 sm:pt-16 pb-16 sm:pb-24">
      <header className="grid lg:grid-cols-12 gap-8 items-end border-b border-line-soft pb-8 sm:pb-10">
        <div className="lg:col-span-8">
          <p className="label mb-4 flex items-center gap-2"><span className="inline-block w-6 h-px bg-melaos-orange" aria-hidden />Legal</p>
          <h1 className="display font-light text-white leading-[1] text-[clamp(2rem,7vw,4.5rem)]">
            Privacidad <span className="text-fog-faint">·</span> <span className="font-medium text-melaos-orange">Privacy</span>
          </h1>
        </div>
        <nav className="lg:col-span-4 grid grid-cols-2 gap-px bg-line-soft border border-line-soft">
          <a href="#es" className={JUMP}>
            <span className="flex items-baseline gap-3">
              <span aria-hidden className="font-mono text-[11px] text-fog-dim tabular-nums">01</span>
              <span className={JUMP_TEXT}>Español</span>
            </span>
            <ArrowDown className={JUMP_ICON} strokeWidth={1.5} aria-hidden />
          </a>
          <a href="#en" className={JUMP}>
            <span className="flex items-baseline gap-3">
              <span aria-hidden className="font-mono text-[11px] text-fog-dim tabular-nums">02</span>
              <span className={JUMP_TEXT}>English</span>
            </span>
            <ArrowDown className={JUMP_ICON} strokeWidth={1.5} aria-hidden />
          </a>
        </nav>
      </header>
      <div className="mt-10 sm:mt-14"><Spanish /></div>
      <hr className="my-16 sm:my-24 border-line-soft" />
      <English />
    </div>
  );
}
