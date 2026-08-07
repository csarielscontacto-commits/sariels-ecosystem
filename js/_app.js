// js/_app.js
import './i18n.js'; // Importa el motor de idiomas desde la misma carpeta js

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}