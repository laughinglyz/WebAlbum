Client Side:

I implement three react.components to generate the page view. 

App for the entire page.

Albumlist for displaying Album name list.

Photolist for displaying the images.



Server side:

I design seven APIs for data transmission.

get '/init' for checking cookies and sending the user information accordingly.

post '/login' for setting logging information and sending the user information accordingly.

get '/logout' for setting logging out.

get '/getalbum/:userid' for  sending images for the received album

post '/uploadphoto' for photo uploading

delete '/deletephoto/:photoid' for photo deletion

put '/updatelike/:photoid' for updating likes of a photo


Way to start the application:

1.Connect mongodb to the albumservice database.
2.Using command line to cd to the server directory and input node app.js to start the server.
3.Using command line to cd to the react client directory and input npm start to start the client.
4.The app is accessed at http://localhost: 3000/.