const express = require('express');
const stripe = require('stripe')('sk_test_51PBZH6GbYCmeINZFjg9A5ZUFfBW6FfH0fctEU5f0NHyrWuU4x2aHywARIZD8hYbAyALJKoNnO2fbK35RY6IaOp5z00y2k5XeHN');
const path = require('path');

const app = express();

app.use(express.json());

// Middleware to serve static files
app.use(express.static('public'));

// Alternatively, you can directly send the HTML file in response to the root path
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
    res.setHeader("Permissions-Policy", "attribution-reporting=(self)");
});

app.get('/cancel', function(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'cancel.html'));
  res.setHeader("Permissions-Policy", "attribution-reporting=(self)");
});

app.get('/success', function(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'success.html'));
  res.setHeader("Permissions-Policy", "attribution-reporting=(self)");
});


app.post('/payment-sheet', async (req, res) => {
  // Create a new Stripe customer
  const customer = await stripe.customers.create();
  const ephemeralKey = await stripe.ephemeralKeys.create(
    {customer: customer.id},
    {apiVersion: '2024-04-10'}
  );
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 1099,
    currency: 'VND',
    customer: customer.id,
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.json({
    paymentIntent: paymentIntent.client_secret,
    ephemeralKey: ephemeralKey.secret,
    customer: customer.id,
    publishableKey: 'pk_test_51PBZH6GbYCmeINZF9HPhB6QY6o20QHijOiUakKXky3PKcS8CuYAckK6SHnTYmqRZ5dep3S3hZiWT5NMRSgkCC25d00NDHcD8r3'
  });
});


app.post('/create-checkout-session', async (req, res) => {
  const listProduct = req.body.listProduct; 
  const note = req.body.note; 
  const customer_id = req.body.customer_id; 
  const discountCode = req.body.discountCode; 
  const quantity = req.body.quantity; 
  const payment = req.body.payment; 
  const totalPrice = req.body.totalPrice; 


  const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
          price_data: {
              currency: 'VND',
              product_data: {
                  name: 'Payment your order',
              },
              unit_amount: totalPrice,
          },
          quantity: 1,
      }],
      mode: 'payment',
      success_url: `${req.headers.origin}/success?listProduct=${listProduct}&note=${note}&customer_id=${customer_id}&totalPrice=${totalPrice}&discountCode=${discountCode}&quantity=${quantity}&payment=${payment}`,
      cancel_url: `${req.headers.origin}/cancel?listProduct=${listProduct}&note=${note}&customer_id=${customer_id}&totalPrice=${totalPrice}&discountCode=${discountCode}&quantity=${quantity}&payment=${payment}`,
  });

  res.json({ sessionId: session.id });
});




// Set the port for the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
