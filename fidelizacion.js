/**
 * fidelizacion.js
 * Sistema de clientes, TOKs y niveles (Bronce/Plata/Oro/Diamante)
 * Respaldado en Supabase.
 * 
 * Requiere: config.js y base-datos-centralizada.js cargados antes.
 * Se usa con fidelizacion.html
 */

(function () {
  "use strict";

  // =========================
  // CONFIGURACIÓN
  // =========================
  const CONFIG_LOCAL = window.CONFIG || {};
  const SUPABASE_URL = CONFIG_LOCAL.SUPABASE_URL || 'https://nvyyxgkladjauolvpzfp.supabase.co';
  const SUPABASE_ANON_KEY = CONFIG_LOCAL.SUPABASE_ANON_KEY || 'sb_publishable_GWNmmwICFc2dkJx2BXdY8Q_-5qAC-Dg';

  let supabaseClient = null;

  // =========================
  // INICIALIZAR SUPABASE
  // =========================
  function initSupabase() {
    try {
      if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase inicializado para Fidelización');
      } else {
        console.warn('⚠️ SDK de Supabase no disponible, usando modo local');
      }
    } catch (error) {
      console.error('❌ Error inicializando Supabase:', error);
    }
  }

  // =========================
  // CLASE SISTEMA FIDELIZACIÓN
  // =========================
  class SistemaFidelizacion {
    constructor() {
      this.clientesCache = JSON.parse(localStorage.getItem('cache_clientes_fidelizacion') || '[]');
      this._cargarDesdeServidor();
    }

    // =========================
    // Cargar desde Supabase
    // =========================
    async _cargarDesdeServidor() {
      if (!supabaseClient) return;
      try {
        const { data, error } = await supabaseClient
          .from('clientes_fidelizacion')
          .select('*')
          .order('creado_en', { ascending: false });
        if (error) throw error;

        this.clientesCache = (data || []).map(this._mapearFila);
        this._guardarCacheLocal();
        window.dispatchEvent(new CustomEvent('fidelizacionSincronizada'));
        console.log('✅ Clientes de fidelización sincronizados');
      } catch (err) {
        console.error('❌ Error cargando clientes de fidelización:', err);
      }
    }

    // =========================
    // Mapear fila de Supabase
    // =========================
    _mapearFila(fila) {
      return {
        id: fila.id,
        nombre: fila.nombre,
        telefono: fila.telefono,
        toks: fila.toks || 0,
        toksTotales: fila.toks_totales || 0,
        transacciones: fila.transacciones || 0,
        nftEmitido: fila.nft_emitido || false,
        nftCanjeado: fila.nft_canjeado || false,
        nivel: fila.nivel || 'sin nivel'
      };
    }

    // =========================
    // Guardar cache local
    // =========================
    _guardarCacheLocal() {
      try {
        localStorage.setItem('cache_clientes_fidelizacion', JSON.stringify(this.clientesCache));
      } catch (e) { /* no crítico */ }
    }

    // =========================
    // Obtener todos los clientes
    // =========================
    obtenerTodosLosClientes() {
      return [...this.clientesCache].sort((a, b) => a.nombre.localeCompare(b.nombre));
    }

    // =========================
    // Obtener cliente por ID
    // =========================
    obtenerCliente(id) {
      return this.clientesCache.find(c => c.id === id) || null;
    }

    // =========================
    // Buscar cliente por nombre
    // =========================
    buscarClientePorNombre(termino) {
      const t = (termino || '').trim().toLowerCase();
      if (!t) return this.obtenerTodosLosClientes();
      return this.clientesCache.filter(c => c.nombre.toLowerCase().includes(t));
    }

    // =========================
    // Calcular descuento
    // =========================
    calcularDescuentoCliente(id) {
      const cliente = this.obtenerCliente(id);
      if (!cliente) return 0;
      const niveles = {
        'diamante': 15,
        'oro': 10,
        'plata': 5,
        'bronce': 3
      };
      return niveles[cliente.nivel] || 0;
    }

    // =========================
    // Registrar cliente
    // =========================
    registrarCliente(nombre, telefono = '') {
      const nombreLimpio = (nombre || '').trim();
      if (!nombreLimpio) throw new Error('El nombre del cliente es obligatorio.');

      const yaExiste = this.clientesCache.some(
        c => c.nombre.toLowerCase() === nombreLimpio.toLowerCase()
      );
      if (yaExiste) throw new Error('Ya existe un cliente con ese nombre.');

      const cliente = {
        id: `cli_${Date.now()}`,
        nombre: nombreLimpio,
        telefono: telefono || '',
        toks: 0,
        toksTotales: 0,
        transacciones: 0,
        nftEmitido: false,
        nftCanjeado: false,
        nivel: 'sin nivel'
      };

      this.clientesCache.unshift(cliente);
      this._guardarCacheLocal();

      // Guardar en Supabase
      if (supabaseClient) {
        supabaseClient.from('clientes_fidelizacion').insert({
          id: cliente.id,
          nombre: cliente.nombre,
          telefono: cliente.telefono,
          toks: 0,
          toks_totales: 0,
          transacciones: 0,
          nft_emitido: false,
          nft_canjeado: false,
          nivel: 'sin nivel'
        }).then(({ error }) => {
          if (error) console.error('❌ Error registrando cliente en Supabase:', error);
        });
      }

      return cliente;
    }

    // =========================
    // Procesar venta (otorgar TOKs)
    // =========================
    procesarVenta(clienteId, venta) {
      const cliente = this.obtenerCliente(clienteId);
      if (!cliente) return null;

      const toksOtorgados = 1; // 1 compra = 1 TOK
      cliente.toks += toksOtorgados;
      cliente.toksTotales += toksOtorgados;
      cliente.transacciones += 1;

      const nivelAnterior = cliente.nivel;
      cliente.nivel = this._calcularNivel(cliente.toksTotales);

      let nftNuevo = null;
      const umbral = CONFIG_LOCAL.FIDELIZACION?.TOKS_PARA_NFT || 12;
      if (cliente.transacciones >= umbral && !cliente.nftEmitido) {
        cliente.nftEmitido = true;
        nftNuevo = { nombre: `NFT ${cliente.nivel} de ${cliente.nombre}` };
      }

      this._guardarCacheLocal();

      // Actualizar en Supabase
      if (supabaseClient) {
        supabaseClient.from('clientes_fidelizacion').update({
          toks: cliente.toks,
          toks_totales: cliente.toksTotales,
          transacciones: cliente.transacciones,
          nivel: cliente.nivel,
          nft_emitido: cliente.nftEmitido
        }).eq('id', cliente.id).then(({ error }) => {
          if (error) console.error('❌ Error actualizando fidelización en Supabase:', error);
        });
      }

      return {
        toksOtorgados,
        nivelAnterior,
        nivelNuevo: cliente.nivel,
        nftNuevo
      };
    }

    // =========================
    // Calcular nivel según TOKs
    // =========================
    _calcularNivel(toks) {
      const niveles = CONFIG_LOCAL.FIDELIZACION?.NIVELES || [
        { nombre: 'diamante', minimo: 1000 },
        { nombre: 'oro', minimo: 600 },
        { nombre: 'plata', minimo: 300 },
        { nombre: 'bronce', minimo: 100 }
      ];
      for (const n of niveles) {
        if (Number(toks) >= n.minimo) return n.nombre;
      }
      return 'sin nivel';
    }

    // =========================
    // Obtener resumen general
    // =========================
    obtenerResumenGeneral() {
      const hoy = new Date().toDateString();
      let ventasHoy = [];
      if (typeof window.bd?.obtenerVentasDeHoy === 'function') {
        ventasHoy = window.bd.obtenerVentasDeHoy() || [];
      } else {
        try {
          ventasHoy = JSON.parse(localStorage.getItem('ventas') || '[]')
            .filter(v => new Date(v.fecha || v.fechaRegistro).toDateString() === hoy);
        } catch (e) { /* no crítico */ }
      }

      const toksOtorgadosHoy = ventasHoy.filter(v => v.clienteFidelizacionId).length;

      return {
        totalClientes: this.clientesCache.length,
        toksOtorgadosHoy,
        nftsActivos: this.clientesCache.filter(c => c.nftEmitido && !c.nftCanjeado).length,
        clientesPorNivel: {
          diamante: this.clientesCache.filter(c => c.nivel === 'diamante').length,
          oro: this.clientesCache.filter(c => c.nivel === 'oro').length,
          plata: this.clientesCache.filter(c => c.nivel === 'plata').length,
          bronce: this.clientesCache.filter(c => c.nivel === 'bronce').length,
          sinNivel: this.clientesCache.filter(c => c.nivel === 'sin nivel').length
        }
      };
    }

    // =========================
    // Sincronizar manualmente
    // =========================
    async sincronizar() {
      await this._cargarDesdeServidor();
      return this.clientesCache;
    }
  }

  // =========================
  // INICIALIZAR
  // =========================
  initSupabase();

  // Crear instancia global
  const sistemaFidelizacion = new SistemaFidelizacion();

  // Exponer globalmente
  window.sistemaFidelizacion = sistemaFidelizacion;
  window.SistemaFidelizacion = SistemaFidelizacion;

  console.log('🎫 Sistema de Fidelización inicializado');

  // Disparar evento de carga
  window.dispatchEvent(new CustomEvent('fidelizacionLista'));

})();