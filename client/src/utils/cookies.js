export const setCookie = (name, value, days = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${JSON.stringify(value)};expires=${expires.toUTCString()};path=/;SameSite=Strict;${window.location.protocol === 'https:' ? 'Secure;' : ''}`;
};

export const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    try {
      return JSON.parse(parts.pop().split(';').shift());
    } catch {
      return parts.pop().split(';').shift();
    }
  }
  return null;
};

export const removeCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

export const getToken = () => {
  return getCookie('token');
};

export const setToken = (token, days = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `token=${token};expires=${expires.toUTCString()};path=/;SameSite=Strict;${window.location.protocol === 'https:' ? 'Secure;' : ''}`;
};

export const removeToken = () => {
  removeCookie('token');
  removeCookie('usuarioLogado');
};