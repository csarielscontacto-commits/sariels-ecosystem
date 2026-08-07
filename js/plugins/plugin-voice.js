// js/plugins/plugin-voice.js - Talaverín Voice OS - GS
export const voicePlugin = {
    recognition: null,
    synth: window.speechSynthesis,

    init() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.log('❌ Tu nave no jala voz, wey');
            return false;
        }
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'es-MX';
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        console.log('✅ Talaverín Voice listo - GS');
        return true;
    },

    hablar(texto) {
        if (!this.synth) return;
        this.synth.cancel();
        const utter = new SpeechSynthesisUtterance(texto);
        utter.lang = 'es-MX';
        utter.rate = 1.1;
        utter.pitch = 1.0;
        this.synth.speak(utter);
    },

    interpretar(texto) {
        const t = texto.toLowerCase();
        if (t.includes('muro')) return 'muro';
        if (t.includes('red') || t.includes('mired') || t.includes('mi red')) return 'red';
        if (t.includes('tiendita') || t.includes('tienda') || t.includes('comprar')) return 'tiendita';
        if (t.includes('foto')) return 'fotos';
        if (t.includes('noticia') || t.includes('news')) return 'noticias';
        if (t.includes('80') || t.includes('ochenta')) return '80';
        return null;
    },

    escuchar() {
        if (!this.recognition) this.init();
        try {
            this.recognition.start();
            console.log('🎤 Escuchando... di: muro, red, tiendita');
            document.dispatchEvent(new CustomEvent('talaverin:escuchando'));
        } catch (e) {
            console.log('Ya estoy escuchando wey');
        }
    }
};