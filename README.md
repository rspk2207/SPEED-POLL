# delta3

check package.json to know about the dependencies.
for the rough idea.... I'm using express of node.js for backend, mongoDB as the database and mongoose to access it, and pug engine.
app.js and package.json should be in the main folder.
the main folder has 2 sub folders named views and public.
all html(doesn't actually contribute to the site) and pug files goes into views.
all css files goes into css folder that is inside public folder.
no script files are used( the ones in this repo are not needed).
app.js server set to localhost 3000.
so basically the folder goes like this -->
-delta3 //my main folder.
  app.js
  package.json
  -views
    all pug files
  -public
    -css
      all css files.....
In other words...delta3(folder)...contains views(folder),public(folder),app.js(file),package.json(file)...views contains all pug files...public contains css(folder) and css contains all css files
Hope this helps, if not contact me pls.
In case anything does not work, pls contact me.
