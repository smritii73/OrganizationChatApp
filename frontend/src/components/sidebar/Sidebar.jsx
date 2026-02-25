import React from 'react';
import SearchInput from './SearchInput';
import Conversations from './Conversations';
import LogoutButton from './LogoutButton';

const Sidebar = ({ onConversationClick }) => {
  return (
    <div className='sidebar-root'>
      <SearchInput />
      <div className='divider px-3'></div>
      <Conversations onConversationClick={onConversationClick} />
      <LogoutButton />
    </div>
  );
};

export default Sidebar;