import express from "express";
import docusign from "docusign-esign";
import fs from "fs";
import axios from "axios";
import session from "express-session";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(bodyParser.json());
// app.use(session({ secret: "SECRET", resave: true, saveUninitialized: true }));
app.use(cors());

const port = process.env.PORT || 4000;

const getToken = async (req) => {
  let dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(process.env.BASE_PATH);
  const results = await dsApiClient.requestJWTUserToken(
    process.env.INTEGRATION_KEY,
    process.env.USER_ID,
    "signature",
    fs.readFileSync("./private.key"),
    3600
  );
  return results.body.access_token;
};

const getEnvelopesAPI = (access_token) => {
  const dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(process.env.BASE_PATH);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + access_token);
  return new docusign.EnvelopesApi(dsApiClient);
};

const makeEnvelope = (first_name, last_name, email, country) => {
  let env = new docusign.EnvelopeDefinition();
  env.templateId = process.env.TEMPLATE_ID;
  const first_name_text = docusign.Text.constructFromObject({
    tabLabel: "first_name",
    value: first_name,
  });
  const last_name_text = docusign.Text.constructFromObject({
    tabLabel: "last_name",
    value: last_name,
  });
  const country_text = docusign.Text.constructFromObject({
    tabLabel: "country",
    value: country,
  });

  const tabs = docusign.Tabs.constructFromObject({
    textTabs: [first_name_text, last_name_text, country_text],
  });

  const signer1 = docusign.TemplateRole.constructFromObject({
    name: first_name,
    email: email,
    tabs,
    roleName: "applicant",
  });

  env.templateRoles = [signer1];
  env.status = "sent";

  return env;
};

app.get("/callback", async (req, res) => {
  try {
    const code = req.query.code;
    const state = req.query.state;

    const { first_name, last_name, email, country } = JSON.parse(
      Buffer.from(state, "base64").toString("utf-8")
    );

    const authorization = `Basic ${Buffer.from(
      `${process.env.INTEGRATION_KEY}:${process.env.CLIENT_SECRET}`
    ).toString("base64")}`;

    const response = await axios.post(
      "https://account-d.docusign.com/oauth/token",
      {
        grant_type: "authorization_code",
        code: code,
      },
      {
        headers: {
          Authorization: authorization,
        },
      }
    );

    const access_token = response.data.access_token;

    const envelopesApi = getEnvelopesAPI(access_token);
    const envelope = makeEnvelope(first_name, last_name, email, country);

    const results = await envelopesApi.createEnvelope(process.env.ACCOUNT_ID, {
      envelopeDefinition: envelope,
    });

    res.send(
      "<h2>You have received the document on the email you entered!</h2>"
    );
  } catch (err) {
    console.log(err);
    res.send("<h2>Something went wrong!</h2>");
  }
});

app.get("/templates", async (req, res) => {
  try {
    const access_token = await getToken(req);

    const response = await axios.get(
      `https://demo.docusign.net/restapi/v2.1/accounts/${process.env.ACCOUNT_ID}/templates`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    return res.status(200).json({ templates: response.data.envelopeTemplates });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

app.listen(4000, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
