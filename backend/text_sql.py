from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_migrate import Migrate, upgrade
from sqlalchemy import or_
from datetime import datetime, timedelta

import os
import re
from dotenv import load_dotenv
import logging
from logging.handlers import RotatingFileHandler
import sys
from io import StringIO

from langchain_community.vectorstores import FAISS
from langchain_core.example_selectors import SemanticSimilarityExampleSelector
from langchain_openai import OpenAIEmbeddings
from langchain_community.agent_toolkits import create_sql_agent
from langchain_community.utilities import SQLDatabase
from langchain.agents import AgentExecutor
from langchain.memory import ConversationBufferMemory
from langchain.text_splitter import RecursiveJsonSplitter
from langchain.docstore.document import Document
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings

import json
import os
from openai import OpenAI

from langchain.chat_models import ChatOpenAI

from langchain_core.prompts import (
    ChatPromptTemplate,
    FewShotPromptTemplate,
    MessagesPlaceholder,
    PromptTemplate,
    SystemMessagePromptTemplate,
)


from langchain.tools.sql_database.tool import (
    InfoSQLDatabaseTool,
    ListSQLDatabaseTool,
    QuerySQLDataBaseTool,
)

# assign your llm and db

info_sql_database_tool_description = """Input to this tool is a comma separated list of tables, output is the schema and sample rows for those tables.Be sure that the tables actually exist by calling list_tables_sql_db first! Example Input: table1, table2, table3"""


load_dotenv()

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv("SECRET_KEY")
app.config['JWT_SECRET_KEY'] = os.getenv(
    "JWT_SECRET_KEY")  # Change this to a secret key for JWT

app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(
    hours=5)  # Example: Token expires after 24 hours

jwt = JWTManager(app)
db = SQLAlchemy(app)
migrate = Migrate(app, db)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)


class QueryLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    query = db.Column(db.String(500), nullable=False)
    response = db.Column(db.String(500), nullable=False)
    is_resolves = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, nullable=False,
                           default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('query_logs', lazy=True))


migrate.init_app(app, db)


# LangChain configuration
username = os.getenv("POSTGRES_USERNAME")
password = os.getenv("POSTGRES_PASSWORD")
host = os.getenv("POSTGRES_HOST")
port = os.getenv("POSTGRES_PORT")
mydatabase = os.getenv("POSTGRES_DATABASE")
pg_uri = f"postgresql+psycopg2://{username}:{password}@{host}:{port}/{mydatabase}"

os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


gpt = ChatOpenAI(openai_api_key=OPENAI_API_KEY,
                 model="gpt-4-0125-preview", temperature=0)
db_sql = SQLDatabase.from_uri(pg_uri)
# print(db_sql.dialect)
# print(db_sql.get_usable_table_names())

text=db_sql.run("""
       SELECT
    ag.name AS group_name,
    au.first_name,
    au.last_name,
	au.username,
	au.email
	
FROM
    public.auth_group AS ag
JOIN
    public.auth_user AS au ON au.id IN (
        SELECT
            aug.user_id
        FROM
            public.auth_user_groups AS aug
        WHERE
            aug.group_id = ag.id
    );""")


data_list = eval(text)
result = []
for item in data_list:
    result.append({
        "Position": item[0] if item[0] else None,
        "First Name": item[1] if item[1] else None,
        "Last Name": item[2] if item[2] else None,
        "Username": item[3] if item[3] else None,
        "Email": item[4] if item[4] else None
    })

json_data = json.dumps(result, indent=4)

document =  []
for item in range(len(result)):
    page = Document(page_content=str(result[item]),
    metadata = {"sequence": item})
    document.append(page)

embeddings = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)

chroma_db = Chroma.from_documents(document, embeddings)


tools = [
    QuerySQLDataBaseTool(db=db_sql),
    InfoSQLDatabaseTool(
        db=db_sql, description=info_sql_database_tool_description),
    ListSQLDatabaseTool(db=db_sql)
]


with open('examples.json', 'r') as examples_file:
    examples_data = json.load(examples_file)

examples = examples_data['examples']

example_selector = SemanticSimilarityExampleSelector.from_examples(
    examples,
    OpenAIEmbeddings(),
    FAISS,
    k=5,
    input_keys=["input"],
)
# print(example_selector)

memory = ConversationBufferMemory(memory_key='history', input_key='input')

client = OpenAI(
  api_key=os.environ.get("OPENAI_API_KEY")
)

def contains_write_keywords(text):
    write_keywords = ['UPDATE', 'INSERT', 'DELETE', 'ALTER', 'CREATE',
                      'DROP', 'TRUNCATE', 'GRANT', 'REVOKE', 'COMMIT', 'ROLLBACK', 'MERGE']
    text_upper = text.upper()

    for keyword in write_keywords:
        if re.search(rf'\b{re.escape(keyword)}\b', text_upper):
            return True

    return False


def load_system_prefix():
    with open('system_prefix.txt', 'r') as file:
        return file.read()

