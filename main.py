#importing
import pymongo
from flask import Flask, request, render_template, make_response, session, jsonify
from upiPay import upiPay

#configuring
client = pymongo.MongoClient("mongodb://localhost:27017/")
app = Flask(__name__)

app.config['SECRET_KEY'] = 'Stall@#31245'
app.config['SESSION_PERMANENT'] = True
app.config['SESSION_TYPE'] = 'filesystem'  

db = client["smart_stall_db"]

customersCol = db["customers"]
stallManagersCol = db["managers"]
stallsCol = db["stalls"]

upi_pay = upiPay('id', 'salt_key', 1)

#configuring html files
@app.route('/')
def index():
    if 'username' in session:
        print('User already logged in... \n')

        if session['type'] == 'customer':
   
            return render_template('customer_home.html')
        else:
            return render_template('manager_home.html')
    else:
        print('proceeding to login page... \n')
        return render_template('login.html')

@app.route('/customer_details')
def customer_details():
    return render_template('customer_details.html')

@app.route('/manager_details')
def manager_details():
    return render_template('manager_details.html')

@app.route('/new_stall_details')
def new_stall_details():
    return render_template('newstall_details.html')

@app.route('/add_menu')
def add_menu():
    return render_template('add_menu.html')

@app.route('/customer_home')
def customer_home():
    return render_template('customer_home.html')

@app.route('/order_finish')
def order_finish():
    return render_template('order_finish.html')

@app.route('/manager_home')
def manager_home():
    return render_template('manager_home.html')

#getting details of users
@app.route('/customer_details', methods=['POST'])
def handle_customer_details(): 
    print("Asking customer's details. \n")
    data = request.get_json()

    customer_username = data.get("customer_username")
    customer_phoneNo = data.get("customer_phoneNo")

    customersCol.insert_one({'Username': customer_username, 'Phone_No': customer_phoneNo})
    print("Added customer's details... \n")

    session['username'] = customer_username
    session['phoneNo'] = customer_phoneNo
    session['type'] = 'customer'
    return '', 204

@app.route('/manager_details', methods=['POST'])
def handle_manager_details(): 
    data = request.get_json()
    print("Asking Manager's details. \n")
    manager_username = data.get("manager_username")
    manager_phoneNo = data.get("manager_phoneNo")

    stallManagersCol.insert_one({'Username': manager_username, 'Phone_No': manager_phoneNo})
    print("Added manager's details. \n")
    session['username'] = manager_username
    session['phoneNo'] = manager_phoneNo
    session['type'] = 'manager'
    session['order_no'] = 0
    return '', 204

#getting stall details
@app.route('/new_stall_details', methods=['POST'])
def handle_stall_details():
    data = request.get_json()
    print("Asking stall's details. \n")
    stall_name = data.get("stall_name")

    session['man_stall'] = stall_name

    stall_code = data.get("stall_code")
    upi_id = data.get("upi_id")
    stallsCol.insert_one({'stall_name': stall_name, 'stall_code': stall_code, 'upi_id': upi_id})
    print("Added stall's details. \n")
    return '', 204

@app.route('/add_menu', methods=['POST'])
def add_stall_menu():
    data = request.get_json()

    items = data.get("items")
    stall = session.get("man_stall")

    stall_query = {'stall_name' : stall}
    stallsCol.update_one(stall_query, {'$set': {'items': items}}, upsert=True)
    print("Added stallmenu to stall document. \n")
    return '', 204

#getting all stalls
@app.route('/stalls_data', methods=['GET'])
def get_stalls_data():
    stalls = list(stallsCol.find({}, {"_id": 0, "stall_name": 1}))
    print("Getting all stalls. \n")
    stalls_D = {str(i): stall for i, stall in enumerate(stalls)}
    print(str(stalls_D) + "\n")
    stalls_D["no"] = str(len(stalls))
    print("Returning all stalls. \n")
    return jsonify(stalls_D)


#getting customer hoome data
@app.route('/chosen_stall', methods=['POST'])
def get_chosen_stall():
    print("Getting chosen stall name. \n")
    data = request.get_json()
    chosen_stall = data.get('chosen_stall')
    if chosen_stall:
        session['cus_stall'] = str(chosen_stall)
    return '', 204

@app.route('/get_stall_menu', methods=['GET'])
def stall_menu():
    stall = session.get('cus_stall')
    print("Adding items to menu. \n")
    if not stall:
        print("no stall available...")
        return jsonify({"error": "No stall selected"}), 400

    items = stallsCol.find_one({"stall_name": stall}, {"_id": 0, "items": 1})
    if items:
        print(f"Returning items. {items}\n")
        return jsonify(items)
    else:
        return jsonify({"error": "No items available"}), 400
    
@app.route('/order_list', methods=['POST'])
def link_order_list():
    customer_name = session.get('username')
    query = {'Username' : customer_name}

    data = request.get_json()
    session['total_amount'] = data.get('price')
    customersCol.update_one(query, {'$set':{'items' : data.get('items'), 'total_price' : data.get('price'), 'stall' : session.get('cus_stall'), 'quantities' : data.get('quantities')}})
    return '', 204

