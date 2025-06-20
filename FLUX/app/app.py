from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
import bcrypt

app = Flask(__name__)
CORS(app)

DB_CONFIG = {
    'host': 'yamanote.proxy.rlwy.net',
    'user': 'root',
    'password': 'QUSURPzzbYPxKkFYsRKRhhWNXOdEiiMn',
    'database': 'railway',
    'port': '49036'
}
def get_db_connection():
    try: 
        connection = mysql.connector.connect(**DB_CONFIG)
        if connection.is_connected():
            print("Conexão com o banco de dados MySQL estabelecida com sucesso")
            return connection
    except Error as e:
        print(f"Erro ao conectar ao banco de dados MySQL: {e}")
    return None

@app.route('/cadastro', methods=['POST'])
def cadastro():
    data = request.get_json()
    if not data or 'nome_completo' not in data or 'email' not in data or 'cpf' not in data or 'rg' not in data or 'senha' not in data:
        return jsonify({'message': 'Todos os campos são obrigatórios'}), 400
    
    nome_completo = data['nome_completo']
    email = data['email']
    cpf = data['cpf']
    rg = data['rg']
    senha = data['senha']
    
    conn = get_db_connection()
    if conn is None:
        return jsonify({'message': 'Erro interno do servidor'}), 500
    
    try:
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM usuarios WHERE email = %s", (email,))
        if cursor.fetchone() is not None:
            return jsonify({'message': 'E-mail já cadastrado'}), 400
        
        cursor.execute("SELECT * FROM usuarios WHERE cpf = %s", (cpf,))
        if cursor.fetchone() is not None:
            return jsonify({'message': 'CPF já cadastrado'}), 400
        
        senha = bcrypt.hashpw(senha.encode('utf-8'), bcrypt.gensalt())
        
        cursor.execute("INSERT INTO usuarios (nome_completo, email, cpf, rg, senha) VALUES (%s, %s, %s, %s, %s)",
                       (nome_completo, email, cpf, rg, senha.decode('utf-8')))
        conn.commit()
        
        return jsonify({'message': 'Cadastro realizado com sucesso'}), 201
    except Error as e:
        print(f"Erro ao cadastrar usuário: {e}")
        return jsonify({'message': 'Erro interno no servidor'}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or 'email' not in data or 'senha' not in data:
        return jsonify({'message': 'Email e senha são obrigatórios'}), 400

    email = data['email']
    senha = data['senha']

    conn = get_db_connection()
    if conn is None:
        return jsonify({'message': 'Erro no servidor'}), 500

    try:
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT email, senha FROM usuarios WHERE email = %s", (email,))
        user = cursor.fetchone()

        if user is None:
            return jsonify({'message': 'Email ou senha incorretos'}), 401

        senha_hash = user['senha']

        if bcrypt.checkpw(senha.encode('utf-8'), senha_hash.encode('utf-8')):
            return jsonify({'message': 'Login realizado com sucesso'}), 200
        else:
            return jsonify({'message': 'Email ou senha incorretos'}), 401

    except Error as e:
        print(f"Erro na consulta ao banco de dados: {e}")
        return jsonify({'message': 'Erro interno do servidor'}), 500
    finally:
        cursor.close()
        conn.close()

        
@app.route('/processos', methods=['GET'])
def listar_processos():
    try:
        with mysql.connector.connect(**DB_CONFIG) as conn:
            with conn.cursor(dictionary=True) as cursor:
                query = """
                    SELECT 
                        id AS numero_processo,
                        reclamante,
                        reclamado,
                        assunto,
                        status,
                        data_julgamento
                    FROM processos
                """
                cursor.execute(query)
                resultados = cursor.fetchall()

                return jsonify(resultados), 200

    except Error as e:
        return jsonify({'error': str(e)}), 500

    except Exception as e:
        return jsonify({'error': 'Ocorreu um erro inesperado: ' + str(e)}), 500
    
@app.route('/processos/<int:processo_id>', methods=['GET'])
def get_processo(processo_id):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Erro de conexão com o banco de dados'}), 500
        
        cursor = conn.cursor(dictionary=True)
        
        query = """
            SELECT 
                id, reclamante, reclamado, assunto, status, data_julgamento, data_publicacao, descricao
            FROM processos 
            WHERE id = %s
        """
        cursor.execute(query, (processo_id,))
        processo = cursor.fetchone()
        
        if processo:
            return jsonify(processo), 200
        else:
            return jsonify({'message': 'Processo não encontrado'}), 404

    except Error as e:
        print(f"Erro ao buscar processo: {e}")
        return jsonify({'message': 'Erro interno do servidor'}), 500
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()
    
@app.route('/cadastrar_processo', methods=['POST'])
def cadastrar_processo():
    try:
        dados = request.get_json()

        reclamante = dados.get('reclamante')
        reclamado = dados.get('reclamado')
        assunto = dados.get('assunto')
        status = dados.get('status')
        descricao = dados.get('descricao')
        data_criacao = dados.get('data_criacao')
        data_julgamento = dados.get('data_julgamento')
        data_publicacao = dados.get('data_publicacao')

        conn = get_db_connection()
        if conn is None:
            return jsonify({'erro': 'Erro de conexão com o banco de dados'}), 500

        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO processos 
            (reclamante, reclamado, assunto, status, descricao, data_criacao, data_julgamento, data_publicacao)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (reclamante, reclamado, assunto, status, descricao, data_criacao, data_julgamento, data_publicacao))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({'mensagem': 'Processo cadastrado com sucesso!'}), 201

    except Exception as e:
        print('Erro:', e)
        return jsonify({'erro': str(e)}), 500

        
if __name__ == '__main__':
    app.run(debug=True)
