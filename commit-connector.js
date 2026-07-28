// ================================================================
// commit-connector.js — Conexión Front-end Sistema COMMIT (CMT)
// Sariel's Ecosystem — Proyecto: nvyyxgkladjauolvpzfp
// ================================================================

(function () {
  'use strict';

  if (!window.bd) {
    console.error('❌ commit-connector.js requiere que base-datos-centralizada.js esté cargado antes.');
    return;
  }

  const supabase = window.bd; // cliente Supabase ya inicializado

  window.Commit = {

    // ------------------------------------------------------------
    // 1. Consultar saldo de un usuario
    // ------------------------------------------------------------
    async consultarSaldo(userId) {
      if (!userId) throw new Error('userId es requerido');

      const { data, error } = await supabase.rpc('obtener_saldo_commit', {
        p_user_id: userId
      });

      if (error) {
        console.error('❌ Error al consultar saldo CMT:', error.message);
        throw error;
      }

      // La función devuelve una tabla; tomamos la primera fila
      const saldo = data && data[0] ? data[0] : {
        balance: 0, total_received: 0, total_sent: 0, total_commission: 0
      };

      return saldo;
    },

    // ------------------------------------------------------------
    // 2. Comprar / enviar un sticker (activo de token_prices)
    //    Internamente usa procesar_transaccion_commit con asset_type
    // ------------------------------------------------------------
    async comprarSticker(userId, receiverId, assetType, descripcion) {
      if (!userId || !assetType) {
        throw new Error('userId y assetType son requeridos');
      }

      // 1) Buscar el precio del sticker
      const { data: precio, error: errPrecio } = await supabase
        .from('token_prices')
        .select('price_commit, asset_name, asset_code')
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

      return {
        ...data[0],
        asset_name: precio.asset_name,
        asset_code: precio.asset_code
      };
    },

    // ------------------------------------------------------------
    // 3. Enviar un regalo directo (sin asset_type, solo CMT puro)
    // ------------------------------------------------------------
    async enviarRegalo(userId, receiverId, monto, descripcion) {
      if (!userId || !receiverId || !monto || monto <= 0) {
        throw new Error('userId, receiverId y monto (>0) son requeridos');
      }

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

      return data[0]; // { transaction_id, commission_amount, receiver_amount, success }
    },

    // ------------------------------------------------------------
    // 4. Consultar historial de transacciones
    // ------------------------------------------------------------
    async consultarHistorial(userId, limite = 50, offset = 0) {
      if (!userId) throw new Error('userId es requerido');

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
    },

    // ------------------------------------------------------------
    // 5. Bonus: listar catálogo de stickers/activos disponibles
    // ------------------------------------------------------------
    async listarStickers() {
      const { data, error } = await supabase
        .from('token_prices')
        .select('*')
        .order('price_commit', { ascending: true });

      if (error) {
        console.error('❌ Error al listar stickers:', error.message);
        throw error;
      }

      return data || [];
    }
  };

  console.log('✅ commit-connector.js cargado — window.Commit disponible');
})();