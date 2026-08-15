// ================================================================
// 🗄️ useSupabase - CSARIEL'S ECOSYSTEM
// ================================================================
// Hook personalizado para interactuar con Supabase de forma reactiva.
// Hecho en Puebla, México 🇲🇽
// Versión: 3.0.0
// ================================================================

import { getSupabase } from '../services/supabaseClient.js';
import { getCurrentUser } from './useAuth.js';

// ================================================================
// 📦 ESTADO
// ================================================================

let supabaseState = {
    isConnected: false,
    isLoading: false,
    error: null,
    tables: {}
};

let listeners = [];

// ================================================================
# 🔌 FUNCIONES DE SUPABASE
// ================================================================

/**
 * Obtiene el cliente de Supabase
 */
function getClient() {
    return getSupabase();
}

/**
 * Notifica a todos los listeners del cambio de estado
 */
function notifyListeners() {
    listeners.forEach(callback => {
        try {
            callback({ ...supabaseState });
        } catch (e) {
            console.warn('Error en listener de Supabase:', e);
        }
    });
}

// ================================================================
# 📊 QUERY BUILDER
// ================================================================

class SupabaseQuery {
    constructor(table) {
        this.table = table;
        this.filters = {};
        this.orderBy = null;
        this.limitValue = null;
        this.offsetValue = null;
        this.selectFields = '*';
        this.single = false;
    }

    select(fields = '*') {
        this.selectFields = fields;
        return this;
    }

    eq(field, value) {
        this.filters[field] = { operator: 'eq', value };
        return this;
    }

    neq(field, value) {
        this.filters[field] = { operator: 'neq', value };
        return this;
    }

    gt(field, value) {
        this.filters[field] = { operator: 'gt', value };
        return this;
    }

    gte(field, value) {
        this.filters[field] = { operator: 'gte', value };
        return this;
    }

    lt(field, value) {
        this.filters[field] = { operator: 'lt', value };
        return this;
    }

    lte(field, value) {
        this.filters[field] = { operator: 'lte', value };
        return this;
    }

    like(field, value) {
        this.filters[field] = { operator: 'like', value };
        return this;
    }

    ilike(field, value) {
        this.filters[field] = { operator: 'ilike', value };
        return this;
    }

    in(field, values) {
        this.filters[field] = { operator: 'in', value: values };
        return this;
    }

    order(field, ascending = true) {
        this.orderBy = { field, ascending };
        return this;
    }

    limit(n) {
        this.limitValue = n;
        return this;
    }

    offset(n) {
        this.offsetValue = n;
        return this;
    }

    maybeSingle() {
        this.single = 'maybe';
        return this;
    }

    single() {
        this.single = 'single';
        return this;
    }

    async execute() {
        try {
            const supabase = getClient();
            let query = supabase.from(this.table).select(this.selectFields);

            // Aplicar filtros
            for (const [field, filter] of Object.entries(this.filters)) {
                query = query[filter.operator](field, filter.value);
            }

            // Aplicar orden
            if (this.orderBy) {
                query = query.order(this.orderBy.field, { ascending: this.orderBy.ascending });
            }

            // Aplicar límite y offset
            if (this.limitValue) {
                query = query.limit(this.limitValue);
            }
            if (this.offsetValue) {
                query = query.range(this.offsetValue, this.offsetValue + (this.limitValue || 10) - 1);
            }

            // Ejecutar
            const { data, error } = await query;
            if (error) throw error;

            return data;

        } catch (error) {
            console.error('❌ Error en query:', error);
            throw error;
        }
    }
}

// ================================================================
# 📋 FUNCIONES DE TABLA
// ================================================================

export function table(tableName) {
    return new SupabaseQuery(tableName);
}

// ================================================================
# 📥 OBTENER DATOS
// ================================================================

export async function getData(table, options = {}) {
    try {
        supabaseState.isLoading = true;
        notifyListeners();

        const supabase = getClient();
        let query = supabase.from(table).select(options.select || '*');

        if (options.eq) {
            for (const [key, value] of Object.entries(options.eq)) {
                query = query.eq(key, value);
            }
        }

        if (options.order) {
            query = query.order(options.order.by, { ascending: options.order.ascending !== false });
        }

        if (options.limit) {
            query = query.limit(options.limit);
        }

        if (options.offset) {
            query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
        }

        const { data, error } = await query;
        if (error) throw error;

        supabaseState.error = null;
        notifyListeners();
        return data;

    } catch (error) {
        console.error('❌ Error en getData:', error);
        supabaseState.error = error.message;
        notifyListeners();
        throw error;
    } finally {
        supabaseState.isLoading = false;
        notifyListeners();
    }
}

