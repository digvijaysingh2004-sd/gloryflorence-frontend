interface Config {
  apiBaseUrl: string;
}

const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;

  // Runtime safeguard: if running on a live deployed domain (e.g. *.vercel.app),
  // NEVER attempt to call localhost or 127.0.0.1
  if (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    if (!envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1')) {
      return 'https://gloryflorence-backend.onrender.com/api';
    }
  }

  return envUrl || '/api';
};

const config: Config = {
  apiBaseUrl: getApiBaseUrl(),
};

export default config;

