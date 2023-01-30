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
            -subj "/CN=Corvée App - DO NOT TRUST/O=Université de Montréal/OU=Direction des bibliothèques/C=CA/L=Montréal" \
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
OU = Direction des bibliothèques
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