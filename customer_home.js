document.addEventListener('DOMContentLoaded', function () {
    let chosen_stall = "";
    let chosen_items = {};

    const stalls_dialog = document.getElementById('stalls-dialog');
    const stalls_container = document.getElementById('stalls-container');
    const menuContainer = document.getElementById('menu-container');
    const mainContainer = document.getElementById('main-container');

    const log_out_btn = document.getElementById('log-out');

    log_out_btn.onclick = function(){
        fetch('/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);  
            alert('Logged out successfully!');
        })
        .catch(error => console.error('Error:', error));

        window.location.href='/customer_details';
    }

    if (stalls_dialog && stalls_container) {
        stalls_dialog.showModal();

        fetch('/stalls_data')
            .then(response => response.json())
            .then(data => {
                console.log(data);  
                const stalls_names = [];
                for (let i = 0; i < data.no; i++) {
                    stalls_names.push(data[i].stall_name);  
                }

                stalls_names.forEach((stallName, index) => {
                    let stall_container = document.createElement('div');
                    const stall = document.createElement('input');
                    stall.type = 'radio';
                    stall.name = 'stall';
                    stall.value = stallName;
                    stall.id = `stall-${index}`;
                    stall.classList.add('radio-stall');
                    
               
                    const stall_label = document.createElement('label');
                    stall_label.htmlFor = stall.id;
                    stall_label.textContent = stallName
                    stall_label.classList.add('stall-rtext');
                    stall_container.classList.add('stall-rbtn')

                    stall_container.appendChild(stall);
                    stall_container.appendChild(stall_label);
                    stalls_container.appendChild(stall_container);

                    stall.onclick = function () {
                        chosen_stall = stallName;
                        stalls_dialog.close();
                        if (mainContainer) {
                            mainContainer.style.display = 'block';
                            document.body.style.backgroundImage = "url('/static/Styles/image 7.jpeg')";
                        }
                        fetch('/chosen_stall', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ 'chosen_stall': chosen_stall })
                        })
                            .then(() => {
                                return fetch('/get_stall_menu', { method: 'GET' });
                            })
                            .then(response => response.json())
                            .then(data => {
                                if (data.items) {
                                    createItemButtons(data.items);
                                } else {
                                    console.error('Error: No items in data.');
                                }
                            })
                            .catch(error => console.error('Error fetching stall menu:', error));
                    };
                });
            })
            .catch(error => console.error('Error fetching stalls data:', error));
    } else {
        console.error('stalls_dialog or stalls_container not found');
    }

    let quantities = {}

    function createItemButtons(items) {
        if (menuContainer) {
            menuContainer.innerHTML = '';  // Clear previous menu items if any

            if (!items) {
                console.error('No items found');
                return;
            }

            for (let i = 0; i < Object.keys(items).length; i++) {
                let item_name = Object.keys(items)[i];
                let item_price = items[item_name];
                let item_container1 = document.createElement('div');
                item_container1.id = "item-container1" + i.toString();
                item_container1.classList.add('item-container-class');
                let item_container = document.createElement('div');
                item_container1.classList.add('item-container1-class2');

                item_container.id = "item-container" + i.toString(); // Correct the ID naming

                menuContainer.appendChild(item_container1);

                let itemName = document.createElement('label');
                itemName.className = "item-name-class";
                itemName.textContent = item_name;

                let itemPrice = document.createElement('label');
                itemPrice.className = "item-price-class";
                itemPrice.textContent = '₹' + String(item_price);

                const quantity = document.createElement('input');
                quantity.type = 'text';
                quantity.placeholder = 'Quantity';
                quantity.classList.add("item-quantity-class"); 
                quantity.value = '1';
                quantity.id = "quantity" + String(i)
                
                item_container.onclick = (function () {               
                    select_item(item_container1.id, item_name, item_price, quantity.id)
                    
                
                });

                item_container.appendChild(itemName);
                item_container.appendChild(itemPrice);
                item_container1.appendChild(item_container)
                item_container1.appendChild(quantity);
            }
        } else {
            console.error('menuContainer not found');
        }
    }

    function select_item(item_container_id, item_name, item_price, quantityid) {
        let item_container = document.getElementById(item_container_id);
        let quantity = document.getElementById(quantityid).value;
        if (item_container) {
            if (item_container.classList.contains('item-container1')) {
                chosen_items[item_name] = item_price;
                item_container.classList.remove('item-container1');
                item_container.classList.add("item-container1-chosen");
                quantities[item_name] = quantity;
            } else {
                delete chosen_items[item_name];
                item_container.classList.remove("item-container1-chosen");
                item_container.classList.add('item-container1');
                delete quantities[item_name]
            }
        } else {
            console.error('Item container not found for id:', item_container_id);
        }
    }

    const nextButton = document.getElementById('next-btn');
    if (nextButton) {
        nextButton.addEventListener('click', function () {
            if (Object.keys(chosen_items).length === 0){
                alert('Click on the item name to choose!')
                
            }
            else{
                order_list(chosen_items, quantities);
                console.log(quantities)
            }
            
        });
    } else {
        console.error('Next button not found');
    }

    function order_list(chosen_items, quantities){
        console.log(quantities)
        let cart_dialog = document.getElementById('cart-dialog');
        cart_dialog.showModal();

        let cart_container = document.getElementById('cart-container');


        const no_of_items = Object.keys(chosen_items).length;

        let total_price = 0

        for (i =0; i < no_of_items; i++){
            const item_name = Object.keys(chosen_items)[i]
            const item_quantity = quantities[Object.keys(quantities)[i]]
            const item_price = chosen_items[item_name]
            const cart_container1 = document.createElement('div');
            cart_container1.classList.add('cart-items-container-class');
            
            console.log(item_price, item_name, item_quantity)
            const item_price2 = parseInt(item_price);
            total_price = total_price + item_price2*parseInt(item_quantity)
            console.log(total_price)

            let item_name_label = document.createElement('label');
            item_name_label.textContent = item_name.toString() 
            item_name_label.style.justifySelf = 'left';
            item_name_label.classList.add('cart-item-name-class');
            
            let item_price_label = document.createElement('label');
            item_price_label.textContent = "₹" + item_price2*parseInt(item_quantity).toString();;
            item_price_label.style.justifySelf = 'right';
            item_price_label.classList.add('cart-item-price-class');

            cart_container1.appendChild(item_name_label);
            cart_container1.appendChild(item_price_label);
            cart_container.appendChild(cart_container1);

        }
        cart_container.appendChild(document.createElement('hr'));

        const cart_container2 = document.createElement('div');
        
        cart_container2.classList.add('cart-items-container-class');
        let total_name_label = document.createElement('label');
        total_name_label.textContent = "Total ";
        total_name_label.classList.add('cart-total-name-class');
        let total_price_label = document.createElement('label');
        total_price_label.textContent = "₹" + total_price.toString();
        total_price_label.classList.add('cart-total-price-class');
        cart_container2.appendChild(total_name_label);
        cart_container2.appendChild(total_price_label)
        cart_container.appendChild(cart_container2);

        let close_dialog_btn = document.getElementById('cancel-btn');
        close_dialog_btn.onclick = function(){
            cart_container.innerHTML = ''
            cart_dialog.close();
        }

        let order_btn = document.getElementById('order-btn');

        order_btn.onclick = function(){
            fetch('/order_list', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    items : chosen_items,
                    quantities: quantities,
                    price : total_price
                })
            }).catch(error => { alert("Something's wrong... Try again later or report") });

            window.location.href='/order_finish'
        }
    }
});
