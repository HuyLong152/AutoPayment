const express = require('express');
const stripe = require('stripe')('sk_test_51PBIYF08bUcYa2HA2w3H7kT5ylRz3BiyzA2lhazM6a20YibswW1OZDBvBDGCCKhFZeea1iGUZRbEx6KHIU9SUqsD00KkmGmYE6'); // Use your Stripe Secret Key
const app = express();

app.use(express.static('public')); // Serve static files from the public directory
app.use(express.json()); // Middleware to parse JSON bodies

// Serve an HTML page from the root
app.get('/', (req, res) => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Stripe Checkout</title>
    <script src="https://js.stripe.com/v3/"></script>
</head>
<body>
    <button id="checkout-button">Checkout</button>
    <script>
        var stripe = Stripe('pk_test_51PBIYF08bUcYa2HAwT6RAlyMVQ0Va2uI9VuQJEzPXze7M35Rxq4AfNYKYXzZezMIBMY0Uzf77NDrie8U2dT8kPaw00duToWL8Y'); // Use your Stripe Publishable Key
        var checkoutButton = document.getElementById('checkout-button');
        checkoutButton.addEventListener('click', function () {
            fetch('/create-checkout-session', {
                method: 'POST',
            })
            .then(function (response) {
                return response.json();
            })
            .then(function (session) {
                return stripe.redirectToCheckout({ sessionId: session.sessionId });
            })
            .catch(function (error) {
                console.error('Error:', error);
            });
        });
    </script>
</body>
</html>
    `;
    res.send(htmlContent);
});

// Route to create a checkout session
app.post('/create-checkout-session', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'T-shirt',
                    },
                    unit_amount: 2000,
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: 'http://localhost:3000/success',
            cancel_url: 'http://localhost:3000/cancel',
        });

        res.json({ sessionId: session.id });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).send(error.toString());
    }
});

// Success and cancel routes
app.get('/success', (req, res) => res.send('Payment successful!'));
app.get('/cancel', (req, res) => res.send('Payment cancelled.'));

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
