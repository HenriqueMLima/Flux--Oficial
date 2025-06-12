// detalhes.js (versão final com data de publicação)

document.addEventListener('DOMContentLoaded', () => {
    // --- Seletores de Elementos ---
    const backButton = document.getElementById('back-button');
    const editButton = document.getElementById('edit-button');
    const pageTitle = document.getElementById('page-title');
    const helpButton = document.getElementById('help-btn');
    const logoutButton = document.getElementById('logout-btn');
    
    // Elementos de dados
    const processoIdEl = document.getElementById('processo-id');
    const processoStatusEl = document.getElementById('processo-status');
    const reclamanteEl = document.getElementById('reclamante');
    const reclamadoEl = document.getElementById('reclamado');
    const assuntoEl = document.getElementById('assunto');
    const dataJulgamentoEl = document.getElementById('data-julgamento');
    const descricaoEl = document.getElementById('descricao');
    const datapublicacao = document.getElementById('data-publicacao');

    // --- LÓGICA DA PÁGINA ---
    const urlParams = new URLSearchParams(window.location.search);
    const processoId = urlParams.get('id');

    if (!processoId) {
        alert("ID do processo não encontrado na URL.");
        return;
    }

    async function carregarDetalhes() {
        try {
            const response = await axios.get(`http://127.0.0.1:5000/processos/${processoId}`);
            const processo = response.data;

            if (!processo) throw new Error("Processo não encontrado no servidor.");

            // Preenche todos os campos
            pageTitle.textContent = `Detalhes do Processo #${processo.id || processoId}`;
            processoIdEl.textContent = `#${processo.id || processoId}`;
            
            const statusFormatado = formatarStatus(processo.status);
            processoStatusEl.textContent = statusFormatado.texto;
            processoStatusEl.className = `status-badge status-${statusFormatado.classe}`;

            reclamanteEl.textContent = processo.reclamante || 'Não informado';
            reclamadoEl.textContent = processo.reclamado || 'Não informado';
            assuntoEl.textContent = processo.assunto || 'Não informado';
            descricaoEl.textContent = processo.descricao || 'Nenhuma descrição fornecida.';
            
            // Formata e preenche a data de julgamento
            const dataObj = processo.data_julgamento ? new Date(processo.data_julgamento) : null;
            const dataFormatada = dataObj && !isNaN(dataObj) ? dataObj.toLocaleDateString('pt-BR') : 'A definir';
            dataJulgamentoEl.textContent = dataFormatada;

            // --- LÓGICA ADICIONADA AQUI ---
            // Formata e preenche a data de publicação
            const dataPublicacaoObj = processo.data_publicacao ? new Date(processo.data_publicacao) : null;
            const dataPublicacaoFormatada = dataPublicacaoObj && !isNaN(dataPublicacaoObj) ? dataPublicacaoObj.toLocaleDateString('pt-BR') : 'Não informada';
            datapublicacao.textContent = dataPublicacaoFormatada;
            // --- FIM DA LÓGICA ADICIONADA ---

            // Configura o botão de Editar
            editButton.href = `../Editar/edit.html?id=${processoId}`;

        } catch (error) {
            console.error("Erro ao carregar detalhes do processo:", error);
            alert("Não foi possível carregar as informações do processo.");
        }
    }
    
    function formatarStatus(status) {
        if (!status) return { classe: 'pending', texto: 'Pendente' };
        const statusLower = status.toLowerCase().trim();
        const statusMap = {
            'pendente': { classe: 'pendente', texto: 'Pendente' },
            'em_andamento': { classe: 'em_andamento', texto: 'Em Andamento' },
            'julgado': { classe: 'julgado', texto: 'Julgado' },
            'rejeitado': { classe: 'rejeitado', texto: 'Rejeitado' },
        };
        return statusMap[statusLower] || { classe: 'pendente', texto: status };
    }

    if (backButton) backButton.addEventListener('click', () => window.history.back());
    if (helpButton) helpButton.addEventListener('click', () => alert('Você clicou em Ajuda!'));
    if (logoutButton) logoutButton.addEventListener('click', () => { if(confirm('Sair?')) alert('Desconectado.'); });

    // Inicialização
    carregarDetalhes();
});