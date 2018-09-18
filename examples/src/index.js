import React from 'react';
import { render } from 'react-dom';
import HCaptcha from '../../src/';

class ReactDemo extends React.Component {
  
  constructor(props) {
    super(props);

    this.state = {isVerified: false};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onVerifyCaptcha = this.onVerifyCaptcha.bind(this);
  }

  handleChange(event) {
    this.setState({isVerified: true});
  }

  onVerifyCaptcha (token) {
    console.log("Verified: " + token);
    this.setState({isVerified: true})
  }

  handleSubmit(event) {
    event.preventDefault()
    this.child.execute()
  }

  render() {
    let respnseParagraph;
    if(this.state.isVerified) {
      respnseParagraph = <p> Open your console to see the Verified response.</p>
    }
    return (
      <div>
        <h2>HCaptcha Quickstart</h2>
        <p>
          Set your sitekey and onVerify callback as props, and drop into your form. From here, we'll take care of the rest.
        </p>
        {respnseParagraph}
        <form>
          <HCaptcha onVerify={this.onVerifyCaptcha}
          sitekey="917ba1eb-0b37-486e-9c90-39f3cb7b2579"
          theme="dark"
          ref={instance => {this.child = instance}}
          />
        </form>
        <h2>Bound to button</h2>
        <p>
          Set your sitekey, the size to invisible, and onVerify callback as props. 
        </p>
        <p>
          Create a button, and set handleSubmit callback and bind it to the parent. The handleSubmit callback should prevent default on the event, and then call this.child.execute().
          This will execute the captcha. 
        </p>
        <form>
          <HCaptcha onVerify={this.onVerifyCaptcha}
          sitekey="917ba1eb-0b37-486e-9c90-39f3cb7b2579"
          size="invisible"
          ref={instance => {this.child = instance}}
          />
        </form>
        <button onClick={this.handleSubmit}>Click</button>
      </div>
    );
  }
}

render(
  <div>
    <h1>HCaptcha React Demo</h1>
    <ReactDemo/>
  </div>,
  document.getElementById('app')
);
