export const useAuth = () => {
  const isLoggedIn = () => {
    return localStorage.getItem("usuarioLogado") !== null;
  };

  const login = (userData) => {
    localStorage.setItem("usuarioLogado", JSON.stringify(userData));
  };

  const logout = () => {
    localStorage.removeItem("usuarioLogado");
  };

  const getUser = () => {
    const user = localStorage.getItem("usuarioLogado");
    return user ? JSON.parse(user) : null;
  };

  return { isLoggedIn, login, logout, getUser };
};