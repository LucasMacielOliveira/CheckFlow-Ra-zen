const API_BASE_URL = "http://localhost:3000";

async function buscarEstados(){
const response = await fetch(`${API_BASE_URL}/estados`);
    
if (!response.ok) {
    throw new Error("Erro ao buscar estados");
    }
    return await response.json();
}

async function buscarFiliaisPorEstado(estado){
    const response = await fetch(`${API_BASE_URL}/filiais?estado=${encodeURIComponent(estado)}`);

    if(!response.ok){
        throw new Error("Erro ao buscar filiais");
    }
    return await response.json();
}