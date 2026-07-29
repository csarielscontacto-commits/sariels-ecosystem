import React, { useState, useEffect, useRef } from 'react';

// ================================================================
// ESTILOS CSS-IN-JS
// ================================================================
const styles = {
  container: {
    minHeight: '100vh',
    background: '#0F2D1A',
    color: '#e8f0f8',
    fontFamily: '"Space Grotesk", "Inter", system-ui, sans-serif',
    position: 'relative',
  },
  // ===== MODAL 18+ =====
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.85)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px',
  },
  modalCard: {
    background: '#123722',
    border: '1px solid #D4AF37',
    borderRadius: '16px',
    padding: '32px',
    maxWidth: '480px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    position: 'relative',
  },
  modalTitle: {
    fontFamily: '"Orbitron", monospace',
    fontSize: '1.3rem',
    color: '#D4AF37',
    textAlign: 'center',
    marginBottom: '12px',
  },
  modalText: {
    fontSize: '0.85rem',
    color: '#8ba3c7',
    lineHeight: 1.7,
    marginBottom: '16px',
    textAlign: 'center',
  },
  modalCheckLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    fontSize: '0.8rem',
    color: '#8ba3c7',
    cursor: 'pointer',
    padding: '8px 0',
    marginBottom: '16px',
  },
  modalCheckbox: {
    marginTop: '3px',
    width: '18px',
    height: '18px',
    accentColor: '#D4AF37',
    cursor: 'pointer',
    flexShrink: 0,
  },
  modalButtons: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  btnEnter: {
    flex: 1,
    padding: '12px 24px',
    background: '#D4AF37',
    color: '#0F2D1A',
    border: 'none',
    borderRadius: '30px',
    fontFamily: '"Orbitron", monospace',
    fontSize: '0.7rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  btnEnterDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  btnExit: {
    padding: '12px 24px',
    background: 'transparent',
    color: '#8ba3c7',
    border: '1px solid rgba(212,175,55,0.2)',
    borderRadius: '30px',
    fontFamily: '"Orbitron", monospace',
    fontSize: '0.7rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  // ===== APP =====
  app: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '16px 20px 30px',
  },
  // ===== HEADER =====
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0 16px',
    borderBottom: '2px solid rgba(212,175,55,0.15)',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textDecoration: 'none',
  },
  logoIcon: {
    fontSize: '1.8rem',
    filter: 'drop-shadow(0 0 20px rgba(212,175,55,0.2))',
  },
  hex: {
    display: 'inline-block',
    background: '#0F2D1A',
    color: '#D4AF37',
    padding: '3px 10px',
    borderRadius: '6px',
    fontSize: '0.9rem',
    fontWeight: 900,
    border: '2px solid #D4AF37',
    fontFamily: '"Orbitron", monospace',
  },
  logoText: {
    fontFamily: '"Orbitron", monospace',
    fontSize: '1.1rem',
    fontWeight: 900,
    letterSpacing: '2px',
    background: 'linear-gradient(135deg, #D4AF37, #1a4a2a)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  headerTitle: {
    fontFamily: '"Orbitron", monospace',
    fontSize: '1rem',
    color: '#D4AF37',
    letterSpacing: '1px',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  // ===== TABS =====
  tabs: {
    display: 'flex',
    gap: '4px',
    marginBottom: '16px',
    flexWrap: 'wrap',
  },
  tab: {
    padding: '8px 18px',
    background: 'transparent',
    border: 'none',
    color: '#4a6a8a',
    fontFamily: '"Orbitron", monospace',
    fontSize: '0.6rem',
    fontWeight: 600,
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    transition: 'all 0.3s',
  },
  tabActive: {
    color: '#D4AF37',
    borderBottom: '2px solid #D4AF37',
  },
  // ===== TOGGLE ANONIMO =====
  toggleAnon: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.55rem',
    color: '#8ba3c7',
    fontFamily: '"Orbitron", monospace',
    cursor: 'pointer',
  },
  toggleSwitch: {
    width: '40px',
    height: '22px',
    background: '#2a3a2a',
    borderRadius: '12px',
    position: 'relative',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  toggleSwitchActive: {
    background: '#D4AF37',
  },
  toggleKnob: {
    width: '18px',
    height: '18px',
    background: 'white',
    borderRadius: '50%',
    position: 'absolute',
    top: '2px',
    left: '2px',
    transition: 'all 0.3s',
  },
  toggleKnobActive: {
    left: '20px',
  },
  // ===== QUICK POST =====
  quickPost: {
    background: 'rgba(18,55,34,0.5)',
    border: '1px solid rgba(212,175,55,0.15)',
    borderRadius: '16px',
    padding: '16px 18px',
    marginBottom: '16px',
  },
  quickPostInput: {
    width: '100%',
    padding: '10px 14px',
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(212,175,55,0.1)',
    borderRadius: '10px',
    color: '#e8f0f8',
    fontSize: '0.85rem',
    outline: 'none',
    fontFamily: '"Space Grotesk", sans-serif',
    marginBottom: '10px',
  },
  flairSelector: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    marginBottom: '10px',
  },
  flairChip: {
    padding: '4px 14px',
    borderRadius: '20px',
    fontSize: '0.55rem',
    fontFamily: '"Orbitron", monospace',
    fontWeight: 600,
    cursor: 'pointer',
    border: '1px solid rgba(212,175,55,0.15)',
    background: 'transparent',
    color: '#8ba3c7',
    transition: 'all 0.3s',
  },
  flairChipActive: {
    background: 'rgba(212,175,55,0.15)',
    borderColor: '#D4AF37',
    color: '#D4AF37',
  },
  quickPostActions: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  quickPostBtn: {
    padding: '6px 16px',
    background: '#D4AF37',
    color: '#0F2D1A',
    border: 'none',
    borderRadius: '30px',
    fontFamily: '"Orbitron", monospace',
    fontSize: '0.55rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  quickPostIcon: {
    background: 'none',
    border: 'none',
    color: '#4a6a8a',
    fontSize: '1rem',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '8px',
    transition: 'all 0.3s',
  },
  // ===== FEED =====
  feed: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  // ===== POST CARD (estilo Reddit) =====
  postCard: {
    background: '#123722',
    border: '1px solid rgba(212,175,55,0.1)',
    borderRadius: '16px',
    padding: '16px',
    display: 'flex',
    gap: '14px',
    transition: 'all 0.3s',
  },
  voteBar: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    paddingTop: '4px',
    flexShrink: 0,
    width: '36px',
  },
  voteBtn: {
    background: 'none',
    border: 'none',
    color: '#4a6a8a',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'all 0.3s',
    padding: '2px',
    lineHeight: 1,
  },
  voteBtnUp: {
    color: '#D4AF37',
  },
  voteCount: {
    fontFamily: '"Orbitron", monospace',
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#e8f0f8',
  },
  postContent: {
    flex: 1,
    minWidth: 0,
  },
  postHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '6px',
  },
  flairBadge: {
    fontSize: '0.5rem',
    padding: '2px 12px',
    borderRadius: '20px',
    fontWeight: 700,
    fontFamily: '"Orbitron", monospace',
  },
  flairMeme: { background: 'rgba(212,175,55,0.2)', color: '#D4AF37' },
  flairConfesion: { background: 'rgba(255,51,102,0.15)', color: '#ff3366' },
  flairChisme: { background: 'rgba(0,212,255,0.15)', color: '#00d4ff' },
  flairCrush: { background: 'rgba(255,107,157,0.15)', color: '#ff6b9d' },
  flairRant: { background: 'rgba(255,165,0,0.15)', color: '#ffa500' },
  flairExposed: { background: 'rgba(255,51,102,0.2)', color: '#ff3366' },

  postAuthor: {
    fontSize: '0.65rem',
    color: '#4a6a8a',
    fontFamily: '"Orbitron", monospace',
  },
  postDate: {
    fontSize: '0.55rem',
    color: '#4a6a8a',
  },
  postText: {
    fontSize: '0.9rem',
    lineHeight: 1.6,
    color: '#e8f0f8',
    marginBottom: '8px',
  },
  postTextBlur: {
    filter: 'blur(6px)',
    cursor: 'pointer',
    userSelect: 'none',
  },
  revealText: {
    fontSize: '0.7rem',
    color: '#D4AF37',
    cursor: 'pointer',
    fontFamily: '"Orbitron", monospace',
  },
  // ===== MEDIA =====
  postMedia: {
    borderRadius: '12px',
    overflow: 'hidden',
    marginBottom: '8px',
    position: 'relative',
    background: '#0a0a0a',
  },
  postMediaImg: {
    width: '100%',
    maxHeight: '300px',
    objectFit: 'cover',
    display: 'block',
  },
  postMediaVideo: {
    width: '100%',
    maxHeight: '400px',
    objectFit: 'cover',
    display: 'block',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '44px',
    height: '44px',
    background: 'rgba(212,175,55,0.2)',
    border: '2px solid rgba(212,175,55,0.5)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 3,
    transition: 'all 0.3s',
    backdropFilter: 'blur(4px)',
    opacity: 0.7,
  },
  playButtonHidden: {
    opacity: 0,
    pointerEvents: 'none',
  },
  playTriangle: {
    width: 0,
    height: 0,
    borderLeft: '14px solid #D4AF37',
    borderTop: '8px solid transparent',
    borderBottom: '8px solid transparent',
    marginLeft: '4px',
  },
  // ===== POST ACTIONS =====
  postActions: {
    display: 'flex',
    gap: '16px',
    paddingTop: '10px',
    borderTop: '1px solid rgba(212,175,55,0.08)',
    flexWrap: 'wrap',
  },
  actionBtn: {
    background: 'none',
    border: 'none',
    color: '#4a6a8a',
    cursor: 'pointer',
    fontSize: '0.7rem',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'all 0.3s',
    fontFamily: '"Space Grotesk", sans-serif',
    padding: '4px 8px',
    borderRadius: '8px',
  },
  // ===== TOAST =====
  toast: {
    position: 'fixed',
    bottom: '80px',
    left: '50%',
    transform: 'translateX(-50%) translateY(80px)',
    background: '#0F2D1A',
    color: '#D4AF37',
    padding: '12px 24px',
    borderRadius: '16px',
    fontWeight: 600,
    fontSize: '0.8rem',
    opacity: 0,
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: 5000,
    pointerEvents: 'none',
    fontFamily: '"Orbitron", monospace',
    border: '1px solid rgba(212,175,55,0.15)',
    maxWidth: '90%',
    textAlign: 'center',
  },
  toastActive: {
    opacity: 1,
    transform: 'translateX(-50%) translateY(0)',
  },
  toastError: {
    background: '#ff3366',
    color: 'white',
  },
  // ===== FOOTER =====
  footer: {
    marginTop: '40px',
    paddingTop: '20px',
    borderTop: '1px solid rgba(212,175,55,0.08)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  },
  footerText: {
    color: '#4a6a8a',
    fontSize: '0.55rem',
    letterSpacing: '0.5px',
    fontFamily: '"Orbitron", monospace',
  },
  footerBrand: {
    color: '#D4AF37',
  },
  footerLinks: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  footerLink: {
    color: '#4a6a8a',
    textDecoration: 'none',
    fontSize: '0.55rem',
    transition: 'all 0.3s',
    fontFamily: '"Orbitron", monospace',
    cursor: 'pointer',
  },
  modBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.45rem',
    color: '#4a6a8a',
    fontFamily: '"Orbitron", monospace',
    padding: '2px 10px',
    borderRadius: '12px',
    background: 'rgba(212,175,55,0.05)',
    border: '1px solid rgba(212,175,55,0.08)',
  },
};

