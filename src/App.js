import React, { Component } from 'react';
import './App.css';
import ChatUIContainer from './components/container/ChatUIContainer';
import { CookiesProvider } from 'react-cookie';

class App extends Component {
  state = {
    chatShown: true
  };

  displayChat = () => {
    this.setState((prevState) => ({
      chatShown: !prevState.chatShown
    }));
  };

  render() {
    return (
      <CookiesProvider>
        <div className="app--container">
          {this.state.chatShown ? <ChatUIContainer /> : null}
        </div>
      </CookiesProvider>
    );
  }
}

export default App;
