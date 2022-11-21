Project Part 3
21 November, 2022
============================================
*** HOW TO RUN AT THE BOTTOM OF THE PAGE ***
============================================

=================
 WORK ALLOCATION
=================

-------------
Robert Vargas
-------------
+ Initialized middleware.
+ Created db_connections.js for handling active sessions/connections.
+ 
+ Created GET route for homepage.
+ Created POST route for logout.
+
+ Created GET route for Digital Display Insert.
+ Created POST route for Digital Display Insert.
+ Created POST route for Digital Display Delete.
+ 
+ Handled error reporting across the application.
+ 
+ Created index.pug
+ Created layout.pug
+ Created database/home.pug
+ 
+ Created stylesheet (style.css)
+ 
+ Refactored code to JavaScript ES standards.
+ Performed multiple test runs.

--------------
Andres Marquez
--------------
+ Created POST route for login.
+ Created GET route for Digital Display Update.
+ Created POST route for Digital Display Update.
+ 
+ Created GET route for Model detailed view.
+ 
+ Created JS for database/home for Scheduler System search button.
+ Created GET route for Scheduler System search.
+ 
+ Created database/layout.pug
+ Created database/view/model.pug
+ Created database/forms/digitaldisplay.pug
+ Created database/search/digitaldisplay.pug
+ 
+ Extracted certain functions out into db_util.js
+ 
+ Performed multiple test runs.


======================
HOW TO RUN THE PROGRAM
======================

This program ran on Node version 16.8.0.
- Unknown compatibility with earlier versions.

This program utilizes Node Package Manager (npm) version 7.21.0.
- Unknown compatibility with earlier versions.

* MySQL version 8.0.30 (collectively, MySQL version 8) was utilized.
- Unknown compatibility with earlier versions.

This ZIP file already contains ALL of the necessary dependencies (node modules) in ./node_modules, and should be ready to run as long as there is an active instance of MySQL running on the device running the WebApp.

* How to start the Web Server.
> Open the project and CD to the root of the project (the directory where app.js, db_connections.js, db_util, package.json, etc.) is located.
> Run the following command:
    node .

    # The dot represents the current working directory, and will run app.js as it is defined as the index file.
    # The command "node ./app.js" may also be run to achieve the same result.
> The server will be initialized in PORT 3000.

* How to open the Web Server in your browser.
> Open up the web browser of your choice.
    - This application has only been tested on Safari and Google Chrome.
> Go to:
    http://localhost:3000/
> This should take you to the login screen, where you may begin testing.