# backblaze + cloudflare file hoster

## setup instructions
 
### this webapp

- create backblaze bucket
- set bucket to public
- create an application key for bucket
- create config.php from config.example.php
- run `composer install`

### cloudflare cname

- set to backblaze endpoint domain e.g. s3.us-east-005.backblazeb2.com

### cloudflare transform rule

name: b2 rewrite  
rule: when incoming requests match…  
field: Hostname Operator: equals value: f.rj1.su  
path: Rewrite to + dynamic  
value: concat("/file/rj1", http.request.uri.path)  
