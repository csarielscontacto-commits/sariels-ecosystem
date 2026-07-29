import React, { useState, useEffect, useRef } from 'react';

// ================================================================
// ESTILOS INTEGRADOS (CSS-in-JS)
// ================================================================
const styles = {
  container: {
    position: 'relative',
    minHeight: '100vh',
    background: '#05080f',
    color: '#e8f0f8',
    fontFamily: '"Space Grotesk", "Inter", system-ui, sans-serif',
  },
  starsCanvas: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
    pointerEvents: 'none',
  },
  nebula: {
    position: 'fixed',
    borderRadius: '50%',
    filter: 'blur(120px)',
    opacity: 0.10,
    pointerEvents: 'none',
    zIndex: 0,
    animation: 'nebula-drift 25s ease-in-out infinite alternate',
  },
  nebula1: {
    width: '700px',
    height: '700px',
    background: '#0F2D1A',
    top: '-15%',
    right: '-15%',
  },
  nebula2: {
    width: '600px',
    height: '600px',
    background: '#D4AF37',
    bottom: '-15%',
    left: '-15%',
    animationDelay: '-8s',
    opacity: 0.05,
  },
  nebula3: {
    width: '500px',
    height: '500px',
    background: '#00d4ff',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    animationDelay: '-15s',
    opacity: 0.04,
  },
  app: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '900px',
    margin: '0 auto',
    padding: '16px 20px 30px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0 16px',
    borderBottom: '2px solid rgba(212,175,55,0.15)',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '10px',
    backdropFilter: 'blur(10px)',
    position: 'relative',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textDecoration: 'none',
  },
  logoIcon: {
    fontSize: '2rem',
    filter: 'drop-shadow(0 0 20px rgba(212,175,55,0.2))',
    animation: 'pulse-glow 3s ease-in-out infinite',
  },
  hex: {
    display: 'inline-block',
    background: '#0F2D1A',
    color: '#D4AF37',
    padding: '3px 10px',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: 900,
    border: '2px solid #D4AF37',
    boxShadow: '0 0 30px rgba(212,175,55,0.1)',
    fontFamily: '"Orbitron", monospace',
  },
  logoText: {
    fontFamily: '"Orbitron", monospace',
    fontSize: '1.3rem',
    fontWeight: 900,
    letterSpacing: '2px',
    background: 'linear-gradient(135deg, #D4AF37, #1a4a2a)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: '0 0 40px rgba(212,175,55,0.15)',
  },
  logoBadge: {
    fontFamily: '"Orbitron", monospace',
    fontSize: '0.45rem',
    background: 'linear-gradient(135deg, #0F2D1A, #D4AF37)',
    color: 'white',
    padding: '3px 12px',
    borderRadius: '20px',
    fontWeight: 700,
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    WebkitTextFillColor: 'white',
    boxShadow: '0 0 30px rgba(15,45,26,0.3)',
    animation: 'badge-pulse 2s ease-in-out infinite',
    border: '1px solid rgba(212,175,55,0.2)',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(212,175,55,0.06)',
    border: '1px solid rgba(212,175,55,0.15)',
    padding: '6px 14px',
    borderRadius: '30px',
    fontSize: '0.6rem',
    color: '#D4AF37',
    fontFamily: '"Orbitron", monospace',
    letterSpacing: '1px',
    backdropFilter: 'blur(10px)',
  },
  statusDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    animation: 'quantum-pulse 1.5s ease-in-out infinite',
  },
  statusDotOnline: {
    background: '#00b894',
    boxShadow: '0 0 20px rgba(0,184,148,0.5)',
  },
  statusDotLive: {
    background: '#ff3366',
    boxShadow: '0 0 30px rgba(255,51,102,0.5)',
    animation: 'live-pulse 1s infinite',
  },
  btn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 16px',
    border: '1px solid rgba(212,175,55,0.08)',
    borderRadius: '30px',
    background: 'rgba(212,175,55,0.03)',
    color: '#e8f0f8',
    fontFamily: '"Orbitron", monospace',
    fontSize: '0.6rem',
    fontWeight: 600,
    letterSpacing: '0.5px',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    textDecoration: 'none',
  },
  btnPrimary: {
    background: 'linear-gradient(135deg, #0F2D1A, #1a4a2a)',
    borderColor: '#D4AF37',
    color: '#D4AF37',
    WebkitTextFillColor: '#D4AF37',
  },
  btnGold: {
    background: 'linear-gradient(135deg, #D4AF37, #b8923a)',
    borderColor: 'transparent',
    color: '#0a0c10',
    WebkitTextFillColor: '#0a0c10',
  },
  btnOutline: {
    borderColor: 'rgba(212,175,55,0.08)',
    background: 'transparent',
  },
  btnSm: {
    padding: '4px 12px',
    fontSize: '0.55rem',
  },
  btnDanger: {
    background: 'rgba(255,51,102,0.15)',
    borderColor: 'rgba(255,51,102,0.3)',
    color: '#ff3366',
  },
  btnSuccess: {
    background: 'linear-gradient(135deg, #00b894, #00897b)',
    borderColor: 'transparent',
    color: 'white',
    WebkitTextFillColor: 'white',
  },
  storiesBar: {
    display: 'flex',
    gap: '12px',
    overflowX: 'auto',
    padding: '8px 4px 12px',
    marginBottom: '8px',
    scrollbarWidth: 'none',
  },
  storyItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    cursor: 'pointer',
    minWidth: '72px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  storyAvatar: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    border: '3px solid #D4AF37',
    background: 'linear-gradient(135deg, #D4AF37, #1a4a2a)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#0a0c10',
    overflow: 'hidden',
    position: 'relative',
  },
  storyAvatarAdd: {
    borderStyle: 'dashed',
  },
  liveBadge: {
    position: 'absolute',
    bottom: '-4px',
    background: '#ff3366',
    color: 'white',
    fontSize: '0.45rem',
    padding: '1px 8px',
    borderRadius: '10px',
    fontFamily: '"Orbitron", monospace',
    animation: 'live-pulse-badge 1.5s infinite',
  },
  storyName: {
    fontSize: '0.6rem',
    color: '#8ba3c7',
    fontFamily: '"Orbitron", monospace',
    textAlign: 'center',
    maxWidth: '70px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  quickPost: {
    background: 'rgba(15,45,26,0.25)',
    border: '1px solid rgba(212,175,55,0.15)',
    borderRadius: '16px',
    padding: '14px 18px',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    marginBottom: '16px',
  },
  quickPostAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #D4AF37, #1a4a2a)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    fontWeight: 700,
    color: '#0a0c10',
    flexShrink: 0,
  },
  quickPostPlaceholder: {
    flex: 1,
    color: '#4a6a8a',
    fontSize: '0.85rem',
  },
  quickPostActions: {
    display: 'flex',
    gap: '8px',
  },
  quickPostAction: {
    background: 'none',
    border: 'none',
    color: '#4a6a8a',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    padding: '4px 8px',
    borderRadius: '8px',
  },
  donacionBanner: {
    background: 'linear-gradient(135deg, rgba(15,45,26,0.4), rgba(212,175,55,0.08))',
    border: '1px solid rgba(212,175,55,0.15)',
    borderRadius: '16px',
    padding: '14px 18px',
    marginBottom: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  bannerContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  bannerIcon: {
    fontSize: '1.5rem',
  },
  bannerText: {
    textAlign: 'left',
  },
  bannerTitle: {
    fontFamily: '"Orbitron", monospace',
    fontSize: '0.9rem',
    color: '#D4AF37',
  },
  bannerSub: {
    fontSize: '0.7rem',
    color: '#8ba3c7',
  },
  feedContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  postCard: {
    background: '#123722',
    border: '1px solid rgba(212,175,55,0.15)',
    borderRadius: '16px',
    padding: '16px 18px',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
  },
  postCardPinned: {
    borderColor: '#D4AF37',
    borderWidth: '2px',
  },
  postHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '10px',
  },
  postAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #D4AF37, #1a4a2a)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    fontWeight: 700,
    color: '#0a0c10',
    flexShrink: 0,
  },
  postAuthorInfo: {
    flex: 1,
    minWidth: 0,
  },
  postAuthor: {
    fontWeight: 600,
    color: '#e8f0f8',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexWrap: 'wrap',
  },
  onlineDot: {
    display: 'inline-block',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#00b894',
    flexShrink: 0,
  },
  liveTag: {
    fontSize: '0.55rem',
    color: '#ff3366',
    fontFamily: '"Orbitron", monospace',
    animation: 'live-pulse 1s infinite',
  },
  postMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexWrap: 'wrap',
    fontSize: '0.65rem',
    color: '#8ba3c7',
  },
  postCarrera: {
    color: '#4a6a8a',
  },
  badgeNivel: {
    fontSize: '0.45rem',
    padding: '1px 8px',
    borderRadius: '12px',
    fontWeight: 700,
    fontFamily: '"Orbitron", monospace',
  },
  badgeGold: {
    background: 'rgba(212,175,55,0.15)',
    color: '#D4AF37',
    border: '1px solid rgba(212,175,55,0.2)',
  },
  badgeSilver: {
    background: 'rgba(192,194,200,0.15)',
    color: '#c0c2c8',
    border: '1px solid rgba(192,194,200,0.2)',
  },
  postDate: {
    color: '#4a6a8a',
    fontSize: '0.55rem',
  },
  pinnedBadge: {
    fontSize: '1rem',
    flexShrink: 0,
    marginLeft: 'auto',
  },
  postContent: {
    fontSize: '0.9rem',
    lineHeight: 1.6,
    color: '#e8f0f8',
    marginBottom: '10px',
    wordWrap: 'break-word',
  },
  postMedia: {
    marginBottom: '10px',
    borderRadius: '10px',
    overflow: 'hidden',
    background: 'rgba(0,0,0,0.2)',
    padding: '20px',
    textAlign: 'center',
  },
  mediaPlaceholder: {
    fontSize: '3rem',
  },
  postActions: {
    display: 'flex',
    gap: '16px',
    paddingTop: '10px',
    borderTop: '1px solid rgba(212,175,55,0.15)',
    flexWrap: 'wrap',
  },
  actionBtn: {
    background: 'none',
    border: 'none',
    color: '#4a6a8a',
    cursor: 'pointer',
    fontSize: '0.8rem',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    fontFamily: '"Space Grotesk", sans-serif',
    padding: '4px 8px',
    borderRadius: '8px',
  },
  actionBtnLiked: {
    color: '#ff3366',
  },
  iaBtn: {
    color: '#D4AF37',
    fontWeight: 600,
    fontSize: '0.7rem',
  },
  liveBtn: {
    color: '#ff3366',
    fontWeight: 600,
    fontSize: '0.7rem',
    animation: 'live-pulse 1s infinite',
  },
  footer: {
    marginTop: '40px',
    paddingTop: '20px',
    borderTop: '1px solid rgba(212,175,55,0.15)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    position: 'relative',
  },
  footerText: {
    color: '#4a6a8a',
    fontSize: '0.6rem',
    letterSpacing: '0.5px',
    fontFamily: '"Orbitron", monospace',
  },
  brand: {
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
    fontSize: '0.6rem',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    fontFamily: '"Orbitron", monospace',
    letterSpacing: '0.5px',
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.85)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3000,
    padding: '20px',
  },
  modalContent: {
    background: 'rgba(15,45,26,0.95)',
    border: '1px solid rgba(212,175,55,0.15)',
    borderRadius: '16px',
    padding: '24px',
    maxWidth: '520px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    position: 'relative',
  },
  modalClose: {
    position: 'absolute',
    top: '12px',
    right: '16px',
    background: 'none',
    border: 'none',
    color: '#4a6a8a',
    fontSize: '1.3rem',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  modalTitle: {
    fontFamily: '"Orbitron", monospace',
    color: '#D4AF37',
    marginBottom: '4px',
    fontSize: '1rem',
  },
  modalSub: {
    color: '#8ba3c7',
    fontSize: '0.75rem',
    marginBottom: '12px',
  },
  modalTextarea: {
    width: '100%',
    padding: '12px 14px',
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(212,175,55,0.15)',
    borderRadius: '10px',
    color: '#e8f0f8',
    fontFamily: '"Space Grotesk", sans-serif',
    fontSize: '0.9rem',
    resize: 'vertical',
    minHeight: '100px',
    outline: 'none',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  modalActions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginTop: '14px',
  },
  moderationResult: {
    padding: '10px 14px',
    borderRadius: '8px',
    marginTop: '10px',
    background: 'rgba(247,212,74,0.1)',
    border: '1px solid rgba(247,212,74,0.2)',
    color: '#D4AF37',
    fontSize: '0.75rem',
  },
  livePreview: {
    textAlign: 'center',
    padding: '20px',
    background: 'rgba(255,51,102,0.1)',
    borderRadius: '12px',
    border: '1px solid rgba(255,51,102,0.2)',
    marginBottom: '12px',
  },
  liveInfo: {
    marginTop: '12px',
    padding: '8px',
    background: 'rgba(212,175,55,0.05)',
    borderRadius: '8px',
    border: '1px solid rgba(212,175,55,0.1)',
  },
  streamerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '8px',
    border: '1px solid rgba(212,175,55,0.15)',
    marginBottom: '12px',
  },
  streamerAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #D4AF37, #1a4a2a)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    color: '#0a0c10',
    fontSize: '1rem',
  },
  streamerName: {
    fontWeight: 600,
    fontSize: '0.9rem',
    color: '#e8f0f8',
  },
  streamerStatus: {
    fontSize: '0.65rem',
    color: '#4a6a8a',
    fontFamily: '"Orbitron", monospace',
  },
  tokenSelector: {
    display: 'flex',
    gap: '6px',
    marginBottom: '10px',
    flexWrap: 'wrap',
  },
  montoSelector: {
    display: 'flex',
    gap: '6px',
    marginBottom: '10px',
    flexWrap: 'wrap',
  },
  montoInput: {
    width: '100%',
    padding: '10px 14px',
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(212,175,55,0.15)',
    borderRadius: '8px',
    color: '#e8f0f8',
    fontSize: '0.9rem',
    outline: 'none',
    fontFamily: '"Space Grotesk", sans-serif',
    marginBottom: '10px',
  },
  mensajeInput: {
    width: '100%',
    padding: '10px 14px',
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(212,175,55,0.15)',
    borderRadius: '8px',
    color: '#e8f0f8',
    fontSize: '0.9rem',
    outline: 'none',
    fontFamily: '"Space Grotesk", sans-serif',
    marginBottom: '10px',
  },
  resumenDonacion: {
    padding: '10px 14px',
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '8px',
    border: '1px solid rgba(212,175,55,0.15)',
    marginBottom: '12px',
  },
  resumenRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
    color: '#8ba3c7',
    padding: '2px 0',
  },
  donacionFooter: {
    marginTop: '8px',
    padding: '8px',
    background: 'rgba(255,51,102,0.05)',
    borderRadius: '8px',
    border: '1px solid rgba(255,51,102,0.1)',
  },
  terminosResumen: {
    padding: '12px 16px',
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '8px',
    borderLeft: '3px solid #D4AF37',
    marginBottom: '12px',
  },
  terminosButtons: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '12px',
  },
  terminosChecklist: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '10px 14px',
    background: 'rgba(0,0,0,0.15)',
    borderRadius: '8px',
    marginBottom: '12px',
  },
  terminosCheckLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    fontSize: '0.7rem',
    color: '#8ba3c7',
    cursor: 'pointer',
    padding: '2px 0',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  terminosCheckbox: {
    marginTop: '2px',
    width: '16px',
    height: '16px',
    accentColor: '#D4AF37',
    cursor: 'pointer',
    flexShrink: 0,
  },
  highlight: {
    color: '#D4AF37',
    fontWeight: 600,
  },
  terminosWarning: {
    fontSize: '0.55rem',
    color: '#4a6a8a',
    textAlign: 'center',
    marginTop: '8px',
  },
};

