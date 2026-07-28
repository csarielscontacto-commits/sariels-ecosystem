// ================================================================
// commit-connector.js — Conexión Front-end Sistema COMMIT (CMT)
// Csariel's Ecosystem — Proyecto: nvyyxgkladjauolvpzfp
// Versión: 2.0 (Completa con eventos y funciones avanzadas)
// ================================================================

(function () {
  'use strict';

  // ================================================================
  // 1. VERIFICAR QUE window.bd EXISTE
  // ================================================================

  if (!window.bd) {
    console.error('❌ commit-connector.js requiere que base-datos-centralizada.js esté cargado antes.');
    console.warn('⚠️ Asegúrate de cargar base-datos-centralizada.js antes que commit-connector.js');
    return;
  }

  const supabase = window.bd; // cliente Supabase ya inicializado

  // ================================================================
  // 2. OBJETO COMMIT
  // ================================================================

  window.Commit = {

    // ------------------------------------------------------------
    // 1. Consultar saldo de un usuario
    // ------------------------------------------------------------
    async consultarSaldo(userId) {
      if (!userId) throw new Error('userId es requerido');

      try {
        const { data, error } = await supabase.rpc('obtener_saldo_commit', {
          p_user_id: userId
        });

        if (error) {
          console.error('❌ Error al consultar saldo CMT:', error.message);
          throw error;
        }

        const saldo = data && data[0] ? data[0] : {
          balance: 0,
          total_received: 0,
          total_sent: 0,
          total_commission: 0
        };

        return saldo;
      } catch (error) {
        console.error('❌ Error en consultarSaldo:', error);
        throw error;
      }
    },

    // ------------------------------------------------------------
    // 2. Comprar / enviar un sticker (activo de token_prices)
    //    Internamente usa procesar_transaccion_commit con asset_type
    // ------------------------------------------------------------
    async comprarSticker(userId, receiverId, assetType, descripcion) {
      if (!userId || !assetType) {
        throw new Error('userId y assetType son requeridos');
      }

      try {
        // 1) Buscar el precio del sticker con todos sus atributos
        const { data: precio, error: errPrecio } = await supabase
          .from('token_prices')
          .select('price_commit, asset_name, asset_code, rarity, emoji, color_hex, animation_type')
          .eq('asset_type', assetType)
          .single();

        if (errPrecio || !precio) {
          console.error('❌ Sticker no encontrado:', assetType);
          throw errPrecio || new Error('Sticker no encontrado');
        }

        // 2) Procesar la transacción (regla 50/50 aplicada en el backend)
        const { data, error } = await supabase.rpc('procesar_transaccion_commit', {
          p_sender_id: userId,
          p_receiver_id: receiverId || null,
          p_amount: precio.price_commit,
          p_asset_type: assetType,
          p_description: descripcion || `Compra de ${precio.asset_name}`
        });

        if (error) {
          console.error('❌ Error al comprar sticker:', error.message);
          throw error;
        }

        // 3) Construir resultado con todos los datos
        const resultado = {
          ...data[0],
          asset_name: precio.asset_name,
          asset_code: precio.asset_code,
          emoji: precio.emoji,
          color_hex: precio.color_hex,
          rarity: precio.rarity,
          animation_type: precio.animation_type || 'none'
        };

        // 4) Emitir evento para animaciones (si aplica)
        if (precio.animation_type && precio.animation_type !== 'none') {
          document.dispatchEvent(new CustomEvent('sticker:enviado', {
            detail: {
              asset_type: assetType,
              asset_name: precio.asset_name,
              asset_code: precio.asset_code,
              emoji: precio.emoji,
              color: precio.color_hex,
              animation_type: precio.animation_type,
              rarity: precio.rarity,
              sender: userId,
              receiver: receiverId,
              amount: precio.price_commit,
              commission: data[0]?.commission_amount || 0,
              receiver_amount: data[0]?.receiver_amount || 0,
              transaction_id: data[0]?.transaction_id
            }
          }));

          console.log(`🎆 Evento sticker:enviado disparado para ${precio.asset_name}`);
        }

        return resultado;
      } catch (error) {
        console.error('❌ Error en comprarSticker:', error);
        throw error;
      }
    },

    // ------------------------------------------------------------
    // 3. Enviar un regalo directo (sin asset_type, solo CMT puro)
    // ------------------------------------------------------------
    async enviarRegalo(userId, receiverId, monto, descripcion) {
      if (!userId || !receiverId || !monto || monto <= 0) {
        throw new Error('userId, receiverId y monto (>0) son requeridos');
      }

      try {
        const { data, error } = await supabase.rpc('procesar_transaccion_commit', {
          p_sender_id: userId,
          p_receiver_id: receiverId,
          p_amount: monto,
          p_asset_type: null,
          p_description: descripcion || 'Regalo P2P'
        });

        if (error) {
          console.error('❌ Error al enviar regalo:', error.message);
          throw error;
        }

        // Emitir evento para el sistema de notificaciones
        document.dispatchEvent(new CustomEvent('regalo:enviado', {
          detail: {
            sender: userId,
            receiver: receiverId,
            amount: monto,
            commission: data[0]?.commission_amount || 0,
            receiver_amount: data[0]?.receiver_amount || 0,
            transaction_id: data[0]?.transaction_id
          }
        }));

        console.log(`🎁 Regalo de ${monto} CMT enviado de ${userId} a ${receiverId}`);

        return data[0]; // { transaction_id, commission_amount, receiver_amount, success }
      } catch (error) {
        console.error('❌ Error en enviarRegalo:', error);
        throw error;
      }
    },

    // ------------------------------------------------------------
    // 4. Consultar historial de transacciones
    // ------------------------------------------------------------
    async consultarHistorial(userId, limite = 50, offset = 0) {
      if (!userId) throw new Error('userId es requerido');

      try {
        const { data, error } = await supabase.rpc('obtener_historial_commit', {
          p_user_id: userId,
          p_limit: limite,
          p_offset: offset
        });

        if (error) {
          console.error('❌ Error al consultar historial CMT:', error.message);
          throw error;
        }

        return data || [];
      } catch (error) {
        console.error('❌ Error en consultarHistorial:', error);
        throw error;
      }
    },

    // ------------------------------------------------------------
    // 5. Listar catálogo de stickers/activos disponibles
    // ------------------------------------------------------------
    async listarStickers() {
      try {
        const { data, error } = await supabase
          .from('token_prices')
          .select('*')
          .order('price_commit', { ascending: true });

        if (error) {
          console.error('❌ Error al listar stickers:', error.message);
          throw error;
        }

        return data || [];
      } catch (error) {
        console.error('❌ Error en listarStickers:', error);
        throw error;
      }
    },

    // ------------------------------------------------------------
    // 6. Obtener estadísticas de la plataforma
    // ------------------------------------------------------------
    async obtenerEstadisticas() {
      try {
        const { data, error } = await supabase.rpc('obtener_estadisticas_commit');

        if (error) {
          console.error('❌ Error al obtener estadísticas:', error.message);
          throw error;
        }

        return data && data[0] ? data[0] : {
          total_usuarios: 0,
          total_transacciones: 0,
          total_commit_circulando: 0,
          total_commit_comision: 0,
          total_regalos_enviados: 0,
          top_donante: null,
          top_donante_monto: 0
        };
      } catch (error) {
        console.error('❌ Error en obtenerEstadisticas:', error);
        throw error;
      }
    },

    // ------------------------------------------------------------
    // 7. Crear usuario si no existe (para pruebas)
    // ------------------------------------------------------------
    async crearUsuarioSiNoExiste(userId) {
      if (!userId) throw new Error('userId es requerido');

      try {
        const { data, error } = await supabase
          .from('user_balances')
          .upsert({
            user_id: userId,
            balance_commit: 0,
            total_received: 0,
            total_sent: 0,
            total_commission: 0,
            last_updated: new Date().toISOString()
          }, { onConflict: 'user_id' });

        if (error) {
          console.error('❌ Error al crear usuario:', error.message);
          throw error;
        }

        console.log(`✅ Usuario ${userId} creado/actualizado en user_balances`);
        return { success: true, user_id: userId };
      } catch (error) {
        console.error('❌ Error en crearUsuarioSiNoExiste:', error);
        throw error;
      }
    },

    // ------------------------------------------------------------
    // 8. Dar saldo a un usuario (para pruebas)
    // ------------------------------------------------------------
    async darSaldo(userId, cantidad) {
      if (!userId || !cantidad || cantidad <= 0) {
        throw new Error('userId y cantidad (>0) son requeridos');
      }

      try {
        const { data, error } = await supabase
          .from('user_balances')
          .upsert({
            user_id: userId,
            balance_commit: cantidad,
            last_updated: new Date().toISOString()
          }, { onConflict: 'user_id' });

        if (error) {
          console.error('❌ Error al dar saldo:', error.message);
          throw error;
        }

        console.log(`💰 ${cantidad} CMT asignados a ${userId}`);
        return { success: true, user_id: userId, balance: cantidad };
      } catch (error) {
        console.error('❌ Error en darSaldo:', error);
        throw error;
      }
    },

    // ------------------------------------------------------------
    // 9. Obtener detalles de un sticker específico
    // ------------------------------------------------------------
    async obtenerSticker(assetType) {
      if (!assetType) throw new Error('assetType es requerido');

      try {
        const { data, error } = await supabase
          .from('token_prices')
          .select('*')
          .eq('asset_type', assetType)
          .single();

        if (error) {
          console.error('❌ Error al obtener sticker:', error.message);
          throw error;
        }

        return data || null;
      } catch (error) {
        console.error('❌ Error en obtenerSticker:', error);
        throw error;
      }
    }
  };

  // ================================================================
  // 3. LOG DE INICIALIZACIÓN
  // ================================================================

  console.log('✅ commit-connector.js cargado — window.Commit disponible (v2.0)');
  console.log('📦 Funciones disponibles:');
  console.log('   📊 Commit.consultarSaldo(userId)');
  console.log('   🎁 Commit.comprarSticker(userId, receiverId, assetType, desc)');
  console.log('   💰 Commit.enviarRegalo(userId, receiverId, monto, desc)');
  console.log('   📜 Commit.consultarHistorial(userId, limite, offset)');
  console.log('   🏷️ Commit.listarStickers()');
  console.log('   📈 Commit.obtenerEstadisticas()');
  console.log('   👤 Commit.crearUsuarioSiNoExiste(userId)');
  console.log('   💰 Commit.darSaldo(userId, cantidad)');
  console.log('   🔍 Commit.obtenerSticker(assetType)');
  console.log('');
  console.log('🎆 Eventos disponibles:');
  console.log('   📡 sticker:enviado — cuando se envía un sticker con animación');
  console.log('   📡 regalo:enviado — cuando se envía un regalo P2P');

})();