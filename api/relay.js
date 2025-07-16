export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST method is allowed' });
  }

  const {
    username,
    email,
    name,
    password,
    plan,
  } = req.body;

  // === KONFIGURASI ===
  const apikey = "ptla_ciMjgQ3JNtpomlFwyoMlCiCAK0I4P8H0e0KrYN3kLf2";
  const domain = "https://kenja-ganteng.kenjaapublik.my.id";
  const egg = 15;
  const nest = 5;
  const location = 1;

  const plans = {
    "1gb-v2": { ram: "1000", disk: "1000", cpu: "40" },
    "2gb-v2": { ram: "2000", disk: "2000", cpu: "60" },
    "3gb-v2": { ram: "3000", disk: "2000", cpu: "80" },
    "4gb-v2": { ram: "4000", disk: "3000", cpu: "100" },
    "5gb-v2": { ram: "5000", disk: "4000", cpu: "120" },
    "6gb-v2": { ram: "6000", disk: "5000", cpu: "140" },
    "7gb-v2": { ram: "7000", disk: "6000", cpu: "160" },
    "8gb-v2": { ram: "8000", disk: "7000", cpu: "180" },
    "9gb-v2": { ram: "9000", disk: "8000", cpu: "200" },
    "10gb-v2": { ram: "10000", disk: "9000", cpu: "220" },
    "unlimited-v2": { ram: "0", disk: "0", cpu: "0" },
  };

  const spec = plans[plan];
  if (!spec) return res.status(400).json({ error: "Invalid plan" });

  try {
    // Buat user
    const userRes = await fetch(`${domain}/api/application/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apikey}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email,
        username,
        first_name: name,
        last_name: "Server",
        language: "en",
        password,
      })
    });
    const userData = await userRes.json();
    if (userData.errors) throw new Error(JSON.stringify(userData.errors[0]));

    const userId = userData.attributes.id;

    // Ambil startup egg
    const eggRes = await fetch(`${domain}/api/application/nests/${nest}/eggs/${egg}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apikey}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    const eggData = await eggRes.json();
    if (eggData.errors) throw new Error(JSON.stringify(eggData.errors[0]));

    const startup = eggData.attributes.startup;

    // Buat server
    const serverRes = await fetch(`${domain}/api/application/servers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apikey}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        user: userId,
        egg,
        nest,
        docker_image: "ghcr.io/parkervcp/yolks:nodejs_18",
        startup,
        environment: {
          INST: "npm",
          USER_UPLOAD: "0",
          AUTO_UPDATE: "0",
          CMD_RUN: "npm start",
        },
        limits: {
          memory: spec.ram,
          swap: 0,
          disk: spec.disk,
          io: 500,
          cpu: spec.cpu,
        },
        feature_limits: {
          databases: 5,
          backups: 5,
          allocations: 5,
        },
        deploy: {
          locations: [location],
          dedicated_ip: false,
          port_range: [],
        },
        description: "Created via Auto Panel",
      })
    });

    const serverData = await serverRes.json();
    if (serverData.errors) throw new Error(JSON.stringify(serverData.errors[0]));

    res.status(200).json({
      message: "Success",
      username,
      password,
      specs: spec,
      panel: domain,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
