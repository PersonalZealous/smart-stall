// For customer details page
function customer_details() {
    const customer_username = document.getElementById("customer-username").value;
    const customer_phoneNo = document.getElementById("customer-phone-no").value;

    fetch('/customer_details', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            customer_username: customer_username,
            customer_phoneNo: customer_phoneNo
        })
    }).catch(error => { alert("Something's wrong... Try again later or report") });
}

// For manager's details page
function manager_details() {
    const manager_username = document.getElementById("manager-username").value;
    const manager_phoneNo = document.getElementById("manager-phone-no").value;

    fetch('/manager_details', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            manager_username: manager_username,
            manager_phoneNo: manager_phoneNo
        })
    }).catch(error => { alert("Something's wrong... Try again later or report") });

    const dialog = document.getElementById("stall_dialog");
    dialog.showModal();
}

// For new stall details

function new_stall_details() {
    const stall_name = document.getElementById("stall-name").value;
    const stall_code = document.getElementById("stall-code").value;
    const upi_id = document.getElementById("upi-id").value;

    temp_stall = stall_name;

    fetch('/new_stall_details', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            stall_name: stall_name,
            stall_code: stall_code,
            upi_id: upi_id
        })
    }).catch(error => { alert("Something's wrong... Try again later or report") });

    const dialog = document.getElementById("dialog2");
    dialog.showModal();
}

// For adding items to menu
let item_counter = 0;
let stall_items = {};

function add_item() {
    const item_name = document.getElementById("menu-item-name").value;
    const item_price = document.getElementById("menu-item-price").value;
    const background_text = document.getElementById("background-text");

    stall_items[item_name] = item_price;

    const item_btn = document.createElement('input');
    item_btn.type = 'radio';
    item_btn.name = 'item';
    item_btn.value = item_name;
    item_btn.id = "item-" + item_counter.toString();

    const item_label = document.createElement('label');
    item_label.htmlFor = item_name;
    item_label.textContent = item_name + "   - " + item_price.toString();
    
    if (item_counter === 0) {
        background_text.remove();
    }
    
    document.getElementById("menu-item-name").value = '';
    document.getElementById("menu-item-price").value = '';
    const container = document.getElementById("item-container");
    container.appendChild(item_btn);
    container.appendChild(item_label);

    item_btn.addEventListener('click', function() {
        item_btn.remove();
        item_label.remove();
        delete stall_items[item_name];
        item_counter--;
    });
    item_counter++;
}

// For adding menu to stall
function add_menu() {
    fetch('/add_menu', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            items: stall_items
        })
    }).catch(error => { alert("Something's wrong... Try again later or report") });

    window.location.href='/manager_home';
}


function dialogNoBtn(){
    let dialog = document.getElementById('stall_dialog');
    dialog.close();
    
    let stall_dialog = document.getElementById('stall_details_dialog');
    stall_dialog.showModal();

   
    let dialog_next = document.getElementById('stall_details_btn');

    dialog_next.onclick = function(){
        let stall_name = document.getElementById('stall-name').value;
        let stall_code = document.getElementById('stall-code').value;
    
        fetch('/present_stall_details', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'stall_name': stall_name,
                'stall_code': stall_code
            })
        })
        .then(() => {
            return fetch('/stall_details_response');
        })
        .then(response => response.json())
        .then(data => {
            if (data.response === 1) {
                console.log('details are correct!');
                window.location.href = '/manager_home';
            } else {
                alert('wrong details!');
                document.getElementById('stall-name').value = '';
                document.getElementById('stall-code').value = '';
            }
        })
        .catch(error => {
            alert("Something's wrong... Try again later or report");
            console.error(error);
        });
    }
    
}