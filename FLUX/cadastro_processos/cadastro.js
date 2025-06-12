document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('processoForm');
    const mensagem = document.getElementById('mensagemProcesso');

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const reclamante = document.getElementById('reclamante').value.trim();
        const reclamado = document.getElementById('reclamado').value.trim();
        const assunto = document.getElementById('assunto').value.trim();
        const status = document.getElementById('status').value.trim();
        const descricao = document.getElementById('descricao').value.trim();

        const data_criacao = document.getElementById('data_criacao').value || null;
        const data_julgamento = document.getElementById('data_julgamento').value || null;
        const data_publicacao = document.getElementById('data_publicacao').value || null;

        if (!reclamante || !reclamado || !assunto || !status || !descricao) {
            mensagem.innerText = 'Preencha todos os campos obrigatórios.';
            mensagem.style.color = 'red';
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:5000/cadastrar_processo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    reclamante,
                    reclamado,
                    assunto,
                    status,
                    descricao,
                    data_criacao,
                    data_julgamento,
                    data_publicacao
                })
            });

            const data = await response.json();

            if (response.ok) {
                mensagem.innerText = data.mensagem || 'Processo cadastrado com sucesso!';
                mensagem.style.color = 'green';
                form.reset();
            } else {
                mensagem.innerText = data.erro || 'Erro ao cadastrar processo.';
                mensagem.style.color = 'red';
            }

        } catch (error) {
            mensagem.innerText = 'Erro ao conectar com o servidor.';
            mensagem.style.color = 'red';
        }
    });
});

