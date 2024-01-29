from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_migrate import Migrate, upgrade
from langchain.agents import create_sql_agent
from langchain.agents.agent_toolkits import SQLDatabaseToolkit
from langchain.sql_database import SQLDatabase
from langchain.llms.openai import OpenAI
from langchain.agents import AgentExecutor
from langchain.agents.agent_types import AgentType
from langchain.chat_models import ChatOpenAI
import os
import re
from dotenv import load_dotenv
import logging
from logging.handlers import RotatingFileHandler
import sys
from io import StringIO

load_dotenv()

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv("SECRET_KEY")
app.config['JWT_SECRET_KEY'] = os.getenv("JWT_SECRET_KEY")  # Change this to a secret key for JWT
jwt = JWTManager(app)
db = SQLAlchemy(app)
migrate = Migrate(app, db)




class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

# LangChain configuration
username = os.getenv("POSTGRES_USERNAME")
password = os.getenv("POSTGRES_PASSWORD")
host = os.getenv("POSTGRES_HOST")
port = os.getenv("POSTGRES_PORT")
mydatabase = os.getenv("POSTGRES_DATABASE")
pg_uri = f"postgresql+psycopg2://{username}:{password}@{host}:{port}/{mydatabase}"

os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
gpt = ChatOpenAI(openai_api_key=OPENAI_API_KEY, model="gpt-3.5-turbo", temperature=0)
db_sql = SQLDatabase.from_uri(pg_uri)
toolkit = SQLDatabaseToolkit(db=db_sql, llm=gpt)
agent_executor = create_sql_agent(
    llm=gpt,
    toolkit=toolkit,
    verbose=True,
    agent_type=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
)

def contains_write_keywords(text):
    write_keywords = ['UPDATE', 'INSERT', 'DELETE', 'ALTER', 'CREATE', 'DROP', 'TRUNCATE', 'GRANT', 'REVOKE', 'COMMIT', 'ROLLBACK', 'MERGE']
    text_upper = text.upper()

    for keyword in write_keywords:
        if re.search(rf'\b{re.escape(keyword)}\b', text_upper):
            return True 

    return False

@app.route('/ask', methods=['POST'])
@jwt_required()
def ask_question():
    try:
        current_user = get_jwt_identity()
        data = request.get_json()
        question = data['question']
        
        txt=f'User {current_user} asked: {question}'

        app.logger.info(txt)
        

        if contains_write_keywords(question):
            txt=f'User {current_user} attempted a query with write keywords: {question}'
            app.logger.warning(txt)
            sys.stdout = original_stdout
            return jsonify({'error': 'Query contains write keywords'}), 400
        else:
            original_stdout = sys.stdout
            captured_output = StringIO()
            sys.stdout = captured_output
            ans = agent_executor.run(question)
            sys.stdout = original_stdout

            captured_output_str = captured_output.getvalue()
            txt=f'User {current_user} received answer: {ans}'
            app.logger.info(txt)
            return jsonify({'user': current_user, 'answer': ans, 'console_output': captured_output_str})
    except Exception as e:
        app.logger.error(f'Error for user {current_user}: {str(e)}')
        return jsonify({'error': str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data['username']
        password = data['password']

        user = User.query.filter_by(username=username).first()
        if user and check_password_hash(user.password, password):
            access_token = create_access_token(identity=username)
            return jsonify({'access_token': access_token, 'message': 'Login successful'})
        else:
            return jsonify({'error': 'Invalid credentials'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/create-user', methods=['POST'])
def create_user():
    try:
        data = request.get_json()
        username = data['username']
        password = data['password']

        if User.query.filter_by(username=username).first():
            return jsonify({'error': 'Username already exists'}), 400

        hashed_password = generate_password_hash(password, method='sha256')
        new_user = User(username=username, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()

        return jsonify({'message': 'User created successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
from flask import Flask, request, jsonify

@app.route('/get-logs/<username>', methods=['GET'])
def get_user_logs(username):
    try:
        with open('app.log', 'r') as log_file:
            logs = log_file.read()

            log_entries = re.split(r'\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3} - ', logs)

            user_logs = [log.strip() for log in log_entries if f'User {username}' in log]

            return jsonify({'logs': user_logs})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    
if __name__ == '__main__':
    with app.app_context():
        # Run the migrations
        upgrade()

        db.create_all()
        
        log_file_path = os.path.abspath('app.log')
        handler = RotatingFileHandler(log_file_path, maxBytes=10000000, backupCount=1)
        handler.setLevel(logging.DEBUG)
        formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        app.logger.addHandler(handler)
        app.logger.setLevel(logging.DEBUG)
        #app.logger.info(f'Starting app...')

    app.run(debug=False)