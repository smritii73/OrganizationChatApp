import React, { useState } from 'react';
import Sidebar from '../../components/sidebar/Sidebar';
import MessageContainer from '../../components/messages/MessageContainer';

const Home = () => {
  const [showMessages, setShowMessages] = useState(false);

  return (
    <div className="h-screen overflow-auto">  {/* 👈 allow scroll */}
      <div className="flex min-h-full">

        {/* Sidebar */}
        <div className={`${showMessages ? "hidden md:flex" : "flex"} flex-col w-full md:w-1/3 lg:w-1/4`}>
          <Sidebar onConversationClick={() => setShowMessages(true)} />
        </div>

        {/* Messages */}
        <div className={`${showMessages ? "flex" : "hidden md:flex"} flex-1`}>
          <MessageContainer onBack={() => setShowMessages(false)} />
        </div>

      </div>
    </div>
  );
};

export default Home;