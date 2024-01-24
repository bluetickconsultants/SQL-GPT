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
    verbose=False,
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
        ans=agent_executor.run(question)
        return jsonify({'answer': ans})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)