#! /bin/sh

export OPENSSL_CONF=./openssl.cnf

./openssl ecparam -out ec_key.pem -name secp256k1 -genkey
./openssl ec -in ec_key.pem -pubout -out public.pem
