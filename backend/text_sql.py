from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_migrate import Migrate, upgrade

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

from langchain.chat_models import ChatOpenAI

from langchain_core.prompts import (
    ChatPromptTemplate,
    FewShotPromptTemplate,
    MessagesPlaceholder,
    PromptTemplate,
    SystemMessagePromptTemplate,
)



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
#print(db_sql.dialect)
print(db_sql.get_usable_table_names())

examples = [
    {
        "input": "Total number of test drives in January 2024:",
        "query": """
            SELECT COUNT(DISTINCT sales_lead) 
            FROM sales_inventory_saleslog 
            WHERE new_value IN ('Test Drive Completed', 'Delivery Given', 'Order Booked') 
            AND EXTRACT(MONTH FROM created_date) = 1 
            AND EXTRACT(YEAR FROM created_date) = 2024;
        """,
    },
    {
        "input": "Total number of leads in January 2024:",
        "query": """
            SELECT COUNT(*) 
            FROM sales_inventory_saleslead 
            WHERE EXTRACT(MONTH FROM created_date) = 1 
            AND EXTRACT(YEAR FROM created_date) = 2024;
        """,
    },
    {
        "input": "Number of qualified leads by Amit Ashara in January 2024:",
        "query": """
            SELECT COUNT(*) 
            FROM sales_inventory_saleslead 
            WHERE status = 'Qualified' 
            AND state = 'Open' 
            AND assigned_to = 'Amit Ashara' 
            AND created_date BETWEEN '2024-01-01' AND '2024-01-31';
        """,
    },
    {
        "input": "Number of all leads by Amit Ashara in January 2024:",
        "query": """
            SELECT COUNT(*) 
            FROM sales_inventory_saleslead 
            WHERE assigned_to = 'Amit Ashara' 
            AND created_date BETWEEN '2024-01-01' AND '2024-01-31';
        """,
    },
    {
        "input": "Number of Yet to be contacted leads by Amit Ashara in January 2024:",
        "query": """
            SELECT COUNT(*) 
            FROM sales_inventory_saleslead 
            WHERE status = 'Yet to Contact' 
            AND assigned_to = 'Amit Ashara' 
            AND created_date BETWEEN '2024-01-01' AND '2024-01-31';
        """,
    },
    {
        "input": "Number of Test Drives leads by Amit Ashara in January 2024:",
        "query": """
            SELECT COUNT(*) 
            FROM sales_inventory_saleslead 
            WHERE status = 'Qualified' 
            AND state = 'Open' 
            AND assigned_to = 'Amit Ashara' 
            AND created_date BETWEEN '2024-01-01' AND '2024-01-31';
        """,
    },
    {
        "input": "Number of Delivery Given leads by Amit Ashara in January 2024:",
        "query": """
            SELECT COUNT(DISTINCT sales_lead, new_value) 
            FROM sales_inventory_saleslog 
            WHERE new_value = 'Delivery Given' 
            AND assigned_to = 'Amit Ashara' 
            AND created_date BETWEEN '2024-01-01' AND '2024-01-31';
        """,
    },
    {
        "input": "Number of Bookings leads by Amit Ashara in January 2024:",
        "query": """
            SELECT COUNT(DISTINCT sales_lead) 
            FROM sales_inventory_saleslog 
            WHERE new_value = 'Order Booked' 
            AND assigned_to = 'Amit Ashara' 
            AND created_date BETWEEN '2024-01-01' AND '2024-01-31';
        """,
    },
    {
        "input": "Number of Delivery Given by Walk in in January 2024:",
        "query": """
            SELECT COUNT(DISTINCT sales_lead) 
            FROM sales_inventory_saleslog 
            WHERE new_value = 'Delivery Given' 
            AND sales_lead_source = 'Walk-in' 
            AND created_date BETWEEN '2024-01-01' AND '2024-01-31';
        """,
    },
    {
        "input": "Calculate Percentage of Conversion and Test drives done by Amit Ashara:",
        "query": """
            SELECT 
                COUNT(*) AS total_leads,
                ROUND((COUNT(DISTINCT CASE WHEN new_value IN 
                    ('Test Drive Completed', 'Test Drive Feedback Completed', 'Under Negotiation', 
                    'Order Booked', 'Payment Received', 'Delivery Given', 'Delivery Feedback Completed') 
                    THEN sales_lead END) / COUNT(*)) * 100, 2) AS test_drive_percentage,
                ROUND((COUNT(DISTINCT CASE WHEN new_value IN 
                    ('Delivery Given', 'Delivery Feedback Completed') THEN sales_lead END) / COUNT(*)) * 100, 2) AS conversion_percentage
            FROM sales_inventory_saleslog 
            WHERE sales_lead_assigned_to = 'Amit Ashara';
        """,
    },
    {
        "input": "Sales of Mercedes Benz A class count in January 2024:",
        "query": """
            SELECT COUNT(*) 
            FROM sales_inventory_saleslead 
            WHERE interested_in_model_name = 'Mercedes Benz' 
            AND interested_in_make_name = 'A Class' 
            AND created_date BETWEEN '2024-01-01' AND '2024-01-31';
        """,
    },
]

