document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    const searchFeedback = document.getElementById('search-feedback');

    const editFormContainer = document.getElementById('editFormContainer');
    const editForm = document.getElementById('editForm');
    const cancelButton = document.getElementById('cancelButton');
    
    // API base URL (mesma dos outros scripts)
    const API_URL = 'http://127.0.0.1:5000';

    // Função para buscar o processo pelo ID
    const handleSearch = async () => {
        const processoId = searchInput.value.trim();
        if (!processoId) {
            searchFeedback.textContent = 'Por favor, digite um ID para buscar.';
            searchFeedback.style.color = 'orange';
            return;
        }

        try {
            const response = await axios.get(`${API_URL}/processos/${processoId}`);
            const processo = response.data;

            // Preenche o formulário com os dados encontrados
            document.getElementById('processoId').value = processo.id || '';
            document.getElementById('reclamante').value = processo.reclamante || '';
            document.getElementById('reclamado').value = processo.reclamado || '';
            document.getElementById('assunto').value = processo.assunto || '';
            
            // Formata a data para o input type="date" (YYYY-MM-DD)
            const dataObj = new Date(processo.data);
            const formattedDate = dataObj.toISOString().split('T')[0];
            document.getElementById('data').value = formattedDate;

            document.getElementById('status').value = processo.status || 'pendente';

            // Mostra o formulário e limpa a mensagem de feedback
            editFormContainer.style.display = 'block';
            searchFeedback.textContent = '';

        } catch (error) {
            editFormContainer.style.display = 'none'; // Esconde o formulário
            if (error.response && error.response.status === 404) {
                searchFeedback.textContent = `Processo com ID "${processoId}" não encontrado.`;
            } else {
                searchFeedback.textContent = 'Erro ao buscar o processo. Tente novamente.';
                console.error('Erro na busca:', error);
            }
            searchFeedback.style.color = 'red';
        }
    };

    // Função para salvar as alterações
    const handleSave = async (event) => {
        event.preventDefault();
        
        const processoId = document.getElementById('processoId').value;
        const updatedData = {
            reclamante: document.getElementById('reclamante').value,
            reclamado: document.getElementById('reclamado').value,
            assunto: document.getElementById('assunto').value,
            data: document.getElementById('data').value,
            status: document.getElementById('status').value,
        };

        try {
            await axios.put(`${API_URL}/processos/${processoId}`, updatedData);
            searchFeedback.textContent = 'Processo atualizado com sucesso!';
            searchFeedback.style.color = 'green';
            editFormContainer.style.display = 'none'; // Esconde o form após salvar

        } catch (error) {
            searchFeedback.textContent = 'Erro ao salvar as alterações.';
            searchFeedback.style.color = 'red';
            console.error('Erro ao salvar:', error);
        }
    };
    
    // Função para cancelar a edição
    const handleCancel = () => {
        editForm.reset(); // Limpa os campos do formulário
        editFormContainer.style.display = 'none'; // Esconde o formulário
        searchFeedback.textContent = ''; // Limpa mensagens
        searchInput.value = ''; // Limpa o campo de busca
    };

    // Adiciona os event listeners
    searchButton.addEventListener('click', handleSearch);
    editForm.addEventListener('submit', handleSave);
    cancelButton.addEventListener('click', handleCancel);
});