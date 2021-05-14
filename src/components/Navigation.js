import React from 'react';
import AddDMBtn from "./AddDMBtn";
import AddChannelBtn from "./AddChannelBtn";

const Navigation = (props) => {
  const {
        displayForms,
        id,
        userLogout,
        username,
        guestUsername,
        closeForm,
        handleChange,
        handleSubmit,
        createChannel,
        startConversation,
        directMessageErrorLog
  } = props;

  return (
    <div className="chatapp__navigation--container">
      <div
        className="chatapp__navigation--logo"
        onClick={() => {
          if (!username) {
            closeForm();
          }
        }}
      >
        Live Chat
      </div>
        <div>
            <AddDMBtn
                {...this.props}/>
        </div>
        <div className="userpanel__channels--add">
            <AddChannelBtn
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                createChannel={createChannel}
            />
        </div>
      <div className="chatapp__navigation--user">
        {username ? <span>{username}</span> : null}
        {guestUsername ? <span>Guest-{guestUsername}</span> : null}
        {id ? (
          <button onClick={userLogout}>Logout</button>
        ) : (
          <div>
            <button
              onClick={() => {
                displayForms('login');
              }}
            >
              Login
            </button>
            <button
              onClick={() => {
                displayForms('register');
              }}
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navigation;
