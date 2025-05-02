const mongoose = require('mongoose');

// .env içindeki MONGO_URI'yi kullanır
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Bildirim şeması
const bildirimSchema = new mongoose.Schema({
  baslik: String,
  icerik: String,
  tarih: { type: Date, default: Date.now }
});

const Bildirim = mongoose.model('Bildirim', bildirimSchema);
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const mongoose = require('mongoose');
require('dotenv').config();  // .env dosyasını yükler

const serviceAccount = require('./serviceAccountKey.json');
const app = express();
app.use(cors());
app.use(bodyParser.json());

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// MongoDB Atlas bağlantısını yapalım
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log("✅ MongoDB Atlas bağlantısı başarılı!");
  })
  .catch((err) => {
    console.error("❌ MongoDB bağlantı hatası:", err);
  });

// Gizli anahtar (gerçek uygulamada .env dosyasına taşınmalı)
const SECRET_KEY = 'gizliAnahtar123';

// Kullanıcı adı ve şifre sabit (gerçekte veritabanından çekilebilir)
const USER = {
  username: 'admin',
  password: 'dernek2024'
};

// Giriş endpoint
app.post('/giris', (req, res) => {
  const { username, password } = req.body;
  if (username === USER.username && password === USER.password) {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false, message: 'Hatalı bilgiler' });
  }
});

// Bildirim gönderme (token kontrolü var)
app.post('/bildirim-gonder', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ success: false, message: 'Token eksik' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ success: false, message: 'Geçersiz token' });

    const { baslik, icerik } = req.body;

    const mesaj = {
      notification: {
        title: baslik,
        body: icerik
      },
      topic: 'tumKullanicilar' // Abone olunan bir topic adı
    };

    admin.messaging().send(mesaj)
      .then(() => res.json({ success: true }))
      .catch(err => {
        console.error(err);
        res.status(500).json({ success: false, message: 'Gönderim hatası' });
      });
  });
});

// Sunucu başlatma
app.listen(3000, () => {
  console.log('Sunucu 3000 portunda çalışıyor');
});
