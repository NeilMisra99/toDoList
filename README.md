# toDoList

A simple to-do list site that is hosted online in its entirety and has been developed using HTML5, CSS, ExpressJS, Node.JS, EJS, MongoDB

<img width="1800" alt="Screenshot 2023-04-27 at 3 35 09 PM" src="https://user-images.githubusercontent.com/116110498/235276955-70fb73da-82b5-49cb-9d41-87af8ab3cf38.png">

<img width="1800" alt="Screenshot 2023-04-27 at 3 35 33 PM" src="https://user-images.githubusercontent.com/116110498/235276963-1b274193-a184-4c2a-bffa-49a4c1f14904.png">

<img width="1800" alt="Screenshot 2023-04-27 at 3 35 44 PM" src="https://user-images.githubusercontent.com/116110498/235276968-a6161277-3d35-4ddf-b7b9-3ffd62b14bf3.png">

<img width="1800" alt="Screenshot 2023-04-27 at 3 36 42 PM" src="https://user-images.githubusercontent.com/116110498/235276984-aa35fe4e-8e20-4e41-93ee-1116581560a9.png">


# Before code can successfully be run:

## Step 1

cd to your project folder and make sure to npm install all the packages being used in the code

## Step 2

To easily setup everything through Google Developer Console, simply watch this short video: 
https://www.youtube.com/watch?v=pBVAyU4pZOU

!!! MAKE SURE TO NOT SHARE YOUR CREDENTIALS !!!

## Step 3

Create a .env file to hold your sensitive information i.e. credentials from Google and the secret you will use for setting up a Passport session.
In my case, the session secret is under the name SECRET, and for Google credentials, the Client ID is under GOOGLE_CLIENT_ID and the Client Secret is under GOOGLE_CLIENT_SECRET. These go into your .env file

## Step 4

Call the variables in your app.js from your .env file using the format process.env.YOUR_VARIABLE_NAME.

## Step 5

Make sure your Mongo shell is up and running. Code should work on your local environment now (given that the port number for MongoDB and localhost is aligned with yours, mine are the default numbers

## Note:

Before deploying to Github, make sure to add a .gitignore file and ignore the .env file in it so as to not have your credentials revoked
