let GOOGLE_MAPS_API_KEY = '';

async function loadApiKey() {
    try {
        const response = await fetch('/config.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const config = await response.json();
        
        if (config.api_key && config.api_key.value) {
            GOOGLE_MAPS_API_KEY = config.api_key.value;
            console.log('✅ API Key carregada do config.json');
            return GOOGLE_MAPS_API_KEY;
        } else {
            throw new Error('API Key não encontrada no config.json');
        }
    } catch (error) {
        console.error('❌ Erro ao carregar config.json:', error);
        throw error;
    }
}

// Exporta a função e a variável
window.loadApiKey = loadApiKey;
window.GOOGLE_MAPS_API_KEY = GOOGLE_MAPS_API_KEY;