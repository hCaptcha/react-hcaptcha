import React from 'react';
  
const CaptchaScript = (cb) => { // Create script to intialize hCaptcha tool - hCaptcha
    let script = document.createElement("script")

    script.src = "https://hcaptcha.com/1/api.js?render=explicit"
    script.async = true

    script.addEventListener('load', cb, true)

    return script;        
}

const hCaptchaVars = {
    domain        : 'hcaptcha.com',
    element_id    : 'h-captcha',
    iframe_title  : 'hCaptcha human verification' //iframe title reference
}
  
  export default class HCaptcha extends React.Component {
    constructor (props) {
      super(props)
  
      this.removeFrame     = this.removeFrame.bind(this)
      this.onloadScript    = this.onloadScript.bind(this)
      this.onerrorCaptcha  = this.onerrorCaptcha.bind(this)
      this.onsubmitCaptcha = this.onsubmitCaptcha.bind(this) 
      this.closeCaptcha    = this.closeCaptcha.bind(this) 
  
      this._id = null
      this._removed = false;
    }
  
    onloadScript() {
      if (typeof hcaptcha !== undefined) { //Render hCaptcha widget and provide neccessary callbacks - hCaptcha
        this._id = hcaptcha.render(hCaptchaVars.element_id, 
          {           
            //"sitekey"         : this.props.sitekey,
            ...this.props, 
            "error-callback"  : this.onerrorCaptcha, 
            "expired-callback": this.onerrorCaptcha, 
            "callback"        : this.onsubmitCaptcha 
          })
      } 
    }
  
    componentDidMount () { //Once captcha is mounted intialize hCaptcha - hCaptcha
        console.log("mounted")
      if (typeof hcaptcha === 'undefined') {  //Check if hCaptcha has already been loaded, if not create script tag and wait to render captcha element - hCaptcha
        let script = CaptchaScript(this.onloadScript);
        document.getElementById(hCaptchaVars.element_id).appendChild(script);
      } else {
        this.onloadScript();
      }
    }
  
    componentWillUnmount() { //If captcha gets removed for timeout or error check to make sure iframe is also removed - hCaptcha
        console.log("unmounted")
        if(typeof hcaptcha === 'undefined') return 
        if (this._removed === false) this.removeFrame()
    }
  
    onsubmitCaptcha (event) {
      if (typeof hcaptcha === 'undefined') return
      
      let token = hcaptcha.getResponse(this._id) //Get response token from hCaptcha widget - hCaptcha
      this.props.onVerify(token) //Dispatch event to verify user response
    }
  
    closeCaptcha () {
      this.removeFrame();
      appActions.onCaptchaClose()
    }
  
    onerrorCaptcha (e) {
      if (typeof hcaptcha === 'undefined') return
      hcaptcha.reset(this._id) // If hCaptcha runs into error, reset captcha - hCaptcha
    }
  
    execute () {
      if(typeof hcaptcha === 'undefined') return 
      hcaptcha.execute(this._id)
    }
  
    removeFrame() {
      let nodes = document.body.childNodes //Get top level dom elements - hCaptcha
      let foundFrame = false
  
      let i = nodes.length
      let k, src, title, frames
  
      while (--i > -1 && foundFrame === false) { //Look for hCaptcha verification iframe appended at document body - hCaptcha
        frames = nodes[i].getElementsByTagName('iframe')
        
        if (frames.length > 0) {
          for (k=0; k < frames.length; k++) {
            src = frames[k].getAttribute("src")
            title = frames[k].getAttribute("title")
  
            if (src.includes(hCaptchaVars.domain) && title.includes(hCaptchaVars.iframe_title)) foundFrame = nodes[i] //Compare iframe source and title to find correct iframe appeneded to body - hCaptcha
          }
  
        }
      }
  
      if (foundFrame) {
        document.body.removeChild(foundFrame);
        this._removed = true;
      }
    }
  
    render () {
  
      return (
        <div>
          <div id={hCaptchaVars.element_id}  ></div>
        </div>
      )
    }
  }