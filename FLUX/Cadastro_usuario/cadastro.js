document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('formCadastro').addEventListener('submit', async function (e) {
        e.preventDefault();

        const nome_completo = document.getElementById('nome_completo').value;
        const email = document.getElementById('email').value;
        const cpf = document.getElementById('cpf').value;
        const rg = document.getElementById('rg').value;
        const senha = document.getElementById('senha').value;

        try {
            const response = await axios.post('http://127.0.0.1:5000/cadastro', {
                nome_completo,
                email,
                cpf,
                rg,
                senha
            });

            document.getElementById('mensagemCadastro').innerText = response.data.message;
            document.getElementById('mensagemCadastro').style.color = 'green';
            document.getElementById('formCadastro').reset();

        } catch (error) {
            const msg = error.response?.data?.message || 'Erro ao cadastrar.';
            document.getElementById('mensagemCadastro').innerText = msg;
            document.getElementById('mensagemCadastro').style.color = 'red';
        }
    });
});
