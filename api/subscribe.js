const mailchimp = require("@mailchimp/mailchimp_marketing");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, firstName, lastName } = req.body || {};

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ error: "A valid email is required." });
  }

  const apiKey = process.env.MAILCHIMP_API_KEY;
  const listId = process.env.MAILCHIMP_LIST_ID;
  const dc = process.env.MAILCHIMP_DC;

  if (!apiKey || !listId || !dc) {
    console.error("Missing Mailchimp environment variables");
    return res.status(500).json({ error: "Server configuration error." });
  }

  mailchimp.setConfig({
    apiKey,
    server: dc,
  });

  try {
    await mailchimp.lists.addListMember(listId, {
      email_address: email,
      status: "pending",
      merge_fields: {
        FNAME: firstName || "",
        LNAME: lastName || "",
      },
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    if (err && err.response && err.response.body && err.response.body.title === "Member Exists") {
      return res.status(200).json({ success: true });
    }

    if (err && err.response && err.response.body) {
      console.error("Mailchimp error:", err.response.body);
      return res.status(400).json({ error: "Could not subscribe. Please try again." });
    }

    console.error("Request failed:", err);
    return res.status(500).json({ error: "Server error. Please try again later." });
  }
};
