// relay.js — Tanpa package.json, bisa langsung run di Replit

const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

// 🔧 Konfigurasi
const PANEL_URL = "https://xemz.my.id";
const API_KEY = "apixxxx"; // Ganti dengan API key admin kamu
const NEST_ID = 5;
const EGG_ID = 15;
const LOCATION_ID = 1;
const DOCKER_IMAGE = "ghcr.io/parkervcp/yolks:nodejs_18"; // Ganti kalau perlu

const PLANS = {
  "1": { ram: 1024, disk: 1024, cpu: 40 },
  "2": { ram: 2048, disk: 2048, cpu: 60 },
  "3": { ram: 3072, disk: 3072, cpu: 80 }
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // Letakkan index.html di folder /public

// Endpoint utama
app.post("/create", async (req, res) => {
  const { name, plan } = req.body;
  const specs = PLANS[plan];
  if (!name || !specs) return res.status(400).json({ error: "Nama atau plan tidak valid" });

  const username = name.toLowerCase().replace(/\s+/g, "");
  const email = `${username}@xemz.my.id`;
  const password = username + "123";

  try {
    // 1. Buat User
    const userRes = await fetch(`${PANEL_URL}/api/application/users`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username,
        email,
        first_name: name,
        last_name: "Auto",
        password
      })
    });

    const user = await userRes.json();
    if (!userRes.ok) return res.status(400).json({ error: user.errors?.[0]?.detail || "Gagal buat user" });

    // 2. Buat Server
    const serverRes = await fetch(`${PANEL_URL}/api/application/servers`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        user: user.id,
        nest: NEST_ID,
        egg: EGG_ID,
        docker_image: DOCKER_IMAGE,
        startup: "npm install && node index.js",
        environment: {
          NODE_VERSION: "18"
        },
        limits: {
          memory: specs.ram,
          swap: 0,
          disk: specs.disk,
          io: 500,
          cpu: specs.cpu
        },
        feature_limits: {
          databases: 1,
          backups: 1,
          allocations: 1
        },
        allocation: {
          default: 1 // ⚠️ HARUS diganti dengan ID allocation aktif kamu!
        }
      })
    });

    const server = await serverRes.json();
    if (!serverRes.ok) return res.status(400).json({ error: server.errors?.[0]?.detail || "Gagal buat server" });

    res.json({
      message: "✅ Panel berhasil dibuat!",
      username,
      email,
      password,
      server_id: server.id
    });

  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: "Gagal konek ke API panel." });
  }
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`✅ Relay jalan di http://localhost:${PORT}`);
});
