#!/bin/sh

# Upgrade pip
pip3 install --upgrade pip

# Install dependencies
pip3 install -r requirements.txt

# Run the server
python3 server.py