// ================================================================
// DATOS MOCK
// ================================================================
const MOCK_POSTS = [
  {
    id: 1,
    flair: 'MEME',
    author: 'Criptonita',
    isAnon: false,
    content: 'Cuando la IA te hace la tarea y el profe dice "explícalo"',
    media: { type: 'image', url: 'https://picsum.photos/seed/meme1/600/400' },
    votes: 342,
    userVote: 0,
    comments: 45,
    date: Date.now() - 3600000,
    isRevealed: true,
  },
  {
    id: 2,
    flair: 'CONFESIÓN',
    author: 'Anónimo',
    isAnon: true,
    content: 'A veces finjo que entiendo las clases y luego veo tutoriales en 2x en casa. No sé si soy un genio o un fraude.',
    media: null,
    votes: 128,
    userVote: 0,
    comments: 32,
    date: Date.now() - 7200000,
    isRevealed: false,
  },
  {
    id: 3,
    flair: 'CHISME',
    author: 'Anónimo',
    isAnon: true,
    content: 'Dicen que el de sistemas tiene un bot que hace las tareas por $50. Alguien confirmó?',
    media: null,
    votes: 89,
    userVote: 0,
    comments: 27,
    date: Date.now() - 14400000,
    isRevealed: true,
  },
  {
    id: 4,
    flair: 'CRUSH',
    author: 'Anónimo',
    isAnon: true,
    content: '💘 Al de gorra negra del 3er piso de biblioteca... si estás viendo esto, háblame. Tu sonrisa me desconfigura.',
    media: null,
    votes: 201,
    userVote: 0,
    comments: 18,
    date: Date.now() - 21600000,
    isRevealed: true,
  },
  {
    id: 5,
    flair: 'RANT',
    author: 'Kronos',
    isAnon: false,
    content: 'Odio cuando la plataforma se cae 5 minutos antes de la entrega. ¿Por qué siempre? ¿Hay una conspiración?',
    media: { type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
    votes: 56,
    userVote: 0,
    comments: 9,
    date: Date.now() - 86400000,
    isRevealed: true,
  },
];

const FLAIRS = ['MEME', 'CONFESIÓN', 'CHISME', 'RANT', 'CRUSH', 'EXPOSED'];
const FLAIR_COLORS = {
  MEME: 'flairMeme',
  CONFESIÓN: 'flairConfesion',
  CHISME: 'flairChisme',
  RANT: 'flairRant',
  CRUSH: 'flairCrush',
  EXPOSED: 'flairExposed',
};

// ================================================================
// COMPONENTE PRINCIPAL
// ================================================================
const MuroMemes = () => {
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [ageCheck, setAgeCheck] = useState(false);
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [activeTab, setActiveTab] = useState('hot');
  const [isAnon, setIsAnon] = useState(true);
  const [postText, setPostText] = useState('');
  const [selectedFlair, setSelectedFlair] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('');
  const toastTimeout = useRef(null);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);

  // ================================================================
  // VERIFICAR EDAD AL CARGAR
  // ================================================================
  useEffect(() => {
    const confirmed = localStorage.getItem('csariels_18_confirmed');
    if (confirmed === 'true') {
      setAgeConfirmed(true);
    }
  }, []);

  // ================================================================
  // FUNCIONES
  // ================================================================
  const handleAgeConfirm = () => {
    if (!ageCheck) return;
    localStorage.setItem('csariels_18_confirmed', 'true');
    setAgeConfirmed(true);
    mostrarToast('🔞 Acceso concedido al Muro +18');
  };

  const handleAgeExit = () => {
    window.location.href = 'https://www.google.com';
  };

  const toggleVote = (postId, direction) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        let newVote = p.userVote;
        let newVotes = p.votes;
        
        if (newVote === direction) {
          newVote = 0;
          newVotes -= direction;
        } else {
          if (newVote === 0) {
            newVotes += direction;
          } else {
            newVotes += direction - newVote;
          }
          newVote = direction;
        }
        
        return { ...p, userVote: newVote, votes: newVotes };
      }
      return p;
    }));
  };

  const toggleReveal = (postId) => {
    setPosts(prev => prev.map(p => 
      p.id === postId ? { ...p, isRevealed: !p.isRevealed } : p
    ));
  };

  const handlePublicar = () => {
    if (!postText.trim() && !videoFile) {
      mostrarToast('⚠️ Escribe algo o sube un archivo', 'error');
      return;
    }
    if (!selectedFlair) {
      mostrarToast('⚠️ Selecciona un flair', 'error');
      return;
    }

    const newPost = {
      id: Date.now(),
      flair: selectedFlair,
      author: isAnon ? 'Anónimo' : 'Usuario',
      isAnon: isAnon,
      content: postText || '📹 Video compartido',
      media: videoFile ? { type: 'video', url: videoPreview } : null,
      votes: 0,
      userVote: 0,
      comments: 0,
      date: Date.now(),
      isRevealed: true,
    };

    setPosts(prev => [newPost, ...prev]);
    setPostText('');
    setSelectedFlair('');
    setVideoFile(null);
    setVideoPreview(null);
    mostrarToast('✅ Publicación creada');
  };

  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoPreview(url);
    mostrarToast('🎬 Video cargado');
    e.target.value = '';
  };

  const removeVideo = () => {
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoFile(null);
    setVideoPreview(null);
  };

  const mostrarToast = (mensaje, tipo = '') => {
    setToastMessage(mensaje);
    setToastType(tipo);
    clearTimeout(toastTimeout.current);
    toastTimeout.current = setTimeout(() => {
      setToastMessage('');
      setToastType('');
    }, 3000);
  };

  const formatDate = (timestamp) => {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return 'Ahora';
    if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
    return `hace ${Math.floor(diff / 86400)}d`;
  };

  // ================================================================
  // RENDER - MODAL 18+
  // ================================================================
  if (!ageConfirmed) {
    return (
      <div style={styles.container}>
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <h2 style={styles.modalTitle}>🔞 Zona +18 - Memes y Confesiones</h2>
            <p style={styles.modalText}>
              Este espacio puede contener humor adulto, confesiones anónimas y lenguaje subido de tono.
              Al continuar confirmas que eres mayor de 18 años, aceptas nuestros Términos,
              Aviso de Privacidad y Moderación por IA.
              <br /><br />
              <strong style={{ color: '#ff3366' }}>Contenido sexual explícito, desnudos reales o ilegal
              está totalmente prohibido</strong> y será eliminado con baneo permanente.
            </p>

            <label style={styles.modalCheckLabel}>
              <input
                type="checkbox"
                style={styles.modalCheckbox}
                checked={ageCheck}
                onChange={() => setAgeCheck(!ageCheck)}
              />
              <span>Confirmo que tengo 18 años o más y acepto los Términos</span>
            </label>

            <div style={styles.modalButtons}>
              <button
                style={{
                  ...styles.btnEnter,
                  ...(!ageCheck ? styles.btnEnterDisabled : {}),
                }}
                onClick={handleAgeConfirm}
                disabled={!ageCheck}
              >
                Entrar al Muro
              </button>
              <button style={styles.btnExit} onClick={handleAgeExit}>
                Salir
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ================================================================
  // RENDER - MURO
  // ================================================================
  return (
    <div style={styles.container}>
      <div style={styles.app}>
        {/* ===== HEADER ===== */}
        <header style={styles.header}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>
              <span style={styles.hex}>◈</span>
            </span>
            <span style={styles.logoText}>Csariel's</span>
          </div>
          <h1 style={styles.headerTitle}>MEMES Y CONFESIONES</h1>
          <div style={styles.headerActions}>
            <button
              className="btn"
              style={{
                padding: '6px 16px',
                background: '#D4AF37',
                color: '#0F2D1A',
                border: 'none',
                borderRadius: '30px',
                fontFamily: '"Orbitron", monospace',
                fontSize: '0.55rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
              onClick={() => document.getElementById('postInput')?.focus()}
            >
              <i className="fas fa-plus"></i> Confesar
            </button>
            <div style={styles.toggleAnon} onClick={() => setIsAnon(!isAnon)}>
              <span>🕵️</span>
              <span style={{ fontSize: '0.5rem' }}>Anónimo</span>
              <div style={{
                ...styles.toggleSwitch,
                ...(isAnon ? styles.toggleSwitchActive : {}),
              }}>
                <div style={{
                  ...styles.toggleKnob,
                  ...(isAnon ? styles.toggleKnobActive : {}),
                }} />
              </div>
            </div>
          </div>
        </header>

        {/* ===== TABS ===== */}
        <div style={styles.tabs}>
          {['hot', 'new', 'top'].map(tab => (
            <button
              key={tab}
              style={{
                ...styles.tab,
                ...(activeTab === tab ? styles.tabActive : {}),
              }}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'hot' && '🔥 Hot'}
              {tab === 'new' && '🆕 Nuevo'}
              {tab === 'top' && '💀 Top'}
            </button>
          ))}
          <span style={styles.modBadge}>
            <i className="fas fa-robot"></i> Moderación IA
          </span>
        </div>

        {/* ===== QUICK POST ===== */}
        <div style={styles.quickPost}>
          <input
            id="postInput"
            style={styles.quickPostInput}
            placeholder="Confiesa algo o suelta el meme..."
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
          />

          <div style={styles.flairSelector}>
            {FLAIRS.map(flair => (
              <button
                key={flair}
                style={{
                  ...styles.flairChip,
                  ...(selectedFlair === flair ? styles.flairChipActive : {}),
                }}
                onClick={() => setSelectedFlair(flair)}
              >
                {flair}
              </button>
            ))}
          </div>

          <div style={styles.quickPostActions}>
            <button style={styles.quickPostBtn} onClick={handlePublicar}>
              <i className="fas fa-rocket"></i> Publicar
            </button>
            <button style={styles.quickPostIcon}>
              <i className="fas fa-image"></i>
            </button>
            <label style={{ cursor: 'pointer' }}>
              <button style={styles.quickPostIcon} as="span">
                <i className="fas fa-video"></i>
              </button>
              <input
                type="file"
                accept="video/*"
                style={{ display: 'none' }}
                onChange={handleVideoSelect}
              />
            </label>
            <button style={styles.quickPostIcon}>
              <i className="fas fa-smile"></i>
            </button>
            {videoPreview && (
              <button
                style={{ ...styles.quickPostIcon, color: '#ff3366' }}
                onClick={removeVideo}
              >
                <i className="fas fa-times"></i> Video
              </button>
            )}
          </div>
        </div>

        {/* ===== FEED ===== */}
        <div style={styles.feed}>
          {posts.map(post => {
            const flairStyle = FLAIR_COLORS[post.flair] || 'flairMeme';
            const isConfesion = post.flair === 'CONFESIÓN' && !post.isRevealed;

            return (
              <div key={post.id} style={styles.postCard}>
                {/* VOTES */}
                <div style={styles.voteBar}>
                  <button
                    style={{
                      ...styles.voteBtn,
                      ...(post.userVote === 1 ? styles.voteBtnUp : {}),
                    }}
                    onClick={() => toggleVote(post.id, 1)}
                  >
                    <i className="fas fa-arrow-up"></i>
                  </button>
                  <span style={styles.voteCount}>{post.votes}</span>
                  <button
                    style={{
                      ...styles.voteBtn,
                      ...(post.userVote === -1 ? { color: '#ff3366' } : {}),
                    }}
                    onClick={() => toggleVote(post.id, -1)}
                  >
                    <i className="fas fa-arrow-down"></i>
                  </button>
                </div>

                {/* CONTENT */}
                <div style={styles.postContent}>
                  <div style={styles.postHeader}>
                    <span style={{ ...styles.flairBadge, ...styles[flairStyle] }}>
                      {post.flair}
                    </span>
                    <span style={styles.postAuthor}>
                      {post.isAnon ? '👤 Anónimo' : post.author}
                    </span>
                    <span style={styles.postDate}>
                      {formatDate(post.date)}
                    </span>
                  </div>

                  <div
                    style={{
                      ...styles.postText,
                      ...(isConfesion ? styles.postTextBlur : {}),
                    }}
                    onClick={() => isConfesion && toggleReveal(post.id)}
                  >
                    {post.content}
                  </div>

                  {isConfesion && (
                    <span style={styles.revealText} onClick={() => toggleReveal(post.id)}>
                      👆 Toca para revelar
                    </span>
                  )}

                  {/* MEDIA */}
                  {post.media && (
                    <div style={styles.postMedia}>
                      {post.media.type === 'image' ? (
                        <img
                          src={post.media.url}
                          alt="Meme"
                          style={styles.postMediaImg}
                          loading="lazy"
                        />
                      ) : (
                        <video
                          src={post.media.url}
                          style={styles.postMediaVideo}
                          autoPlay
                          muted
                          loop
                          playsInline
                          preload="metadata"
                        />
                      )}
                    </div>
                  )}

                  {/* ACTIONS */}
                  <div style={styles.postActions}>
                    <button style={styles.actionBtn}>
                      <i className="fas fa-comment"></i> 💬 {post.comments}
                    </button>
                    <button style={styles.actionBtn}>
                      <i className="fas fa-share"></i> Compartir
                    </button>
                    <button style={styles.actionBtn}>
                      <i className="fas fa-bookmark"></i> Guardar
                    </button>
                    <button style={{ ...styles.actionBtn, color: '#ff3366' }}>
                      <i className="fas fa-flag"></i> Reportar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ===== FOOTER ===== */}
        <footer style={styles.footer}>
          <span style={styles.footerText}>
            <span style={styles.footerBrand}>◈ Csariel's</span> — Memes y Confesiones · 18+ · Moderación IA
          </span>
          <div style={styles.footerLinks}>
            <a href="#" style={styles.footerLink} onClick={() => setAgeConfirmed(false)}>
              🔞 Verificar edad
            </a>
            <a href="#" style={styles.footerLink}>📜 Términos</a>
            <a href="#" style={styles.footerLink}>🔐 Privacidad</a>
          </div>
        </footer>
      </div>

      {/* ===== TOAST ===== */}
      <div style={{
        ...styles.toast,
        ...(toastMessage ? styles.toastActive : {}),
        ...(toastType === 'error' ? styles.toastError : {}),
      }}>
        {toastMessage}
      </div>
    </div>
  );
};

export default MuroMemes;