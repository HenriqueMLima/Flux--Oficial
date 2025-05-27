        async function carregarProcessos() {
            const mensagem = document.getElementById('mensagem');
            const tbody = document.getElementById('processos-corpo');
            mensagem.textContent = 'Carregando processos...';

            try {
                const resposta = await axios.get('http://127.0.0.1:5000/processos');
                const dados = resposta.data;

                if (!Array.isArray(dados) || dados.length === 0) {
                    mensagem.textContent = 'Nenhum processo encontrado.';
                    tbody.innerHTML = '';
                    return;
                }

                tbody.innerHTML = '';

                dados.forEach(processo => {
                    const tr = document.createElement('tr');

                    const dataJulg = new Date(processo.data_julgamento);
                    const dataJulgFormatada = !isNaN(dataJulg)
                        ? dataJulg.toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        })
                        : '-';

                    tr.innerHTML = `
                        <td>${processo.numero_processo || '-'}</td>
                        <td>${processo.reclamante || '-'}</td>
                        <td>${processo.reclamado || '-'}</td>
                        <td>${processo.assunto || '-'}</td>
                        <td>${processo.status || '-'}</td>
                        <td>${dataJulgFormatada}</td>
                    `;
                    tbody.appendChild(tr);
                });

                mensagem.textContent = '';
            } catch (erro) {
                mensagem.textContent = 'Falha ao carregar processos: ' +
                    (erro.response ? erro.response.statusText : erro.message);
                tbody.innerHTML = '';
            }
        }

        document.addEventListener('DOMContentLoaded', carregarProcessos);
