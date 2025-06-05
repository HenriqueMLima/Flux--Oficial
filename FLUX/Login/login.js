document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('formLogin');
    const mensagem = document.getElementById('mensagemLogin');

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;

        try {
            const response = await axios.post('http://127.0.0.1:5000/login', {
                email,
                senha
            });

            
            window.location.href = 'http://127.0.0.1:5500/FLUX/Processos/index.html';

        } catch (error) {
            const msg = error.response?.data?.message || 'Erro ao fazer login.';
            mensagem.innerText = msg;
            mensagem.style.color = 'red';
            console.error('Erro ao logar:', error);
        }
    });
});
