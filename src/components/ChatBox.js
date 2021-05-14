import React, { Component } from 'react';
import Moment from 'moment';
import ChatLists from './ChatLists';


export default class ChatBox extends Component {

  scrollDown = () => {
    const { chat_container } = this.refs;
    chat_container.scrollTop = chat_container.scrollHeight;
  }

  componentDidMount() {
    this.scrollDown();
  }

  componentDidUpdate(prevProps, prevState) {
    this.scrollDown();
  }

  render() {
    const { handleSubmit, handleChange, currentChannel, channelConversations, id, getUsersConversations, hasToken, socketConversations, composedMessage, username, guestUsername } = this.props;
    return (
        <div className="chatapp__mainchat--container">
          {
            (id)
                ? <ChatLists
                    getUsersConversation={getUsersConversations}
                    hasToken={hasToken}
                    {...this.props}
                />
                : null
          }
          <div className="chatapp__chatbox">
            <h3>{currentChannel}</h3>
            <div className="chatapp__chatbox--messages" ref="chat_container">
              {
                (channelConversations)
                    ? <ul>
                      {channelConversations.map((message, index) => {
                        return (
                            <li className={(username !== message.author[0].item.username || message.author[0].item.guestName) ? (guestUsername === message.author[0].item.guestName) ? "" : "chat--received" : null} key={`chatMsgId-${index}`}>
                              <div className="speech--bubble">
                                <div className="speech--bubble--author">
                                  {
                                    (username === message.author[0].item.username )
                                        ? ''
                                        : <p>{message.author[0].item.username || message.author[0].item.guestName}</p>
                                  }
                                </div>
                                <p className="speech--bubble--message">{message.body} <span className="speech--bubble--date">{Moment(message.createdAt).format('H:m d.M.Y')}</span></p>
                              </div>
                            </li>
                        )
                      })}
                    </ul>
                    : <p>Nothing has been posted in this channel yet.</p>
              }
              {
                (socketConversations)
                    ? <ul>
                      {socketConversations.map((message, index) => {
                        return (
                            <li className={(username !== message.author) ? "chat--received" : null} key={`socketMsgId-${index}`}>
                              <div className="speech--bubble">
                                {
                                  username !== message.author && <div className="speech--bubble--author">
                                          <p>{message.author}</p>
                                  </div>
                                }
                                <p className="speech--bubble--message">{message.composedMessage} <span className="speech--bubble--date">{Moment(message.date).format('H:m d.M.Y')}</span></p>
                              </div>
                            </li>

                        )
                      })}
                    </ul>
                    : null
              }
            </div>
            <form onSubmit={handleSubmit}>
              <input onChange={handleChange} value={composedMessage} name="composedMessage" placeholder="Type a message here" type="text" autoComplete="off"/>
            </form>
          </div>
        </div>
    )
  }
}