document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('formCadastro');
    const mensagem = document.getElementById('mensagemCadastro');

    form.addEventListener('submit', async function (e) {
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

            window.location.href = 'http://127.0.0.1:5500/FLUX/Login/login.html'; 

        } catch (error) {
            const msg = error.response?.data?.message || 'Erro ao cadastrar.';
            mensagem.innerText = msg;
            mensagem.style.color = 'red';
        }
    });
});