example_selector = SemanticSimilarityExampleSelector.from_examples(
    examples,
    OpenAIEmbeddings(),
    FAISS,
    k=5,
    input_keys=["input"],
)
print(example_selector)
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
            
            
            system_prefix = """You are an agent designed to interact with a SQL database.
            Given an input question, create a syntactically correct {dialect} query to run, then look at the results of the query and return the answer.
            Unless the user specifies a specific number of examples they wish to obtain, always limit your query to at most {top_k} results.
            You can order the results by a relevant column to return the most interesting examples in the database.
            Never query for all the columns from a specific table, only ask for the relevant columns given the question.
            You have access to tools for interacting with the database.
            Only use the given tools. Only use the information returned by the tools to construct your final answer.
            You MUST double check your query before executing it. If you get an error while executing a query, rewrite the query and try again.
            
            There are sevral roles in the comapny. 
            The roles are: Business Head
                            Department Executive
                            Sales Co-Ordinator
                            Sales Executive
                            Team Leader
                            Sales Manager
                            Account Executive
                            Department Manager
                            Agency
                                        
            The people in various roles are :
                                    Business Head:
                                    Mohan Mariwala
                                    Suraj Sapaliga
                                    Dheeraj Tadose
                                    Abhishek Kamdar

                                    Department Executive:
                                    Aziz K
                                    Manan Mehta
                                    Dilip Panikar
                                    Dinesh Mhaskar
                                    Akshay Dangra
                                    Shekar Bhaskar
                                    Siddharth D'Souza (Evaluator)
                                    Harsh Verma (Evaluator)
                                    Jayesh Dalvi
                                    Jay Bhosale (Evaluator)
                                    Ajit Mohite
                                    Shubham Chikhalkar

                                    Sales Co-Ordinator:
                                    Sonal Bhawsar
                                    Valencia Crasto
                                    Deepika Tiwari
                                    Nikita Lokhande
                                    Archit Jain

                                    Sales Executive:
                                    Pushkaraj Pisat
                                    Aahad Siddiqui
                                    Abhishek Rai
                                    Avtar Dhanjal
                                    Dikeshwar Sinha
                                    Dilip Panikar (Sales)
                                    Jayesh Dalvi (Sales)
                                    Khushrooshaw Vania
                                    Sanchit Sharma
                                    Waseem Bajawala
                                    Aziz K (Sales)
                                    Manan Mehta (Sales)
                                    Nadeem Shaikh (Sales)
                                    Mirza Baig
                                    Wasim Shaikh
                                    Neeraj Mahamunkar
                                    Sidhharth Dawande
                                    Prasad Patil
                                    Pratik Nade
                                    Aman Singh
                                    Pashin Bhadha
                                    Vinayak Sane
                                    Aejaz Khan
                                    Gaurav Patil
                                    Fahad Choudhary
                                    Irshad Khatri
                                    Niranjan Shaha
                                    Ahmed Khan
                                    Fasih Ullah
                                    Siddharth D'Souza (SC)
                                    Abhishek Upadhyay
                                    Vinaymohan Sunil
                                    Harsh Verma (SC)
                                    Sagar Jagtap
                                    Amit Ashara
                                    Bhavin Mehta
                                    Saurabh Pramod
                                    Nilesh Ranaware
                                    Irfan Shaikh
                                    Divy Singh
                                    Jay Bhosale (SC)
                                    Nikhil Dubewad
                                    Hitesh Yadav

                                    Team Leader:
                                    Sanchit Sharma (TL)
                                    Khushroo V (TL)
                                    Dikeshwar Sinha (TL)

                                    Sales Manager:
                                    Narendra Pai
                                    Joel Gaware
                                    Nadeem Shaikh (SM)

                                    Account Executive:
                                    Saraj Kathe

                                    Department Manager:
                                    Nadeem Shaikh (DM)
                                    Aziz K (DM)
                                    Sanket Muley

                                    Agency:
                                    Logicloop
                                    
            Also their are different lead stages in LMS.
                Under Refurbishment
                Delivery Taken
                Payment Processed
                Car Inward
                Final Offer Given
                Negotiations Ongoing
                Technical Evaluation Complete
                Initial Sales Offer
                Sales Evaluation Complete
                Evaluation Scheduled
                Assigned
                Unassigned
            
            There are different Lead Sources in LMS.
                	Walk-in APC
                    Walk-in MBC
                    Walk-in Metro Motors
                    Walk-in Andheri Showroom
                    Trade-in
                    Tele-in
                    Walk-in Prabhadevi Showroom
                    Event
                    Others
                    Print Ad
                    Leasing Company
                    Referral - Customer
                    Referral - Staff
                    Referral - Management
                    Social Media
                    Online Portal
                    Dealer
                    Broker

            DO NOT make any DML statements (INSERT, UPDATE, DELETE, DROP etc.) to the database.

            If the question does not seem related to the database, just return "I don't know" as the answer.

            Here are some examples of user inputs and their corresponding SQL queries:"""

            few_shot_prompt = FewShotPromptTemplate(
                example_selector=example_selector,
                example_prompt=PromptTemplate.from_template(
                    "User input: {input}\nSQL query: {query}"
                ),
                input_variables=["input", "dialect", "top_k"],
                prefix=system_prefix,
                suffix="",
            )

            full_prompt = ChatPromptTemplate.from_messages(
                [
                    SystemMessagePromptTemplate(prompt=few_shot_prompt),
                    ("human", "{input}"),
                    MessagesPlaceholder("agent_scratchpad"),
                ]
            )
            print("done")
            agent = create_sql_agent(
            llm=gpt,
            db=db_sql,
            prompt=full_prompt,
            verbose=True,
            agent_type="openai-tools",
            agent_executor_kwargs={"handle_parsing_errors": True}
            )
            print("done")
            ans = agent.invoke({"input": f"{question}"})
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