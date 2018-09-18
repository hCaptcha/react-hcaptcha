import React from 'react';
import ReactDOM from 'react-dom';
import HCaptcha from './component/HCaptcha';

class ReactDemo extends React.Component {
  
  constructor(props) {
    super(props);

    this.state = {
      response: null
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  onVerifyCaptcha (token) {
    console.log("Verified: " + token);
  }

  handleSubmit(event) {
    event.preventDefault()
    this.child.execute()
  }

  render() {
    return (
      <div>
        <h2>HCaptcha Quickstart</h2>
        <p>
          Set your sitekey as a prop, and drop into your form. From here, we'll take care of the rest.
        </p>
        <p>
          Open your console to see the Verified response. 
        </p>
        <form>
          <HCaptcha onVerify={this.onVerifyCaptcha}
          //sitekey="917ba1eb-0b37-486e-9c90-39f3cb7b2579"
          //theme="dark"
          //ref={instance => {this.child = instance}}
          ></HCaptcha>
        </form>
      </div>
    );
  }
}

ReactDOM.render(
  <div>
    <h1>HCaptcha React Demo</h1>
    <ReactDemo/>
  </div>,
  document.getElementById('app')
);
