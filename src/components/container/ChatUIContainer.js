import React, {Component} from 'react';
import PropTypes from 'prop-types';
import LoginForm from '../LoginForm';
import RegisterForm from '../RegisterForm';
import {withCookies} from 'react-cookie';
import axios from 'axios';
import Navigation from '../Navigation';
import ChatBox from '../ChatBox';
import io from 'socket.io-client';
import Moment from 'moment';
import PrivateMessagingContainer from './PrivateMessageContainer';

const API_URL = 'http://localhost:3000/api';
const SOCKET_URL = 'http://localhost:3000';
const socket = io(SOCKET_URL);

class ChatUIContainer extends Component {
  constructor() {
    super();

    this.userLogin = this.userLogin.bind(this);

    this.state = {
      username: '',
      id: '',
      loginError: [],
      registrationError: [],
      formsShown: true,
      formsMethod: 'login',
      chatsShown: false,
      socket: null,
      composedMessage: '',
      currentChannel: '',
      conversations: [],
      channelConversations: [],
      socketConversations: [],
      usersChannels: [],
      createInput: '',
      startDmInput: '',
      usersDirectMessages: [],
      directMessageErrorLog: [],
      currentPrivateRecipient: {},
      token: ''
    };
  }

  componentDidMount() {
    this.hasToken();
    this.initSocket();
    this.getChannelConversations();
  }
  initSocket = () => {
    this.setState({
      socket
    });

    socket.on('new private chat', (data) => {
      if (data._id === this.state.id) {
        const newUsersDirectMessages = Array.from(
          this.state.usersDirectMessages
        );
        newUsersDirectMessages.push(data);
        this.setState({
          usersDirectMessages: newUsersDirectMessages
        });
      }
    });

    socket.on('refresh messages', (data) => {
      const newSocketConversations = Array.from(this.state.socketConversations);

      newSocketConversations.push(data);

      this.setState({
        socketConversations: newSocketConversations
      });
    });

    socket.on('user joined', (data) => {
      const userJoined = Array.from(this.state.socketConversations);

      // userJoined.push({
      //   userJoined: data
      // });

      this.setState({
        socketConversations: userJoined
      });
    });

    socket.on('user left', (data) => {
      const userJoined = Array.from(this.state.socketConversations);

      userJoined.push({
        userJoined: data
      });

      this.setState({
        socketConversations: userJoined
      });
    });
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevState.currentChannel !== this.state.currentChannel) {
      socket.emit(
        'leave channel',
        prevState.currentChannel,
        this.setUsername()
      );
    }
  }
  hasToken = () => {
    const { cookies } = this.props;
    const token = cookies.get('token');
    const guestToken = cookies.get('guestToken');
    const tokenUser = cookies.get('user');
    const tokenGuestUser = cookies.get('guestUser');
    const usersChannels = cookies.get('usersChannels');
    const currentChannel = cookies.get('channel');

    if (token) {
      this.setState({
        username: tokenUser.username,
        guestUsername: '',
        guestSignup: '',
        id: tokenUser._id,
        token,
        usersChannels,
        currentChannel: currentChannel || '',
        formsMethod: '',
        formsShown: false
      });
    } else if (guestToken) {
      this.setState({
        guestUsername: tokenGuestUser,
        token: guestToken,
        formsMethod: '',
        formsShown: false
      });
    }
  };
  setUsername = () => {
    return this.state.username;
  };
  async userLogin({ username, password }) {
    const { cookies } = this.props;
    const currentChannel = this.state.currentChannel;

    try {
      const userData = await axios.post(`${API_URL}/auth/login`, {
        username,
        password
      });
      cookies.set('token', userData.data.token, { path: '/', maxAge: 7200 });
      cookies.set('user', userData.data.user, { path: '/', maxAge: 7200 });
      cookies.set('usersChannels', userData.data.user.usersChannels, {
        path: '/',
        maxAge: 7200
      });

      this.setState(
        {
          username: userData.data.user.username,
          formsShown: false,
          token: userData.data.token,
          id: userData.data.user._id,
          loginError: [],
          usersChannels: userData.data.user.usersChannels,
          formsMethod: ''
        },
        () => {
          socket.emit('enter channel', currentChannel, this.setUsername());
        }
      );
    } catch (error) {
      const errorLog = Array.from(this.state.loginError);
      errorLog.length = [];
      errorLog.push(error);
      this.setState({
        loginError: errorLog
      });
    }
  }
  userLogout = () => {
    const { cookies } = this.props;
    const currentChannel = this.state.currentChannel;
    cookies.remove('token', { path: '/' });
    cookies.remove('user', { path: '/' });
    cookies.remove('usersChannels', { path: '/' });
    cookies.remove('channel', { path: '/' });

    socket.emit('leave channel', currentChannel, this.setUsername());

    this.setState({
      username: '',
      id: '',
      token: '',
      usersChannels: [],
      socketConversations: [],
      currentChannel: '',
      formsMethod: 'login',
      formsShown: true
    });
  };
  userRegistration = ({ username, password }) => {
    const { cookies } = this.props;
    const currentChannel = this.state.currentChannel;

    axios
      .post(`${API_URL}/auth/register`, { username, password })
      .then((res) => {
        cookies.set('token', res.data.token, { path: '/', maxAge: 7200 });
        cookies.set('user', res.data.user, { path: '/', maxAge: 7200 });
        cookies.set('usersChannels', res.data.user.usersChannels, {
          path: '/',
          maxAge: 7200
        });

        this.setState(
          {
            username: res.data.user.username,
            id: res.data.user._id,
            registrationError: [],
            token: res.data.token,
            formsShown: false,
            usersChannels: res.data.user.usersChannels,
            formsMethod: ''
          },
          () => {
            socket.emit('enter channel', currentChannel, this.setUsername());
          }
        );
      })
      .catch((error) => {
        const errorLog = Array.from(this.state.registrationError);

        errorLog.length = [];
        errorLog.push(error);

        this.setState({
          registrationError: errorLog
        });
      });
  };

  getChannelConversations = () => {
    axios
      .get(`${API_URL}/chat/channel/${this.state.currentChannel}`)
      .then((res) => {
        const currentChannel = this.state.currentChannel;

        socket.emit('enter channel', currentChannel, this.setUsername());

        this.setState({
          channelConversations: res.data.channelMessages
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  getUsersConversations = () => {
    axios
      .get(`${API_URL}/chat`, {
        headers: { Authorization: this.state.token }
      })
      .then((res) => {
        const updatedUsersDirectMessages = res.data.conversationsWith;

        this.setState({
          usersDirectMessages: updatedUsersDirectMessages || []
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };
  sendMessage = (composedMessage) => {
    const socket = this.state.socket;
    const currentChannel = this.state.currentChannel;

    axios
      .post(
        `${API_URL}/chat/postchannel/${this.state.currentChannel}`,
        { composedMessage },
        {
          headers: { Authorization: this.state.token }
        }
      )
      .then((res) => {
        const socketMsg = {
          composedMessage,
          channel: currentChannel,
          author: this.state.guestUsername || this.state.username,
          date: Moment().format()
        };
        socket.emit('new message', socketMsg);

        this.setState({
          composedMessage: ''
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  handleChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value
    });
  };

  handleSubmit = (e) => {
    e.preventDefault();

    this.sendMessage(this.state.composedMessage);
  };
  createChannel = (e) => {
    const { cookies } = this.props;
    const createInput = this.state.createInput;
    e.preventDefault();

    axios
      .post(
        `${API_URL}/user/addchannel`,
        { createInput },
        {
          headers: { Authorization: this.state.token }
        }
      )
      .then((res) => {
        const updatedUsersChannels = Array.from(this.state.usersChannels);

        updatedUsersChannels.push(this.state.createInput);

        cookies.set('usersChannels', updatedUsersChannels, {
          path: '/',
          maxAge: 7200
        });

        this.setState(
          {
            socketConversations: [],
            currentChannel: createInput,
            usersChannels: updatedUsersChannels
          },
          () => {
            this.getChannelConversations();
          }
        );
      })
      .catch((err) => {
        console.log(err);
      });
  };
  removeChannel = (channel) => {
    const { cookies } = this.props;

    axios
      .post(
        `${API_URL}/user/removechannel`,
        { channel },
        {
          headers: { Authorization: this.state.token }
        }
      )
      .then((res) => {
        const updatedChannels = res.data.updatedChannels;

        cookies.set('usersChannels', updatedChannels, {
          path: '/',
          maxAge: 7200
        });

        this.joinChannel('');
        this.setState({
          socketConversations: [],
          usersChannels: updatedChannels
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };
  joinChannel = (channel) => {
    const { cookies } = this.props;

    cookies.set('channel', channel, { path: '/', maxAge: 7200 });

    this.setState(
      {
        socketConversations: [],
        currentChannel: channel
      },
      () => {
        this.getChannelConversations();
      }
    );
  };
  startConversation = (e) => {
    const startDmInput = this.state.startDmInput;
    const usersDirectMessages = this.state.usersDirectMessages;
    e.preventDefault();

    const checkForCurrentConvos = usersDirectMessages.filter(
      (directMessage) => {
        return directMessage.username === startDmInput;
      }
    );

    if (!checkForCurrentConvos.length || !usersDirectMessages.length) {
      axios
        .post(
          `${API_URL}/chat/new`,
          { startDmInput },
          {
            headers: { Authorization: this.state.token }
          }
        )
        .then((res) => {
          const newUsersDirectMessages = Array.from(
            this.state.usersDirectMessages
          );

          const newItem = {
            username: res.data.recipient,
            _id: res.data.recipientId
          };

          newUsersDirectMessages.push(newItem);
          socket.emit('new private chat', {
            username: this.state.username,
            _id: res.data.recipientId
          });
          this.setState({
            usersDirectMessages: newUsersDirectMessages,
            directMessageErrorLog: []
          });
        })
        .catch((err) => {
          const updatedErrorLog = Array.from(this.state.directMessageErrorLog);

          updatedErrorLog.push(err);

          this.setState({
            directMessageErrorLog: updatedErrorLog
          });
        });
    } else {
      const updatedErrorLog = Array.from(this.state.directMessageErrorLog);

      updatedErrorLog.push({
        response: {
          data: {
            error: 'Already in conversation with that person.'
          }
        }
      });

      this.setState({
        directMessageErrorLog: updatedErrorLog
      });
    }
  };

  leaveConversation = (conversationId, user) => {
    axios
      .post(
        `${API_URL}/chat/leave`,
        { conversationId },
        {
          headers: { Authorization: this.state.token }
        }
      )
      .then((res) => {
        const directMessages = Array.from(this.state.usersDirectMessages);

        const newDirectMessages = directMessages.filter((directMessages) => {
          return directMessages.username !== user;
        });

        this.setState({
          usersDirectMessages: newDirectMessages
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  choosePrivateMessageRecipient = (recipient) => {
    this.setState({
      currentPrivateRecipient: recipient
    });
  };
  displayForms = (method) => {
    if (method === 'login') {
      this.setState({
        loginError: [],
        formsMethod: 'login',
        formsShown: true,
        guestUsername: ''
      });
    }

    if (method === 'register') {
      this.setState({
        formsMethod: 'register',
        formsShown: true,
        guestUsername: ''
      });
    }

    if (method === 'close') {
      this.setState({
        formsMethod: '',
        formsShown: false
      });
    }
  };

  closePM = (e) => {
    e.stopPropagation();
    this.setState({
      currentPrivateRecipient: {}
    });
  };

  componentWillUnmount() {
    const currentChannel = this.state.currentChannel;

    socket.emit('leave channel', currentChannel, this.setUsername());
    socket.off('refresh messages');
    socket.off('user joined');
    socket.off('user left');
  }

  render() {
    return (
      <div className="chatapp__container">
        <Navigation
          displayForms={this.displayForms}
          userLogout={this.userLogout}
          closeForm={this.closeForm}
          {...this.state}
          handleChange={this.handleChange}
          handleSubmit={this.handleSubmit}
          createChannel={this.createChannel}
          startConversation={this.startConversation}
          directMessageErrorLog={''}
        />
        {this.state.formsMethod === 'login' && this.state.formsShown ? (
          <LoginForm
            userLogin={this.userLogin}
            closeForm={this.closeForm}
            {...this.state}
          />
        ) : null}
        {this.state.formsMethod === 'register' && this.state.formsShown ? (
          <RegisterForm
            userRegistration={this.userRegistration}
            closeForm={this.closeForm}
            {...this.state}
          />
        ) : null}
        {this.state.id || this.state.guestUsername ? (
          <ChatBox
            handleChange={this.handleChange}
            handleSubmit={this.handleSubmit}
            createChannel={this.createChannel}
            removeChannel={this.removeChannel}
            startConversation={this.startConversation}
            leaveConversation={this.leaveConversation}
            joinChannel={this.joinChannel}
            choosePrivateMessageRecipient={this.choosePrivateMessageRecipient}
            getUsersConversations={this.getUsersConversations}
            hasToken={this.hasToken}
            {...this.state}
          />
        ) : null}
        {Object.getOwnPropertyNames(this.state.currentPrivateRecipient)
          .length !== 0 ? (
          <PrivateMessagingContainer
            usersDirectMessages={this.state.usersDirectMessages}
            closePM={this.closePM}
            currentPrivateRecipient={this.state.currentPrivateRecipient}
            token={this.state.token}
            username={this.state.username}
          />
        ) : null}
      </div>
    );
  }
}

ChatUIContainer.propTypes = {
  username: PropTypes.string,
  id: PropTypes.string,
  loginError: PropTypes.array,
  registrationError: PropTypes.array,
  formsShown: PropTypes.bool,
  formsMethod: PropTypes.string,
  chatsShown: PropTypes.bool,
  composedMessage: PropTypes.string,
  currentChannel: PropTypes.string,
  conversations: PropTypes.array,
  channelConversations: PropTypes.array,
  socketConversations: PropTypes.array,
  usersChannels: PropTypes.array,
  createInput: PropTypes.string,
  startDmInput: PropTypes.string,
  usersDirectMessages: PropTypes.array,
  directMessageErrorLog: PropTypes.array,
  currentPrivateRecipient: PropTypes.object,
  token: PropTypes.string
};

export default withCookies(ChatUIContainer);
