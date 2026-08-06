export const voicePlugin = {
  recognition: null,
  init() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return null;
    this.recognition = new SR();
    this.recognition.lang = 'es-MX';
    return this.recognition;
  },
  interpretar(texto) {
    texto = texto.toLowerCase().replace('talaverín','').replace('marquinhos','').trim();
    if(texto.includes('muro')) return 'muro';
    if(texto.includes('red')) return 'red';
    if(texto.includes('tienda') || texto.includes('tiendita')) return 'tiendita';
    if(texto.includes('noticia')) return 'noticias';
    if(texto.includes('foto')) return 'fotos';
    return null;
  },
  hablar(texto) {
    const voz = new SpeechSynthesisUtterance(texto);
    voz.lang = 'es-MX';
    voz.rate = 1.1;
    speechSynthesis.speak(voz);
  }
}