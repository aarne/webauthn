import { client, parsers } from './webauthn.min.js'

Vue.prototype.$buefy.config.setOptions({
  defaultProgrammaticPromise : true
})


const app = new Vue({
  el: '#app',
  data: {
    username: null,
    registrationParsed: null,
    authenticationParsed: null,
    autocompleteAvailable: null
  },
  methods: {

    clear() {
      this.authenticationParsed = null
      this.registrationParsed = null;
    },

    async register() {
      this.clear();
      const username = this.username;
      console.log(username);
      if(!username)
        return;

      try {
          // 1. Get a challenge from the server
          const challenge = window.crypto.randomUUID(); // faking it here of course

          // 2. Invoking WebAuthn in the browser
          const registration = await client.register({
            challenge,
            user: {
              id: `id-for-${username}`, // to override credential with same username, should be anonymous
              name:username
            },
            discoverable: 'required', // Otherwise conditional UI does not work
            debug: true
          })

          // 3. Send the payload to the server
          console.log('Registration payload')
          console.log(JSON.stringify(registration, null, 2))

          // 4. The server can now verify the payload, but let's just parse it for the demo
          this.registrationParsed = await parsers.parseRegistration(registration)

          this.$buefy.toast.open({
            message: 'Registered!',
            type: 'is-success'
          })
      }
      catch(e) {
        // This might happen when there is something wrong or the user cancelled it
        this.$buefy.toast.open({
          message: e,
          type: 'is-danger'
        })
      }
    },

    async authenticate() {
      this.clear();

      this.autocompleteAvailable = await client.isAutocompleteAvailable()
      if(!this.autocompleteAvailable)
        return

      try {
        // 1. Get a challenge from the server
        const challenge = window.crypto.randomUUID(); // faking it here of course

        // 2. Invoking WebAuthn in the browser
        const authentication = await client.authenticate({
          challenge,
          autocomplete: true,
          debug: true
        })

        // 3. Send the payload to the server
        console.log('Authentication payload')
        console.log(JSON.stringify(authentication, null, 2))

        // 4. The server can now verify the payload, but let's just parse it for the demo
        this.authenticationParsed = await parsers.parseAuthentication(authentication);

        this.$buefy.toast.open({
          message: 'Authenticated!',
          type: 'is-success'
        })
      }
      catch(e) {
        // This might happen when there is something wrong or the user cancelled it
        this.$buefy.toast.open({
          message: e,
          type: 'is-danger'
        })
      }
    },

    async logout() {
      this.clear();
      this.$buefy.toast.open({
        message: 'Signed out!',
        type: 'is-success'
      });
      this.authenticate()
    }
  }
})

app.authenticate()