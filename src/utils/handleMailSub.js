const axios = require("axios");

module.exports = async (name, email) => {
  const lmUser = process.env.lm_user;
  const lmPass = process.env.lm_pass;
  const serverMailEndpoint = "http://peacefulriches.com:9001/maildata";

  console.log("trying to register a new user");

  console.log(
    "Sending data over to Proxy Server: User" + lmUser + " Pass: " + lmPass
  );

  try {
    const response = await axios.post(serverMailEndpoint, {
      email: email,
      name: name,
      status: "enabled",
      lists: [3, 4],
    });

    // Handle the response data here, e.g., log it
    console.log("Response from server:", response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.log(
        "POST failed, could not register a new mail to the mail list:",
        error.response.data
      );
      return error.response.data;
    } else {
      console.error("An error occurred:", error.message);
      return error;
    }
  }
};
