const mongoose = require('mongoose');
const dns = require('dns');
const net = require('net');

let connectPromise;

const DEFAULT_DNS_FALLBACK_SERVERS = ['8.8.8.8', '1.1.1.1'];
const DEFAULT_DB_NAME = 'malwa_hardware';

function parseDnsFallbackServers() {
  const raw = process.env.MONGO_DNS_FALLBACK_SERVERS;
  if (!raw) {
    return DEFAULT_DNS_FALLBACK_SERVERS;
  }

  const servers = raw
    .split(/[,\s;/|]+/)
    .map((server) => server.trim())
    .filter((server) => Boolean(server) && net.isIP(server) > 0);

  return servers.length > 0 ? servers : DEFAULT_DNS_FALLBACK_SERVERS;
}

function shouldRetryWithSrvBypass(uri, error) {
  return (
    typeof uri === 'string' &&
    uri.startsWith('mongodb+srv://') &&
    error &&
    error.syscall === 'querySrv' &&
    ['ECONNREFUSED', 'ETIMEOUT', 'EAI_AGAIN', 'ENOTFOUND', 'SERVFAIL'].includes(String(error.code || ''))
  );
}

function normalizeMongoUri(uri) {
  if (!uri) {
    return '';
  }

  let next = String(uri).trim();

  // Some editors/users append semicolons like a JS statement.
  if (next.endsWith(';')) {
    next = next.slice(0, -1).trim();
  }

  // Defensive: accept accidental wrapping quotes.
  if (
    (next.startsWith('"') && next.endsWith('"')) ||
    (next.startsWith("'") && next.endsWith("'"))
  ) {
    next = next.slice(1, -1);
  }

  return next.trim();
}

function resolveSrv(resolver, hostname) {
  return new Promise((resolve, reject) => {
    resolver.resolveSrv(hostname, (error, records) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(records);
    });
  });
}

function resolveTxt(resolver, hostname) {
  return new Promise((resolve) => {
    resolver.resolveTxt(hostname, (error, records) => {
      if (error) {
        resolve([]);
        return;
      }
      resolve(records);
    });
  });
}

function mergeTxtOptions(searchParams, txtRecords) {
  txtRecords
    .flat()
    .join('&')
    .split('&')
    .filter(Boolean)
    .forEach((pair) => {
      const [key, value = ''] = pair.split('=');
      if (!searchParams.has(key)) {
        searchParams.set(key, value);
      }
    });
}

async function buildNonSrvUriFromSrvUri(srvUri) {
  const parsed = new URL(srvUri);
  const resolver = new dns.Resolver();
  const dnsServers = parseDnsFallbackServers();
  resolver.setServers(dnsServers);

  const srvHost = `_mongodb._tcp.${parsed.hostname}`;
  const [srvRecords, txtRecords] = await Promise.all([
    resolveSrv(resolver, srvHost),
    resolveTxt(resolver, parsed.hostname)
  ]);

  if (!srvRecords.length) {
    throw new Error(`No SRV records found for ${srvHost}`);
  }

  const hostList = srvRecords.map((record) => `${record.name}:${record.port}`).join(',');
  const searchParams = new URLSearchParams(parsed.search);
  mergeTxtOptions(searchParams, txtRecords);
  if (!searchParams.has('tls') && !searchParams.has('ssl')) {
    searchParams.set('tls', 'true');
  }

  const username = parsed.username ? encodeURIComponent(parsed.username) : '';
  const password = parsed.password ? encodeURIComponent(parsed.password) : '';
  const auth =
    username || password ? `${username}${password ? `:${password}` : ''}@` : '';
  const pathname = parsed.pathname && parsed.pathname !== '/' ? parsed.pathname : '';
  const query = searchParams.toString();

  return `mongodb://${auth}${hostList}${pathname}${query ? `?${query}` : ''}`;
}

async function connectWithUri(uri) {
  const normalizedUri = normalizeMongoUri(uri);
  let dbNameFromUri = '';

  try {
    const parsed = new URL(normalizedUri);
    if (parsed.pathname && parsed.pathname !== '/') {
      dbNameFromUri = decodeURIComponent(parsed.pathname).replace(/^\//, '');
    }
  } catch {
    // Ignore URL parsing issues; mongoose will validate the URI.
  }

  const dbNameFromEnv = String(process.env.MONGO_DB_NAME || '').trim();
  const dbName = dbNameFromUri || dbNameFromEnv || DEFAULT_DB_NAME;

  const connection = await mongoose.connect(normalizedUri, {
    serverSelectionTimeoutMS: 10000,
    dbName
  });

  const host = connection.connection.host || 'mongodb-host';
  console.log(`MongoDB connected: ${host} (db: ${connection.connection.name})`);
  return connection.connection;
}

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const mongoUri = normalizeMongoUri(process.env.MONGO_URI);

  if (!mongoUri) {
    throw new Error('MONGO_URI is required');
  }

  if (!connectPromise) {
    connectPromise = connectWithUri(mongoUri).catch(async (error) => {
      if (shouldRetryWithSrvBypass(mongoUri, error)) {
        const fallbackUri = await buildNonSrvUriFromSrvUri(mongoUri);
        console.warn(
          `MongoDB SRV DNS lookup failed (${error.code}). Retrying with standard URI via DNS fallback servers.`
        );
        return connectWithUri(fallbackUri);
      }

      throw error;
    }).catch((error) => {
        connectPromise = null;
        throw error;
      });
  }

  return connectPromise;
}

async function disconnectDB() {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  await mongoose.disconnect();
  connectPromise = null;
}

module.exports = {
  connectDB,
  disconnectDB
};