def parsing_llm(question):
    response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": """You are parser which looks that given string has three 
                                                values to displayed which is output after running SQL query.
                                                If three values are not present then return as it is else 
                                                return the three values as output in tabular format."""},
                {"role": "user", "content": question},
            ],
            temperature=0,
            max_tokens=1024,
            n=1,
            stop=None
        )
    return response.choices[0].message.content

@app.route('/ask', methods=['POST'])
@jwt_required()
def ask_question():
    try:
        current_user = get_jwt_identity()
        data = request.get_json()
        question = data['question']

        txt = f'User {current_user} asked: {question}'
        app.logger.info(txt)

        if contains_write_keywords(question):
            txt = f'User {current_user} attempted a query with write keywords: {question}'
            app.logger.warning(txt)
            # sys.stdout = original_stdout
            return jsonify({'error': 'You cannot perform insert/update/delete'}), 400
        else:
            matching_docs = chroma_db.similarity_search(question)
            matched=matching_docs[0].page_content
            matched=matched[1:-1]
            #print(type(matched))
            #print(matched)
            original_stdout = sys.stdout
            captured_output = StringIO()
            sys.stdout = captured_output

            system_prefix = load_system_prefix()
            #system_prefix = system_prefix+f"The current user details are {matched}"
            #print(system_prefix)

            few_shot_prompt = FewShotPromptTemplate(
                example_selector=example_selector,
                example_prompt=PromptTemplate.from_template(
                    "User input: {input}\nSQL query: {query}"
                ),
                input_variables=["input", "dialect", "top_k"],
                prefix=system_prefix,
                suffix=f"The current user details are {matched}.",
            )
            #few_shot_prompt+=f"The current user details are {matched}"
            #print(few_shot_prompt)
            full_prompt = ChatPromptTemplate.from_messages(
                [
                    SystemMessagePromptTemplate(prompt=few_shot_prompt),
                    ("human", "{input}"),
                    MessagesPlaceholder("agent_scratchpad"),
                ]
            )

            agent = create_sql_agent(
                llm=gpt,
                db=db_sql,
                prompt=full_prompt,
                verbose=True,
                agent_type="openai-tools",
                extra_tools=tools,
                agent_executor_kwargs={
                    "handle_parsing_errors": True, 'memory': memory}
            )

            ans = agent.invoke({"input": f"{question}"})
            
            sys.stdout = original_stdout

            captured_output_str = captured_output.getvalue()
            txt = f'User {current_user} received answer: {ans}'
            app.logger.info(txt)
            
            ans['output'] = parsing_llm(ans['output'])

            response_json = json.dumps(ans['output'])

            user_id = User.query.filter_by(username=current_user).first().id

            query_log = QueryLog(user_id=user_id, query=question, response=response_json, is_resolves=True,
                                 created_at=datetime.utcnow())
            db.session.add(query_log)
            db.session.commit()

            return jsonify({'user': current_user, 'answer': ans, 'console_output': captured_output_str})
    except Exception as e:
        app.logger.error(f'Error for user {current_user}: {str(e)}')
        return jsonify({'error': str(e)}), 500


@app.route('/dashboard/', methods=['GET'])
def dashboard():
    try:
        name_filters = request.args.get('name')
        date_filters = request.args.get('date')
        is_resolved_filters = request.args.get('is_resolved')

        query = db.session.query(QueryLog).join(
            User).filter(User.username == name_filters)

        if name_filters:
            name_filters = name_filters.split(',')
            query = query.filter(User.username.in_(name_filters))

        if date_filters:
            date_filters = date_filters.split(',')
            date_query = or_(*[QueryLog.created_at.startswith(date)
                             for date in date_filters])
            query = query.filter(date_query)

        if is_resolved_filters is not None:
            is_resolved_filters = [
                value.lower() == 'true' for value in is_resolved_filters.split(',')]
            is_resolved_query = or_(
                *[QueryLog.is_resolves == is_resolved for is_resolved in is_resolved_filters])
            query = query.filter(is_resolved_query)

        logs = query.all()

        serialized_logs = [{
            'id': log.id,
            'user_id': log.user_id,
            'query': log.query,
            'response': log.response,
            'is_resolved': log.is_resolves,
            'created_at': log.created_at.strftime('%Y-%m-%d %H:%M:%S')
        } for log in logs]

        return jsonify({'logs': serialized_logs})

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

        hashed_password = generate_password_hash(
            password, method='pbkdf2:sha256')
        new_user = User(username=username, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()

        return jsonify({'message': 'User created successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/get-logs/<username>', methods=['GET'])
def get_user_logs(username):
    try:
        with open('app.log', 'r') as log_file:
            logs = log_file.read()

            log_entries = re.split(
                r'\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3} - ', logs)

            user_logs = [log.strip()
                         for log in log_entries if f'User {username}' in log]

            return jsonify({'logs': user_logs})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    with app.app_context():
        # Run the migrations
        upgrade()

        db.create_all()

        log_file_path = os.path.abspath('app.log')
        handler = RotatingFileHandler(
            log_file_path, maxBytes=10000000, backupCount=1)
        handler.setLevel(logging.DEBUG)
        formatter = logging.Formatter(
            '%(asctime)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        app.logger.addHandler(handler)
        app.logger.setLevel(logging.DEBUG)
        # app.logger.info(f'Starting app...')

    app.run(debug=False)
