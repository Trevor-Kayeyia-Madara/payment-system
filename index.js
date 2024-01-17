const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3001;

const corsOptions = {
  origin: 'http://localhost:3000',  // Allow only requests from this origin
};

app.use(cors(corsOptions));
app.use(express.json());

// Replace the connection details with your MySQL server details
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'hotel_payment',
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL as id ' + db.threadId);
});

// CRUD operations for the 'guest' table
// Replace 'guest' with your actual table name

// Create a new guest
app.post('/guests', (req, res) => {
  const { folio_number, first_name, surname, email, phone_number, city, country, zip } = req.body;
  const sql = 'INSERT INTO guest (folio_number, first_name, surname, email, phone_number, city, country, zip) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  const values = [folio_number, first_name, surname, email, phone_number, city, country, zip];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error creating guest');
      return;
    }
    res.status(201).send('Guest created successfully');
  });
});

// Retrieve all guests
app.get('/guests', (req, res) => {
  const sql = 'SELECT * FROM guest';

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error retrieving guests');
      return;
    }
    res.status(200).json(results);
  });
});

// Retrieve a specific guest by folio number
app.get('/guests/:folio_number', (req, res) => {
  const folio_number = req.params.folio_number;
  const sql = 'SELECT * FROM guest WHERE folio_number = ?';

  db.query(sql, [folio_number], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error retrieving guest');
      return;
    }
    if (result.length === 0) {
      res.status(404).send('Guest not found');
      return;
    }
    res.status(200).json(result[0]);
  });
});
const nodemailer = require('nodemailer');

// ... (Your existing setup for the Express app)

// Add a route for sending emails
app.post('/send-email', async (req, res) => {
  const emailData = req.body;

  // Create a nodemailer transporter using Gmail SMTP
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'your-gmail-email@gmail.com', // Replace with your Gmail email
      pass: 'your-gmail-password', // Replace with your Gmail password
    },
  });

  // Construct email options
  const mailOptions = {
    from: 'your-gmail-email@gmail.com',
    to: emailData.email, // Send to the email provided in the form
    subject: 'Payment Confirmation', // Subject of the email
    text: `Dear ${emailData.first_name} ${emailData.last_name},\n\nThank you for your payment.\n\nMode of Payment: ${emailData.selected_payment_mode}\n\nAmount: $${emailData.amount}\n\nMessage: ${emailData.message}\n\nSincerely,\nYour Hotel Team`,
  };

  try {
    // Send the email
    await transporter.sendMail(mailOptions);

    // Respond to the client
    res.status(200).send('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);

    // Respond with an error status
    res.status(500).send('Error sending email');
  }
});

// Update a guest by folio number
app.put('/guests/:folio_number', (req, res) => {
  const folio_number = req.params.folio_number;
  const { first_name, surname, email, phone_number, city, country, zip } = req.body;
  const sql = 'UPDATE guest SET first_name=?, surname=?, email=?, phone_number=?, city=?, country=?, zip=? WHERE folio_number=?';
  const values = [first_name, surname, email, phone_number, city, country, zip, folio_number];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error updating guest');
      return;
    }
    if (result.affectedRows === 0) {
      res.status(404).send('Guest not found');
      return;
    }
    res.status(200).send('Guest updated successfully');
  });
});

// Delete a guest by folio number
app.delete('/guests/:folio_number', (req, res) => {
  const folio_number = req.params.folio_number;
  const sql = 'DELETE FROM guest WHERE folio_number=?';

  db.query(sql, [folio_number], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error deleting guest');
      return;
    }
    if (result.affectedRows === 0) {
      res.status(404).send('Guest not found');
      return;
    }
    res.status(200).send('Guest deleted successfully');
  });
});

// Create a new room
app.post('/rooms', (req, res) => {
    const { room_type, folio_number, no_of_guests, room_rate, check_in_date, check_out_date, number_of_nights } = req.body;
    const sql = 'INSERT INTO room (room_type, folio_number, no_of_guests, room_rate, check_in_date, check_out_date, number_of_nights) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const values = [room_type, folio_number, no_of_guests, room_rate, check_in_date, check_out_date, number_of_nights];
  
    db.query(sql, values, (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error creating room');
        return;
      }
      res.status(201).send('Room created successfully');
    });
  });
  
  
  // Endpoint to fetch room details by room_type
