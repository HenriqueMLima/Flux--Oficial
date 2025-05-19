from flask import Flask, request, jsonify
import mysql.connector
from mysql.connector import Error
import bcrypt

app = Flask(__name__)

DB_CONFIG = {
    'host': 'yamanote.proxy.rlwy.net',
    'user': 'root',
    'password': 'QUSURPzzbYPxKkFYsRKRhhWNXOdEiiMn',
    'database': 'railway' ,
    'port': '49036'
}

def get_db_connection():
    try: 
        connection = mysql.connector.connect(**DB_CONFIG)
        if connection.is_connected():
            print("conexão com o banco de dados MySQL estabelecida com sucesso")
            return connection
    except Error as e:
        print(f"Erro ao conectar ao banco de dados MySQL {e}")
    return None










if __name__ == '__main__':
    app.run(debug=True)
