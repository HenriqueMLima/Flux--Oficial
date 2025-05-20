from flask import Flask, request, jsonify
import mysql.connector
from mysql.connector import Error
import bcrypt

app = Flask(__name__)

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
        
        senha_hash = bcrypt.hashpw(senha.encode('utf-8'), bcrypt.gensalt())
        
        cursor.execute("INSERT INTO usuarios (nome_completo, email, cpf, rg, senha_hash) VALUES (%s, %s, %s, %s, %s)",
                       (nome_completo, email, cpf, rg, senha_hash.decode('utf-8')))
        conn.commit()
        
        return jsonify({'message': 'Cadastro realizado com sucesso'}), 201
    except Error as e:
        print(f"Erro ao cadastrar usuário: {e}")
        return jsonify({'message': 'Erro interno no servidor'}), 500
    finally:
        cursor.close()
        conn.close()
        
        #app.rout de login
        
        
        
        
if __name__ == '__main__':
    app.run(debug=True)