// ================================================================
// CONFIGURACIÓN
// ================================================================
const CONFIG = {
  VERSION: '1.0.0',
  calcularComisionDirecto: (monto, token) => {
    const comision = monto * 0.50;
    return {
      comision: comision,
      streamerMonto: monto - comision,
      token: token
    };
  }
};

// ================================================================
// DATOS MOCK
// ================================================================
const MOCK_POSTS = [
  {
    id: 1,
    author: 'Jorge Méndez',
    avatar: 'J',
    carrera: 'Ing. Industrial UDLAP',
    badge: 'GÉNESIS',
    badgeColor: 'gold',
    content: '🔥 Ya quedó el Muro Live 🔥 ¿Quién se apunta a probar la IA predictiva? Me hizo la tarea en 10s',
    media: null,
    likes: 24,
    liked: false,
    comments: 8,
    date: Date.now() - 120000,
    online: true,
    isPinned: true,
    moderationStatus: 'approved',
    tipo: 'publicacion',
    showIA: true
  },
  {
    id: 2,
    author: 'María García',
    avatar: 'M',
    carrera: 'Contaduría UDLAP',
    badge: 'AÑO 1 2026',
    badgeColor: 'silver',
    content: 'Vendo resumen de Conta, $50 o 10 AURAPOINTS',
    media: { type: 'image', data: '📚' },
    likes: 12,
    liked: false,
    comments: 3,
    date: Date.now() - 7200000,
    online: false,
    isPinned: false,
    moderationStatus: 'approved',
    tipo: 'publicacion',
    showIA: false
  },
  {
    id: 3,
    author: 'Carlos Ruiz',
    avatar: 'C',
    carrera: 'Ing. Civil BUAP',
    badge: null,
    badgeColor: null,
    content: '📚 Estoy en biblioteca, si ocupan ayuda con cálculo avisen',
    media: null,
    likes: 7,
    liked: false,
    comments: 2,
    date: Date.now() - 14400000,
    online: true,
    isPinned: false,
    moderationStatus: 'approved',
    tipo: 'publicacion',
    isLive: true,
    showIA: false
  },
  {
    id: 4,
    author: 'Ana López',
    avatar: 'A',
    carrera: 'Arquitectura Ibero',
    badge: null,
    badgeColor: null,
    content: '🏠 Busco roomie cerca de UDLAP, presupuesto $3000',
    media: null,
    likes: 5,
    liked: false,
    comments: 1,
    date: Date.now() - 21600000,
    online: false,
    isPinned: false,
    moderationStatus: 'approved',
    tipo: 'publicacion',
    showIA: false
  },
  {
    id: 5,
    author: 'Sistema',
    avatar: '◈',
    carrera: 'Csariel\'s',
    badge: null,
    badgeColor: 'gold',
    content: '🎉 Bienvenido a Año 1. Verifica tu .edu y gana 50 AURAPOINTS internos (sin gas) + Skins en Polygon < $1 MXN comisión',
    media: null,
    likes: 42,
    liked: false,
    comments: 6,
    date: Date.now() - 86400000,
    online: false,
    isPinned: false,
    moderationStatus: 'approved',
    tipo: 'sistema',
    showIA: false
  }
];

