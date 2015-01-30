

Copy the file `default` to the /etc/nginx/sites-enabled/ directory.

Identify the below line in the file and replace the `localhost` with your domain name if you have any.

server_name ~^(?<sub>.+)\.localhost$;


This changes made in this file is to extract the subdomain in the url and pass it  as a query string as shown in below example.

Example:

http://local.mydomain.com/hello will become http://mydomain.com/sub=local&req=hello
