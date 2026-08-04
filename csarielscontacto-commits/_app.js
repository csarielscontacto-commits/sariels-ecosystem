import '../config/i18n';
import '../styles/globals.css'; // O el nombre de tu css global si lo tienes

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}