import axios from "axios";
import React, { useEffect, useState } from "react";

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await axios.get("https://docusign-service.onrender.com/templates");
        setTemplates(response.data.templates);
      } catch (err) {
        console.log(err);
      }
      setLoading(false);
    };

    fetchTemplates();
  }, []);

  return (
    <div>
      {loading
        ? "Loading..."
        : templates.map((template, index) => (
            <div key={index} style={{ margin: 15, border: '1px solid grey' }}>
              <p>Template ID: {template.templateId}</p>
              <p>Template Name: {template.name}</p>
            </div>
          ))}
    </div>
  );
};

export default Templates;
