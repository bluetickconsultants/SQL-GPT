from flask import Flask, request, jsonify, session, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from flask import Flask, request, jsonify
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

load_dotenv()

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv("SECRET_KEY")
db = SQLAlchemy(app)

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
#gpt_eval = ChatOpenAI(openai_api_key=OPENAI_API_KEY, model="gpt-3.5-turbo", temperature=0)
db = SQLDatabase.from_uri(pg_uri)
toolkit = SQLDatabaseToolkit(db=db, llm=gpt)
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
def ask_question():
    try:
        data = request.get_json()
        question = data['question']
        if contains_write_keywords(question):
            return jsonify({'error': 'Query contains write keywords'}), 400
        else:
            ans = agent_executor.run(question)
            return jsonify({'answer': ans})
    except Exception as e:
            return jsonify({'error': str(e)}), 500


@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data['username']
        password = data['password']

        user = User.query.filter_by(username=username).first()
        if user and check_password_hash(user.password, password):
            session['user_id'] = user.id
            return jsonify({'message': 'Login successful'})
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
    
    
if __name__ == '__main__':
    db.create_all()
    app.run(debug=True)