const MOCK_STORIES = [
  { id: 1, name: 'Tu estado', avatar: '+', isAdd: true },
  { id: 2, name: 'María · 2h', avatar: 'M', isLive: true },
  { id: 3, name: 'Carlos · 4h', avatar: 'C', isLive: false },
  { id: 4, name: 'Ana · 6h', avatar: 'A', isLive: false },
  { id: 5, name: 'Luis · 12h', avatar: 'L', isLive: false },
  { id: 6, name: 'Sofía · 1d', avatar: 'S', isLive: false }
];

// ================================================================
// COMPONENTE PRINCIPAL
// ================================================================
const MuroLive = () => {
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [stories] = useState(MOCK_STORIES);
  const [isLive, setIsLive] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showLiveModal, setShowLiveModal] = useState(false);
  const [showDonacionModal, setShowDonacionModal] = useState(false);
  const [showTerminosModal, setShowTerminosModal] = useState(false);
  const [terminosAceptados, setTerminosAceptados] = useState(false);
  const [postText, setPostText] = useState('');
  const [moderationResult, setModerationResult] = useState(null);
  const [streamerInfo, setStreamerInfo] = useState(null);
  const [donacionMonto, setDonacionMonto] = useState('');
  const [donacionMensaje, setDonacionMensaje] = useState('');
  const [tokenSeleccionado, setTokenSeleccionado] = useState('USDT');
  const [terminosChecks, setTerminosChecks] = useState({
    check1: false,
    check2: false,
    check3: false,
    check4: false,
    check5: false
  });
  
  const canvasRef = useRef(null);

  // ================================================================
  // EFECTO: ESTRELLAS
  // ================================================================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let width, height;
    let stars = [];
    const STAR_COUNT = 200;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    const createStars = () => {
      stars = [];
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.5 + 0.3,
          speed: Math.random() * 0.015 + 0.005,
          opacity: Math.random() * 0.7 + 0.3,
          twinkleSpeed: Math.random() * 0.02 + 0.01,
          twinklePhase: Math.random() * Math.PI * 2
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (let star of stars) {
        const opacity = star.opacity * (0.6 + 0.4 * Math.sin(star.twinklePhase));
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fill();
        star.twinklePhase += star.twinkleSpeed;
        star.y += star.speed;
        if (star.y > height) {
          star.y = 0;
          star.x = Math.random() * width;
        }
      }
      requestAnimationFrame(draw);
    };

    resize();
    createStars();
    draw();

    const handleResize = () => {
      resize();
      createStars();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ================================================================
  // EFECTO: TÉRMINOS Y STREAMER
  // ================================================================
  useEffect(() => {
    // Verificar términos
    const aceptado = localStorage.getItem('terminos_muro_live_aceptado');
    if (aceptado === 'true') {
      setTerminosAceptados(true);
    } else {
      setTimeout(() => setShowTerminosModal(true), 800);
    }

    // Verificar streamer activo
    const streamerData = localStorage.getItem('streamer_activo');
    if (streamerData) {
      try {
        const data = JSON.parse(streamerData);
        if (data && data.wallet) {
          setStreamerInfo(data);
          setIsLive(true);
        }
      } catch (e) {}
    }
  }, []);

  // ================================================================
  // FUNCIONES
  // ================================================================
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'Ahora mismo';
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
    if (diff < 604800) return `Hace ${Math.floor(diff / 86400)} d`;
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleLike = (id) => {
    setPosts(prev => prev.map(p => 
      p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
    ));
  };

  const handlePublicar = () => {
    if (!postText.trim()) return;

    const nuevoPost = {
      id: Date.now(),
      author: 'Usuario',
      avatar: 'U',
      carrera: 'Estudiante Csariel\'s',
      badge: null,
      badgeColor: null,
      content: postText,
      media: null,
      likes: 0,
      liked: false,
      comments: 0,
      date: Date.now(),
      online: true,
      isPinned: false,
      moderationStatus: 'approved',
      tipo: 'publicacion',
      showIA: false
    };

    setPosts(prev => [nuevoPost, ...prev]);
    setPostText('');
    setShowPostModal(false);
    setModerationResult(null);
  };

  const iniciarTransmision = () => {
    const nuevoStreamer = {
      nombre: 'Usuario',
      wallet: '0x' + Array.from({length: 40}, () => 
        Math.floor(Math.random() * 16).toString(16)).join(''),
      inicio: Date.now()
    };
    setStreamerInfo(nuevoStreamer);
    setIsLive(true);
    localStorage.setItem('streamer_activo', JSON.stringify(nuevoStreamer));
    setShowLiveModal(false);
  };

  const terminarTransmision = () => {
    setIsLive(false);
    setStreamerInfo(null);
    localStorage.removeItem('streamer_activo');
  };

  const aceptarTerminos = () => {
    localStorage.setItem('terminos_muro_live_aceptado', 'true');
    setTerminosAceptados(true);
    setShowTerminosModal(false);
  };

  const procesarDonacion = () => {
    const monto = parseFloat(donacionMonto);
    if (!monto || monto <= 0) return;
    
    const comision = CONFIG.calcularComisionDirecto(monto, tokenSeleccionado);
    
    // Guardar en localStorage para demo
    const donaciones = JSON.parse(localStorage.getItem('donaciones_demo') || '[]');
    donaciones.push({
      id: Date.now(),
      streamer: streamerInfo?.nombre || 'Streamer',
      monto: monto,
      token: tokenSeleccionado,
      comision: comision.comision,
      streamerMonto: comision.streamerMonto,
      mensaje: donacionMensaje || '¡Buena transmisión!',
      fecha: new Date().toISOString()
    });
    localStorage.setItem('donaciones_demo', JSON.stringify(donaciones));
    
    setShowDonacionModal(false);
    setDonacionMonto('');
    setDonacionMensaje('');
  };

  const handleTermCheck = (checkName) => {
    setTerminosChecks(prev => ({
      ...prev,
      [checkName]: !prev[checkName]
    }));
  };

  const allTermsChecked = () => {
    return Object.values(terminosChecks).every(v => v === true);
  };

  // ================================================================
  // RENDER
  // ================================================================
  return (
    <div style={styles.container}>
      {/* ===== FONDO ESTELAR ===== */}
      <canvas ref={canvasRef} style={styles.starsCanvas}></canvas>
      <div style={{ ...styles.nebula, ...styles.nebula1 }}></div>
      <div style={{ ...styles.nebula, ...styles.nebula2 }}></div>
      <div style={{ ...styles.nebula, ...styles.nebula3 }}></div>

      {/* ===== INJECT KEYFRAMES ===== */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Space+Grotesk:wght@300;400;600;700&display=swap');
        
        @keyframes pulse-glow {
          0%, 100% { filter: drop-shadow(0 0 20px rgba(212,175,55,0.2)); }
          50% { filter: drop-shadow(0 0 40px rgba(212,175,55,0.4)); }
        }
        
        @keyframes badge-pulse {
          0%, 100% { box-shadow: 0 0 30px rgba(15,45,26,0.3); }
          50% { box-shadow: 0 0 60px rgba(212,175,55,0.2); }
        }
        
        @keyframes quantum-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.7); }
        }
        
        @keyframes live-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.8); }
        }
        
        @keyframes live-pulse-badge {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes nebula-drift {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(40px, -30px) scale(1.15); }
        }
        
        @keyframes border-flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #05080f; }
        ::-webkit-scrollbar-thumb { background: linear-gradient(#D4AF37, #0F2D1A); border-radius: 3px; }
        
        .stories-bar::-webkit-scrollbar { display: none; }
        
        .post-card-pinned::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(135deg, #D4AF37, #0F2D1A, #D4AF37);
          background-size: 300% 300%;
          border-radius: 16px;
          z-index: -1;
          opacity: 0.2;
          animation: border-flow 4s ease-in-out infinite;
        }
        
        .btn:hover { transform: scale(1.02); border-color: rgba(212,175,55,0.25); }
        .btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none !important; }
        
        .btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #1a4a2a, #0F2D1A);
          box-shadow: 0 0 40px rgba(15,45,26,0.5);
        }
        
        .btn-gold:hover:not(:disabled) { box-shadow: 0 0 40px rgba(212,175,55,0.3); }
        .btn-outline:hover:not(:disabled) { background: rgba(212,175,55,0.05); border-color: #D4AF37; }
        .btn-danger:hover:not(:disabled) { background: rgba(255,51,102,0.25); }
        
        .story-item:hover { transform: scale(1.05); }
        .quick-post:hover { border-color: rgba(212,175,55,0.25); transform: translateY(-2px); }
        .donacion-banner:hover { border-color: rgba(212,175,55,0.25); }
        .post-card:hover { transform: translateY(-2px); border-color: rgba(212,175,55,0.25); }
        
        .action-btn:hover { color: #D4AF37; background: rgba(212,175,55,0.05); }
        .modal-close:hover { color: #e8f0f8; transform: rotate(90deg); }
        .modal-textarea:focus { border-color: #D4AF37; }
        .monto-input:focus, .mensaje-input:focus { border-color: #D4AF37; }
        
        .terminos-checklist label:hover { color: #e8f0f8; }
        .footer-links a:hover { color: #D4AF37; }
        .quick-post .actions button:hover {
          background: rgba(212,175,55,0.1);
          color: #D4AF37;
        }
      `}</style>

      <div style={styles.app}>
        {/* ===== HEADER ===== */}
        <header style={styles.header}>
          <a href="#" style={styles.logo} onClick={(e) => e.preventDefault()}>
            <span style={styles.logoIcon}>
              <span style={styles.hex}>◈</span>
            </span>
            <span style={styles.logoText}>Csariel's</span>
            <span style={styles.logoBadge}>MURO LIVE</span>
          </a>
          <div style={styles.headerActions}>
            <div style={styles.statusBadge}>
              <span style={{
                ...styles.statusDot,
                ...(isLive ? styles.statusDotLive : styles.statusDotOnline)
              }}></span>
              <span>{isLive ? '🔴 EN VIVO' : 'En vivo'}</span>
            </div>
            <button style={{ ...styles.btn, ...styles.btn }} onClick={() => window.location.href = './mi-red.html'}>
              <i className="fas fa-arrow-left"></i> Mi Red
            </button>
            <button style={{ ...styles.btn, ...styles.btnGold, ...styles.btnSm }} onClick={() => window.location.href = './servicios-comunitarios.html'}>
              <i className="fas fa-tools"></i> Servicios
            </button>
            <button style={{ ...styles.btn, ...styles.btnPrimary, ...styles.btnSm }} onClick={() => setShowPostModal(true)}>
              <i className="fas fa-plus"></i> Publicar
            </button>
            <button 
              style={{ ...styles.btn, ...styles.btnDanger, ...styles.btnSm }}
              onClick={() => isLive ? terminarTransmision() : setShowLiveModal(true)}
            >
              <i className="fas fa-broadcast"></i> {isLive ? '🔴 Terminar' : 'Live'}
            </button>
            <button style={{ ...styles.btn, ...styles.btnOutline, ...styles.btnSm }} onClick={() => setShowTerminosModal(true)}>
              <i className="fas fa-file-contract"></i> 📜 Términos
            </button>
          </div>
        </header>

        {/* ===== STORIES ===== */}
        <div style={styles.storiesBar} className="stories-bar">
          {stories.map(story => (
            <div 
              key={story.id} 
              style={styles.storyItem}
              onClick={() => story.isAdd && setShowPostModal(true)}
            >
              <div 
                style={{
                  ...styles.storyAvatar,
                  ...(story.isAdd ? styles.storyAvatarAdd : {}),
                  ...(story.isAdd ? { borderStyle: 'dashed' } : {})
                }}
              >
                {story.isAdd ? (
                  <i className="fas fa-plus" style={{ fontSize: '1.2rem', color: '#D4AF37' }}></i>
                ) : (
                  <>
                    <span>{story.avatar}</span>
                    {story.isLive && <span style={styles.liveBadge}>● LIVE</span>}
                  </>
                )}
              </div>
              <span style={styles.storyName}>{story.name}</span>
            </div>
          ))}
        </div>

        {/* ===== QUICK POST ===== */}
        <div style={styles.quickPost} onClick={() => setShowPostModal(true)}>
          <div style={styles.quickPostAvatar}>U</div>
          <span style={styles.quickPostPlaceholder}>¿Qué está pasando? Comparte algo...</span>
          <div style={styles.quickPostActions}>
            <button style={styles.quickPostAction} onClick={(e) => e.stopPropagation()}><i className="fas fa-image"></i></button>
            <button style={styles.quickPostAction} onClick={(e) => e.stopPropagation()}><i className="fas fa-video"></i></button>
            <button style={styles.quickPostAction} onClick={(e) => e.stopPropagation()}><i className="fas fa-smile"></i></button>
          </div>
        </div>

        {/* ===== BANNER DONACIÓN (si está en vivo) ===== */}
        {isLive && streamerInfo && (
          <div style={styles.donacionBanner} onClick={() => setShowDonacionModal(true)}>
            <div style={styles.bannerContent}>
              <span style={styles.bannerIcon}>🎁</span>
              <div style={styles.bannerText}>
                <div style={styles.bannerTitle}>🔴 Apoya esta transmisión</div>
                <div style={styles.bannerSub}>Envía donaciones en USDT, USDC o TOK</div>
              </div>
              <button style={{ ...styles.btn, ...styles.btnGold }} onClick={(e) => { e.stopPropagation(); setShowDonacionModal(true); }}>
                <i className="fas fa-gift"></i> Donar
              </button>
            </div>
          </div>
        )}

        {/* ===== FEED ===== */}
        <div style={styles.feedContainer}>
          {posts.map(post => (
            <div 
              key={post.id} 
              style={{
                ...styles.postCard,
                ...(post.isPinned ? styles.postCardPinned : {})
              }}
              className={post.isPinned ? 'post-card-pinned' : ''}
            >
              <div style={styles.postHeader}>
                <div style={styles.postAvatar}>{post.avatar}</div>
                <div style={styles.postAuthorInfo}>
                  <div style={styles.postAuthor}>
                    {post.author}
                    {post.online && <span style={styles.onlineDot}></span>}
                    {post.isLive && <span style={styles.liveTag}>● LIVE</span>}
                  </div>
                  <div style={styles.postMeta}>
                    <span style={styles.postCarrera}>{post.carrera}</span>
                    {post.badge && (
                      <span style={{
                        ...styles.badgeNivel,
                        ...(post.badgeColor === 'gold' ? styles.badgeGold : styles.badgeSilver)
                      }}>
                        {post.badge}
                      </span>
                    )}
                    <span style={styles.postDate}>{formatDate(post.date)}</span>
                  </div>
                </div>
                {post.isPinned && <span style={styles.pinnedBadge}>📌</span>}
              </div>

              <div style={styles.postContent}>{post.content}</div>

              {post.media && post.media.type === 'image' && (
                <div style={styles.postMedia}>
                  <div style={styles.mediaPlaceholder}>{post.media.data}</div>
                </div>
              )}

              <div style={styles.postActions}>
                <button 
                  style={{
                    ...styles.actionBtn,
                    ...(post.liked ? styles.actionBtnLiked : {})
                  }}
                  onClick={() => toggleLike(post.id)}
                >
                  <i className="fas fa-heart"></i>
                  <span>{post.likes}</span>
                </button>
                <button style={styles.actionBtn}>
                  <i className="fas fa-comment"></i>
                  <span>{post.comments}</span>
                </button>
                <button style={styles.actionBtn}>
                  <i className="fas fa-share"></i>
                </button>
                {post.showIA && (
                  <button style={{ ...styles.actionBtn, ...styles.iaBtn }}>
                    <i className="fas fa-brain"></i> Ver IA
                  </button>
                )}
                {post.isLive && (
                  <button style={{ ...styles.actionBtn, ...styles.liveBtn }}>
                    <i className="fas fa-broadcast"></i> Live
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ===== FOOTER ===== */}
        <footer style={styles.footer}>
          <span style={styles.footerText}>
            <span style={styles.brand}>◈ Csariel's</span> — Muro Live · Moderación IA · Donaciones en Directo
          </span>
          <div style={styles.footerLinks}>
            <a href="./mi-red.html" style={styles.footerLink}>👥 Mi Red</a>
            <a href="./servicios-comunitarios.html" style={styles.footerLink}>🔧 Servicios</a>
            <a href="./panel-web3.html" style={styles.footerLink}>🔗 Web3</a>
            <a href="#" style={{ ...styles.footerLink, color: '#D4AF37' }} onClick={() => setShowTerminosModal(true)}>📜 Términos</a>
            <a href="#" style={{ ...styles.footerLink, color: '#D4AF37' }}>🔐 Privacidad</a>
          </div>
        </footer>
      </div>

      {/* ===== MODAL PUBLICAR ===== */}
      {showPostModal && (
        <div style={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setShowPostModal(false)}>
          <div style={styles.modalContent}>
            <button style={styles.modalClose} onClick={() => setShowPostModal(false)}>✕</button>
            <h3 style={styles.modalTitle}>📝 Crear Publicación</h3>
            <p style={styles.modalSub}>Tu contenido será moderado por IA antes de publicarse</p>
            <textarea 
              style={styles.modalTextarea}
              placeholder="¿Qué quieres compartir?..."
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
            />
            {moderationResult && (
              <div style={styles.moderationResult}>
                <p>{moderationResult}</p>
              </div>
            )}
            <div style={styles.modalActions}>
              <button style={{ ...styles.btn, ...styles.btnGold }} onClick={handlePublicar}>
                <i className="fas fa-rocket"></i> Publicar
              </button>
              <button style={{ ...styles.btn, ...styles.btnOutline }} onClick={() => setShowPostModal(false)}>
                <i className="fas fa-times"></i> Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL LIVE ===== */}
      {showLiveModal && (
        <div style={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setShowLiveModal(false)}>
          <div style={{ ...styles.modalContent, maxWidth: '400px' }}>
            <button style={styles.modalClose} onClick={() => setShowLiveModal(false)}>✕</button>
            <h3 style={styles.modalTitle}>📡 Iniciar Transmisión</h3>
            <p style={styles.modalSub}>Comparte en vivo con tu comunidad</p>
            <div style={styles.livePreview}>
              <i className="fas fa-broadcast" style={{ fontSize: '3rem', color: '#ff3366' }}></i>
              <p style={{ color: '#8ba3c7', fontSize: '0.85rem', marginTop: '8px' }}>
                <strong style={{ color: '#ff3366' }}>● EN VIVO</strong><br />
                Recibe donaciones en tiempo real desde tu comunidad.
              </p>
            </div>
            <div style={styles.modalActions}>
              <button style={{ ...styles.btn, ...styles.btnDanger, flex: 1, justifyContent: 'center' }} onClick={iniciarTransmision}>
                <i className="fas fa-play"></i> Iniciar Live
              </button>
              <button style={{ ...styles.btn, ...styles.btnOutline }} onClick={() => setShowLiveModal(false)}>
                <i className="fas fa-times"></i> Cancelar
              </button>
            </div>
            <div style={styles.liveInfo}>
              <p style={{ fontSize: '0.6rem', color: '#4a6a8a', textAlign: 'center', lineHeight: '1.6' }}>
                💰 <strong style={{ color: '#D4AF37' }}>Donaciones activas:</strong> 50% para el streamer · 50% para Csariel's<br />
                🪙 Tokens aceptados: USDT · USDC · TOK (1:1)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL DONACIÓN ===== */}
      {showDonacionModal && (
        <div style={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setShowDonacionModal(false)}>
          <div style={{ ...styles.modalContent, maxWidth: '480px' }}>
            <button style={styles.modalClose} onClick={() => setShowDonacionModal(false)}>✕</button>
            <h3 style={styles.modalTitle}>🎁 Donar en Directo</h3>
            <p style={styles.modalSub}>
              Apoya al streamer en su transmisión. <span style={{ color: '#D4AF37' }}>50% para el streamer · 50% para Csariel's</span>
            </p>

            <div style={styles.streamerInfo}>
              <div style={styles.streamerAvatar}>{streamerInfo?.nombre?.charAt(0) || 'S'}</div>
              <div>
                <div style={styles.streamerName}>{streamerInfo?.nombre || 'Streamer'}</div>
                <div style={styles.streamerStatus}><span style={{ color: '#ff3366' }}>● EN VIVO</span></div>
              </div>
            </div>

            <div style={styles.tokenSelector}>
              {['USDT', 'USDC', 'TOK'].map(token => (
                <button 
                  key={token}
                  style={{
                    ...styles.btn,
                    ...styles.btnSm,
                    ...(tokenSeleccionado === token ? styles.btnGold : styles.btnOutline),
                    flex: 1,
                    justifyContent: 'center'
                  }}
                  onClick={() => setTokenSeleccionado(token)}
                >
                  {token === 'USDT' && '💵'} {token === 'USDC' && '💳'} {token === 'TOK' && '🪙'} {token}
                  {token === 'TOK' && ' (Próximo)'}
                </button>
              ))}
            </div>

            <div style={styles.montoSelector}>
              {[1, 5, 10, 25, 50].map(m => (
                <button 
                  key={m}
                  style={{
                    ...styles.btn,
                    ...styles.btnSm,
                    ...styles.btnOutline,
                    flex: 1,
                    justifyContent: 'center'
                  }}
                  onClick={() => setDonacionMonto(m.toString())}
                >
                  ${m}
                </button>
              ))}
            </div>

            <input 
              type="number" 
              style={styles.montoInput}
              placeholder="Monto personalizado (mín 1)"
              value={donacionMonto}
              onChange={(e) => setDonacionMonto(e.target.value)}
              min="1"
            />

            <input 
              type="text" 
              style={styles.mensajeInput}
              placeholder="Mensaje para el streamer (opcional)"
              value={donacionMensaje}
              onChange={(e) => setDonacionMensaje(e.target.value)}
            />

            <div style={styles.resumenDonacion}>
              <div style={styles.resumenRow}>
                <span>💰 Donación</span>
                <span style={{ color: '#e8f0f8', fontWeight: 600 }}>
                  ${donacionMonto || 0} {tokenSeleccionado}
                </span>
              </div>
              <div style={styles.resumenRow}>
                <span>🎁 Para el streamer (50%)</span>
                <span style={{ color: '#00b894' }}>
                  ${donacionMonto ? (parseFloat(donacionMonto) * 0.50).toFixed(2) : '0.00'} {tokenSeleccionado}
                </span>
              </div>
              <div style={styles.resumenRow}>
                <span>🏢 Csariel's (50%)</span>
                <span style={{ color: '#D4AF37' }}>
                  ${donacionMonto ? (parseFloat(donacionMonto) * 0.50).toFixed(2) : '0.00'} {tokenSeleccionado}
                </span>
              </div>
            </div>

            <div style={styles.modalActions}>
              <button style={{ ...styles.btn, ...styles.btnGold, flex: 1, justifyContent: 'center' }} onClick={procesarDonacion}>
                <i className="fas fa-rocket"></i> Enviar Donación
              </button>
              <button style={{ ...styles.btn, ...styles.btnOutline }} onClick={() => setShowDonacionModal(false)}>
                <i className="fas fa-times"></i> Cancelar
              </button>
            </div>

            <div style={styles.donacionFooter}>
              <p style={{ fontSize: '0.55rem', color: '#4a6a8a', textAlign: 'center', lineHeight: '1.6' }}>
                ⚡ Las donaciones se procesan en la red Polygon.<br />
                Comisión del 50% para mantener la plataforma y los directos.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL TÉRMINOS ===== */}
      {showTerminosModal && (
        <div style={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setShowTerminosModal(false)}>
          <div style={{ ...styles.modalContent, maxWidth: '540px' }}>
            <button style={styles.modalClose} onClick={() => setShowTerminosModal(false)}>✕</button>
            <h3 style={styles.modalTitle}>📜 Términos y Condiciones</h3>
            <p style={styles.modalSub}>Csariel's — Muro Live · Pasarela de Pagos</p>

            <div style={styles.terminosResumen}>
              <p><strong>📋 Resumen del Acuerdo:</strong></p>
              <ul style={{ paddingLeft: '18px', fontSize: '0.65rem', color: '#8ba3c7' }}>
                <li>🔒 <strong style={{ color: '#e8f0f8' }}>Modelo No Custodial:</strong> Tú controlas tus activos.</li>
                <li>⚡ <strong style={{ color: '#e8f0f8' }}>Irreversibilidad:</strong> Las transacciones en blockchain son finales.</li>
                <li>📊 <strong style={{ color: '#e8f0f8' }}>Declaración Fiscal:</strong> Eres responsable ante el SAT.</li>
                <li>🛡️ <strong style={{ color: '#e8f0f8' }}>Prevención de Lavado:</strong> Cumplimos con la LFPIORPI.</li>
                <li>📜 <strong style={{ color: '#e8f0f8' }}>Jurisdicción:</strong> Puebla, México.</li>
                <li>🔐 <strong style={{ color: '#e8f0f8' }}>Datos Personales:</strong> Conforme a la LFPDPPP.</li>
              </ul>
            </div>

            <div style={styles.terminosButtons}>
              <a href="#" style={{ ...styles.btn, ...styles.btnPrimary, flex: 1, justifyContent: 'center' }}>
                <i className="fas fa-file-pdf"></i> 📖 Leer Términos Completos (81 arts.)
              </a>
              <a href="#" style={{ ...styles.btn, ...styles.btnOutline, flex: 1, justifyContent: 'center' }}>
                <i className="fas fa-shield-alt"></i> 🔐 Aviso de Privacidad
              </a>
            </div>

            <div style={styles.terminosChecklist}>
              <label style={styles.terminosCheckLabel}>
                <input 
                  type="checkbox" 
                  style={styles.terminosCheckbox}
                  checked={terminosChecks.check1}
                  onChange={() => handleTermCheck('check1')}
                />
                <span>He leído y acepto los <span style={styles.highlight}>Términos y Condiciones Generales</span> de Csariel's.</span>
              </label>
              <label style={styles.terminosCheckLabel}>
                <input 
                  type="checkbox" 
                  style={styles.terminosCheckbox}
                  checked={terminosChecks.check2}
                  onChange={() => handleTermCheck('check2')}
                />
                <span>Comprendo que las transacciones son <span style={styles.highlight}>irreversibles</span> y operan bajo modelo <span style={styles.highlight}>no custodial</span>.</span>
              </label>
              <label style={styles.terminosCheckLabel}>
                <input 
                  type="checkbox" 
                  style={styles.terminosCheckbox}
                  checked={terminosChecks.check3}
                  onChange={() => handleTermCheck('check3')}
                />
                <span>Declaro que cumplo con mis <span style={styles.highlight}>obligaciones fiscales</span> ante el SAT.</span>
              </label>
              <label style={styles.terminosCheckLabel}>
                <input 
                  type="checkbox" 
                  style={styles.terminosCheckbox}
                  checked={terminosChecks.check4}
                  onChange={() => handleTermCheck('check4')}
                />
                <span>He leído y acepto el <span style={styles.highlight}>Aviso de Privacidad</span> conforme a la LFPDPPP.</span>
              </label>
              <label style={styles.terminosCheckLabel}>
                <input 
                  type="checkbox" 
                  style={styles.terminosCheckbox}
                  checked={terminosChecks.check5}
                  onChange={() => handleTermCheck('check5')}
                />
                <span>Acepto la <span style={styles.highlight}>jurisdicción de Puebla, México</span> para cualquier controversia.</span>
              </label>
            </div>

            <div style={styles.modalActions}>
              <button 
                style={{ ...styles.btn, ...styles.btnSuccess, flex: 1, justifyContent: 'center' }}
                onClick={aceptarTerminos}
                disabled={!allTermsChecked()}
              >
                <i className="fas fa-check"></i> Aceptar y Continuar
              </button>
              <button style={{ ...styles.btn, ...styles.btnOutline }} onClick={() => setShowTerminosModal(false)}>
                <i className="fas fa-times"></i> Rechazar
              </button>
            </div>
            <p style={styles.terminosWarning}>
              ⚠️ Debes aceptar <strong style={{ color: '#ff3366' }}>TODOS</strong> los puntos para continuar usando el Muro Live.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MuroLive;