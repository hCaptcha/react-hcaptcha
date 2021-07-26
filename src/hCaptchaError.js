class hCaptchaError extends Error {
  constructor(message = "", ...args) {
    super(message, ...args);
    this.message = `hCaptcha Error - ${message}`;
  }
}

module.exports = {
  hCaptchaError
};