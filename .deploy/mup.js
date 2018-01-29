module.exports = {
	servers: {
		one: {
			// TODO: set host address, username, and authentication method
			host: 'dev.rooch.net',
			username: 'meteor',
			// pem: '~/.ssh/id_rsa'
			// password: 'server-password'
			// or neither for authenticate from ssh-agent
		}
	},

	app: {
		// TODO: change app name and path
		name: 'shewmap',
		path: '../.',
    //port: 8080,

		servers: {
			one: {}
		},

		buildOptions: {
			serverOnly: true,
		},

		env: {
			// TODO: Change to your app's url
			// If you are using ssl, it needs to start with https://
			ROOT_URL: 'http://shewmap.rooch.net',
			MONGO_URL: 'mongodb://localhost/meteor',
			PORT: 8080
		},

		// ssl: { // (optional)
		//   // Enables let's encrypt (optional)
		//   autogenerate: {
		//     email: 'email.address@domain.com',
		//     // comma separated list of domains
		//     domains: 'website.com,www.website.com'
		//   }
		// },

		docker: {
			// change to 'kadirahq/meteord' if your app is using Meteor 1.3 or older
			image: 'abernix/meteord:node-8.4.0-base'
		},

		// Show progress bar while uploading bundle to server
		// You might need to disable it on CI servers
		enableUploadProgressBar: true
	},

	mongo: {
		version: '3.4.1',
		servers: {
			one: {}
		}
	}
};