// ================================================================
# 📥 OBTENER UN SOLO REGISTRO
// ================================================================

export async function getOne(table, match) {
    try {
        const supabase = getClient();
        let query = supabase.from(table).select('*');

        for (const [key, value] of Object.entries(match)) {
            query = query.eq(key, value);
        }

        const { data, error } = await query.single();
        if (error) throw error;

        return data;

    } catch (error) {
        console.error('❌ Error en getOne:', error);
        throw error;
    }
}

// ================================================================
# 📥 INSERTAR DATOS
// ================================================================

export async function insertData(table, data) {
    try {
        supabaseState.isLoading = true;
        notifyListeners();

        const supabase = getClient();
        const { data: result, error } = await supabase
            .from(table)
            .insert(data)
            .select();

        if (error) throw error;

        supabaseState.error = null;
        notifyListeners();
        return result;

    } catch (error) {
        console.error('❌ Error en insertData:', error);
        supabaseState.error = error.message;
        notifyListeners();
        throw error;
    } finally {
        supabaseState.isLoading = false;
        notifyListeners();
    }
}

// ================================================================
# 📝 ACTUALIZAR DATOS
// ================================================================

export async function updateData(table, data, match) {
    try {
        supabaseState.isLoading = true;
        notifyListeners();

        const supabase = getClient();
        let query = supabase.from(table).update(data);

        for (const [key, value] of Object.entries(match)) {
            query = query.eq(key, value);
        }

        const { data: result, error } = await query.select();
        if (error) throw error;

        supabaseState.error = null;
        notifyListeners();
        return result;

    } catch (error) {
        console.error('❌ Error en updateData:', error);
        supabaseState.error = error.message;
        notifyListeners();
        throw error;
    } finally {
        supabaseState.isLoading = false;
        notifyListeners();
    }
}

// ================================================================
# 🗑️ ELIMINAR DATOS
// ================================================================

export async function deleteData(table, match) {
    try {
        supabaseState.isLoading = true;
        notifyListeners();

        const supabase = getClient();
        let query = supabase.from(table).delete();

        for (const [key, value] of Object.entries(match)) {
            query = query.eq(key, value);
        }

        const { data: result, error } = await query.select();
        if (error) throw error;

        supabaseState.error = null;
        notifyListeners();
        return result;

    } catch (error) {
        console.error('❌ Error en deleteData:', error);
        supabaseState.error = error.message;
        notifyListeners();
        throw error;
    } finally {
        supabaseState.isLoading = false;
        notifyListeners();
    }
}

// ================================================================
# 📡 SUSCRIBIRSE A CAMBIOS EN TABLA
// ================================================================

export function subscribeToTable(table, callback, evento = '*') {
    try {
        const supabase = getClient();
        const channel = supabase.channel(`public:${table}`);

        channel.on('postgres_changes', {
            event: evento,
            schema: 'public',
            table: table
        }, (payload) => {
            callback(payload);
        }).subscribe();

        return channel;

    } catch (error) {
        console.error('❌ Error suscribiendo a tabla:', error);
        return null;
    }
}

// ================================================================
# 🔌 DESUSCRIBIRSE
// ================================================================

export function unsubscribe(channel) {
    if (channel) {
        channel.unsubscribe();
        console.log('🔌 Suscripción cancelada');
    }
}

// ================================================================
# 📊 OBTENER ESTADO
// ================================================================

export function useSupabase() {
    return { ...supabaseState };
}

export function getSupabaseState() {
    return { ...supabaseState };
}

// ================================================================
# 👂 SUSCRIBIRSE A CAMBIOS
// ================================================================

export function subscribeToSupabase(callback) {
    if (typeof callback === 'function') {
        listeners.push(callback);
        callback({ ...supabaseState });
    }
    return () => {
        listeners = listeners.filter(cb => cb !== callback);
    };
}

// ================================================================
# 🚀 INICIALIZAR
// ================================================================

export function initSupabaseHook() {
    try {
        getClient();
        supabaseState.isConnected = true;
        supabaseState.error = null;
        notifyListeners();
        console.log('🗄️ Supabase hook inicializado');
    } catch (error) {
        console.error('❌ Error inicializando Supabase hook:', error);
        supabaseState.isConnected = false;
        supabaseState.error = error.message;
        notifyListeners();
    }
}

// ================================================================
# 📦 EXPORTAR
// ================================================================

export default {
    table,
    getData,
    getOne,
    insertData,
    updateData,
    deleteData,
    subscribeToTable,
    unsubscribe,
    useSupabase,
    getSupabaseState,
    subscribeToSupabase,
    initSupabaseHook
};

console.log('🗄️ useSupabase cargado');
console.log('📍 Hecho en Puebla, México 🇲🇽');