#giving customer order no
@app.route('/get_order_details', methods = ['GET'])
def order_details():
    print('getting order No...')
    query = {'stall' : session.get('cus_stall')}
    print(query)
    query1 = {'Username' : session.get('username')}
    no_of_stall_customers = len(list(customersCol.find(query, {})))
    print(no_of_stall_customers)
       
    orderNo = no_of_stall_customers + 2
    session['order_no'] = orderNo
    customersCol.update_one(query1, {'$set':{'order_no' : orderNo}})
    data = {'username' : session.get('username'), 'order_no' : orderNo}
    print(data)

    return jsonify(data)

@app.route('/get_order_status', methods = ['GET'])
def get_order_status():
    query = {'Username' : session.get('username')}
    status = list(customersCol.find(query, {"_id": 0, "order_status": 1}))
    print(status[0]['order_status'])
    return jsonify({'order_status' : status[0]['order_status']})

#for manager who wants to join current stall
@app.route('/present_stall_details', methods = ['POST'])
def get_presentstall_manager():
    data = request.get_json()
    stall_name = data.get('stall_name')
    stall_code = data.get('stall_code')
    print(stall_name, stall_code)
    query = {'stall_name' : stall_name, 'stall_code' : stall_code}
    stall_detailsValid = list(stallsCol.find(query, {}))
    print(stall_detailsValid)
    
    if len(stall_detailsValid) != 0:
        session['manager_statusL'] = 'yes'
    else:
        session['manager_statusL'] = 'no'

    return '', 204

@app.route('/stall_details_response', methods = ['GET'])
def manager_details_response():
    if session.get('manager_statusL') == 'yes':
        print('valid details')
        session.pop('manager_statusL', None)
        return jsonify({'response' : 1})
    else:
        print('invalid details')
        session.pop('manager_statusL', None)
        return jsonify({'response' : 0})
    
#getting unprepared orders
@app.route('/unprepared_orders', methods= ['GET'])
def get_unprepared_orders():
    print("getting orders")
    query = {'order_no' : {'$gte' : session.get('order_no', 0)}}
    requirement = {'Username' : 1, 'Phone_No' : 1, 'items' :1, 'quantities' : 1, 'total_price' : 1, 'order_no' : 1,'order_status' : 1,'_id' : 0}
    orders = list(customersCol.find(query, requirement))
    print(orders)
    data = {}
    for x in range(0, len(orders)):
        data[str(x)] = orders[x]
        print(orders[x])
    if orders[0]:
        data['no'] = len(orders)
        session['order_no'] = orders[-1]['order_no']
    else:
        session['order_no'] = 0
    print(data)
    return jsonify(data)

#payment 
@app.route('/payment_upi_isdone', methods = ['GET'])
def payment_upi_isdone():
    query = {'Username' : session.get('username')}
    print(query)
    results = list(customersCol.find(query, {'_id' : 0, 'payment_status' : 1}))
    print(results)

    if results[0] != {}:
        print('yes')
        return jsonify({'response' : 1})
    else:
        return jsonify({'response' : 0})

@app.route('/upi_payment')
def upi_payment():
    amount = session.get('total_amount')
    username = session.get('username')

    _, status, _, error = upi_pay.initiate_payment(amount, 'https://www.smartstall.com/order_finish', 'https://www.smartstall.com/payment_status', username)

    if error:
        print(error)
        return '', 204
    else:
        if status == 'SUCCESS':
            query = {'Username' : username}
            customersCol.update_one(query, {'$set':{'order_status' : 0, 'payment_status' : 1, 'payment_type' : 'upi'}})
            return '', 204
        else:
            query = {'Username' : username}
            customersCol.update_one(query, {'$set':{'order_status' : 3, 'payment_status' : 1, 'payment_type' : 'cash'}})
            return '', 204
        
@app.route('/cash_payment', methods = ['GET'])
def cash_payment():
    query = {'Username' : session.get('username')}
    customersCol.update_one(query, {'$set':{'order_status' : 4, 'payment_status' : 1, 'payment_type' : 'cash'}})
    return jsonify({'response' : 1})

#for customer's status
@app.route('/customer_statusU', methods = ['POST'])
def update_customer_status1():
    data = request.get_json()
    print('Updating customer satus')
    query = {'Username' : data.get('username')}
    customersCol.update_one(query, {'$set' : {'order_status' : 1}})
    print('updated!')
    return '', 204

@app.route('/customer_statusP', methods = ['POST'])
def update_customer_status2():
    data = request.get_json()
    print('Updating customer satus')
    query = {'Username' : data.get('username')}
    customersCol.update_one(query, {'$set' : {'order_status' : 2}})
    print('updated!')
    return '', 204

#for logging out
@app.route('/log_out', methods = ['POST'])
def logout():
    session.clear()
    return '', 204

if __name__ == '__main__':
    app.run(debug=True)
