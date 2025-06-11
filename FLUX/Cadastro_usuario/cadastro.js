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

        // Validação do CPF
        const cpfValido = /^\d{11}$/.test(cpf);
        if (!cpfValido) {
            mensagem.innerText = 'O CPF deve conter exatamente 11 dígitos numéricos.';
            mensagem.style.color = 'red';
            return;
        }

        // Validação do RG
        const rgValido = /^\d{7,9}$/.test(rg);
        if (!rgValido) {
            mensagem.innerText = 'O RG deve conter apenas números (7 a 9 dígitos).';
            mensagem.style.color = 'red';
            return;
        }

        // Validação da senha
        const senhaValida = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(senha);
        if (!senhaValida) {
            mensagem.innerText = 'A senha deve ter no mínimo 8 caracteres, com uma letra maiúscula, uma minúscula e um número.';
            mensagem.style.color = 'red';
            return;
        }

        try {
            const response = await axios.post('http://127.0.0.1:5000/cadastro', {
                nome_completo,
                email,
                cpf,
                rg,
                senha
            });

            //  Mensagem de sucesso e o timer que foi pedido pelo stakeholders
            mensagem.innerText = 'Cadastro realizado com sucesso! Redirecionando para o login...';
            mensagem.style.color = 'green';

            setTimeout(() => {
                window.location.href = 'http://127.0.0.1:5500/FLUX/Login/login.html';
            }, 2000);

        } catch (error) {
            const msg = error.response?.data?.message || 'Erro ao cadastrar.';
            mensagem.innerText = msg;
            mensagem.style.color = 'red';
        }
    });
});

