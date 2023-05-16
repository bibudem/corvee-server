# How to Create Self-Signed Certificates using OpenSSL

Go to a directory named `certificate` under `config` to save all the generated keys & certificates.

    cd config/certificate

— The following is adapted from: <https://devopscube.com/create-self-signed-certificates-openssl/>

## Create Certificate Authority

We need to create our own root CA certificate for browsers to trust the self-signed certificate. So let’s create the root CA certificate first.

Execute the following `openssl` command to create the `rootCA.key`and `rootCA.crt`. Replace `corvee.bib.umontreal.ca` with your domain name or IP address.

    openssl req -x509 -utf8 \
                -sha256 -days 10000 \
                -nodes \
                -newkey rsa:2048 \
                -subj "/CN=Corvée App - DO NOT TRUST/O=Université de Montréal/OU=Direction des bibliothèques/C=CA/L=Montréal" \
                -keyout rootCA.key -out rootCA.crt

We will use the `rootCA.key`and `rootCA.crt` to sign the SSL certificate.

**Note**: If you get the following error, comment `RANDFILE = $ENV::HOME/.rnd` line in `/etc/ssl/openssl.cnf`

    Can't load /home/vagrant/.rnd into RNG

## Create Self-Signed Certificates using OpenSSL

Follow the steps given below to create the self-signed certificates. We will sign out certificates using our own root CA created in the previous step.

#### 1\. Create the Server Private Key

    openssl genrsa -out server.key 2048

#### 2\. Create Certificate Signing Request Configuration

We will create a `csr.conf` file to have all the information to generate the CSR. Replace `corvee.bib.umontreal.ca` with your domain name or IP address.

    cat > csr.conf <<EOF
    [ req ]
    default_bits = 2048
    prompt = no
    default_md = sha256
    req_extensions = req_ext
    distinguished_name = dn

    [ dn ]
    C = CA
    ST = Québec
    L = Montréal
    O = Université de Montréal
    OU = Direction des bibliothèques Dev
    CN = Corvée App - DO NOT TRUST

    [ req_ext ]
    subjectAltName = @alt_names

    [ alt_names ]
    DNS.1 = corvee.bib.umontreal.ca
    IP.1 = 192.168.1.5
    IP.2 = 192.168.1.6

    EOF

#### 3\. Generate Certificate Signing Request (CSR) Using Server Private Key

Now we will generate `server.csr` using the following command.

    openssl req -new -utf8 -key server.key -out server.csr -config csr.conf

Now our folder should have three files. `csr.conf`, `server.csr` and `server.key`

#### 4\. Create a external file

Execute the following to create `cert.conf` for the SSL certificate. Replace `corvee.bib.umontreal.ca` with your domain name or IP address.

    cat > cert.conf <<EOF

    authorityKeyIdentifier=keyid,issuer
    basicConstraints=CA:FALSE
    keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
    subjectAltName = @alt_names

    [alt_names]
    DNS.1 = corvee.bib.umontreal.ca

    EOF

#### 5\. Generate SSL certificate With self signed CA

Now, execute the following command to generate the SSL certificate that is signed by the `rootCA.crt` and `rootCA.key` created as part of our own Certificate Authority.

    openssl x509 -req \
        -nameopt oneline,-esc_msb \
        -in server.csr \
        -CA rootCA.crt -CAkey rootCA.key \
        -CAcreateserial -out server.crt \
        -days 365 \
        -sha256 -extfile cert.conf

The above command will generate `server.crt` that will be used with our `server.key` to **enable SSL in applications.**

For example, the following config shows the Nginx config using the server certificate and private key used for SSL configuration.

    server {

    listen   443;

    ssl    on;
    ssl_certificate    /etc/ssl/server.crt;
    ssl_certificate_key    /etc/ssl/server.key;

    server_name your.domain.com;
    access_log /var/log/nginx/nginx.vhost.access.log;
    error_log /var/log/nginx/nginx.vhost.error.log;
    location / {
    root   /home/www/public_html/your.domain.com/public/;
    index  index.html;
    }

    }

## Install Certificate Authority In Your Browser/OS

You need to install the `rootCA.crt` in your browser or operating system to avoid the security message that shows up in the browser when using self-signed certificates.

Installing self-signed CA certificates differs in Operating systems.

1. Double click on the `config/rootCA.crt` file
2. On the _Certificate_ dialog box, click _Install Certificate_ to start the _Certificate Import Wizard_.
3. On the _Welcome_ page, select _Local Computer_, and click _Next_.
4. On the _Certificate Store_ page, select _Place all certificates in the following store_ and click _Browse_.
5. In the _Select Certificate Store_ dialog box, select _Trusted Root Certification Authorities_, and then click OK.
6. On the _Certificate Store_ page, click _Next_.
7. On the summary page, review the details and click _Finish_.

## Shell Script To Create Self-Signed Certificate

If you want to create self-signed certificates quite often, you can make use of the following shell script. You just need to execute the script with the domain name or IP that you want to add to the certificate.

Save the following shell script as `ssl.sh`

    #! /bin/bash

    if [ "$#" -ne 1 ]
    then
    echo "Error: No domain name argument provided"
    echo "Usage: Provide a domain name as an argument"
    exit 1
    fi

    DOMAIN=$1

    # Create root CA & Private key

    openssl req -x509 -utf8 \
                -sha256 -days 10000 \
                -nodes \
                -newkey rsa:2048 \
                -subj "/CN=Corvée App - DO NOT TRUST/C=CA/L=Montréal" \
                -keyout rootCA.key -out rootCA.crt

    # Generate Private key

    openssl genrsa -out server.key 2048

    # Create csf conf

    cat > csr.conf <<EOF
    [ req ]
    default_bits = 2048
    prompt = no
    default_md = sha256
    req_extensions = req_ext
    distinguished_name = dn

    [ dn ]
    C = CA
    ST = Québec
    L = Montréal
    O = Université de Montréal
    OU = Direction des bibliothèques Dev
    CN = Corvée App - DO NOT TRUST

    [ req_ext ]
    subjectAltName = @alt_names

    [ alt_names ]
    DNS.1 = ${DOMAIN}

    EOF

    # create CSR request using private key

    openssl req -new -utf8 -key server.key -out server.csr -config csr.conf

    # Create a external config file for the certificate

    cat > cert.conf <<EOF

    authorityKeyIdentifier=keyid,issuer
    basicConstraints=CA:FALSE
    keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
    subjectAltName = @alt_names

    [alt_names]
    DNS.1 = ${DOMAIN}

    EOF

    # Create SSl with self signed CA

    openssl x509 -req \
        -nameopt oneline,-esc_msb \
        -in server.csr \
        -CA rootCA.crt -CAkey rootCA.key \
        -CAcreateserial -out server.crt \
        -days 10000 \
        -sha256 -extfile cert.conf
