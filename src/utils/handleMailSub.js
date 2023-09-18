const axios = require("axios");
const dotenv = require("dotenv");

module.exports = async (name, email) => {
  dotenv.config();
  let zohoAccessToken = process.env.zoho_access_token;

  let contactinfo = {
    "First Name": name,
    "Last Name": "Last Name",
    "Contact Email": email,
  };

  let encodedContactInfo = encodeURIComponent(JSON.stringify(contactinfo));

  const urlElements = {
    resfmt: "JSON",
    listkey: process.env.zoho_list_key,
    contactinfo: encodedContactInfo,
  };

  try {
    console.log(
      `https://campaigns.zoho.eu/api/v1.1/json/listsubscribe?resfmt=${urlElements.resfmt}&listkey=${urlElements.listkey}&contactinfo=${urlElements.contactinfo}`
    );
    const response = await axios.post(
      `https://campaigns.zoho.eu/api/v1.1/json/listsubscribe?resfmt=${urlElements.resfmt}&listkey=${urlElements.listkey}&contactinfo=${urlElements.contactinfo}`,
      null,
      {
        headers: {
          Authorization: `Bearer ${zohoAccessToken}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.log("subscribing a user to zoho has failed", error.response.data);
    return "An error occurred. Please try again later.";
  }
};
