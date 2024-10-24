import uuid  
from phonepe.sdk.pg.payments.v1.models.request.pg_pay_request import PgPayRequest
from phonepe.sdk.pg.payments.v1.payment_client import PhonePePaymentClient
from phonepe.sdk.pg.env import Env

class upiPay():
    def __init__(self, owner_id, salt_key, salt_index):
        self.owner_id = owner_id
        self.salt_key = salt_key
        self.salt_index = salt_index
        pass

    def initiate_payment(self, amount,redirect_url, backend_url, user_id):
        env = Env.UAT
        client = PhonePePaymentClient(self.owner_id, self.salt_key, self.salt_index, env, True)
        

        transaction_id = str(uuid.uuid4())[:-2]
        page_request = PgPayRequest().pay_page_pay_request_builder(
            merchant_transaction_id=transaction_id,
            amount=amount,
            merchant_user_id=user_id,
            redirect_url=redirect_url,
            callback_url=backend_url
        )

        page_response = client.pay(page_request)
        pay_page_url = page_response.data.instrument_response.redirect_info.url
        status = page_response.data.status        
        amount = page_response.data.amount
        error = page_response.data.error_message

        if error:
            return(pay_page_url, status, amount, error)
        else:
            return(pay_page_url, status, amount, '')