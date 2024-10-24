document.addEventListener('DOMContentLoaded', function(){
    //initialising
    let order_dialog = document.getElementById('dialog');
    let order_no;
    let status;
    let username;

    const order_container = document.getElementById('order-container');
    const upi_btn = document.getElementById('upi-btn');
    const cash_btn = document.getElementById('cash-btn');
    const s_container = document.getElementById('s-container')
    let ifcash = false;
    
    // sending payment type to server
    fetch('/payment_upi_isdone', {method : 'GET'}).then(response => response.json()).then(data => {
        if (data.response === 0){
            console.log('open')
            order_dialog.showModal();
        }

        if (data.response === 1){
            order_dialog.style.display = 'none';
            
            s_container.style.display = 'block';
            document.body.style.backgroundImage = "url(/static/Styles/image8.jpg)";
            order_container.style.display = 'flex';
            order_container.style.flexDirection = 'column';
            console.log('closed')
            get_customer_details()
        }
    })

    

    upi_btn.onclick = function(){
        fetch('/upi_payment')
            .then(response => response.json())
            .then(data => {})
            .catch(error => console.error('Error:', error));
    }

    cash_btn.onclick = function(){
        
        fetch('/cash_payment')
            .then(response => response.json())
            .then(data => {
                document.getElementById('dialog').close();
                order_dialog.style.display = 'none';
                s_container.style.display = 'block';
                document.body.style.backgroundImage = "url(/static/Styles/image8.jpg)";
                order_container.style.display = 'flex';
                order_container.style.flexDirection = 'column';
            })
            .catch(error => console.error('Error:', error));
        get_customer_details()
    }


    function get_customer_details(){
        
        fetch('/get_order_details', {method : 'GET'}).then(response => response.json()).then(data => {
                order_no = data.order_no;
                username = data.username
                let order_no_label = document.createElement('label');
                order_no_label.textContent = `Order No -  ${order_no}`;
                order_no_label.style.alignSelf = 'center';
                order_no_label.classList.add('user-details-class');
                let username_label = document.createElement('label');
                username_label.style.alignSelf = 'center';
                username_label.textContent = `Username - ${username}`;
                username_label.classList.add('user-details-class');
                order_container.appendChild(order_no_label);
            
                order_container.insertBefore(username_label, order_no_label);
                let order_status = document.createElement('label');
                order_status.style.alignSelf = 'center';
                order_status.classList.add('order-status-class');
                order_container.appendChild(order_status);
                let new_order_btn = document.createElement('button');
                new_order_btn.classList.add('new-order-btn-class');
                new_order_btn.textContent = 'New Order';
                order_container.appendChild(new_order_btn);
                function update_status(){
                    
                    fetch('/get_order_status', {method : 'GET'}).then(response => response.json()).then(data => {
                        status = data.order_status;
                        if (status === 0){
                            order_status.textContent = "Being Prepared";
                        }
                        if (status === 1){
                            order_status.textContent = "Done, Ready to Be Picked Up!";
                        }
                        if (status ===2){
                            order_status.textContent = "Order has been picked up!"
                        }
                        if (status === 3){
                            order_status.textContent = "Order payment has been failed... Please visit cash counter for payment"
                        }
    
                        if (status === 4){
                            order_status.textContent = "Vist the cash counter for payment"
                        }
                        
                    }).catch(error => {
                            console.error('Error:', error); 
                        });
                        
                    
                } 
                update_status();
                setInterval(update_status, 10000)
            
            }).catch(error => {
                    console.error('Error:', error); 
                });
        
        
        
            
    }

})