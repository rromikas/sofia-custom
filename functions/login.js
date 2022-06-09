import JWT from "jwt-decode";

export const API_URL = "http://socean-api.sofiapulse.com/api/v1";

const decodeUserData = (resp, decoded) => {
  const { organization } = resp.json;

  let userInfo = { ...decoded.identity, organization };

  return { ...userInfo, ...resp.json };
};

export const login = ({ username, password }) => {
  const request = new Request(`${API_URL}/auth/login`, {
    method: "POST",
    body: JSON.stringify({ username, password }),
    headers: new Headers({ "Content-Type": "application/json" }),
  });

  return fetch(request)
    .then((response) => {
      if (response.status === 401) {
        throw new Error("Incorrect username and password.");
      }
      if (response.status < 200 || response.status >= 300) {
        throw new Error(response.statusText);
      }
      return response.json();
    })
    .then((response) => {
      const { access_token } = response;
      if (access_token) {
        var decoded = JWT(access_token);

        return fetch(`${API_URL}/users/me`).then((resp) => {
          return { ...decodeUserData(resp, decoded), access_token };
        });
      } else {
        throw new Error("Incorrect username and password.");
      }
    });
};
