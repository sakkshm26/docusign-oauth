import React, { useState } from "react";
import axios from "axios";
import { Buffer } from "buffer";

const Form = () => {
  const [data, setData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    country: "",
  });

  const handleChange = (e) => {
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const encodedFormData = Buffer.from(JSON.stringify(data)).toString(
      "base64"
    );
    window.location.replace(
      `https://account-d.docusign.com/oauth/auth?response_type=code&scope=signature%20impersonation&client_id=48640638-333c-4258-96ce-a035cf041261&redirect_uri=https://docusign-service.onrender.com/callback&state=${encodedFormData}`
    );
  };

  return (
    <form
      onChange={handleChange}
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", padding: 50 }}
    >
      <input
        name="first_name"
        type="text"
        placeholder="First Name"
        required
        style={{ margin: 8, width: "50%", padding: 10 }}
      />
      <input
        name="last_name"
        type="text"
        placeholder="Last Name"
        required
        style={{ margin: 8, width: "50%", padding: 10 }}
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        required
        style={{ margin: 8, width: "50%", padding: 10 }}
      />
      <input
        name="country"
        type="text"
        placeholder="Country"
        required
        style={{ margin: 8, width: "50%", padding: 10 }}
      />
      <button
        type="submit"
        style={{ margin: 8, width: "52%", padding: 10, marginTop: 30 }}
      >
        Submit
      </button>
    </form>
  );
};

export default Form;
