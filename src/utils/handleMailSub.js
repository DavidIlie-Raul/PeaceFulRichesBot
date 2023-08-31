const axios = require("axios");

module.exports = async (name, email) => {
  const MCAPIKEY = process.env.mc_api_key;

  try {
    const response = await axios.post(
      "https://us14.api.mailchimp.com/3.0/lists/7cd9e26a69/members",
      {
        email_address: email,
        status: "subscribed",
        merge_fields: {
          FNAME: name,
        },
      },
      {
        auth: {
          username: "apikey",
          password: MCAPIKEY,
        },
      }
    );

    console.log("Email added to Mailchimp:", response.data);
    return response.data;
  } catch (error) {
    console.log("Error adding email to Mailchimp:", error.response.data);
    throw error;
  }
};
