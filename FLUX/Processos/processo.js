let processosOriginais = [];
let paginaAtual = 1;
const TAMANHO_PAGINA = 13;
let campoOrdenacao = 'data';
let ordemCrescente = true;

async function carregarProcessos() {
    const tbody = document.getElementById('table-body');
    try {
        const resposta = await axios.get('http://127.0.0.1:5000/processos');
        processosOriginais = resposta.data || [];
        paginaAtual = 1;
        renderizarTabela();
    } catch (erro) {
        console.error('Falha ao carregar processos:', erro);
        tbody.innerHTML = '<tr><td colspan="7" class="error-message">Erro ao carregar processos</td></tr>';
    }
}

// Retorna true se o campo de busca está vazio
function buscaVazia() {
    const searchInput = document.getElementById('search-input').value.trim();
    return searchInput === '';
}

// Função de filtro com busca por status, nome do processo e número
function filtrarProcessos() {
    const searchInput = document.getElementById('search-input').value.toLowerCase();
    return processosOriginais.filter(item => {
        const processo = {
            id: item.id || item.numero_processo || item.codigo || '-',
            reclamante: item.reclamante || item.nome_reclamante || '-',
            assunto: item.assunto || item.descricao_assunto || '-',
            reclamado: Array.isArray(item.reclamado) ? item.reclamado.join(', ') :
                (item.reclamado || item.nome_reclamado || '-'),
            data: item.data_julgamento || item.data || item.data_cadastro || '-',
            status: item.status || item.situacao || item.estado || '-'
        };
        // Busca por número, nome do processo (reclamante) ou status
        return (
            processo.id.toString().toLowerCase().includes(searchInput) ||
            processo.reclamante.toLowerCase().includes(searchInput) ||
            processo.status.toLowerCase().includes(searchInput)
        );
    });
}

function ordenarProcessos(lista) {
    if (!campoOrdenacao) return lista;
    return lista.slice().sort((a, b) => {
        let valA = a[campoOrdenacao] || '';
        let valB = b[campoOrdenacao] || '';
        if (campoOrdenacao === 'data') {
            valA = new Date(valA);
            valB = new Date(valB);
            return ordemCrescente ? valB - valA : valA - valB;
        }
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA < valB) return ordemCrescente ? -1 : 1;
        if (valA > valB) return ordemCrescente ? 1 : -1;
        return 0;
    });
}

function renderizarTabela() {
    const tbody = document.getElementById('table-body');
    let dados = filtrarProcessos().map(item => ({
        id: item.id || item.numero_processo || item.codigo || '-',
        reclamante: item.reclamante || item.nome_reclamante || '-',
        assunto: item.assunto || item.descricao_assunto || '-',
        reclamado: Array.isArray(item.reclamado) ? item.reclamado.join(', ') :
            (item.reclamado || item.nome_reclamado || '-'),
        data: item.data_julgamento || item.data || item.data_cadastro || '-',
        status: item.status || item.situacao || item.estado || '-'
    }));

    dados = ordenarProcessos(dados);

    let pagina = [];
    let totalPaginas = 1;

    // Se busca vazia, aplica paginação
    if (buscaVazia()) {
        totalPaginas = Math.ceil(dados.length / TAMANHO_PAGINA);
        if (paginaAtual > totalPaginas) paginaAtual = totalPaginas || 1;
        const inicio = (paginaAtual - 1) * TAMANHO_PAGINA;
        const fim = inicio + TAMANHO_PAGINA;
        pagina = dados.slice(inicio, fim);
    } else {
        // Se busca ativa, mostra todos os resultados
        pagina = dados;
        paginaAtual = 1;
        totalPaginas = 1;
    }

    tbody.innerHTML = '';
    if (pagina.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="no-data">Nenhum processo encontrado</td></tr>';
        document.getElementById('prevPage').disabled = true;
        document.getElementById('nextPage').disabled = true;
        atualizarInfoPaginacao(paginaAtual, totalPaginas, dados.length);
        return;
    }

    pagina.forEach(processo => {
        const dataObj = processo.data ? new Date(processo.data) : null;
        const dataFormatada = dataObj && !isNaN(dataObj)
            ? dataObj.toLocaleDateString('pt-BR')
            : '-';
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

    // Atualiza botões de paginação
    document.getElementById('prevPage').disabled = (paginaAtual === 1 || !buscaVazia());
    document.getElementById('nextPage').disabled = (paginaAtual === totalPaginas || !buscaVazia());
    atualizarInfoPaginacao(paginaAtual, totalPaginas, dados.length);
}

// Atualiza a informação de paginação na interface 
function atualizarInfoPaginacao(paginaAtual, totalPaginas, totalRegistros) {
    const info = document.getElementById('infoPaginacao');
    if (info) {
        if (totalPaginas > 1) {
            info.textContent = `Página ${paginaAtual} de ${totalPaginas} (${totalRegistros} registros)`;
        } else {
            info.textContent = `${totalRegistros} registro(s) encontrado(s)`;
        }
    }
}

function handleSort(campo) {
    if (campoOrdenacao === campo) {
        // Se clicar novamente no mesmo campo, inverte a ordem
        ordemCrescente = !ordemCrescente;
    } else {
        // Se for um novo campo, define a ordem padrão (data: decrescente, outros: crescente)
        campoOrdenacao = campo;
        ordemCrescente = (campo !== 'data') ? true : false;
    }
    renderizarTabela();
}

function prevPage() {
    if (buscaVazia() && paginaAtual > 1) {
        paginaAtual--;
        renderizarTabela();
    }
}

function nextPage() {
    const dados = ordenarProcessos(filtrarProcessos());
    const totalPaginas = Math.ceil(dados.length / TAMANHO_PAGINA);
    if (buscaVazia() && paginaAtual < totalPaginas) {
        paginaAtual++;
        renderizarTabela();
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

document.addEventListener('DOMContentLoaded', () => {
    carregarProcessos();
    document.getElementById('search-input').addEventListener('input', () => {
        paginaAtual = 1;
        renderizarTabela();
    });
    document.getElementById('prevPage').addEventListener('click', prevPage);
    document.getElementById('nextPage').addEventListener('click', nextPage);
    document.querySelectorAll('th.sortable').forEach(th => {
        th.addEventListener('click', () => handleSort(th.getAttribute('data-sort')));
    });
});