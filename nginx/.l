# You may add here your
# server {
#	...
# }
# statements for each of your virtual hosts to this file

##
# You should look at the following URL's in order to grasp a solid understanding
# of Nginx configuration files in order to fully unleash the power of Nginx.
# http://wiki.nginx.org/Pitfalls
# http://wiki.nginx.org/QuickStart
# http://wiki.nginx.org/Configuration
#
# Generally, you will want to move this file somewhere, and start with a clean
# file but keep this around for reference. Or just disable in sites-enabled.
#
# Please see /usr/share/doc/nginx-doc/examples/ for more detailed examples.
##
server {
        listen 80 default_server;
        listen [::]:80 default_server;

        # SSL configuration
        #


        # SSL configuration
        #
        # listen 443 ssl default_server;
        # listen [::]:443 ssl default_server;
        #
        # Self signed certs generated by the ssl-cert package
        # Don't use them in a production server!
        #
        # include snippets/snakeoil.conf;

#       root /var/www/html;

        # Add index.php to the list if you are using PHP
#       index index.html index.htm index.nginx-debian
        server_name ~^(?<sub>.+)\.localhost$;
        #  rewrite ^ http://kanthm.in/data?sub=$sub;
#       location / {
                # First attempt to serve request as file, then
                # as directory, then fall back to displaying a 404.
#               try_files $uri $uri/ =404;
#       }
#
   location / {

    # proxy_pass  http://0.0.0.0:5000/sub=$sub&req=$request_uri;
if ($host ~* www\.(.*)) {
  set $host_without_www $1;
 proxy_pass http://0.0.0.0:5000/sub=$sub&req=$request_uri; # $1 contains '/foo', not 'www.mydomain.com/foo'
}
proxy_pass http://0.0.0.0:5000;



     proxy_next_upstream error timeout invalid_header http_500 http_502 http_503 http_504;
     proxy_redirect off;
     proxy_buffering off;
     proxy_set_header        Host            $host;
     proxy_set_header        X-Real-IP       $remote_addr;
     proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
   }
        #
}


# another virtual host using mix of IP-, name-, and port-based configuration
#
#server {
#	listen 8000;
#	listen somename:8080;
#	server_name somename alias another.alias;
#	root html;
#	index index.html index.htm;
#
#	location / {
#		try_files $uri $uri/ =404;
#	}
#}


# HTTPS server
#
#server {
#	listen 443;
#	server_name localhost;
#
#	root html;
#	index index.html index.htm;
#
#	ssl on;
#	ssl_certificate cert.pem;
#	ssl_certificate_key cert.key;
#
#	ssl_session_timeout 5m;
#
#	ssl_protocols SSLv3 TLSv1 TLSv1.1 TLSv1.2;
#	ssl_ciphers "HIGH:!aNULL:!MD5 or HIGH:!aNULL:!MD5:!3DES";
#	ssl_prefer_server_ciphers on;
#
#	location / {
#		try_files $uri $uri/ =404;
#	}
#}