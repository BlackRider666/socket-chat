import React, { Component } from 'react';

export default class ChatLists extends Component {
  componentDidMount() {
    this.props.getUsersConversations();
  }

  render() {
    const {
      usersChannels,
      removeChannel,
      joinChannel,
      usersDirectMessages,
      leaveConversation,
      choosePrivateMessageRecipient
    } = this.props;

    return (
      <div className="chatapp__userpanel--container">
        <div className="userpanel__channels--container">
          <div className="userpanel__channels--list">
            {usersChannels ? (
              <ul>
                {usersChannels.map((channel, index) => {
                  return (
                    <li
                      onClick={() => {
                        joinChannel(channel);
                      }}
                      key={`usersChannelId-${index}`}
                    >
                      <p>{channel}</p>
                      {channel !== 'Public-Main' ? (
                        <button
                          onClick={() => {
                            removeChannel(channel);
                          }}
                        >
                          &#xf014;
                        </button>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        </div>
        <div className="userpanel__channels--container">
          <div className="userpanel__channels--list">
            {usersDirectMessages ? (
              <ul>
                {usersDirectMessages.map((conversation, index) => {
                  return (
                    <li
                      onClick={() => {
                        choosePrivateMessageRecipient(conversation);
                      }}
                      key={`convoId-${index}`}
                    >
                      <p>{conversation.username}</p>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <button
                          onClick={() => {
                            leaveConversation(
                              conversation._id,
                              conversation.username
                            );
                          }}
                        >
                          &#xf014;
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p>No Active Conversations</p>
            )}
          </div>
        </div>
      </div>
    );
  }
}
