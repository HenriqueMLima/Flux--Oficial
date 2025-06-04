async function carregarProcessos() {
    const tbody = document.getElementById('table-body');
    
    try {
        const resposta = await axios.get('http://127.0.0.1:5000/processos');
        const dados = resposta.data;

        if (!Array.isArray(dados) || dados.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="no-data">Nenhum processo encontrado</td></tr>';
            return;
        }

        tbody.innerHTML = '';

        dados.forEach(item => {
            // Normalização dos dados para compatibilidade
            const processo = {
                id: item.id || item.numero_processo || item.codigo || '-',
                reclamante: item.reclamante || item.nome_reclamante || '-',
                assunto: item.assunto || item.descricao_assunto || '-',
                reclamado: Array.isArray(item.reclamado) ? item.reclamado.join(', ') : 
                         (item.reclamado || item.nome_reclamado || '-'),
                data: item.data || item.data_julgamento || item.data_cadastro,
                status: item.status || item.situacao || item.estado
            };

            // Formatação de data robusta
            const dataObj = processo.data ? new Date(processo.data) : null;
            const dataFormatada = dataObj && !isNaN(dataObj) 
                ? dataObj.toLocaleDateString('pt-BR') 
                : '-';

            // Formatação do status
            const statusFormatado = formatarStatus(processo.status);

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${processo.id}</td>
                <td>${processo.reclamante}</td>
                <td>${processo.assunto}</td>
                <td>${processo.reclamado}</td>
                <td>
                    <div class="date-cell">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        ${dataFormatada}
                    </div>
                </td>
                <td>
                    <span class="status-badge status-${statusFormatado.classe}">
                        ${statusFormatado.texto}
                    </span>
                </td>
                <td class="actions-column">
                    <button class="action-view" data-id="${processo.id}" title="Visualizar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                </td>
            `;
            
            tbody.appendChild(tr);
        });

    } catch (erro) {
        console.error('Falha ao carregar processos:', erro);
        tbody.innerHTML = '<tr><td colspan="7" class="error-message">Erro ao carregar processos</td></tr>';
    }
}

function formatarStatus(status) {
    if (!status) return { classe: 'pending', texto: 'Pendente' };
    
    const statusLower = status.toLowerCase().trim();
    
    const statusMap = {
        'pendente': { classe: 'pending', texto: 'Pendente' },
        'andamento': { classe: 'in-progress', texto: 'Em Andamento' },
        'em_andamento': { classe: 'in-progress', texto: 'Em Andamento' },
        'concluído': { classe: 'completed', texto: 'Concluído' },
        'concluido': { classe: 'completed', texto: 'Concluído' },
        'cancelado': { classe: 'rejected', texto: 'Cancelado' },
        'rejeitado': { classe: 'rejected', texto: 'Rejeitado' }
    };
    
    return statusMap[statusLower] || { classe: 'pending', texto: status };
}

document.addEventListener('DOMContentLoaded', carregarProcessos);