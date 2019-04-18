import React from "react";

export default React.createContext({
  token: null,
  tokenExpiration: null,
  userId: null,
  login: (token, tokenExpiration, userId) => {},
  logout: () => {}
});
