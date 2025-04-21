import React, { useEffect } from 'react';

const Chat: React.FC = () => {
  useEffect(() => {
    // Initialize Chatling configuration
    window.chtlConfig = { chatbotId: "2512553376" };

    // Create and append the script
    const script = document.createElement('script');
    script.async = true;
    script.dataset.id = "2512553376";
    script.id = "chatling-embed-script";
    script.src = "https://chatling.ai/js/embed.js";
    document.body.appendChild(script);

    // Cleanup
    return () => {
      const existingScript = document.getElementById('chatling-embed-script');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return null;
};

export default Chat;