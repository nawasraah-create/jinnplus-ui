const express = require('express');
const cors = require('cors'); // للسماح بالطلبات من دومينات مختلفة
const app = express();
const port = process.env.PORT || 3000; // للنشر على Heroku

app.use(cors());
app.use(express.json());

// Endpoint لاستقبال بيانات من اللعبة
app.post('/game-data', (req, res) => {
  const gameData = req.body;
  console.log('Received game data:', gameData);
  // هنا يمكن تعدل البيانات أو ترسل لقاعدة بيانات
  res.json({ message: 'Data processed successfully', modifiedData: gameData });
});

// Endpoint بسيط للاختبار
app.get('/', (req, res) => {
  res.send('Welcome to 3rb.io Private Server Backend!');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
