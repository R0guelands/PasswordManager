App deployed and running on free Heroku:
https://r0gue-manager.herokuapp.com/


For clonning and setting up on your on:

This project is a simple web-based password manager that allows you to store your passwords in a secure way and acess them using your login.
The server never stores your passwords in plain text, but uses a hash function to encrypt the login information and a chiper to encrypt the passwords you save, using your login password as the key. It never decrypt your passwords, but rather sends them encrypted to the client, where a jscript decrypts them using your login password saved locally.

It uses [passport](https://www.passportjs.org/) to authenticate users and uses the [bcrypt](https://www.npmjs.com/package/bcrypt) module to hash passwords so only the person with the correct master-password can decrypt the hash.

Once you have logged in, you can use the `/passwords` endpoint to manage your passwords.

To install and use it yourself, you can follow this steps:

1. Clone the repository and go the directory where it got cloned.
2. Install the dependencies with `npm install`.
3. Install and configure the mongodb database (please follow the [instructions](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/)).
4. Open the `app.js` file and change the database connection string to your mongodb connection string.
5. Change the app.listen() call to your desired port and ip.
6. Run the server with `node app.js`
7. Open the browser and go to http://< ip >:< port > to login or register.
8. You can now use the `/passwords` endpoint to manage your passwords.