app.get('/room', (req, res) => {
  try {
    const { room_type } = req.query;

    if (!room_type) {
      return res.status(400).json({ error: 'Missing room_type parameter' });
    }

    // Fetch room details with the specified room_type using a MySQL query
    pool.query('SELECT RoomID, room_rate FROM rooms WHERE room_type = ?', [room_type], (error, results) => {
      if (error) {
        console.error('Error fetching room details:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'Room not found' });
      }

      res.json(results[0]); // Assuming that room_type is unique and returning the first result
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

  
  app.get('/rooms/:folio_number', (req, res) => {
    const folio_number = req.params.folio_number;
    const sql = 'SELECT * FROM room WHERE folio_number = ?';
  
    db.query(sql, [folio_number], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error retrieving room data');
        return;
      }
  
      res.status(200).json(result);
    });
  });
  
  // Update a room by room type
  app.put('/rooms/:room_type', (req, res) => {
    const room_type = req.params.room_type;
    const { folio_number, no_of_guests, room_rate, check_in_date, check_out_date, number_of_nights } = req.body;
    const sql = 'UPDATE room SET folio_number=?, no_of_guests=?, room_rate=?, check_in_date=?, check_out_date=?, number_of_nights=? WHERE room_type=?';
    const values = [folio_number, no_of_guests, room_rate, check_in_date, check_out_date, number_of_nights, room_type];
  
    db.query(sql, values, (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error updating room');
        return;
      }
      if (result.affectedRows === 0) {
        res.status(404).send('Room not found');
        return;
      }
      res.status(200).send('Room updated successfully');
    });
  });
  
  // Delete a room by room type
  app.delete('/rooms/:room_type', (req, res) => {
    const room_type = req.params.room_type;
    const sql = 'DELETE FROM room WHERE room_type=?';
  
    db.query(sql, [room_type], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error deleting room');
        return;
      }
      if (result.affectedRows === 0) {
        res.status(404).send('Room not found');
        return;
      }
      res.status(200).send('Room deleted successfully');
    });
  });
  app.post('/payments', (req, res) => {
    const paymentData = req.body;
  
    const sql = `
      INSERT INTO payment (
        TransactionDate, 
        room_type, 
        invoice_number, 
        cleaning_fee, 
        sea_view, 
        car_rental, 
        breakfast, 
        wifi, 
        laundry, 
        satellite_tv, 
        amount
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
  
    const values = [
      paymentData.transactionDate,
      paymentData.room_type,
      paymentData.invoiceNumber,
      paymentData.cleaning_fee,
      paymentData.sea_view,
      paymentData.car_rental,
      paymentData.breakfast,
      paymentData.wifi,
      paymentData.laundry,
      paymentData.satellite_tv,
      paymentData.amount,
    ];
  
    db.query(sql, values, (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error inserting payment data');
        return;
      }
  
      res.status(201).send('Payment data inserted successfully');
    });
  });
  
  // Retrieve all payments
  app.get('/payments', (req, res) => {
    const sql = 'SELECT * FROM payment';
  
    db.query(sql, (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error retrieving payments');
        return;
      }
      res.status(200).json(results);
    });
  });
  
  // Retrieve a specific payment by transaction_id
  app.get('/payments/:transaction_id', (req, res) => {
    const transaction_id = req.params.transaction_id;
    const sql = 'SELECT * FROM payment WHERE transaction_id = ?';
  
    db.query(sql, [transaction_id], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error retrieving payment');
        return;
      }
      if (result.length === 0) {
        res.status(404).send('Payment not found');
        return;
      }
      res.status(200).json(result[0]);
    });
  });
  
  // Update a payment by transaction_id
  app.put('/payments/:transaction_id', (req, res) => {
    const transaction_id = req.params.transaction_id;
    const {
      transaction_date,
      room_type,
      invoice_number,
      cleaning_fee,
      sea_view,
      car_rental,
      breakfast,
      wifi,
      laundry,
      satellite_tv,
      amount,
    } = req.body;
  
    const sql =
      'UPDATE payment SET transaction_date=?, room_type=?, invoice_number=?, cleaning_fee=?, sea_view=?, car_rental=?, breakfast=?, wifi=?, laundry=?, satellite_tv=?, amount=? WHERE transaction_id=?';
    const values = [
      transaction_date,
      room_type,
      invoice_number,
      cleaning_fee,
      sea_view,
      car_rental,
      breakfast,
      wifi,
      laundry,
      satellite_tv,
      amount,
      transaction_id,
    ];
  
    db.query(sql, values, (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error updating payment');
        return;
      }
      if (result.affectedRows === 0) {
        res.status(404).send('Payment not found');
        return;
      }
      res.status(200).send('Payment updated successfully');
    });
  });
  
  // Delete a payment by transaction_id
  app.delete('/payments/:transaction_id', (req, res) => {
    const transaction_id = req.params.transaction_id;
    const sql = 'DELETE FROM payment WHERE transaction_id=?';
  
    db.query(sql, [transaction_id], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error deleting payment');
        return;
      }
      if (result.affectedRows === 0) {
        res.status(404).send('Payment not found');
        return;
      }
      res.status(200).send('Payment deleted successfully');
    });
  });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
