document.addEventListener('DOMContentLoaded', function() {
    console.log('loaded');
    const unprepared_container = document.getElementById('unprepared-orders');
    const prepared_container = document.getElementById('prepared-orders');
    const completed_container = document.getElementById('pickedup-orders');

    const dialog2 = document.getElementById('dialog2');
    const dialog = document.getElementById('dialog');
    function createOrders() {
        
        
        fetch('/unprepared_orders')
            .then(response => response.json())
            .then(data => {
                console.log(data);
                for (let i = 0; i < parseInt(data.no); i++) {
                    const order = data[String(i)];
                    console.log(order);

                    let order_status = parseInt(order[Object.keys(order)[4]]);
                    console.log(order_status);

                    const order_container = document.createElement('div');
                    order_container.style.display = 'flex';
                    order_container.classList.add('order-container-class');

                    const order_no_label = document.createElement('label');
                    let order_no_data = order[Object.keys(order)[3]];
                    order_no_label.textContent = 'Order No: ' + String(order_no_data);
                    order_no_label.classList.add('order-text-class');

                    let quantities = Object.values(order[Object.keys(order)[5]]);
                    const total_price = order[Object.keys(order)[6]];

                    // Create total price label
                    const total_price_label = document.createElement('label');
                    total_price_label.textContent = "Total Price: " + String(total_price);
                    total_price_label.classList.add('order-text-class');  // Use total_price_label instead of total_price

                    // Append elements to the order container
                    order_container.appendChild(order_no_label);
                    order_container.appendChild(total_price_label); // Add the total price label

                    const items = order[Object.keys(order)[2]];
                    for (let x = 0; x < Object.keys(items).length; x++) {
                        let item_name = Object.keys(items)[x];
                        let quantity = quantities[x];

                        const item_label = document.createElement('label');
                        item_label.textContent = String(item_name) + ": " + String(quantity);
                        item_label.classList.add('order-text-class');
                        order_container.appendChild(item_label);
                    }

                    let username_label = document.createElement('label');
                    let username = order[Object.keys(order)[1]];
                    username_label.textContent = String(username);
                    username_label.classList.add('order-text-class');

                    order_container.appendChild(username_label);

                    let phone_label = document.createElement('label');
                    let phone_no = order[Object.keys(order)[0]];
                    phone_label.textContent = phone_no;
                    phone_label.classList.add('order-text-class');

                    order_container.appendChild(phone_label);

                    // Append the order container to the correct section based on status
                    if (order_status === 0) {
                        unprepared_container.appendChild(order_container);
                        console.log('done1');
                    } else if (order_status === 1) {
                        prepared_container.appendChild(order_container);
                        console.log('done2');
                    } else if (order_status === 2) {
                        completed_container.appendChild(order_container);
                        console.log('done3');
                    }

                    // Click event handler for order container
                    order_container.onclick = function() {
                        console.log('clicked');

                        if (unprepared_container.contains(order_container)) {
                            dialog.showModal();
                            const dialog_yes = document.getElementById('dyes');
                            const dialog_no = document.getElementById('dno');

                            dialog_yes.onclick = function() {
                                fetch('/customer_statusU', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                        'username': username
                                    })
                                }).then(() => {
                                    order_container.remove();
                                    prepared_container.appendChild(order_container);
                                    dialog.close();
                                }).catch(error => { 
                                    alert("Something's wrong... Try again later or report");
                                    dialog.close();  // Close dialog in case of error
                                });
                            };

                            dialog_no.onclick = function() {
                                dialog.close();
                            };

                        } else if (prepared_container.contains(order_container)) {
                            dialog2.showModal();
                            const dialog_yes = document.getElementById('dyes1');
                            const dialog_no = document.getElementById('dno2');

                            dialog_yes.onclick = function() {
                                fetch('/customer_statusP', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                        'username': username,
                                    })
                                }).then(() => {
                                    order_container.remove();
                                    completed_container.appendChild(order_container);
                                    dialog2.close();
                                }).catch(error => { 
                                    alert("Something's wrong... Try again later or report");
                                    dialog2.close();  // Close dialog in case of error
                                });
                            };

                            dialog_no.onclick = function() {
                                dialog2.close();
                            };
                        }
                    };
                }
            })
            .catch(error => {
                console.error("Failed to fetch unprepared orders:", error);
            });
    }

    setInterval(createOrders(), 1000);
});
