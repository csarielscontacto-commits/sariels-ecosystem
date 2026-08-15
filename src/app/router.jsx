// ================================================================
// 🧭 ROUTER - CSARIEL'S ECOSYSTEM (LAZY LOADING)
// ================================================================
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Spinner } from '../features/red/modules/shared/components/Spinner';

// ================================================================
// 📦 LAZY LOADING (Carga perezosa por módulo)
// ================================================================

const MainLayout = lazy(() => import('../features/red/modules/layouts/MainLayout'));

// === Módulo Feed (Publicaciones) ===
const FeedPage = lazy(() => import('../features/red/modules/feed/pages/FeedPage'));
const PostDetailPage = lazy(() => import('../features/red/modules/feed/pages/PostDetailPage'));
const CreatePostPage = lazy(() => import('../features/red/modules/feed/pages/CreatePostPage'));

// === Módulo Directos (Transmisiones en vivo) ===
const DirectosPage = lazy(() => import('../features/red/modules/directos/pages/DirectosPage'));
const StreamPage = lazy(() => import('../features/red/modules/directos/pages/StreamPage'));
const StartStreamPage = lazy(() => import('../features/red/modules/directos/pages/StartStreamPage'));

// === Módulo Grupos ===
const GruposPage = lazy(() => import('../features/red/modules/grupos/pages/GruposPage'));
const GroupDetailPage = lazy(() => import('../features/red/modules/grupos/pages/GroupDetailPage'));
const CreateGroupPage = lazy(() => import('../features/red/modules/grupos/pages/CreateGroupPage'));

// === Módulo Eventos ===
const EventosPage = lazy(() => import('../features/red/modules/eventos/pages/EventosPage'));
const EventDetailPage = lazy(() => import('../features/red/modules/eventos/pages/EventDetailPage'));
const CreateEventPage = lazy(() => import('../features/red/modules/eventos/pages/CreateEventPage'));

// === Módulo Mensajes ===
const MensajesPage = lazy(() => import('../features/red/modules/mensajes/pages/MensajesPage'));
const ChatWindowPage = lazy(() => import('../features/red/modules/mensajes/pages/ChatWindowPage'));

// === Módulo Monetización ===
const PremiumPage = lazy(() => import('../features/red/modules/monetizacion/pages/PremiumPage'));
const RewardsPage = lazy(() => import('../features/red/modules/monetizacion/pages/RewardsPage'));

// === Módulo Sistema ===
const SettingsPage = lazy(() => import('../features/red/modules/sistema/pages/SettingsPage'));
const SecurityPage = lazy(() => import('../features/red/modules/sistema/pages/SecurityPage'));
const ProfilePage = lazy(() => import('../features/red/modules/sistema/pages/ProfilePage'));
const HelpPage = lazy(() => import('../features/red/modules/sistema/pages/HelpPage'));

// ================================================================
// 🚀 LOADING FALLBACK
// ================================================================

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Spinner size="lg" className="text-gold-cosmic" />
  </div>
);

// ================================================================
// 🗺️ ROUTER CONFIGURATION
// ================================================================

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<PageLoader />}>
        <MainLayout />
      </Suspense>
    ),
    children: [
      // ===== REDIRECTS =====
      { index: true, element: <Navigate to="/feed" replace /> },
      { path: '/red', element: <Navigate to="/feed" replace /> },

      // ===== FEED (Publicaciones) =====
      {
        path: '/feed',
        element: (
          <Suspense fallback={<PageLoader />}>
            <FeedPage />
          </Suspense>
        ),
      },
      {
        path: '/feed/post/:id',
        element: (
          <Suspense fallback={<PageLoader />}>
            <PostDetailPage />
          </Suspense>
        ),
      },
      {
        path: '/feed/create',
        element: (
          <Suspense fallback={<PageLoader />}>
            <CreatePostPage />
          </Suspense>
        ),
      },

      // ===== DIRECTOS (Streams) =====
      {
        path: '/directos',
        element: (
          <Suspense fallback={<PageLoader />}>
            <DirectosPage />
          </Suspense>
        ),
      },
      {
        path: '/directos/stream/:id',
        element: (
          <Suspense fallback={<PageLoader />}>
            <StreamPage />
          </Suspense>
        ),
      },
      {
        path: '/directos/start',
        element: (
          <Suspense fallback={<PageLoader />}>
            <StartStreamPage />
          </Suspense>
        ),
      },

      // ===== GRUPOS =====
      {
        path: '/grupos',
        element: (
          <Suspense fallback={<PageLoader />}>
            <GruposPage />
          </Suspense>
        ),
      },
      {
        path: '/grupos/:id',
        element: (
          <Suspense fallback={<PageLoader />}>
            <GroupDetailPage />
          </Suspense>
        ),
      },
      {
        path: '/grupos/create',
        element: (
          <Suspense fallback={<PageLoader />}>
            <CreateGroupPage />
          </Suspense>
        ),
      },

      // ===== EVENTOS =====
      {
        path: '/eventos',
        element: (
          <Suspense fallback={<PageLoader />}>
            <EventosPage />
          </Suspense>
        ),
      },
      {
        path: '/eventos/:id',
        element: (
          <Suspense fallback={<PageLoader />}>
            <EventDetailPage />
          </Suspense>
        ),
      },
      {
        path: '/eventos/create',
        element: (
          <Suspense fallback={<PageLoader />}>
            <CreateEventPage />
          </Suspense>
        ),
      },

      // ===== MENSAJES =====
      {
        path: '/mensajes',
        element: (
          <Suspense fallback={<PageLoader />}>
            <MensajesPage />
          </Suspense>
        ),
      },
      {
        path: '/mensajes/chat/:id',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ChatWindowPage />
          </Suspense>
        ),
      },

      // ===== MONETIZACIÓN =====
      {
        path: '/premium',
        element: (
          <Suspense fallback={<PageLoader />}>
            <PremiumPage />
          </Suspense>
        ),
      },
      {
        path: '/rewards',
        element: (
          <Suspense fallback={<PageLoader />}>
            <RewardsPage />
          </Suspense>
        ),
      },

      // ===== SISTEMA =====
      {
        path: '/settings',
        element: (
          <Suspense fallback={<PageLoader />}>
            <SettingsPage />
          </Suspense>
        ),
      },
      {
        path: '/security',
        element: (
          <Suspense fallback={<PageLoader />}>
            <SecurityPage />
          </Suspense>
        ),
      },
      {
        path: '/profile',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ProfilePage />
          </Suspense>
        ),
      },
      {
        path: '/help',
        element: (
          <Suspense fallback={<PageLoader />}>
            <HelpPage />
          </Suspense>
        ),
      },

      // ===== 404 =====
      {
        path: '*',
        element: (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gold-cosmic">404</h1>
              <p className="text-muted mt-2">Página no encontrada</p>
            </div>
          </div>
        ),
      },
    ],
  },
]);

export default router;