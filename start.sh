#!/bin/sh

# Install Python 3 and pip
apt-get update
apt-get install -y python3 python3-pip

# Install dependencies
pip3 install -r requirements.txt

# Run the server
python3 server.py
