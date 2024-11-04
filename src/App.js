import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './styles/App.css';

const stripePromise = loadStripe('pk_test_51Mv8IwCcTEvUOeFzf2B9Qs0Sq0zGJob2PZOGQnYpmNhpzR180IxzbvmMEWoUEnuD4cZAuOYqW5h5ZC7VXyZYU29b00weK0cqIt'); // Reemplaza con tu clave pública de Stripe

function CheckoutForm({ clientSecret }) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    const card = elements.getElement(CardElement);
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: card,
        billing_details: { name: 'Usuario Prueba' },
      },
    });

    if (error) {
      console.error(error.message);
    } else if (paymentIntent.status === 'succeeded') {
      console.log('Pago exitoso');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe}>Pagar</button>
    </form>
  );
}

function App() {
  const [amount, setAmount] = useState('');
  const [clientSecret, setClientSecret] = useState(null);

  const handlePayment = async () => {
    const response = await fetch('/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: parseInt(amount * 100) }),
    });
    const { clientSecret } = await response.json();
    setClientSecret(clientSecret);
  };

  return (
    <div>
      <h1>Página de Pago</h1>
      <input
        type="number"
        placeholder="Monto a pagar"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={handlePayment}>Generar Intento de Pago</button>
      {clientSecret && (
        <Elements stripe={stripePromise}>
          <CheckoutForm clientSecret={clientSecret} />
        </Elements>
      )}
    </div>
  );
}

export default App;
